"use client";

// CubeIntroOverlay — dedicated full-screen intro BEAT that plays after the
// particle preloader and before the hero. It mounts the Blender-authored
// edge-frame cube (public/models/cubixso-cube.glb), plays the baked TRS
// assembly once, fades opacity + emission up per-bar in JS (material anim
// doesn't survive glTF), idle-spins briefly, then the whole overlay fades out
// to reveal the existing hero (scroll cube + content) untouched.
//
// Sequencing: shows at START_DELAY (≈ when the preloader iris-closes), so the
// preloader visually hands off to the assembling cube. Gated once-per-session
// off the same `cubixso.seen` flag the preloader uses, and skipped entirely
// under prefers-reduced-motion.
//
// Tunable timing constants live at the top — steer with one-liners.

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF, useAnimations, Environment, Lightformer } from "@react-three/drei";
import { AnimatePresence, motion } from "framer-motion";
import * as THREE from "three";
import { useTheme } from "@/components/providers/ThemeProvider";
import { cdn } from "@/lib/cdn";

const MODEL_URL = cdn("/models/cubixso-cube.glb");
const DRACO_URL = cdn("/draco/");

// ── Timing (tunable) ─────────────────────────────────────────────────────────
const START_DELAY = 3800;   // ms — overlay appears as the preloader hands off
const HOLD_AFTER   = 900;    // ms — idle-spin hold after assembly before exit
const EXIT_FADE    = 0.7;    // s  — overlay fade-out
const HANDOFF      = 1.6;    // s  — assembly done → idle spin
const SPIN         = 0.3;    // rad/s — idle spin
const ASSEMBLY_MS  = 1600;   // ms — last bar finishes ~1.6s

// Per-bar opacity + emission fade windows (seconds) — matches the Blender stagger.
const FADE: Record<string, [number, number]> = {
  bar_00: [0.03, 0.43], bar_01: [0.13, 0.53], bar_02: [0.23, 0.63], bar_03: [0.33, 0.73],
  bar_08: [0.40, 0.80], bar_10: [0.57, 0.97], bar_11: [0.73, 1.13],
  bar_04: [0.80, 1.07], bar_05: [0.93, 1.20], bar_06: [1.07, 1.33],
  bar_07: [1.20, 1.47], bar_09: [1.33, 1.60],
};

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const easeOut = (t: number) => 1 - Math.pow(1 - clamp01(t), 3);

interface BarState {
  mat: THREE.MeshStandardMaterial;
  finalEmissive: number;
  start: number;
  end: number;
}

function CubeModel() {
  const root = useRef<THREE.Group>(null);
  const { scene, animations } = useGLTF(MODEL_URL, DRACO_URL);
  const { actions } = useAnimations(animations, root);
  const t0 = useRef<number | null>(null);
  const fadeDone = useRef(false);

  const bars = useMemo<BarState[]>(() => {
    const list: BarState[] = [];
    scene.traverse((o) => {
      const mesh = o as THREE.Mesh;
      if (!mesh.isMesh) return;
      const mat = mesh.material as THREE.MeshStandardMaterial;
      const win = FADE[o.name] ?? [0, 0.5];
      list.push({ mat, finalEmissive: mat.emissiveIntensity ?? 1, start: win[0], end: win[1] });
    });
    return list;
  }, [scene]);

  useEffect(() => {
    bars.forEach((b) => {
      b.mat.transparent = true;
      b.mat.opacity = 0;
      b.mat.emissiveIntensity = 0;
      b.mat.depthWrite = false;
    });
    Object.values(actions).forEach((a) => {
      a?.reset();
      a?.setLoop(THREE.LoopOnce, 1);
      if (a) a.clampWhenFinished = true;
      a?.play();
    });
    t0.current = null;
  }, [actions, bars]);

  useFrame((state, delta) => {
    if (t0.current == null) t0.current = state.clock.elapsedTime;
    const t = state.clock.elapsedTime - t0.current;

    if (!fadeDone.current) {
      let allDone = true;
      for (const b of bars) {
        const k = easeOut((t - b.start) / Math.max(1e-4, b.end - b.start));
        b.mat.opacity = k;
        b.mat.emissiveIntensity = k * b.finalEmissive;
        if (k >= 1) {
          if (b.mat.transparent) {
            b.mat.transparent = false; // flip off once opaque → no z-sort flicker
            b.mat.depthWrite = true;
            b.mat.needsUpdate = true;
          }
        } else {
          allDone = false;
        }
      }
      if (allDone) fadeDone.current = true;
    }

    if (t >= HANDOFF && root.current) {
      root.current.rotation.y += delta * SPIN;
    }
  });

  return (
    <group ref={root}>
      <primitive object={scene} />
    </group>
  );
}

export function CubeIntroOverlay() {
  const { resolved } = useTheme();
  const bg = resolved === "dark" ? "#000000" : "#f5f5f7";
  // phases: "idle" (not shown) → "play" → "exit" → unmounted
  const [phase, setPhase] = useState<"idle" | "play" | "exit">("idle");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const seen = sessionStorage.getItem("cubixso.seen") === "1";
    if (reduced || seen) return; // skip entirely

    const timers: number[] = [];
    timers.push(window.setTimeout(() => setPhase("play"), START_DELAY));
    timers.push(window.setTimeout(() => setPhase("exit"), START_DELAY + ASSEMBLY_MS + HOLD_AFTER));
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <AnimatePresence>
      {phase === "play" && (
        <motion.div
          key="cube-intro"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: EXIT_FADE, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 z-[9000]"
          style={{ background: bg }}
          aria-hidden
        >
          <Canvas
            gl={{ antialias: true, alpha: true }}
            dpr={[1, 1.75]}
            camera={{ position: [3.0, 2.0, 3.9], fov: 36 }}
          >
            <ambientLight intensity={0.35} />
            <directionalLight position={[4, 6, 3]} intensity={1.2} color="#fff1dc" />
            <pointLight position={[-3, 1.5, -2]} intensity={26} color="#4A7BFF" distance={16} />
            <Suspense fallback={null}>
              <CubeModel />
              {/* Self-contained studio environment — built from Lightformers in
                  scene, NO CDN HDRI fetch (the `preset` HDRIs were failing to
                  load and crashing). Gives the metallic bars clean reflections. */}
              <Environment resolution={256} frames={1} environmentIntensity={0.7}>
                <Lightformer intensity={2.4} color="#ffffff" position={[0, 3, 3]} scale={[7, 3, 1]} />
                <Lightformer intensity={1.4} color="#bcd0ff" position={[-4, 1, 2]} scale={[3, 4, 1]} />
                <Lightformer intensity={1.8} color="#4A7BFF" position={[4, -1, -3]} scale={[5, 3, 1]} />
                <Lightformer intensity={1.0} color="#ffffff" position={[0, -3, 1]} scale={[6, 2, 1]} />
              </Environment>
            </Suspense>
          </Canvas>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

useGLTF.preload(MODEL_URL, DRACO_URL);
