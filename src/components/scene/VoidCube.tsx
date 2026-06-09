"use client";

// VoidCube — the GLOBAL SPINE canvas. ONE fixed, full-viewport R3F <Canvas>
// (position:fixed; inset:0; pointer-events:none; behind all content) meant to
// mount ONCE in the layout behind all 12 sections. It renders:
//   • the black void,
//   • the persistent cobalt EDGE-FRAME cube — the frozen Blender logo glb
//     (/models/cubixso-cube.glb), REUSED exactly like CubixsoCube.tsx
//     (useGLTF(url,"/draco/") + clone-with-cloned-materials),
//   • a cobalt INSTANCED particle field (one InstancedMesh, ≤2.5k, ~60fps).
//
// A single normalized scroll progress p = scrollY / innerHeight is read per
// frame (so p≈section index in viewports). The cube MIGRATES + MORPHS across
// phases as p climbs:
//   p≈0  Hero        — center, ignite (emissive breathes up from a settle)
//   p≈1  drift+disassemble toward the particle field (offset + spin loosen)
//   p≈2  recede DEEP into the void (pushes back on -Z, dims)
//   p≈3  tighten to a NODE-CLUSTER (scale down, fast tight spin)
//   p≈4  bloom toward a WIREFRAME-GLOBE pose (scale up, slow grand rotation)
//   p→1(end) reform to the CLEAN logo at center (snap back, emissive settles)
//
// Every transform is DAMPED (lerp toward target each frame) so the object trails
// scroll slightly — the mass-in-zero-g cue. The particle field counter-migrates:
// it tightens around the cube in the disassembly phase and spreads to a starfield
// in the globe phase.
//
// prefers-reduced-motion ⇒ cube FREEZES to one elegant static pose + particles
// stay static (no rotation, no breathing, no migration).
//
// Cobalt base #1B4FFF, emissive #4A7BFF. Environment uses drei <Lightformer>s
// (NO HDRI CDN), like the existing scene comps. dpr={[1,2]}, low geometry.

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Lightformer, useGLTF } from "@react-three/drei";
import * as THREE from "three";

const MODEL_URL = "/models/cubixso-cube.glb";

const COBALT = "#1B4FFF";
const GLOW = "#4A7BFF";

const PARTICLE_COUNT = 2400;

const clamp = (x: number, a: number, b: number) => Math.min(b, Math.max(a, x));
const clamp01 = (x: number) => clamp(x, 0, 1);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
// smooth ramp between phase keyframes a→b (a..b in p-space, returns 0..1)
const ramp = (p: number, a: number, b: number) => {
  const t = clamp01((p - a) / Math.max(1e-4, b - a));
  return t * t * (3 - 2 * t); // smoothstep
};

// ── Shared, rAF-throttled normalized scroll progress (in viewports). ──────────
// p ≈ section index; matches the design's single-scrollbar spine.
function useScrollProgress() {
  const ref = useRef(0);
  useEffect(() => {
    if (typeof window === "undefined") return;
    let raf = 0;
    let ticking = false;
    const update = () => {
      ref.current = window.scrollY / Math.max(1, window.innerHeight);
      ticking = false;
    };
    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        raf = requestAnimationFrame(update);
      }
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", update);
      cancelAnimationFrame(raf);
    };
  }, []);
  return ref;
}

// Phase count in p-space: Hero(0) → drift(1) → recede(2) → node(3) → globe(4) → reform(5+)
const P_REFORM = 5;

interface SpineProps {
  reduced: boolean;
  scrollRef: React.MutableRefObject<number>;
}

// ── The cobalt edge-frame cube (frozen logo glb, cloned per instance). ────────
function SpineCube({ reduced, scrollRef }: SpineProps) {
  const root = useRef<THREE.Group>(null);
  const { scene } = useGLTF(MODEL_URL, "/draco/");

  // Clone scene + materials so this spine instance is independent of the cache
  // (the loader/hero also clone — no shared-cache fights).
  const model = useMemo(() => {
    const c = scene.clone(true);
    c.traverse((o) => {
      const m = o as THREE.Mesh;
      if (m.isMesh) m.material = (m.material as THREE.Material).clone();
    });
    return c;
  }, [scene]);

  // Collect emissive materials + their authored base emissive intensity, and
  // tint the whole cube cobalt with a cobalt-glow emissive (the brand light).
  const mats = useMemo(() => {
    const list: { mat: THREE.MeshStandardMaterial; base: number }[] = [];
    const cobalt = new THREE.Color(COBALT);
    const glow = new THREE.Color(GLOW);
    model.traverse((o) => {
      const m = o as THREE.Mesh;
      if (!m.isMesh) return;
      const mat = m.material as THREE.MeshStandardMaterial;
      mat.color.copy(cobalt);
      mat.emissive.copy(glow);
      mat.metalness = 0.2;
      mat.roughness = 0.35;
      list.push({ mat, base: mat.emissiveIntensity ?? 1 });
    });
    return list;
  }, [model]);

  // Damped state (lerps toward per-frame phase targets so the cube TRAILS scroll).
  const sx = useRef(1);
  const px = useRef(0);
  const py = useRef(0);
  const pz = useRef(0);
  const spin = useRef(0); // accumulated free spin
  const spinRate = useRef(0.12); // damped current spin speed (rad/s)
  const tilt = useRef(0); // damped X tilt for the globe bloom
  const emit = useRef(1); // damped emissive multiplier (the "breathe")

  // Freeze to one elegant static pose for reduced-motion.
  useEffect(() => {
    if (!reduced) return;
    sx.current = 1;
    px.current = 0;
    py.current = 0;
    pz.current = 0;
    spin.current = 0.5;
    tilt.current = 0.18;
    emit.current = 1.1;
    if (root.current) {
      root.current.scale.setScalar(1);
      root.current.position.set(0, 0, 0);
      root.current.rotation.set(0.18, 0.5, 0);
    }
    mats.forEach((m) => (m.mat.emissiveIntensity = m.base * 1.1));
  }, [reduced, mats]);

  useFrame((state, delta) => {
    if (reduced) return; // frozen pose, no per-frame work
    const o = root.current;
    if (!o) return;

    const p = scrollRef.current;
    const d = Math.min(1, delta); // guard against tab-stall spikes
    const damp = (cur: number, target: number, speed: number) =>
      cur + (target - cur) * Math.min(1, d * speed);

    // ── Per-phase TARGETS (migration + morph) ────────────────────────────────
    // Hero: centered logo, gentle ignite. Drift: slide + loosen toward particles.
    // Recede: push deep on -Z + shrink. Node: tighten + fast tight spin.
    // Globe: bloom large + slow grand rotation + tilt. Reform: snap clean center.
    const rDrift = ramp(p, 0, 1);
    const rRecede = ramp(p, 1, 2);
    const rNode = ramp(p, 2, 3);
    const rGlobe = ramp(p, 3, 4);
    const rReform = ramp(p, 4, P_REFORM);

    // Position: center → drift up-right → recede deep → pull to node → bloom
    // centered globe → reform dead center.
    const tPx =
      lerp(0, 1.1, rDrift) * (1 - rRecede) + // drift then released as it recedes
      lerp(0, -0.6, rNode) * (1 - rGlobe);
    const tPy =
      lerp(0, 0.5, rDrift) * (1 - rRecede) +
      lerp(0, 0.4, rNode) * (1 - rGlobe);
    const tPz =
      lerp(0, -1.2, rDrift) + // start drifting back
      lerp(0, -3.0, rRecede) - // recede deep into the void
      lerp(0, 3.5, rNode) * 0 + // node stays deep
      lerp(0, 4.2, rGlobe); // globe blooms back forward toward camera
    // reform pulls everything home to 0
    const homePx = lerp(tPx, 0, rReform);
    const homePy = lerp(tPy, 0, rReform);
    const homePz = lerp(tPz, 0, rReform);

    // Scale: 1 → loosen → recede small → node tiny cluster → globe large → 1.
    const tS =
      lerp(1, 0.92, rDrift) *
      lerp(1, 0.7, rRecede) *
      lerp(1, 0.55, rNode) * // tight node-cluster
      lerp(1, 2.55, rGlobe); // wireframe-globe bloom
    const homeS = lerp(tS, 1, rReform);

    // Spin rate: slow idle → loosens during disassembly → FAST tight spin at the
    // node → SLOW grand rotation for the globe → settles to idle on reform.
    const tSpinRate =
      0.1 +
      0.45 * rDrift * (1 - rNode) +
      0.85 * rNode * (1 - rGlobe) + // node spins tight + fast
      0.06 * rGlobe; // globe is a slow, grand turn
    const homeSpinRate = lerp(tSpinRate, 0.1, rReform);

    // X-tilt: flat → leans for the globe bloom → flat on reform.
    const tTilt = lerp(0, 0.42, rGlobe);
    const homeTilt = lerp(tTilt, 0, rReform);

    // Emissive BREATHE per phase: hero settle (1) → drift dims slightly (0.7) →
    // recede dim (0.45) → node PULSE bright (1.6) → globe radiant (1.25) →
    // reform settles to a calm 1.0, with a soft sine shimmer layered on top.
    const tEmit =
      lerp(1, 0.7, rDrift) *
      lerp(1, 0.6, rRecede) *
      lerp(1, 2.6, rNode) * // node-cluster inference pulse
      lerp(1, 0.78, rGlobe); // globe radiant but spread
    const homeEmit = lerp(tEmit, 1, rReform);
    const shimmer = 1 + Math.sin(state.clock.elapsedTime * 1.1) * 0.08;

    // ── DAMP everything (trail scroll slightly = mass-in-zero-g) ──────────────
    px.current = damp(px.current, homePx, 2.2);
    py.current = damp(py.current, homePy, 2.2);
    pz.current = damp(pz.current, homePz, 2.0);
    sx.current = damp(sx.current, homeS, 2.4);
    spinRate.current = damp(spinRate.current, homeSpinRate, 1.8);
    tilt.current = damp(tilt.current, homeTilt, 2.0);
    emit.current = damp(emit.current, homeEmit, 1.6);

    // Apply free-running spin (rate is itself damped above).
    spin.current += d * spinRate.current;

    o.position.set(px.current, py.current, pz.current);
    o.scale.setScalar(sx.current);
    o.rotation.set(tilt.current, spin.current, 0);

    // Gentle perpetual hover bob (antigravity float) — relaxes near reform/home.
    o.position.y += Math.sin(state.clock.elapsedTime * 1.2) * 0.08;

    // Drive emissive across all bar materials.
    const e = emit.current * shimmer;
    for (const m of mats) m.mat.emissiveIntensity = m.base * e;
  });

  return (
    <group ref={root}>
      <primitive object={model} />
    </group>
  );
}

// ── Cobalt INSTANCED particle field — one InstancedMesh, GPU-cheap. ───────────
function ParticleField({ reduced, scrollRef }: SpineProps) {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  // Base positions on a soft fibonacci shell (so the field reads as a cloud that
  // can tighten to the cube or spread to a starfield).
  const base = useMemo(() => {
    const arr = new Float32Array(PARTICLE_COUNT * 3);
    const golden = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const y = 1 - (i / (PARTICLE_COUNT - 1)) * 2;
      const r = Math.sqrt(Math.max(0, 1 - y * y));
      const theta = golden * i;
      const rr = 3.4 * (0.55 + Math.random() * 0.9); // radial jitter = depth
      arr[i * 3] = Math.cos(theta) * r * rr;
      arr[i * 3 + 1] = y * rr;
      arr[i * 3 + 2] = Math.sin(theta) * r * rr;
    }
    return arr;
  }, []);

  const spin = useRef(0);

  // Static placement for reduced-motion (write once).
  useEffect(() => {
    if (!reduced || !mesh.current) return;
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      dummy.position.set(base[i * 3], base[i * 3 + 1], base[i * 3 + 2]);
      dummy.updateMatrix();
      mesh.current.setMatrixAt(i, dummy.matrix);
    }
    mesh.current.instanceMatrix.needsUpdate = true;
  }, [reduced, base, dummy]);

  useFrame((state, delta) => {
    if (reduced || !mesh.current) return;
    const p = scrollRef.current;
    const d = Math.min(1, delta);

    spin.current += d * 0.04;

    // Field radius migrates with the cube's story: tightens around the cube as it
    // disassembles, spreads to a wide starfield for the globe, returns home.
    const rDrift = ramp(p, 0, 1);
    const rNode = ramp(p, 2, 3);
    const rGlobe = ramp(p, 3, 4);
    const rReform = ramp(p, 4, P_REFORM);
    const fieldScale =
      lerp(1, 0.72, rDrift) * // tighten toward the cube during disassembly
      lerp(1, 0.55, rNode) * // very tight around the node-cluster
      lerp(1, 2.6, rGlobe); // bloom out to a starfield around the globe
    const scale = lerp(fieldScale, 1, rReform);

    const t = state.clock.elapsedTime;
    const c = Math.cos(spin.current);
    const s = Math.sin(spin.current);

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const bx = base[i * 3];
      const by = base[i * 3 + 1];
      const bz = base[i * 3 + 2];
      // slow Y rotation of the whole field
      let x = (bx * c - bz * s) * scale;
      const yy = by * scale;
      let z = (bx * s + bz * c) * scale;
      // tiny per-particle drift so the cloud breathes (cheap, deterministic)
      x += Math.sin(t * 0.5 + i) * 0.02;
      z += Math.cos(t * 0.5 + i * 1.3) * 0.02;
      dummy.position.set(x, yy, z);
      dummy.updateMatrix();
      mesh.current.setMatrixAt(i, dummy.matrix);
    }
    mesh.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh
      ref={mesh}
      args={[undefined, undefined, PARTICLE_COUNT]}
      frustumCulled={false}
    >
      <sphereGeometry args={[0.012, 6, 6]} />
      <meshBasicMaterial
        color={GLOW}
        transparent
        opacity={0.85}
        toneMapped={false}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </instancedMesh>
  );
}

// ── The spine scene (cube + particles + lightformer environment). ─────────────
function Scene({ reduced, scrollRef }: SpineProps) {
  return (
    <>
      <ambientLight intensity={0.35} />
      <SpineCube reduced={reduced} scrollRef={scrollRef} />
      <ParticleField reduced={reduced} scrollRef={scrollRef} />
      {/* Lightformer env — NO HDRI CDN. Cobalt-keyed studio rims so the glass
          edge-frame reads as a cobalt intelligence in the void. */}
      <Environment resolution={128} frames={1} environmentIntensity={0.7}>
        <Lightformer intensity={2.6} color={GLOW} position={[0, 3, 3]} scale={[7, 3, 1]} />
        <Lightformer intensity={1.6} color={COBALT} position={[-4, 1, 2]} scale={[3, 4, 1]} />
        <Lightformer intensity={1.2} color="#ffffff" position={[4, -1, -3]} scale={[5, 3, 1]} />
        <Lightformer intensity={1.0} color={GLOW} position={[0, -3, 2]} scale={[6, 2, 1]} />
      </Environment>
    </>
  );
}

export function VoidCube() {
  const scrollRef = useScrollProgress();
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  // Pause the loop when the tab is hidden (perf). reduced-motion already freezes,
  // but a hidden tab should never burn frames either.
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    if (typeof document === "undefined") return;
    const onVis = () => setVisible(!document.hidden);
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  // reduced-motion → render a single still frame ("demand", never invalidated).
  const frameloop = reduced || !visible ? "demand" : "always";

  return (
    <div
      aria-hidden
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        pointerEvents: "none",
        background: "#000000",
      }}
    >
      <Canvas
        camera={{ position: [0, 0, 6], fov: 45, near: 0.1, far: 100 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
        frameloop={frameloop}
        style={{ position: "absolute", inset: 0 }}
      >
        <color attach="background" args={["#000000"]} />
        <Suspense fallback={null}>
          <Scene reduced={reduced} scrollRef={scrollRef} />
        </Suspense>
      </Canvas>
    </div>
  );
}

useGLTF.preload(MODEL_URL, "/draco/");

export default VoidCube;
