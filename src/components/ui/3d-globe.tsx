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
  },
  low: {
    textureUrl: "/textures/earth-2048.webp",
    bumpMapUrl: "/textures/earth-bump-1024.webp",
    nightTextureUrl: "/textures/earth-night-2048.webp",
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
  const scratch = useMemo(() => ({ w: new THREE.Vector3(), c: new THREE.Vector3() }), []);
  const visibleRef = useRef(true);
  useFrame(() => {
    if (!imageGroupRef.current) return;
    imageGroupRef.current.getWorldPosition(scratch.w).normalize();
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
          color={hovered ? "#ffffff" : "#94a3b8"}
          transparent
          opacity={hovered ? 0.9 : 0.6}
        />
      </mesh>

      {/* Pin point at the surface */}
      <mesh position={surfacePosition} quaternion={lineQuaternion}>
        <coneGeometry args={[0.015, 0.04, 8]} />
        <meshBasicMaterial color={hovered ? "#f97316" : "#ef4444"} />
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
            className="group flex cursor-pointer items-center gap-2 whitespace-nowrap"
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

interface RotatingGlobeProps {
  config: Required<Globe3DConfig>;
  markers: GlobeMarker[];
  onMarkerClick?: (marker: GlobeMarker) => void;
  onMarkerHover?: (marker: GlobeMarker | null) => void;
}

function RotatingGlobe({
  config,
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
      ? [config.textureUrl, config.bumpMapUrl, config.nightTextureUrl]
      : [config.textureUrl, config.bumpMapUrl],
  );
  const [earthTexture, bumpTexture, nightTexture] = textures as THREE.Texture[];

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
  const sunUniform = useMemo(() => ({ value: new THREE.Vector3(0, 0, 1) }), []);
  const onBeforeCompile = useCallback(
    (shader: THREE.WebGLProgramParametersWithUniforms) => {
      shader.uniforms.uSunView = sunUniform;
      shader.fragmentShader = shader.fragmentShader
        .replace("#include <common>", "#include <common>\nuniform vec3 uSunView;")
        .replace(
          "#include <emissivemap_fragment>",
          `#include <emissivemap_fragment>
          {
            // view-space normal (bump-perturbed) against view-space sun direction
            float sunFacing = dot(normalize(normal), normalize(uSunView));
            float nightSide = 1.0 - smoothstep(-0.2, 0.1, sunFacing);
            totalEmissiveRadiance *= nightSide;
          }`,
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
    return new THREE.SphereGeometry(config.radius, 64, 64);
  }, [config.radius]);

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
          <meshStandardMaterial
            map={earthTexture}
            bumpMap={bumpTexture}
            bumpScale={config.bumpScale * 0.05}
            roughness={0.75}
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
        <directionalLight ref={sunRef} intensity={2.6} color="#fff6e8" />
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

interface AtmosphereProps {
  radius: number;
  color: string;
  intensity: number;
  blur: number;
}

// Shell radius relative to the planet. The glow lives in the band between the
// planet's limb and this shell's silhouette.
const ATMO_SCALE = 1.15;
// |n·v| on the back face of the shell, measured where a view ray just grazes the
// planet: sqrt(1 - (1/ATMO_SCALE)^2). It runs 0 at the shell's outer silhouette
// up to this value at the planet's edge.
const ATMO_LIMB = Math.sqrt(1 - 1 / (ATMO_SCALE * ATMO_SCALE));

function Atmosphere({ radius, color, intensity, blur }: AtmosphereProps) {
  // blur -> falloff exponent: higher blur = softer, wider halo.
  const falloff = Math.max(0.6, 4 - blur);

  // Upstream wrote alpha = fresnel * intensity with NORMAL blending. On a
  // back-facing shell that fresnel term peaks at the shell's OUTER edge, so the
  // brightest part was the rim furthest from the planet — a hard ring, not an
  // atmosphere — and at the demo's intensity of 20 the alpha clamped to 1
  // across the whole band: the solid blue circle. This version is brightest at
  // the planet's edge and fades to zero at the shell silhouette, and blends
  // ADDITIVELY so it reads as emitted light rather than a painted stroke.
  const atmosphereMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        atmosphereColor: { value: new THREE.Color(color) },
        intensity: { value: intensity },
        falloff: { value: falloff },
        limb: { value: ATMO_LIMB },
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
        uniform vec3 atmosphereColor;
        uniform float intensity;
        uniform float falloff;
        uniform float limb;
        varying vec3 vNormal;
        varying vec3 vPosition;
        void main() {
          float t = abs(dot(normalize(vNormal), normalize(-vPosition)));
          // 0 at the shell's outer silhouette -> 1 at the planet's edge.
          float g = pow(smoothstep(0.0, limb, t), falloff);
          gl_FragColor = vec4(atmosphereColor * g * intensity, 1.0);
        }
      `,
      side: THREE.BackSide,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
  }, [color, intensity, falloff]);

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
  onMarkerClick?: (marker: GlobeMarker) => void;
  onMarkerHover?: (marker: GlobeMarker | null) => void;
}

function Scene({ markers, config, onMarkerClick, onMarkerHover }: SceneProps) {
  const { camera, gl } = useThree();

  // Set initial camera position (pulled back to accommodate markers)
  React.useEffect(() => {
    camera.position.set(0, 0, config.cameraDistance || config.radius * 3.5);
    camera.lookAt(0, 0, 0);
  }, [camera, config.radius, config.cameraDistance]);

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
        />
      )}

      {/* Controls */}
      <OrbitControls
        makeDefault
        enablePan={config.enablePan}
        enableZoom={config.enableZoom}
        minDistance={config.minDistance}
        maxDistance={config.maxDistance}
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
}: Globe3DProps) {
  const mergedConfig = useMemo(
    () => ({ ...defaultConfig, ...config }),
    [config],
  );
  const [ready, setReady] = useState(false);

  return (
    <div className={cn("relative h-[500px] w-full", className)}>
      <Canvas
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
        }}
        dpr={[1, 2]}
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
