"use client";

// Hero — editorial composition for the landing screen.
// Backdrop: by default the global persistent <CubeScene /> in layout.tsx
// drives the cube. Flip USE_EXPLORATION_SCENE = true to swap in the 60-line
// HeroScene exploration (Float + MeshReflectorMaterial + Stars + Bloom)
// so you can A/B-test the Hubtown vibe in-place.
//
// When ON, the layout-level CubeScene visually competes; toggle it off
// in src/app/layout.tsx for a clean side-by-side. Or just visit /hero-test
// for an isolated full-screen view.

import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { WordReveal } from "@/components/motion/WordReveal";
import { Magnetic } from "@/components/motion/Magnetic";
import { ScrollIndicator } from "@/components/motion/ScrollIndicator";
import { ChapterLabel } from "@/components/shared/ChapterLabel";

const USE_EXPLORATION_SCENE = false;       // flip to true to swap

const HeroScene = dynamic(
  () => import("@/components/scene/HeroScene").then((m) => m.HeroScene),
  { ssr: false, loading: () => null },
);

const fadeUp = {
  hidden: { opacity: 0, y: 16, filter: "blur(6px)" },
  show: (delay: number) => ({
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.9, delay, ease: [0.16, 1, 0.3, 1] as const },
  }),
};

export function Hero() {
  return (
    <section className="relative min-h-svh overflow-hidden">
      {/* 3D cube backdrop — default lives globally via <CubeScene /> in layout.tsx.
          Exploration: set USE_EXPLORATION_SCENE = true above to swap in HeroScene. */}
      {USE_EXPLORATION_SCENE && (
        <div className="absolute inset-0 z-0" aria-hidden>
          <HeroScene />
        </div>
      )}

      {/* Foreground content — Nav (fixed-top) handles brand + theme + CTA */}
      <div className="relative z-10 flex min-h-svh flex-col justify-end gap-[clamp(40px,8vh,80px)] px-[var(--pad-x)] pt-[clamp(120px,18vh,180px)] pb-[clamp(40px,5vh,64px)]">
        {/* Sub-runner telemetry — single line below Nav, desktop only */}
        <motion.div
          className="hidden md:flex items-center gap-3 mono text-(--color-muted) -mt-[clamp(60px,12vh,140px)]"
          variants={fadeUp}
          custom={0.05}
          initial="hidden"
          animate="show"
        >
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-(--color-signal) animate-pulse" />
          <span>SYS//LIVE</span>
          <span className="w-3 h-px bg-(--color-line-2)" aria-hidden />
          <span>BUILD//0.1</span>
          <span className="w-3 h-px bg-(--color-line-2)" aria-hidden />
          <span>NODE//HYD-01</span>
        </motion.div>

        {/* ── Center — editorial display ───────────────────────────── */}
        <div className="mx-auto w-full max-w-[var(--col-w)]">
          <ChapterLabel num="01" word="FUTURE" />

          <h1 className="mt-8 font-display text-[length:var(--text-display-2xl)] leading-[0.9] tracking-[-0.045em] text-balance text-(--color-fg)">
            <WordReveal delay={0.35} className="block">Generative AI</WordReveal>
            <span className="block">
              <motion.em
                className="font-serif not-italic italic mr-2"
                style={{
                  backgroundImage:
                    "linear-gradient(110deg, var(--color-fg) 25%, var(--color-accent-2) 50%, var(--color-fg) 75%)",
                  backgroundSize: "220% auto",
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                  color: "transparent",
                  letterSpacing: "-0.02em",
                  fontWeight: 400,
                }}
                initial={{ opacity: 0, y: 16, filter: "blur(8px)" }}
                animate={{
                  opacity: 1,
                  y: 0,
                  filter: "blur(0px)",
                  backgroundPosition: ["220% center", "-120% center"],
                }}
                transition={{
                  opacity: { duration: 1.0, delay: 0.55, ease: [0.16, 1, 0.3, 1] },
                  y:       { duration: 1.0, delay: 0.55, ease: [0.16, 1, 0.3, 1] },
                  filter:  { duration: 1.0, delay: 0.55, ease: [0.16, 1, 0.3, 1] },
                  backgroundPosition: {
                    duration: 5.5,
                    delay: 1.5,
                    repeat: Infinity,
                    ease: "linear",
                  },
                }}
              >
                for the
              </motion.em>
              <WordReveal delay={0.75} className="inline-block">autonomous</WordReveal>
            </span>
            <WordReveal delay={0.95} className="block">enterprise.</WordReveal>
          </h1>

          <motion.p
            className="mt-10 max-w-[60ch] text-[clamp(15px,1.2vw,18px)] leading-relaxed text-(--color-fg-2)"
            variants={fadeUp}
            custom={1.15}
            initial="hidden"
            animate="show"
          >
            Cubixso.ai is the AI-first company building intelligent systems, agentic
            products, and enterprise platforms — engineered for scale, impact, and the
            decade that&rsquo;s coming.
          </motion.p>

          <motion.div
            className="mt-12 flex flex-wrap items-center gap-6"
            variants={fadeUp}
            custom={1.35}
            initial="hidden"
            animate="show"
          >
            <Magnetic>
              <a
                href="#contact"
                className="group inline-flex items-center gap-3 bg-(--color-fg) text-(--color-bg) rounded-full pl-6 pr-2 py-2 font-medium tracking-tight transition-transform hover:scale-[1.02]"
              >
                <span>Start the conversation</span>
                <span className="grid place-items-center w-9 h-9 rounded-full bg-(--color-bg) text-(--color-fg) transition-transform group-hover:rotate-45">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M7 17 L17 7 M9 7 L17 7 L17 15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              </a>
            </Magnetic>
            <a
              href="#work"
              className="mono pb-1 border-b border-(--color-line-2) hover:border-(--color-fg) text-(--color-fg-2) hover:text-(--color-fg) transition-colors"
            >
              EXPLORE PRODUCTS →
            </a>
          </motion.div>
        </div>

        {/* ── Bottom runner — coords left · scroll indicator right ──── */}
        <motion.footer
          className="flex items-center justify-between gap-4"
          variants={fadeUp}
          custom={1.6}
          initial="hidden"
          animate="show"
        >
          <span className="mono text-[10px] md:text-[11px] text-(--color-muted)">
            17.385°N · 78.486°E — T-HUB · HYDERABAD
          </span>
          <ScrollIndicator />
        </motion.footer>
      </div>
    </section>
  );
}
