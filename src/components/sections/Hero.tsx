"use client";

// Hero — reference-style: pure-black field, central particle sphere (swappable
// <HeroParticles/>), headline SPREAD around it (upper-left + lower-right).
//
// Headline motion: animate-text › kinetic-center-build — per-word, soft blur,
// enter-from-right, sequential build with the signature easing. Adapted to the
// spread layout (each word builds into its resting position, in order, rather
// than re-centering one line). The build is GATED to start when the loader
// reveals the page, so it isn't wasted behind the loader overlay.

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ScrollIndicator } from "@/components/motion/ScrollIndicator";

const SIG = [0.2, 0.8, 0.2, 1] as const; // kinetic-center-build signature easing

const word = {
  hidden: { opacity: 0, x: 88, y: 6, scale: 0.992, filter: "blur(3.5px)" },
  show: (i: number) => ({
    opacity: 1,
    x: 0,
    y: 0,
    scale: 1,
    filter: "blur(0px)",
    transition: { duration: 0.36, ease: SIG, delay: i * 0.22 },
  }),
};

function W({ children, i }: { children: string; i: number }) {
  return (
    <motion.span
      variants={word}
      custom={i}
      className="inline-block will-change-transform"
    >
      {children}
    </motion.span>
  );
}

const H =
  "font-display font-bold uppercase tracking-[-0.01em] leading-[0.92] " +
  "text-[clamp(34px,6.6vw,116px)] text-[#e9e9ec]";

export function Hero() {
  // Start the build only once the page is revealed (loader gone / already seen).
  const [revealed, setRevealed] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    let seen = false;
    try {
      seen = sessionStorage.getItem("cubixso.seen") === "1";
    } catch {}
    if (seen) {
      setRevealed(true);
      return;
    }
    const onReveal = () => setRevealed(true);
    window.addEventListener("cubixso:revealed", onReveal);
    const safety = window.setTimeout(() => setRevealed(true), 4500);
    return () => {
      window.removeEventListener("cubixso:revealed", onReveal);
      clearTimeout(safety);
    };
  }, []);
  const state = revealed ? "show" : "hidden";

  return (
    <section className="relative min-h-svh overflow-hidden text-[#e9e9ec]">
      {/* Spine cube + void render behind via the global <VoidCube/> (layout) */}

      {/* SEO/a11y heading (visible spread type below is decorative) */}
      <h1 className="sr-only">Generative AI for the autonomous enterprise</h1>

      <div className="relative z-10 min-h-svh" aria-hidden>
        {/* Upper-left — words 0..3 */}
        <motion.div
          initial="hidden"
          animate={state}
          className={`absolute left-[var(--pad-x)] top-[33%] ${H}`}
        >
          <span className="block">
            <W i={0}>Generative</W> <W i={1}>AI</W>
          </span>
          <span className="block">
            <W i={2}>for</W> <W i={3}>the</W>
          </span>
        </motion.div>

        {/* Lower-right — words 4..5 */}
        <motion.div
          initial="hidden"
          animate={state}
          className={`absolute right-[var(--pad-x)] top-[49%] text-right ${H}`}
        >
          <span className="block">
            <W i={4}>Autonomous</W>
          </span>
          <span className="block">
            <W i={5}>Enterprise</W>
          </span>
        </motion.div>

        {/* Bottom runner — coords left · scroll indicator right */}
        <motion.div
          initial={{ opacity: 0, y: 16, filter: "blur(6px)" }}
          animate={
            revealed
              ? { opacity: 1, y: 0, filter: "blur(0px)" }
              : { opacity: 0, y: 16, filter: "blur(6px)" }
          }
          transition={{ duration: 1.0, delay: 1.5, ease: SIG }}
          className="absolute inset-x-0 bottom-[clamp(24px,5vh,56px)] flex items-center justify-between px-[var(--pad-x)]"
        >
          <span className="mono text-[10px] md:text-[11px] text-white/40">
            17.385°N · 78.486°E — T-HUB · HYDERABAD
          </span>
          <ScrollIndicator />
        </motion.div>
      </div>
    </section>
  );
}
