"use client";

// IntroSequence — the preloader is the glowing Cubixso CUBE (the same
// cubixso-cube.glb used by the "Built dimensional" scroller, recoloured to
// glowing edges + bloom). It AUTO-ROTATES a full 360°, then the whole curtain
// lifts UP to reveal the hero. Theme-adaptive (near-black / white field). Plays
// once per session, honours prefers-reduced-motion, fires "cubixso:revealed".

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF, Environment, Lightformer, Preload } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import { AnimatePresence, motion } from "framer-motion";
import * as THREE from "three";
import { whoosh } from "@/lib/feedback";
import { useTheme } from "@/components/providers/ThemeProvider";
import { cdn } from "@/lib/cdn";
import { hasWebGL } from "@/lib/perf";
import { CanvasBoundary } from "@/components/util/CanvasBoundary";

const SIG = [0.16, 1, 0.3, 1] as const;
const MODEL = cdn("/models/cubixso-cube.glb");
const DRACO = cdn("/draco/");
const DURATION = 3600; // a calm partial turn before the lift

// Capability keywords. DESKTOP: they ORBIT the cube on a slow ellipse (positions
// computed per-frame). MOBILE/TABLET: cycled one-at-a-time in a band below it.
const WORDS = [
  "Agentic Orchestration",
  "Agent Teams",
  "Agentic AI",
  "LLMOps",
  "RAG · MCP",
];

function PreloaderCube({ dark }: { dark: boolean }) {
  const { scene } = useGLTF(MODEL, DRACO);
  const root = useRef<THREE.Group>(null);

  // dark theme → glowing white-blue edges (bloom makes the glow).
  // light theme → a SOLID NEAR-BLACK cube (charcoal edges on white), no glow.
  const model = useMemo(() => {
    const c = scene.clone(true);
    c.traverse((o) => {
      const m = o as THREE.Mesh;
      if (!m.isMesh) return;
      const mat = (m.material as THREE.MeshStandardMaterial).clone();
      if (dark) {
        mat.color.setRGB(0.02, 0.035, 0.09);
        mat.emissive.set("#cfe0ff");
        mat.emissiveIntensity = 1.8;
      } else {
        mat.color.set("#0b0b12"); // near-black body — reads as a black cube on white
        mat.emissive.set("#0b0b12");
        mat.emissiveIntensity = 0;
        mat.roughness = 0.55;
        mat.metalness = 0.1;
      }
      m.material = mat;
    });
    return c;
  }, [scene, dark]);

  // calm auto-rotate (slower than a full turn — was too fast).
  // delta is clamped so a long frame (first-paint shader compile, tab jank)
  // advances the cube smoothly instead of visibly jumping.
  useFrame((_, delta) => {
    if (root.current) root.current.rotation.y += Math.min(delta, 1 / 30) * 0.82;
  });

  return (
    <group ref={root} rotation={[0.34, 0, 0]}>
      <primitive object={model} />
    </group>
  );
}

export function IntroSequence() {
  const { resolved } = useTheme();
  const dark = resolved !== "light";
  const [show, setShow] = useState(false);
  const [exiting, setExiting] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [compact, setCompact] = useState(false); // phone / tablet-portrait
  const [wordIdx, setWordIdx] = useState(0); // cycling keyword on compact screens
  const [webgl, setWebgl] = useState(true); // 3D only renders when WebGL works
  const done = useRef(false);
  const wordRefs = useRef<(HTMLDivElement | null)[]>([]); // orbiting keywords (desktop)

  const finish = () => {
    if (done.current) return;
    done.current = true;
    try { sessionStorage.setItem("cubixso.seen", "1"); } catch { /* private */ }
    try { window.dispatchEvent(new Event("cubixso:revealed")); } catch { /* ssr */ }
    whoosh();
    setExiting(true);
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    try { if (sessionStorage.getItem("cubixso.seen") === "1") return; } catch { /* private */ }
    setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    setCompact(window.matchMedia("(max-width: 900px)").matches);
    setWebgl(hasWebGL()); // no WebGL (weak/blocklisted GPU) → wordmark-only loader
    setShow(true);
  }, []);

  useEffect(() => {
    if (!show) return;
    const t = window.setTimeout(finish, reduced ? 700 : DURATION);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show, reduced]);

  // On compact screens the keywords cycle one-at-a-time (see render) — advance
  // the index on a gentle interval.
  useEffect(() => {
    if (!show || !compact || reduced) return;
    const id = window.setInterval(() => setWordIdx((i) => (i + 1) % WORDS.length), 1150);
    return () => clearInterval(id);
  }, [show, compact, reduced]);

  // DESKTOP: the keywords ORBIT the cube — they ride a slow elliptical path
  // around the centre, evenly spaced, staying upright (pure translation, no
  // tumble). Direct ref writes per frame (no React re-render). ~36s/rev.
  useEffect(() => {
    if (!show || compact || reduced) return;
    let raf = 0;
    let start = 0;
    const N = WORDS.length;
    const loop = (ts: number) => {
      if (!start) start = ts;
      const t = ts - start;
      const Rx = Math.min(window.innerWidth * 0.4, 600);
      const Ry = Math.min(window.innerHeight * 0.34, 360);
      const base = t * 0.000175; // rad/ms → ~36s per revolution
      for (let i = 0; i < N; i++) {
        const el = wordRefs.current[i];
        if (!el) continue;
        const a = base + (i / N) * Math.PI * 2 - Math.PI / 2; // start at top
        const x = Math.cos(a) * Rx;
        const y = Math.sin(a) * Ry;
        el.style.transform = `translate(-50%, -50%) translate(${x}px, ${y}px)`;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [show, compact, reduced]);

  if (!show) return null;

  return (
    <AnimatePresence onExitComplete={() => setShow(false)}>
      {!exiting && (
        <motion.div
          key="intro"
          initial={{ y: 0, opacity: 1 }}
          animate={{ y: 0, opacity: 1 }}
          exit={reduced ? { opacity: 0 } : { y: "-100%" }}
          transition={{ duration: reduced ? 0.4 : 0.9, ease: SIG }}
          className="fixed inset-0 z-[9999] overflow-hidden"
          style={{ background: dark ? "#060708" : "#ffffff" }}
          aria-hidden
        >
          {/* The 3D cube renders ONLY when WebGL works, and inside a boundary —
              so a weak/blocklisted GPU (common on Windows laptops + tablets) can
              never crash the loader; it just shows the wordmark loader instead. */}
          {webgl && (
          <CanvasBoundary fallback={null}>
          <Canvas
            orthographic
            // Smaller zoom on phones/tablets so the cube isn't oversized and the
            // keyword caption + wordmark below it keep clear air.
            camera={{ position: [3.4, 3.4, 3.4], zoom: compact ? 88 : 118, near: 0.1, far: 100 }}
            gl={{ antialias: true, alpha: true, powerPreference: "high-performance", stencil: false }}
            // phones/tablets cap at 1.75× — indistinguishable at this size, but it
            // takes the antialias+bloom first-frame cost off the critical path.
            dpr={compact ? [1, 1.75] : [1, 2]}
            onCreated={({ camera }) => camera.lookAt(0, 0, 0)}
            style={{ position: "absolute", inset: 0 }}
          >
            <ambientLight intensity={dark ? 0.3 : 0.95} />
            <directionalLight position={[4, 6, 3]} intensity={dark ? 0.8 : 1.1} color="#cdd9ff" />
            <pointLight position={[-3, 2, -2]} intensity={dark ? 14 : 5} color="#5f8bff" distance={18} />
            <Suspense fallback={null}>
              <PreloaderCube dark={dark} />
              <Environment resolution={128} frames={1} environmentIntensity={dark ? 0.45 : 0.85}>
                <Lightformer intensity={1.8} color="#9fc0ff" position={[0, 3, 3]} scale={[7, 3, 1]} />
                <Lightformer intensity={1.1} color="#cfe0ff" position={[4, -1, -3]} scale={[5, 3, 1]} />
              </Environment>
              {/* Compile every material + the env cubemap up-front, so the cube's
                  first visible frame doesn't stall on shader compilation. */}
              <Preload all />
            </Suspense>
            <EffectComposer>
              {/* Tighter bloom: only the brightest edges glow (higher threshold,
                  lower intensity) so the wide soft halo no longer fills the
                  background as a grey blob — the field stays pure black. */}
              <Bloom intensity={dark ? 0.55 : 0.1} luminanceThreshold={dark ? 0.28 : 0.7} luminanceSmoothing={0.7} radius={0.5} />
            </EffectComposer>
          </Canvas>
          </CanvasBoundary>
          )}

          {/* Capability keywords. DESKTOP: they ORBIT the cube on a slow ellipse
              (transform set per-frame by the orbit effect; fade-in via CSS so it
              never fights the JS transform). MOBILE/TABLET: no room beside the
              cube, so cycle ONE keyword at a time in a band below it. */}
          {!reduced && !compact && WORDS.map((w, i) => (
            <div
              key={w}
              ref={(el) => { wordRefs.current[i] = el; }}
              style={{ transform: "translate(-50%, -50%)", animationDelay: `${0.4 + i * 0.12}s` }}
              className={`cbx-orbit-word pointer-events-none absolute left-1/2 top-1/2 whitespace-nowrap font-display text-[15px] font-medium tracking-[0.005em] ${dark ? "text-white/90" : "text-black/85"}`}
            >
              {w}
            </div>
          ))}

          {!reduced && compact && (
            <div className="pointer-events-none absolute inset-x-0 bottom-[24%] flex justify-center px-8">
              <AnimatePresence mode="wait">
                <motion.span
                  key={wordIdx}
                  initial={{ opacity: 0, y: 8, filter: "blur(6px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, y: -8, filter: "blur(6px)" }}
                  transition={{ duration: 0.5, ease: SIG }}
                  className={`text-center font-display text-[15px] font-medium tracking-[0.04em] ${dark ? "text-white/85" : "text-black/80"}`}
                >
                  {WORDS[wordIdx]}
                </motion.span>
              </AnimatePresence>
            </div>
          )}

          {/* bold brand wordmark — ".ai" is a SOFT, FLOWING gradient (the colour
              gently drifts left→right forever). Palindrome stops + 200% size make
              the loop seamless. */}
          <style>{`
            @keyframes cbx-ai-flow { to { background-position: 200% center; } }
            @keyframes cbx-orbit-fade { from { opacity: 0; } to { opacity: 1; } }
            .cbx-orbit-word { opacity: 0; animation: cbx-orbit-fade 0.9s ease forwards; }
          `}</style>
          <motion.div
            initial={{ opacity: 0, y: 12, filter: "blur(6px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 1, delay: 0.45, ease: SIG }}
            className="pointer-events-none absolute bottom-[10vh] left-1/2 -translate-x-1/2 font-display text-[clamp(24px,3.6vw,42px)] font-semibold tracking-[-0.02em]"
            style={{ color: dark ? "#ffffff" : "#0a0a0c" }}
          >
            cubixso
            <span
              style={{
                backgroundImage:
                  "linear-gradient(90deg,#6EA8FF,#9C8CFF,#5FD7FF,#9C8CFF,#6EA8FF)",
                backgroundSize: "200% auto",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
                animation: reduced ? undefined : "cbx-ai-flow 4s linear infinite",
              }}
            >
              .ai
            </span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

useGLTF.preload(MODEL, DRACO);
