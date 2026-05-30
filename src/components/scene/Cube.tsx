"use client";

// Cube — the protagonist. 12 wireframe edges that DRIFT outward based on
// scroll progress (fragmentation 0..1) + Y core (3 cylinders + junction
// sphere) that scales and glows with progress. The scroll listener is
// inlined here; CubeController is a thin wrapper around this component.
//
// Scroll-state curve:
//   00–10 (hero)        cube assembled
//   10–30 (manifesto/kin) cube opens slightly
//   30–40 (services)    fully fragmented
//   40–60 (products/ind) re-merging
//   60–70 (whyus)       collapsed, glow blowout
//   70–90 (metrics/test/global) re-emerging
//   90–100 (cta)        cube fully reformed + Y glows

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import {
  FragmentsGrid,
  OrbitalModules,
  LiquidParticles,
  ParticleCloud,
  GlobeWire,
  type OverlayHandle,
} from "./CubeOverlays";
import { CubeFaces, type FacesHandle } from "./CubeFaces";
import { stateWeight } from "./cubeStates";

const HALF = 0.8;                // half-extent of a 1.6 cube
const MAX_EDGE_OFFSET = 0.55;    // how far edges drift at fragmentation = 1
const ACCENT      = "#1B4FFF";
const ACCENT_GLOW = "#4A7BFF";
const EDGE_COLOR_DARK  = "#FFFFFF";
const EDGE_COLOR_LIGHT = "#0a0a0c";

// 8 corners of the cube
const CORNERS = [
  [-1, -1, -1], [ 1, -1, -1], [ 1,  1, -1], [-1,  1, -1], // back face
  [-1, -1,  1], [ 1, -1,  1], [ 1,  1,  1], [-1,  1,  1], // front face
].map(([x, y, z]) => new THREE.Vector3(x * HALF, y * HALF, z * HALF));

// 12 edges as pairs of corner indices
const EDGE_PAIRS: [number, number][] = [
  [0, 1], [1, 2], [2, 3], [3, 0], // back face
  [4, 5], [5, 6], [6, 7], [7, 4], // front face
  [0, 4], [1, 5], [2, 6], [3, 7], // verticals
];

// Pre-compute base vertex positions (24 verts) + per-edge outward direction
const BASE_POSITIONS = new Float32Array(EDGE_PAIRS.length * 6);
const EDGE_DIRS = new Float32Array(EDGE_PAIRS.length * 3);
{
  let vi = 0, di = 0;
  for (const [ai, bi] of EDGE_PAIRS) {
    const a = CORNERS[ai], b = CORNERS[bi];
    BASE_POSITIONS[vi++] = a.x; BASE_POSITIONS[vi++] = a.y; BASE_POSITIONS[vi++] = a.z;
    BASE_POSITIONS[vi++] = b.x; BASE_POSITIONS[vi++] = b.y; BASE_POSITIONS[vi++] = b.z;
    const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2, mz = (a.z + b.z) / 2;
    const len = Math.hypot(mx, my, mz);
    EDGE_DIRS[di++] = mx / len;
    EDGE_DIRS[di++] = my / len;
    EDGE_DIRS[di++] = mz / len;
  }
}

// ── Scroll progress hook (window scroll, captured passive) ──────────────────
function useScrollProgress(): React.MutableRefObject<number> {
  const ref = useRef(0);
  useEffect(() => {
    const onScroll = () => {
      const doc = document.documentElement;
      const max = doc.scrollHeight - window.innerHeight;
      ref.current = max <= 0 ? 0 : window.scrollY / max;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return ref;
}

// ── State curves — derive cube attributes from scroll progress (0..1) ──────
function fragmentationAt(p: number): number {
  // bell-ish curve peaking at services (~0.35)
  if (p < 0.1)  return 0;
  if (p < 0.35) return ((p - 0.1) / 0.25);          // 0 → 1
  if (p < 0.55) return 1 - ((p - 0.35) / 0.20) * 0.7; // 1 → 0.3
  if (p < 0.65) return 0.3 - ((p - 0.55) / 0.10) * 0.3; // 0.3 → 0 (whyus collapse)
  if (p < 0.90) return ((p - 0.65) / 0.25) * 0.2;    // 0 → 0.2 (gentle re-emerge)
  return Math.max(0, 0.2 - ((p - 0.90) / 0.10) * 0.2); // 0.2 → 0 (cta reform)
}
function scaleAt(p: number): number {
  if (p < 0.55) return 1;
  if (p < 0.65) return 1 - ((p - 0.55) / 0.10) * 0.35; // shrink to 0.65 at whyus
  if (p < 0.85) return 0.65 + ((p - 0.65) / 0.20) * 0.35; // grow back to 1
  return 1;
}
function glowAt(p: number, base = 0.6): number {
  // higher glow at whyus collapse and cta
  if (p < 0.55) return base;
  if (p < 0.65) return base + ((p - 0.55) / 0.10) * 1.2; // peak 1.8 at whyus
  if (p < 0.90) return 1.8 - ((p - 0.65) / 0.25) * 1.0;  // ramp down to 0.8
  return 0.8 + ((p - 0.90) / 0.10) * 1.0;                // 0.8 → 1.8 at cta
}

// Hubtown-style hinge open schedule. Returns [openAmount, holdMultiplier].
// openAmount 0..1 — how splayed the panels are
// hold       0..1 — scale-modulating term so panels disappear at whyus collapse
function hingeAt(p: number): [number, number] {
  // checkpoints: hero closed, services full bloom, whyus tight, global petal, cta clean
  // smoothstep
  const ss = (x: number) => {
    const t = Math.max(0, Math.min(1, x));
    return t * t * (3 - 2 * t);
  };
  // bloom curve — opens 0→1 between hero(0) and services(0.32),
  // closes 1→0 between services and whyus(0.66), reopens to petal mid at global(0.86),
  // closes back at cta.
  let open: number;
  if (p < 0.32) {
    open = ss(p / 0.32);                              // 0 → 1
  } else if (p < 0.66) {
    open = 1 - ss((p - 0.32) / 0.34);                 // 1 → 0
  } else if (p < 0.86) {
    open = ss((p - 0.66) / 0.20) * 0.65;              // 0 → 0.65 (petal)
  } else {
    open = 0.65 - ss((p - 0.86) / 0.14) * 0.65;       // 0.65 → 0
  }
  // hold shrinks the panel opacity at the collapse moment
  const hold = p > 0.60 && p < 0.72
    ? 1 - ss((p - 0.60) / 0.06) + ss((p - 0.68) / 0.04) * 0.5
    : 1;
  return [open, Math.max(0, hold)];
}

// Shared, stable theme handle read imperatively inside the Canvas so theme
// toggles never re-render any R3F element (which would recreate inline-args
// primitives and crash on the cyclic scene graph).
export type ThemeRef = { current: { isDark: boolean; bg: string } };

interface CubeProps {
  size?: number;            // visual reference, the geometry is hard-coded at HALF*2
  themeRef?: ThemeRef;      // imperative theme source (edge color swap)
}

export function Cube({ themeRef }: CubeProps) {
  // Read the initial theme once for first paint; live changes are applied
  // imperatively in useFrame so this component never needs to re-render.
  const initialDark = themeRef ? themeRef.current.isDark : true;
  const group = useRef<THREE.Group>(null);
  const yCoreGroup = useRef<THREE.Group>(null);
  const linesRef = useRef<THREE.LineSegments>(null);
  const matY    = useRef<THREE.MeshPhysicalMaterial>(null);
  const matCore = useRef<THREE.MeshPhysicalMaterial>(null);
  const edgeMat = useRef<THREE.LineBasicMaterial>(null);
  const lastDark = useRef(initialDark);

  // Overlay handles — fragments / modules / liquid / particles / globe
  const fragRef    = useRef<OverlayHandle>(null);
  const modulesRef = useRef<OverlayHandle>(null);
  const liquidRef  = useRef<OverlayHandle>(null);
  const cloudRef   = useRef<OverlayHandle>(null);
  const globeRef   = useRef<OverlayHandle>(null);
  const facesRef   = useRef<FacesHandle>(null);

  const progressRef = useScrollProgress();

  // ── Geometry: BufferGeometry with 24 vertex slots, drawn as line pairs ──
  const geom = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const positions = new Float32Array(BASE_POSITIONS);
    const posAttr = new THREE.BufferAttribute(positions, 3);
    posAttr.usage = THREE.DynamicDrawUsage;        // updated every frame
    g.setAttribute("position", posAttr);
    return g;
  }, []);

  // ── Y core — single ExtrudeGeometry built from the brand glyph silhouette.
  // Traced from the logo SVG strokes (M17 32 L48 40, M83 32 L52 40, M50 43 L50 88),
  // closed into a Y outline and extruded with a soft bevel.
  const yGeom = useMemo(() => {
    const s = HALF * 1.05;           // overall fit inside the cage
    const w = 0.085;                 // half-width of the arms / stem
    const armOuterY  =  0.62 * s;
    const armOuterX  =  0.58 * s;
    const armInnerX  =  0.46 * s;
    const armInnerY  =  0.50 * s;
    const stemTopY   = -0.02 * s;    // where arms meet stem
    const stemBotY   = -0.92 * s;

    const shape = new THREE.Shape();
    // Start at top-left arm outer tip, walk clockwise
    shape.moveTo(-armOuterX,  armOuterY);
    shape.lineTo(-armInnerX + w * 0.6,  armInnerY);
    shape.lineTo(-w,          stemTopY);
    shape.lineTo(-w,          stemBotY);
    shape.lineTo( w,          stemBotY);
    shape.lineTo( w,          stemTopY);
    shape.lineTo( armInnerX - w * 0.6,  armInnerY);
    shape.lineTo( armOuterX,  armOuterY);
    shape.lineTo( armOuterX - w * 1.6,  armOuterY + w * 1.0);
    shape.lineTo( 0,          armInnerY - w * 0.2);
    shape.lineTo(-armOuterX + w * 1.6,  armOuterY + w * 1.0);
    shape.closePath();

    const g = new THREE.ExtrudeGeometry(shape, {
      depth: 0.18,
      bevelEnabled: true,
      bevelThickness: 0.02,
      bevelSize: 0.018,
      bevelSegments: 3,
      curveSegments: 8,
    });
    g.center();                      // center on origin
    g.translate(0, 0, -0.05);        // pull slightly behind cage center
    return g;
  }, []);

  // Smooth-lerped current values (avoid scroll jitter)
  const cur = useRef({ frag: 0, scale: 1, glow: 0.6, yaw: 0, tilt: 0 });

  useFrame((state, delta) => {
    const g = group.current;
    if (!g) return;

    const p = progressRef.current;
    const targetFrag  = fragmentationAt(p);
    const targetScale = scaleAt(p);
    const targetGlow  = glowAt(p);

    // smooth lerp
    const k = 0.08;
    cur.current.frag  += (targetFrag  - cur.current.frag)  * k;
    cur.current.scale += (targetScale - cur.current.scale) * k;
    cur.current.glow  += (targetGlow  - cur.current.glow)  * k;

    // Apply edge drift
    const f = cur.current.frag * MAX_EDGE_OFFSET;
    const arr = (geom.attributes.position as THREE.BufferAttribute).array as Float32Array;
    let vi = 0, di = 0;
    for (let e = 0; e < EDGE_PAIRS.length; e++) {
      const dx = EDGE_DIRS[di] * f;
      const dy = EDGE_DIRS[di + 1] * f;
      const dz = EDGE_DIRS[di + 2] * f;
      arr[vi]     = BASE_POSITIONS[vi]     + dx;
      arr[vi + 1] = BASE_POSITIONS[vi + 1] + dy;
      arr[vi + 2] = BASE_POSITIONS[vi + 2] + dz;
      arr[vi + 3] = BASE_POSITIONS[vi + 3] + dx;
      arr[vi + 4] = BASE_POSITIONS[vi + 4] + dy;
      arr[vi + 5] = BASE_POSITIONS[vi + 5] + dz;
      vi += 6;
      di += 3;
    }
    (geom.attributes.position as THREE.BufferAttribute).needsUpdate = true;

    // Idle rotation + scroll-coupled tilt + mouse parallax
    g.rotation.y += delta * 0.22 + (cur.current.frag * delta * 0.4);
    cur.current.tilt += (state.mouse.y * 0.087 - cur.current.tilt) * 0.05;
    g.rotation.x = cur.current.tilt + Math.sin(state.clock.elapsedTime * 0.4) * 0.06;
    g.scale.setScalar(cur.current.scale);

    // Y core shrinks faster than the cage when fragmenting (visual contrast)
    if (yCoreGroup.current) {
      const ys = 1 - cur.current.frag * 0.45;
      yCoreGroup.current.scale.setScalar(ys);
    }

    // Apply glow to materials
    const gl = cur.current.glow;
    if (matY.current)    matY.current.emissiveIntensity    = gl;
    if (matCore.current) matCore.current.emissiveIntensity = gl * 1.3;

    // ── State weights for the 5 morph overlays ────────────────────────────
    // Hero / Manifesto / Kinetic / CTA share the base cube — their weight
    // does NOT drive an overlay; instead the cube edges fade out as the
    // other states ramp up. Y core stays visible except during particles/globe.
    const wFragments  = stateWeight(p, "services");
    const wLiquid     = stateWeight(p, "products");
    const wModules    = stateWeight(p, "industries");
    const wCollapsed  = stateWeight(p, "whyus");
    const wParticles  = stateWeight(p, "metrics");
    const wGlobe      = stateWeight(p, "global");

    // Dim the base cube edges when any morph form is dominant
    const morphAmount = Math.max(wFragments, wLiquid, wModules, wParticles, wGlobe);
    if (edgeMat.current) {
      edgeMat.current.opacity = 0.92 - morphAmount * 0.75;
      // Imperative theme swap — only touch the material when it actually
      // flips, so there's no per-frame string parse.
      const dark = themeRef ? themeRef.current.isDark : true;
      if (dark !== lastDark.current) {
        lastDark.current = dark;
        edgeMat.current.color.set(dark ? EDGE_COLOR_DARK : EDGE_COLOR_LIGHT);
      }
    }
    // Y core hides during particles + globe (where it would clip visually)
    if (yCoreGroup.current) {
      const hideY = Math.max(wParticles, wGlobe);
      const ys = (1 - cur.current.frag * 0.45) * (1 - hideY * 0.92) * (1 - wCollapsed * 0.55 + wCollapsed * 1.4);
      yCoreGroup.current.scale.setScalar(Math.max(0.05, ys));
    }

    fragRef.current?.setWeight(wFragments);
    liquidRef.current?.setWeight(wLiquid);
    modulesRef.current?.setWeight(wModules);
    cloudRef.current?.setWeight(wParticles);
    globeRef.current?.setWeight(wGlobe);

    // Hubtown-style hinged face bloom
    const [hingeOpen, hingeHold] = hingeAt(p);
    facesRef.current?.setOpen(hingeOpen, hingeHold);
  });

  const edgeColor = initialDark ? EDGE_COLOR_DARK : EDGE_COLOR_LIGHT;

  return (
    <group ref={group}>
      <lineSegments ref={linesRef} geometry={geom}>
        <lineBasicMaterial
          ref={edgeMat}
          color={edgeColor}
          transparent
          opacity={0.92}
          depthWrite={false}
        />
      </lineSegments>

      {/* Hubtown-signature hinged face panels — mechanical bloom */}
      <CubeFaces ref={facesRef} themeIsDark={initialDark} />

      {/* Morph overlays — each fades in around its state checkpoint */}
      <FragmentsGrid     ref={fragRef} />
      <OrbitalModules    ref={modulesRef} />
      <LiquidParticles   ref={liquidRef} />
      <ParticleCloud     ref={cloudRef} />
      <GlobeWire         ref={globeRef} />

      <group ref={yCoreGroup}>
        {/* Brand-Y extrusion — single mesh traced from the logo SVG outline */}
        <mesh geometry={yGeom}>
          <meshPhysicalMaterial
            ref={matY}
            color={ACCENT}
            emissive={ACCENT_GLOW}
            emissiveIntensity={0.6}
            clearcoat={1}
            clearcoatRoughness={0.05}
            roughness={0.15}
            metalness={0.25}
            toneMapped={false}
          />
        </mesh>
        {/* Junction core — small sphere at the Y branch point */}
        <mesh position={[0, 0, 0.04]}>
          <sphereGeometry args={[0.085, 28, 28]} />
          <meshPhysicalMaterial
            ref={matCore}
            color={ACCENT}
            emissive={ACCENT_GLOW}
            emissiveIntensity={0.78}
            clearcoat={1}
            clearcoatRoughness={0.05}
            roughness={0.12}
            toneMapped={false}
          />
        </mesh>
      </group>
    </group>
  );
}

// Exported so CubeController (or any sibling) can read the same scroll signal
export { useScrollProgress };
