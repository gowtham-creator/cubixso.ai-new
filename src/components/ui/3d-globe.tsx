"use client";
import React, { useRef, useMemo, useState, useCallback, Suspense } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Html, useTexture } from "@react-three/drei";
import * as THREE from "three";
import { cn } from "@/lib/utils";

// ============================================================================
// Types
// ============================================================================

export interface GlobeMarker {
  lat: number;
  lng: number;
  /** Optional avatar/logo. Without one the marker renders as a glowing dot. */
  src?: string;
  label?: string;
  size?: number;
}

export interface Globe3DConfig {
  /** Globe radius */
  radius?: number;
  /** Globe base color (used as fallback or tint) */
  globeColor?: string;
  /** URL to the Earth texture map */
  textureUrl?: string;
  /** URL to the bump/elevation map for terrain */
  bumpMapUrl?: string;
  /** Whether to show atmosphere glow */
  showAtmosphere?: boolean;
  /** Atmosphere color */
  atmosphereColor?: string;
  /** Atmosphere intensity */
  atmosphereIntensity?: number;
  /** Atmosphere blur/softness (higher = more diffuse, default 3) */
  atmosphereBlur?: number;
  /** Terrain bump scale (0 = flat, higher = more pronounced) */
  bumpScale?: number;
  /** Auto rotate speed (0 = disabled) */
  autoRotateSpeed?: number;
  /** Enable zoom */
  enableZoom?: boolean;
  /** Enable pan */
  enablePan?: boolean;
  /** Min zoom distance */
  minDistance?: number;
  /** Max zoom distance */
  maxDistance?: number;
  /** Initial rotation */
  initialRotation?: { x: number; y: number };
  /** Initial camera distance from the globe centre (default radius x 3.5) */
  cameraDistance?: number;
  /** Light the globe from the REAL sun position for the current moment */
  realtimeSun?: boolean;
  /** City-lights texture shown on the night side (realtimeSun only) */
  nightTextureUrl?: string;
  /** Roughness map: smooth oceans, rough land — gives real sun-glint (realtimeSun only) */
  roughnessMapUrl?: string;
  /** Brightness of the night-side city lights */
  nightLightsIntensity?: number;
  /** Marker default size */
  markerSize?: number;
  /** Show wireframe overlay */
  showWireframe?: boolean;
  /** Wireframe color */
  wireframeColor?: string;
  /** Ambient light intensity */
  ambientIntensity?: number;
  /** Point light intensity */
  pointLightIntensity?: number;
  /** Background color (null for transparent) */
  backgroundColor?: string | null;
}

interface Globe3DProps {
  /** Array of markers to display on the globe */
  markers?: GlobeMarker[];
  /** Globe configuration */
  config?: Globe3DConfig;
  /** Additional CSS classes */
  className?: string;
  /** Callback when a marker is clicked */
  onMarkerClick?: (marker: GlobeMarker) => void;
  /** Callback when a marker is hovered */
  onMarkerHover?: (marker: GlobeMarker | null) => void;
  /** "low" on phones/tablets: lighter geometry and a lower pixel ratio. */
  quality?: "high" | "low";
}

// ============================================================================
// Constants - Earth Texture URLs (NASA Blue Marble)
// ============================================================================

// Self-hosted WebP at full resolution. Upstream fetched a 4096x2048 JPEG
// (1.4 MB) and a 2048x1024 PNG (369 KB) from unpkg.com at mount time — 1.8 MB
// from a third-party CDN on the critical path of the globe appearing. The same
// resolutions re-encoded as WebP are 657 KB + 42 KB, same origin, one-year
// immutable cache (see next.config.ts).
//
// Resolution is deliberately NOT reduced. A 2048-wide earth map was tried and
// read as blurred: only half the map faces the camera, so 2048 wide leaves
// ~1024 texels across a globe drawn ~700 device pixels wide on a 2x display —
// and anisotropic filtering at the limb eats into that further.
const DEFAULT_EARTH_TEXTURE = "/textures/earth-4096.webp";
const DEFAULT_BUMP_TEXTURE = "/textures/earth-bump-2048.webp";

// Texture sets per device tier. Phones get 2048-wide maps: a 4096x2048 RGBA
// texture with mipmaps is ~43 MB of GPU memory, which on iOS raises the odds of
// the WebGL context being evicted.
export const GLOBE_TEXTURES = {
  high: {
    textureUrl: DEFAULT_EARTH_TEXTURE,
    bumpMapUrl: DEFAULT_BUMP_TEXTURE,
    nightTextureUrl: "/textures/earth-night-4096.webp",
    roughnessMapUrl: "/textures/earth-rough-2048.webp",
  },
  low: {
    textureUrl: "/textures/earth-2048.webp",
    bumpMapUrl: "/textures/earth-bump-1024.webp",
    nightTextureUrl: "/textures/earth-night-2048.webp",
    roughnessMapUrl: "/textures/earth-rough-1024.webp",
  },
} as const;

/**
 * Download + decode globe textures into the loader cache ahead of mounting.
 *
 * This must be called by the page, not at module scope: the globe is loaded via
 * next/dynamic, so its module only evaluates when the <Canvas> first mounts —
 * a module-level preload there fires at exactly the moment it was meant to beat.
 * Creates no WebGL context, so it is safe on phones too.
 */
export function preloadGlobeTextures(urls: readonly string[]) {
  useTexture.preload(urls as string[]);
}

// ============================================================================
// Real-time sun
// ============================================================================

const DEG = Math.PI / 180;

/**
 * Sub-solar point — where the sun is directly overhead — for a given instant.
 * Low-precision solar ephemeris (Astronomical Almanac), good to well under a
 * degree: declination from the sun's ecliptic longitude, longitude from right
 * ascension minus Greenwich mean sidereal time. Checked against equinox and
 * solstice declinations and the November equation-of-time maximum.
 */
export function subsolarPoint(date: Date): { lat: number; lng: number } {
  const n = date.getTime() / 86400000 + 2440587.5 - 2451545.0; // days since J2000
  const L = (280.46 + 0.9856474 * n) % 360; // mean longitude
  const g = ((357.528 + 0.9856003 * n) % 360) * DEG; // mean anomaly
  const lambda = (L + 1.915 * Math.sin(g) + 0.02 * Math.sin(2 * g)) * DEG;
  const eps = (23.439 - 0.0000004 * n) * DEG; // obliquity of the ecliptic
  const decl = Math.asin(Math.sin(eps) * Math.sin(lambda));
  const ra = Math.atan2(Math.cos(eps) * Math.sin(lambda), Math.cos(lambda));
  const gmst = (280.46061837 + 360.98564736629 * n) % 360;
  const lng = ((((ra / DEG - gmst) % 360) + 540) % 360) - 180;
  return { lat: decl / DEG, lng };
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Convert latitude/longitude to 3D cartesian coordinates
 */
function latLngToVector3(
  lat: number,
  lng: number,
  radius: number,
): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);

  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);

  return new THREE.Vector3(x, y, z);
}

// ============================================================================
// Marker Component (static - rotation handled by parent group)
// ============================================================================

interface MarkerProps {
  marker: GlobeMarker;
  radius: number;
  defaultSize: number;
  onClick?: (marker: GlobeMarker) => void;
  onHover?: (marker: GlobeMarker | null) => void;
}

function Marker({
  marker,
  radius,
  defaultSize,
  onClick,
  onHover,
}: MarkerProps) {
  const [hovered, setHovered] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const groupRef = useRef<THREE.Group>(null);
  const imageGroupRef = useRef<THREE.Group>(null);
  const { camera } = useThree();

  // Surface position (where the line starts)
  const surfacePosition = useMemo(() => {
    return latLngToVector3(marker.lat, marker.lng, radius * 1.001);
  }, [marker.lat, marker.lng, radius]);

  // Top of the line (where the image is) - positioned further out to prevent going inside globe
  const topPosition = useMemo(() => {
    return latLngToVector3(marker.lat, marker.lng, radius * 1.18);
  }, [marker.lat, marker.lng, radius]);

  const lineHeight = topPosition.distanceTo(surfacePosition);

  // Check if marker is facing the camera.
  //
  // Upstream allocated two Vector3s and called setIsVisible() on EVERY frame,
  // per marker — a React state update at 60fps for each pin, plus steady GC
  // churn. Scratch vectors are reused, and state is only touched when the
  // visibility actually flips (a pin crossing the horizon), which is a handful
  // of times per rotation rather than sixty per second.
  const scratch = useMemo(
    () => ({ w: new THREE.Vector3(), c: new THREE.Vector3(), p: new THREE.Vector3(), q: new THREE.Vector3() }),
    [],
  );
  const visibleRef = useRef(true);
  // Labels sit to the right of their dot, which runs off a narrow phone pane for
  // pins on the right-hand side of the disc. Flip them to the left there. Like
  // visibility, state only changes when a pin crosses the threshold.
  const [flip, setFlip] = useState(false);
  const flipRef = useRef(false);
  useFrame(() => {
    if (!imageGroupRef.current) return;
    imageGroupRef.current.getWorldPosition(scratch.p);
    const nextFlip = scratch.q.copy(scratch.p).project(camera).x > 0.2;
    if (nextFlip !== flipRef.current) {
      flipRef.current = nextFlip;
      setFlip(nextFlip);
    }
    scratch.w.copy(scratch.p).normalize();
    scratch.c.copy(camera.position).normalize();
    // Positive dot = facing the camera; the 0.1 margin hides pins right on the
    // limb, where they would otherwise flicker as they cross the horizon.
    const next = scratch.w.dot(scratch.c) > 0.1;
    if (next !== visibleRef.current) {
      visibleRef.current = next;
      setIsVisible(next);
    }
  });

  const handlePointerEnter = useCallback(() => {
    setHovered(true);
    onHover?.(marker);
  }, [marker, onHover]);

  const handlePointerLeave = useCallback(() => {
    setHovered(false);
    onHover?.(null);
  }, [onHover]);

  const handleClick = useCallback(() => {
    onClick?.(marker);
  }, [marker, onClick]);

  // Calculate line center and orientation
  const { lineCenter, lineQuaternion } = useMemo(() => {
    const center = surfacePosition.clone().lerp(topPosition, 0.5);

    // Calculate rotation to align cylinder with the direction from surface to top
    const direction = topPosition.clone().sub(surfacePosition).normalize();
    const quaternion = new THREE.Quaternion();
    quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction);

    return { lineCenter: center, lineQuaternion: quaternion };
  }, [surfacePosition, topPosition]);

  return (
    <group ref={groupRef} visible={isVisible}>
      {/* Pin line from surface to image - properly oriented */}
      <mesh position={lineCenter} quaternion={lineQuaternion}>
        <cylinderGeometry args={[0.003, 0.003, lineHeight, 8]} />
        <meshBasicMaterial
          color={hovered ? "#ffffff" : "#cfe0ff"}
          transparent
          opacity={hovered ? 0.9 : 0.6}
        />
      </mesh>

      {/* Pin point at the surface */}
      <mesh position={surfacePosition} quaternion={lineQuaternion}>
        <coneGeometry args={[0.015, 0.04, 8]} />
        <meshBasicMaterial color={hovered ? "#ffffff" : "#4A7BFF"} />
      </mesh>

      {/* Marker head + location label.
          Screen-space (no `transform`): the DOM stays at a constant, legible
          pixel size instead of scaling with camera distance, so labels read the
          same whether the globe is zoomed in or out. zIndexRange is pinned low
          because drei's default is ~16.7 million, which floats the labels over
          the site's fixed navbar and every section below. */}
      <group ref={imageGroupRef} position={topPosition}>
        <Html
          center
          zIndexRange={[10, 0]}
          style={{
            pointerEvents: isVisible ? "auto" : "none",
            opacity: isVisible ? 1 : 0,
            transition: "opacity 0.2s ease-out",
          }}
        >
          <div
            className={cn(
              "group flex cursor-pointer items-center gap-2 whitespace-nowrap",
              flip && "flex-row-reverse",
            )}
            onMouseEnter={handlePointerEnter}
            onMouseLeave={handlePointerLeave}
            onClick={handleClick}
          >
            {marker.src ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={marker.src}
                alt=""
                className={cn(
                  "h-7 w-7 rounded-full object-cover ring-1 ring-white/40 transition-transform duration-200",
                  hovered && "scale-110 ring-white/80",
                )}
                draggable={false}
              />
            ) : (
              <span
                aria-hidden
                className={cn(
                  "relative block h-2.5 w-2.5 rounded-full bg-[#4A7BFF] transition-transform duration-200",
                  "shadow-[0_0_0_3px_rgba(74,123,255,0.25),0_0_14px_rgba(74,123,255,0.9)]",
                  hovered && "scale-125",
                )}
              />
            )}
            {marker.label ? (
              <span
                className={cn(
                  "rounded-full border border-white/15 bg-black/60 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-white/85 backdrop-blur-sm transition-colors duration-200",
                  hovered && "border-white/40 text-white",
                )}
              >
                {marker.label}
              </span>
            ) : null}
          </div>
        </Html>
      </group>
    </group>
  );
}

// ============================================================================
// Rotating Globe with Markers (all rotate together)
// ============================================================================

type SunUniform = { value: THREE.Vector3 };

interface RotatingGlobeProps {
  config: Required<Globe3DConfig>;
  /** Sun direction in VIEW space, written here each frame, read by shaders. */
  sunUniform: SunUniform;
  /** Geometry detail — lower on phones. */
  segments: number;
  markers: GlobeMarker[];
  onMarkerClick?: (marker: GlobeMarker) => void;
  onMarkerHover?: (marker: GlobeMarker | null) => void;
}

function RotatingGlobe({
  config,
  sunUniform,
  segments,
  markers,
  onMarkerClick,
  onMarkerHover,
}: RotatingGlobeProps) {
  const groupRef = useRef<THREE.Group>(null);
  const sunRef = useRef<THREE.DirectionalLight>(null);
  const { camera } = useThree();

  // Load Earth textures (city lights too when lit by the real sun)
  const textures = useTexture(
    config.realtimeSun
      ? [config.textureUrl, config.bumpMapUrl, config.nightTextureUrl, config.roughnessMapUrl]
      : [config.textureUrl, config.bumpMapUrl],
  );
  const [earthTexture, bumpTexture, nightTexture, roughTexture] = textures as THREE.Texture[];

  // Configure textures
  useMemo(() => {
    if (earthTexture) {
      earthTexture.colorSpace = THREE.SRGBColorSpace;
      earthTexture.anisotropy = 16;
    }
    if (bumpTexture) {
      bumpTexture.anisotropy = 8;
    }
    if (nightTexture) {
      nightTexture.colorSpace = THREE.SRGBColorSpace;
      nightTexture.anisotropy = 8;
    }
  }, [earthTexture, bumpTexture, nightTexture]);

  // ── Real-time day / night ─────────────────────────────────────────────
  // The sun light is a CHILD of the globe group, positioned at the live
  // sub-solar point in Earth coordinates. That anchors daylight to geography,
  // not to the camera: orbit or drag the globe and the terminator stays where
  // it really is. It is re-derived from the clock every few seconds, so the
  // day/night line keeps sweeping west in real time (15° an hour).
  //
  // City lights ride the emissive channel and are masked to the night side in
  // the shader, with a soft ~15° twilight band so they fade in at dusk rather
  // than switching on along a hard line.
  const onBeforeCompile = useCallback(
    (shader: THREE.WebGLProgramParametersWithUniforms) => {
      shader.uniforms.uSunView = sunUniform;
      shader.uniforms.uRimColor = { value: new THREE.Color("#8fc4ff") };
      shader.fragmentShader = shader.fragmentShader
        .replace(
          "#include <common>",
          "#include <common>\nuniform vec3 uSunView;\nuniform vec3 uRimColor;",
        )
        .replace(
          "#include <emissivemap_fragment>",
          `#ifdef USE_EMISSIVEMAP
            // The Black Marble map carries dim terrain as well as city lights;
            // boosted as-is it washed the whole night side blue. A power curve
            // crushes that low-level terrain while keeping the lights bright.
            vec3 cityLights = texture2D(emissiveMap, vEmissiveMapUv).rgb;
            totalEmissiveRadiance *= pow(cityLights, vec3(2.4)) * 2.4;
          #endif
          {
            // view-space (bump-perturbed) normal against view-space sun direction
            float sunFacing = dot(normalize(normal), normalize(uSunView));
            // 1 in full night, 0 in daylight, ~15 degrees of twilight between
            float nightSide = 1.0 - smoothstep(-0.2, 0.1, sunFacing);
            totalEmissiveRadiance *= nightSide;
          }`,
        )
        .replace(
          "#include <opaque_fragment>",
          `{
            // Atmospheric haze over the planet itself, rising toward the limb —
            // the soft blue edge real Earth photos have. Without it the halo
            // floats beside a hard-edged ball. Strong on the lit limb, faint on
            // the night limb, so it follows the real sun too.
            vec3 V = normalize(vViewPosition);
            float ndv = clamp(dot(normalize(normal), V), 0.0, 1.0);
            float rim = pow(1.0 - ndv, 3.0);
            float lit = smoothstep(-0.3, 0.35, dot(normalize(normal), normalize(uSunView)));
            outgoingLight += uRimColor * rim * (0.06 + 0.42 * lit);
          }
          #include <opaque_fragment>`,
        );
    },
    [sunUniform],
  );

  const placeSun = useCallback(() => {
    if (!sunRef.current) return;
    const { lat, lng } = subsolarPoint(new Date());
    sunRef.current.position.copy(latLngToVector3(lat, lng, config.radius * 20));
  }, [config.radius]);

  React.useEffect(() => {
    if (!config.realtimeSun) return;
    placeSun();
    const id = window.setInterval(placeSun, 5000);
    return () => window.clearInterval(id);
  }, [config.realtimeSun, placeSun]);

  const sunWorld = useMemo(() => new THREE.Vector3(), []);
  useFrame(() => {
    if (!config.realtimeSun || !sunRef.current) return;
    // The emissive mask runs in view space, so hand it the sun direction there.
    sunRef.current.getWorldPosition(sunWorld);
    sunUniform.value.copy(sunWorld).transformDirection(camera.matrixWorldInverse);
  });

  // Create geometries
  const geometry = useMemo(() => {
    return new THREE.SphereGeometry(config.radius, segments, segments);
  }, [config.radius, segments]);

  const wireframeGeometry = useMemo(() => {
    return new THREE.SphereGeometry(config.radius * 1.002, 32, 16);
  }, [config.radius]);

  return (
    // initialRotation was declared in Globe3DConfig but never applied upstream,
    // so the globe always opened facing longitude −90° (the Americas). Euler
    // order XYZ spins about the polar axis first, then tilts — i.e. choose the
    // longitude to face, then lean the hemisphere toward the camera. Markers are
    // children, so they turn with the surface.
    <group
      ref={groupRef}
      rotation={[config.initialRotation.x, config.initialRotation.y, 0]}
    >
      {/* Main globe mesh with Earth texture */}
      <mesh geometry={geometry}>
        {config.realtimeSun ? (
          // Physical rather than Standard only for specularIntensity: with the
          // ocean roughness map, the sun's reflection off the sea at full
          // dielectric strength read as a second sun. No clearcoat/sheen/
          // transmission are enabled, so it compiles to the same cost.
          <meshPhysicalMaterial
            map={earthTexture}
            bumpMap={bumpTexture}
            bumpScale={config.bumpScale * 0.05}
            roughness={1}
            roughnessMap={roughTexture}
            specularIntensity={0.45}
            metalness={0.0}
            emissiveMap={nightTexture}
            emissive="#ffffff"
            emissiveIntensity={config.nightLightsIntensity}
            onBeforeCompile={onBeforeCompile}
          />
        ) : (
          <meshStandardMaterial
            map={earthTexture}
            bumpMap={bumpTexture}
            bumpScale={config.bumpScale * 0.05}
            roughness={0.7}
            metalness={0.0}
          />
        )}
      </mesh>

      {config.realtimeSun && (
        <directionalLight ref={sunRef} intensity={3.2} color="#fff6e8" />
      )}

      {/* Wireframe overlay */}
      {config.showWireframe && (
        <mesh geometry={wireframeGeometry}>
          <meshBasicMaterial
            color={config.wireframeColor}
            wireframe
            transparent
            opacity={0.08}
          />
        </mesh>
      )}

      {/* Markers - now inside the rotating group */}
      {markers.map((marker, index) => (
        <Marker
          key={`marker-${index}-${marker.lat}-${marker.lng}`}
          marker={marker}
          radius={config.radius}
          defaultSize={config.markerSize}
          onClick={onMarkerClick}
          onHover={onMarkerHover}
        />
      ))}
    </group>
  );
}

// ============================================================================
// Atmosphere Component (stays static - doesn't rotate)
// ============================================================================

// Shell radius relative to the planet. Real atmosphere is a thin skin; the
// first pass used 1.15, which read as a thick stroke around the ball.
const ATMO_SCALE = 1.075;
// |n·v| on the back face of the shell where a view ray just grazes the planet:
// sqrt(1 - (1/ATMO_SCALE)^2). It runs 0 at the shell's outer silhouette up to
// this value at the planet's edge.
const ATMO_LIMB = Math.sqrt(1 - 1 / (ATMO_SCALE * ATMO_SCALE));

interface AtmosphereProps {
  radius: number;
  color: string;
  intensity: number;
  blur: number;
  sunUniform: SunUniform;
  realtimeSun: boolean;
}

function Atmosphere({ radius, color, intensity, blur, sunUniform, realtimeSun }: AtmosphereProps) {
  // blur -> falloff exponent: higher blur = softer, wider halo.
  const falloff = Math.max(0.8, 4 - blur);

  // History, because both earlier versions were wrong in instructive ways:
  //   • upstream: alpha = fresnel * intensity, normal blending. On a back-facing
  //     shell that fresnel peaks at the OUTER edge, so the brightest part was the
  //     rim furthest from the planet; at the demo's intensity of 20 the alpha
  //     clamped to 1 across the whole band — a solid blue ring.
  //   • my first rewrite: additive blending with alpha fixed at 1. Additive can
  //     only brighten, and on a transparent canvas the faded part still wrote
  //     alpha 1 — invisible on the black theme, a hard black band on the light one.
  // Now: normal blending with real alpha falloff (brightest and palest at the
  // planet's edge, fully transparent at the shell), so it reads as air on both
  // themes; and it is lit by the real sun — bright along the day limb, faint
  // along the night limb.
  const atmosphereMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        innerColor: { value: new THREE.Color("#d6ebff") },
        outerColor: { value: new THREE.Color(color) },
        intensity: { value: intensity },
        falloff: { value: falloff },
        limb: { value: ATMO_LIMB },
        uSunView: sunUniform,
        useSun: { value: realtimeSun ? 1 : 0 },
      },
      vertexShader: `
        varying vec3 vNormal;
        varying vec3 vPosition;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 innerColor;
        uniform vec3 outerColor;
        uniform float intensity;
        uniform float falloff;
        uniform float limb;
        uniform vec3 uSunView;
        uniform float useSun;
        varying vec3 vNormal;
        varying vec3 vPosition;
        void main() {
          vec3 n = normalize(vNormal);
          float t = abs(dot(n, normalize(-vPosition)));
          float g = smoothstep(0.0, limb, t);          // 0 outer edge -> 1 planet edge
          float a = pow(g, falloff);
          float sunLit = 0.18 + 0.82 * smoothstep(-0.4, 0.45, dot(n, normalize(uSunView)));
          a *= mix(1.0, sunLit, useSun);
          vec3 col = mix(outerColor, innerColor, pow(g, 2.0));
          gl_FragColor = vec4(col, clamp(a * intensity, 0.0, 1.0));
        }
      `,
      side: THREE.BackSide,
      transparent: true,
      depthWrite: false,
      blending: THREE.NormalBlending,
    });
  }, [color, intensity, falloff, sunUniform, realtimeSun]);

  return (
    <mesh scale={[ATMO_SCALE, ATMO_SCALE, ATMO_SCALE]}>
      <sphereGeometry args={[radius, 64, 32]} />
      <primitive object={atmosphereMaterial} attach="material" />
    </mesh>
  );
}

// ============================================================================
// Scene Component
// ============================================================================

interface SceneProps {
  markers: GlobeMarker[];
  config: Required<Globe3DConfig>;
  segments: number;
  onMarkerClick?: (marker: GlobeMarker) => void;
  onMarkerHover?: (marker: GlobeMarker | null) => void;
}

function Scene({ markers, config, segments, onMarkerClick, onMarkerHover }: SceneProps) {
  const { camera, gl, size } = useThree();
  const sunUniform = useMemo<SunUniform>(() => ({ value: new THREE.Vector3(0, 0, 1) }), []);

  // FIT TO THE PANE. The camera's field of view is vertical, so a fixed distance
  // sizes the globe to the pane's HEIGHT. On a portrait phone pane (≈310 wide by
  // 437 tall) that drew a globe wider than the pane, clipped on both sides. When
  // the pane is narrower than it is tall, pull the camera back until the globe,
  // halo included, fits the width — and scale the zoom limits with it, or
  // OrbitControls would clamp the fitted distance straight back to maxDistance.
  const base = config.cameraDistance || config.radius * 3.5;
  const fit = useMemo(() => {
    const aspect = size.width / Math.max(1, size.height);
    if (aspect >= 1) return 1;
    const R = config.radius * ATMO_SCALE;
    const tanV = Math.tan(Math.asin(Math.min(0.999, R / base))); // apparent radius at `base`
    const d = R / Math.sin(Math.atan(tanV * aspect));
    return d / base;
  }, [size.width, size.height, config.radius, base]);

  React.useEffect(() => {
    // Keep whatever angle the user has orbited to; only change the distance.
    if (camera.position.lengthSq() < 1e-6) camera.position.set(0, 0, 1);
    camera.position.setLength(base * fit);
    camera.lookAt(0, 0, 0);
  }, [camera, base, fit]);

  // OrbitControls sets touch-action:none on the canvas, which on a phone means
  // a full-width globe swallows every vertical swipe and traps the visitor
  // mid-page. pan-y hands vertical panning back to the browser (page scroll)
  // while horizontal drags and pinches still reach the controls. This effect
  // runs after OrbitControls connects — child effects fire before the parent's —
  // so it overrides the value rather than being overwritten by it. No effect on
  // mouse input.
  React.useEffect(() => {
    gl.domElement.style.touchAction = "pan-y";
  }, [gl]);

  return (
    <>
      {/* Lighting. With the real sun on, the only direct light is the sun inside
          RotatingGlobe; the two fixed lights would otherwise illuminate the night
          side and erase the terminator. A faint ambient keeps night-side
          coastlines just readable under the city lights. */}
      {config.realtimeSun ? (
        <ambientLight intensity={0.07} />
      ) : (
        <>
          <ambientLight intensity={config.ambientIntensity} />
          <directionalLight
            position={[config.radius * 5, config.radius * 2, config.radius * 5]}
            intensity={config.pointLightIntensity}
            color="#ffffff"
          />
          <directionalLight
            position={[-config.radius * 3, config.radius, -config.radius * 2]}
            intensity={config.pointLightIntensity * 0.3}
            color="#88ccff"
          />
        </>
      )}

      {/* Rotating Globe with Markers */}
      <RotatingGlobe
        config={config}
        sunUniform={sunUniform}
        segments={segments}
        markers={markers}
        onMarkerClick={onMarkerClick}
        onMarkerHover={onMarkerHover}
      />

      {/* Atmosphere (static) */}
      {config.showAtmosphere && (
        <Atmosphere
          radius={config.radius}
          color={config.atmosphereColor}
          intensity={config.atmosphereIntensity}
          blur={config.atmosphereBlur}
          sunUniform={sunUniform}
          realtimeSun={config.realtimeSun}
        />
      )}

      {/* Controls */}
      <OrbitControls
        makeDefault
        enablePan={config.enablePan}
        enableZoom={config.enableZoom}
        minDistance={config.minDistance * fit}
        maxDistance={config.maxDistance * fit}
        rotateSpeed={0.4}
        autoRotate={config.autoRotateSpeed > 0}
        autoRotateSpeed={config.autoRotateSpeed}
        enableDamping
        dampingFactor={0.1}
      />
    </>
  );
}

// ============================================================================
// Loading Fallback
// ============================================================================

// Nothing drawn while textures load: the wrapper stays at opacity 0 until the
// first real frame (see Globe3D), so there is no "Loading globe..." text and no
// half-textured sphere flashing in.
function LoadingFallback() {
  return null;
}

// Fires once, on the first frame rendered after the textures have resolved.
function OnFirstFrame({ onReady }: { onReady: () => void }) {
  const done = useRef(false);
  useFrame(() => {
    if (done.current) return;
    done.current = true;
    onReady();
  });
  return null;
}

// ============================================================================
// Main Globe3D Component
// ============================================================================

const defaultConfig: Required<Globe3DConfig> = {
  radius: 2,
  globeColor: "#1a1a2e",
  textureUrl: DEFAULT_EARTH_TEXTURE,
  bumpMapUrl: DEFAULT_BUMP_TEXTURE,
  showAtmosphere: false,
  atmosphereColor: "#4da6ff",
  atmosphereIntensity: 0.5,
  atmosphereBlur: 2,
  bumpScale: 1,
  autoRotateSpeed: 0.3,
  enableZoom: false,
  enablePan: false,
  minDistance: 5,
  maxDistance: 15,
  initialRotation: { x: 0, y: 0 },
  cameraDistance: 0, // 0 = radius x 3.5, the upstream framing
  realtimeSun: false,
  nightTextureUrl: "/textures/earth-night-4096.webp",
  roughnessMapUrl: "/textures/earth-rough-2048.webp",
  nightLightsIntensity: 1.6,
  markerSize: 0.06,
  showWireframe: false,
  wireframeColor: "#4a9eff",
  ambientIntensity: 0.6,
  pointLightIntensity: 1.5,
  backgroundColor: null,
};

export function Globe3D({
  markers = [],
  config = {},
  className,
  onMarkerClick,
  onMarkerHover,
  quality = "high",
}: Globe3DProps) {
  const mergedConfig = useMemo(
    () => ({ ...defaultConfig, ...config }),
    [config],
  );
  const [ready, setReady] = useState(false);

  // RENDER LOOP. Upstream rendered at full frame rate for as long as the canvas
  // existed — including while scrolled far off-screen. Once the globe was being
  // warmed up early, that meant it drew 60 frames a second in the background
  // the whole time the visitor was on the hero, competing with the hero cube:
  // constant GPU load, and the lag on phones.
  //
  // Off-screen it is now "demand": React Three Fiber renders only when
  // invalidated, which includes the commit where the textures resolve. So a
  // warm-up mount still renders ONCE — compiling the shaders and uploading the
  // textures, which is the whole point of warming it — and then goes idle.
  // "never" would have skipped that first frame entirely. On screen it runs
  // "always" so auto-rotation and the live sun animate.
  const wrapRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  React.useEffect(() => {
    const el = wrapRef.current;
    if (!el || typeof IntersectionObserver === "undefined") { setInView(true); return; }
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), {
      rootMargin: "10% 0px",
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const low = quality === "low";
  // Phones: 1.5x is visibly sharp and costs ~44% fewer pixels than 2x; 48
  // segments is indistinguishable at phone size and roughly halves the vertices.
  const dpr: [number, number] = low ? [1, 1.5] : [1, 2];
  const segments = low ? 48 : 64;

  return (
    <div ref={wrapRef} className={cn("relative h-[500px] w-full", className)}>
      <Canvas
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
        }}
        dpr={dpr}
        frameloop={inView ? "always" : "demand"}
        camera={{
          fov: 45,
          near: 0.1,
          far: 1000,
          position: [0, 0, mergedConfig.cameraDistance || mergedConfig.radius * 3.5],
        }}
        style={{
          background: mergedConfig.backgroundColor || "transparent",
          // Fade in on the first real frame instead of popping in.
          opacity: ready ? 1 : 0,
          transition: "opacity 0.7s ease-out",
        }}
      >
        <Suspense fallback={<LoadingFallback />}>
          <Scene
            markers={markers}
            config={mergedConfig}
            segments={segments}
            onMarkerClick={onMarkerClick}
            onMarkerHover={onMarkerHover}
          />
          <OnFirstFrame onReady={() => setReady(true)} />
        </Suspense>
      </Canvas>
    </div>
  );
}

export default Globe3D;
