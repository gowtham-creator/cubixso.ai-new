"use client";

// IntroSequence — the preloader is the glowing Cubixso CUBE (the same
// cubixso-cube.glb used by the "Built dimensional" scroller, recoloured to
// glowing edges + bloom). It AUTO-ROTATES a full 360°, then the whole curtain
// lifts UP to reveal the hero. Theme-adaptive (near-black / white field). Plays
// once per session, honours prefers-reduced-motion, fires "cubixso:revealed".

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF, Environment, Lightformer } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import { AnimatePresence, motion } from "framer-motion";
import * as THREE from "three";
import { whoosh } from "@/lib/feedback";
import { useTheme } from "@/components/providers/ThemeProvider";
import { cdn } from "@/lib/cdn";

const SIG = [0.16, 1, 0.3, 1] as const;
const MODEL = cdn("/models/cubixso-cube.glb");
const DRACO = cdn("/draco/");
const DURATION = 3600; // a calm partial turn before the lift

// Capability keywords that float in the margins AROUND the cube while it spins.
const WORDS: { t: string; style: React.CSSProperties }[] = [
  { t: "Agentic Orchestration", style: { top: "15%", left: "50%", transform: "translateX(-50%)" } },
  { t: "Agent Teams", style: { top: "37%", right: "7%" } },
  { t: "Agentic AI", style: { top: "42%", left: "7%" } },
  { t: "LLMOps", style: { bottom: "28%", left: "17%" } },
  { t: "RAG · MCP", style: { bottom: "26%", right: "17%" } },
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

  // calm auto-rotate (slower than a full turn — was too fast)
  useFrame((_, delta) => {
    if (root.current) root.current.rotation.y += delta * 0.82;
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
  const done = useRef(false);

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
    setShow(true);
  }, []);

  useEffect(() => {
    if (!show) return;
    const t = window.setTimeout(finish, reduced ? 700 : DURATION);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show, reduced]);

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
          <Canvas
            orthographic
            camera={{ position: [3.4, 3.4, 3.4], zoom: 118, near: 0.1, far: 100 }}
            gl={{ antialias: true, alpha: true }}
            dpr={[1, 2]}
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
            </Suspense>
            <EffectComposer>
              <Bloom intensity={dark ? 1.2 : 0.12} luminanceThreshold={dark ? 0.1 : 0.7} luminanceSmoothing={0.9} mipmapBlur />
            </EffectComposer>
          </Canvas>

          {/* capability keywords orbiting the cube — clean editorial type
              (font-display, NOT mono), blur-in reveal + a slow continuous float */}
          {!reduced && WORDS.map((w, i) => (
            <motion.div
              key={w.t}
              style={w.style}
              className="pointer-events-none absolute whitespace-nowrap"
              initial={{ opacity: 0, y: 18, filter: "blur(9px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 0.95, delay: 0.4 + i * 0.14, ease: SIG }}
            >
              <motion.span
                className={`font-display text-[13px] md:text-[15px] font-medium tracking-[0.005em] ${dark ? "text-white/90" : "text-black/85"}`}
                animate={{ y: [0, -5, 0] }}
                transition={{ repeat: Infinity, duration: 3.4 + i * 0.25, ease: "easeInOut" }}
              >
                {w.t}
              </motion.span>
            </motion.div>
          ))}

          {/* bold brand wordmark — gradient ".ai" (cobalt → violet → cyan) */}
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
                backgroundImage: "linear-gradient(95deg,#4A7BFF,#9B6BFF 55%,#37E5FF)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
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
