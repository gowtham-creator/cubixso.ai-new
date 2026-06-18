"use client";

// VoidCube — the GLOBAL SPINE canvas. ONE fixed, full-viewport R3F <Canvas>
// (position:fixed; inset:0; pointer-events:none; behind all content) meant to
// mount ONCE in the layout behind all 12 sections. It renders:
//   • a TRANSPARENT void — the Aurora layer mounted just below paints the
//     black base + breathing gradient field behind this canvas,
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
import { cdn } from "@/lib/cdn";

const MODEL_URL = cdn("/models/cubixso-cube.glb");
const DRACO_URL = cdn("/draco/");

const COBALT = "#1B4FFF";
const GLOW = "#4A7BFF";

const PARTICLE_COUNT = 2400;

// ── Loader → hero IGNITION handoff ────────────────────────────────────────────
// Until the intro curtain lifts ("cubixso:revealed") the hero cube idles dim
// (30% emissive) and slightly small (×0.6). On reveal it IGNITES: spring-
// overshoot scale to 1, emissive ramps to full over ~1.2s, and the particle
// field gets a one-shot outward velocity impulse before settling back into the
// ambient drift. Already-seen fast path (sessionStorage cubixso.seen — event
// fired before mount / reload mid-session) snaps straight to the final state.
const IGNITE_SECONDS = 1.2;
const BURST_DONE_S = 4; // impulse envelope fully decayed by here

interface IgniteState {
  revealed: boolean;
  instant: boolean; // fast path: no animation, jump to final state
  t: number; // 0..1 ignition progress (SpineCube is the only writer)
}

const clamp = (x: number, a: number, b: number) => Math.min(b, Math.max(a, x));
const clamp01 = (x: number) => clamp(x, 0, 1);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
// smooth ramp between phase keyframes a→b (a..b in p-space, returns 0..1)
const ramp = (p: number, a: number, b: number) => {
  const t = clamp01((p - a) / Math.max(1e-4, b - a));
  return t * t * (3 - 2 * t); // smoothstep
};

// ── Shared, rAF-throttled normalized scroll progress — ANCHOR-MAPPED. ─────────
// p is a virtual "phase index": exactly 1.0 as #manifesto arrives, 2.0 at
// #services, 3.0 at #edge (WhyUs), 4.0 at #reach (Global → the globe bloom),
// 5.0 at #legacy (FinalCTA → reform). Piecewise-linear between anchors.
//
// Why not scrollY/innerHeight: pin-spacers (KineticStack/Global ScrollTriggers)
// and lazy-below-fold content stretch the page, so fixed viewport-multiples
// drift away from the sections they were tuned against. Measuring the REAL
// anchors keeps the cube's story locked to the narrative no matter how tall
// the page becomes.
const PHASE_ANCHOR_IDS = ["manifesto", "services", "edge", "reach", "legacy"];

function useScrollProgress() {
  const ref = useRef(0);
  useEffect(() => {
    if (typeof window === "undefined") return;
    let raf = 0;
    let ticking = false;
    // anchors[i] = scrollY at which phase index becomes i+1
    const anchors: number[] = [];

    const measure = () => {
      const vh = Math.max(1, window.innerHeight);
      PHASE_ANCHOR_IDS.forEach((id, i) => {
        const el = document.getElementById(id);
        if (!el) {
          // missing anchor (non-home route) — fall back to viewport multiples
          if (anchors[i] === undefined) anchors[i] = (i + 1) * vh;
          return;
        }
        // While a section is actively PINNED ScrollTrigger holds it
        // position:fixed — its rect is meaningless; keep the cached value.
        if (getComputedStyle(el).position === "fixed") return;
        // "Arrival" = section top reaching 55% up the viewport (the cube
        // transition slightly leads the section, mass-in-zero-g style).
        const top = el.getBoundingClientRect().top + window.scrollY;
        anchors[i] = Math.max(1, top - vh * 0.55);
      });
    };

    const update = () => {
      const y = window.scrollY;
      const vh = Math.max(1, window.innerHeight);
      let p: number;
      if (anchors.length === 0 || anchors[0] === undefined) {
        p = y / vh; // pre-measure fallback
      } else if (y <= anchors[0]) {
        p = y / Math.max(1, anchors[0]); // 0 → 1 across the hero approach
      } else {
        const last = anchors.length - 1;
        let i = 0;
        while (i < last && y > anchors[i + 1]) i++;
        if (i >= last) {
          // beyond the final anchor: advance gently in viewport units
          p = anchors.length + (y - anchors[last]) / vh;
        } else {
          const span = Math.max(1, anchors[i + 1] - anchors[i]);
          p = i + 1 + (y - anchors[i]) / span;
        }
      }
      ref.current = p;
      ticking = false;
    };
    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        raf = requestAnimationFrame(update);
      }
    };
    const onResize = () => {
      measure();
      update();
    };

    measure();
    update();
    // Lazy-below-fold content (map, previews, mascot) grows the page after
    // load — re-measure anchors whenever the document actually resizes.
    let roTimer = 0;
    const ro = new ResizeObserver(() => {
      window.clearTimeout(roTimer);
      roTimer = window.setTimeout(onResize, 250);
    });
    ro.observe(document.body);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      window.clearTimeout(roTimer);
      ro.disconnect();
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
  igniteRef: React.MutableRefObject<IgniteState>;
}

// ── The cobalt edge-frame cube (frozen logo glb, cloned per instance). ────────
function SpineCube({ reduced, scrollRef, igniteRef }: SpineProps) {
  const root = useRef<THREE.Group>(null);
  const { scene } = useGLTF(MODEL_URL, DRACO_URL);

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
      // transparent so the spine cube can FADE IN as the cinematic VideoVoid
      // film (which carries its own cube through the hero) fades out.
      mat.transparent = true;
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

    // ── IGNITION (loader handoff) — dim/small until revealed, then spring up.
    const ig = igniteRef.current;
    let igScale = 1;
    let igEmit = 1;
    if (ig.t < 1) {
      if (ig.revealed) {
        ig.t = ig.instant ? 1 : Math.min(1, ig.t + d / IGNITE_SECONDS);
      }
      const it = ig.revealed ? ig.t : 0;
      // analytic underdamped spring 0→1: overshoots ~16% then settles by t=1
      const f = it >= 1 ? 1 : 1 - Math.exp(-6 * it) * Math.cos(10.5 * it);
      igScale = lerp(0.6, 1, f); // small → overshoot → 1
      igEmit = lerp(0.3, 1, f); // dim → flash past full → full
    }

    o.position.set(px.current, py.current, pz.current);
    o.scale.setScalar(sx.current * igScale);
    o.rotation.set(tilt.current, spin.current, 0);

    // Gentle perpetual hover bob (antigravity float) — relaxes near reform/home.
    o.position.y += Math.sin(state.clock.elapsedTime * 1.2) * 0.08;

    // Drive emissive across all bar materials.
    const e = emit.current * shimmer * igEmit;
    // FILM → REALTIME HANDOFF: the cinematic VideoVoid carries its own cube
    // through the hero; the live spine cube fades in across the same window
    // (p 0 → ~0.9) so there is exactly ONE cube on screen at any moment.
    const fade = clamp01(p * 1.15);
    for (const m of mats) {
      m.mat.emissiveIntensity = m.base * e;
      m.mat.opacity = fade;
    }
    o.visible = fade > 0.01;
  });

  return (
    <group ref={root}>
      <primitive object={model} />
    </group>
  );
}

// ── CINEMATIC BOKEH DUST — sparse, soft, filmic (v3). ─────────────────────────
// Two THREE.Points layers (fine dust + a few large bokeh orbs) drawn with a
// radial-gradient sprite so every point is a soft glow, not a hard dot. The
// whole field rides ONE group transform per layer (rotation/scale/bob) — no
// per-particle CPU work at all. Matches the Blender film's luminous-dust
// mood so the hero handoff feels continuous.
const DUST_COUNT = 220;
const ORB_COUNT = 36;

function makeGlowTexture() {
  const c = document.createElement("canvas");
  c.width = c.height = 64;
  const g = c.getContext("2d")!;
  const grad = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  grad.addColorStop(0, "rgba(255,255,255,1)");
  grad.addColorStop(0.35, "rgba(214,228,255,0.55)");
  grad.addColorStop(1, "rgba(160,190,255,0)");
  g.fillStyle = grad;
  g.fillRect(0, 0, 64, 64);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

// Fibonacci shell positions — same cloud the cube story expects.
function shellPositions(count: number, radius: number) {
  const arr = new Float32Array(count * 3);
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < count; i++) {
    const y = 1 - (i / (count - 1)) * 2;
    const r = Math.sqrt(Math.max(0, 1 - y * y));
    const theta = golden * i;
    const rr = radius * (0.55 + Math.random() * 0.9);
    arr[i * 3] = Math.cos(theta) * r * rr;
    arr[i * 3 + 1] = y * rr;
    arr[i * 3 + 2] = Math.sin(theta) * r * rr;
  }
  return arr;
}

function ParticleField({ reduced, scrollRef, igniteRef }: SpineProps) {
  const group = useRef<THREE.Group>(null);

  const glowTex = useMemo(() => makeGlowTexture(), []);
  const dustGeo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute(
      "position",
      new THREE.BufferAttribute(shellPositions(DUST_COUNT, 3.6), 3),
    );
    return g;
  }, []);
  const orbGeo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute(
      "position",
      new THREE.BufferAttribute(shellPositions(ORB_COUNT, 4.4), 3),
    );
    return g;
  }, []);

  const spin = useRef(0);
  const burstT = useRef(-1); // -1 = ignition burst not started yet

  useFrame((state, delta) => {
    if (reduced || !group.current) return;
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

    // ── IGNITION BURST (loader handoff) — one-shot outward velocity impulse on
    // reveal, then settle back into the ambient drift. Fast path skips it.
    const ig = igniteRef.current;
    if (ig.revealed && burstT.current < 0) {
      burstT.current = ig.instant ? BURST_DONE_S : 0;
    }
    let burst = 0;
    if (burstT.current >= 0 && burstT.current < BURST_DONE_S) {
      burstT.current += d;
      const bt = burstT.current / 0.45;
      burst = bt * Math.exp(1 - bt); // impulse response: peaks 1 at bt=1, decays
    }

    const scale = lerp(fieldScale, 1, rReform) * (1 + 0.75 * burst);

    const t = state.clock.elapsedTime;
    // ONE transform for the whole field — slow turn, story-scale, gentle bob.
    group.current.rotation.y = spin.current;
    group.current.scale.setScalar(scale);
    group.current.position.y = Math.sin(t * 0.22) * 0.18;
  });

  return (
    <group ref={group}>
      {/* fine dust — small soft glows */}
      <points geometry={dustGeo} frustumCulled={false}>
        <pointsMaterial
          map={glowTex}
          color={GLOW}
          size={0.085}
          sizeAttenuation
          transparent
          opacity={0.5}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
      {/* large bokeh orbs — the filmic depth layer */}
      <points geometry={orbGeo} frustumCulled={false}>
        <pointsMaterial
          map={glowTex}
          color="#9db9ff"
          size={0.42}
          sizeAttenuation
          transparent
          opacity={0.16}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  );
}

// ── The spine scene (cube + particles + lightformer environment). ─────────────
function Scene({ reduced, scrollRef, igniteRef }: SpineProps) {
  return (
    <>
      <ambientLight intensity={0.35} />
      <SpineCube reduced={reduced} scrollRef={scrollRef} igniteRef={igniteRef} />
      <ParticleField reduced={reduced} scrollRef={scrollRef} igniteRef={igniteRef} />
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

  // Loader → hero handoff: listen for the intro curtain lift. If the intro
  // already ran this session (event fired before mount / mid-session reload),
  // skip the ignition animation and render the final ignited state.
  const igniteRef = useRef<IgniteState>({ revealed: false, instant: false, t: 0 });
  useEffect(() => {
    if (typeof window === "undefined") return;
    const ig = igniteRef.current;
    if (ig.revealed) return; // StrictMode re-run after reveal — keep state
    let seen = false;
    try {
      seen = sessionStorage.getItem("cubixso.seen") === "1";
    } catch {
      /* private mode — treat as unseen */
    }
    if (seen) {
      ig.revealed = true;
      ig.instant = true;
      ig.t = 1;
      return;
    }
    const onReveal = () => {
      ig.revealed = true;
    };
    window.addEventListener("cubixso:revealed", onReveal);
    return () => window.removeEventListener("cubixso:revealed", onReveal);
  }, []);

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
        // No background — the canvas is transparent so the Aurora gradient
        // void (mounted just below in the layout) shows through behind it.
      }}
    >
      <Canvas
        camera={{ position: [0, 0, 6], fov: 45, near: 0.1, far: 100 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        frameloop={frameloop}
        style={{ position: "absolute", inset: 0 }}
      >
        <Suspense fallback={null}>
          <Scene reduced={reduced} scrollRef={scrollRef} igniteRef={igniteRef} />
        </Suspense>
      </Canvas>
    </div>
  );
}

useGLTF.preload(MODEL_URL, DRACO_URL);

export default VoidCube;
