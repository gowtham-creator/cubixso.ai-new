"use client";

// Preloader — counter + status telemetry (Hubtown) + a 6000-particle finale
// (ported Axshatt/ParticleText engine) that forms "Cubixso." then dissolves
// into a sphere and explodes outward, revealing the live hero cube behind.
//
// Choreography (first-visit, suppressed by sessionStorage on subsequent loads):
//   t=0       counter ticks, particles sit as idle sphere
//   t=+400    particles converge into "Cubixso." brand text
//   t=2400    counter hits 100, status reads "Ready to explore"
//   t=+500    text dissolves back to sphere
//   t=+800    sphere explodes outward, overlay iris-closes
//   t=+800    preloader unmounts → live hero cube
//
// Mobile + reduced-motion fall back to the original SVG glyph stroke-draw
// (zero canvas, zero particles) so frame budget stays sane.

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { ParticleEngine, type ParticleEngineHandle } from "./ParticleEngine";
import { useTheme } from "@/components/providers/ThemeProvider";

// Status lines cycle as the counter progresses
const STATUS_LINES = [
  "Calibrating cube",
  "Compiling shaders",
  "Warming WebGL",
  "Loading editorial",
  "Ready to explore",
];

// Variants for each stroke of the Cubixso glyph — staggered draw
const drawStroke: Variants = {
  hidden:  { pathLength: 0, opacity: 0 },
  visible: (i: number) => ({
    pathLength: 1,
    opacity: 1,
    transition: {
      pathLength: { delay: 0.15 + i * 0.07, duration: 0.9, ease: [0.16, 1, 0.3, 1] as const },
      opacity:    { delay: 0.15 + i * 0.07, duration: 0.18 },
    },
  }),
};

// The 9 strokes of the Cubixso isometric cube glyph (6 outer hex segments
// + 3 inner Y strokes — matches the brand mark we use in Nav)
const STROKES = [
  "M51 7 L89 30",
  "M91 33 L91 67",
  "M89 70 L54 91",
  "M46 91 L11 70",
  "M9 67 L9 33",
  "M11 30 L49 7",
  "M17 32 L48 40",
  "M83 32 L52 40",
  "M50 43 L50 88",
];

export function Preloader({ durationMs = 2400 }: { durationMs?: number }) {
  const [progress, setProgress] = useState(0);
  const [statusIdx, setStatusIdx] = useState(0);
  const [done, setDone] = useState(true); // start hidden, flip ON via useEffect
  const [usesParticles, setUsesParticles] = useState(false);
  const [particleCount, setParticleCount] = useState(6000);
  const engineRef = useRef<ParticleEngineHandle>(null);
  const { resolved } = useTheme();
  const isDark = resolved === "dark";

  useEffect(() => {
    // Suppress on subsequent route renders within the same session
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem("cubixso.seen") === "1") {
      setDone(true);
      return;
    }
    setDone(false);

    // Particle finale runs on mobile too (just fewer particles); only
    // reduced-motion users get the static SVG glyph fallback.
    const mobile = window.matchMedia("(max-width: 768px)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const useParticles = !reduced;
    setUsesParticles(useParticles);
    setParticleCount(mobile ? 2800 : 6000);

    const start = performance.now();
    let raf = 0;
    const timers: number[] = [];

    // Particle finale orchestration — only if the engine will mount
    if (useParticles) {
      timers.push(window.setTimeout(() => {
        engineRef.current?.setText("Cubixso.");
      }, 400));
    }

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs);
      const eased = 1 - Math.pow(1 - t, 3); // ease-out cubic for the counter
      setProgress(Math.floor(eased * 100));
      setStatusIdx(Math.min(STATUS_LINES.length - 1, Math.floor(t * STATUS_LINES.length)));
      if (t < 1) {
        raf = requestAnimationFrame(tick);
        return;
      }
      // Counter at 100% — choreograph the finale
      if (useParticles) {
        timers.push(window.setTimeout(() => engineRef.current?.setSphere(), 500));
        timers.push(window.setTimeout(() => engineRef.current?.explode(), 1300));
        timers.push(window.setTimeout(() => {
          setDone(true);
          try { sessionStorage.setItem("cubixso.seen", "1"); } catch { /* private mode */ }
        }, 2100));
      } else {
        // Original short hold + iris-close exit
        timers.push(window.setTimeout(() => {
          setDone(true);
          try { sessionStorage.setItem("cubixso.seen", "1"); } catch { /* private mode */ }
        }, 500));
      }
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      timers.forEach((t) => clearTimeout(t));
    };
  }, [durationMs]);

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          key="preloader"
          initial={{ opacity: 1, clipPath: "circle(140% at 50% 50%)" }}
          exit={{
            opacity: 0,
            clipPath: "circle(0% at 50% 50%)",
          }}
          transition={{
            opacity:  { duration: 0.9, delay: 0.35, ease: [0.16, 1, 0.3, 1] },
            clipPath: { duration: 1.25, ease: [0.65, 0, 0.35, 1] },
          }}
          className="fixed inset-0 z-[9999] bg-(--color-bg) text-(--color-fg)"
          aria-hidden
        >
          {/* Top-left — big counter */}
          <span className="absolute top-8 left-8 mono text-[clamp(56px,7vw,96px)] leading-none tabular-nums tracking-[-0.04em] text-(--color-fg)">
            {String(progress).padStart(2, "0")}
          </span>

          {/* Top-right — system label */}
          <span className="absolute top-10 right-8 mono text-(--color-muted-2)">
            [ CUBIXSO. ENV / BOOT ]
          </span>

          {/* Bottom-left — cycling status */}
          <div className="absolute bottom-8 left-8 mono text-(--color-muted) flex flex-col gap-1">
            <span className="text-(--color-muted-2)">{`> SYS`}</span>
            <AnimatePresence mode="wait">
              <motion.span
                key={statusIdx}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className="text-(--color-fg)"
              >
                {STATUS_LINES[statusIdx]}…
              </motion.span>
            </AnimatePresence>
          </div>

          {/* Bottom-right — progress bar (mono telemetry) */}
          <div className="absolute bottom-10 right-8 flex items-center gap-3 mono text-(--color-muted)">
            <span className="block w-40 h-px bg-(--color-line-2) relative overflow-hidden">
              <motion.span
                className="block h-full bg-(--color-fg) origin-left"
                animate={{ scaleX: progress / 100 }}
                transition={{ duration: 0.05, ease: "linear" }}
              />
            </span>
            <span className="tabular-nums text-(--color-fg)">{progress}%</span>
          </div>

          {/* Center — 6000-particle engine OR SVG fallback (mobile / reduced-motion) */}
          {usesParticles ? (
            <ParticleEngine
              ref={engineRef}
              count={particleCount}
              themeIsDark={isDark}
              className="z-0"
            />
          ) : (
            <>
              <motion.svg
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[clamp(120px,18vw,200px)] h-[clamp(120px,18vw,200px)]"
                viewBox="0 0 100 100"
                fill="none"
                stroke="currentColor"
                strokeWidth="6"
                strokeLinecap="square"
                initial="hidden"
                animate={progress >= 100
                  ? { scale: 1.8, opacity: 0, filter: "blur(12px)" }
                  : { scale: 1, opacity: 1, filter: "blur(0px)" }}
                variants={{ hidden: { scale: 1, opacity: 1 }, visible: { scale: 1, opacity: 1 } }}
                transition={{
                  scale:   { duration: 1.2, ease: [0.16, 1, 0.3, 1] },
                  opacity: { duration: 0.9, delay: 0.15, ease: [0.16, 1, 0.3, 1] },
                  filter:  { duration: 1.0, delay: 0.1, ease: [0.16, 1, 0.3, 1] },
                }}
                style={{ transformOrigin: "50% 50%" }}
              >
                {STROKES.map((d, i) => (
                  <motion.path key={i} d={d} custom={i} variants={drawStroke} />
                ))}
              </motion.svg>
              <motion.span
                className="absolute top-[calc(50%+12vw)] left-1/2 -translate-x-1/2 text-(--color-accent-2) text-[clamp(28px,4vw,52px)] leading-none font-display font-semibold"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={progress >= 100 ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.5 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              >
                .
              </motion.span>
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
