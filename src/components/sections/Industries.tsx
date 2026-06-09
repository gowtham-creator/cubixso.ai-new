"use client";

// Industries — six sectors as Tier-2 Liquid-Glass PANEL cards floating over the
// living void. Each card is its own refractive slab (pointer-tracked cobalt
// rim-light); the grid arrives via the signature 3-beat <Reveal> with a per-card
// stagger. A 12–24px black gutter rings every slab so the cobalt cube light
// lives behind the edges. No opaque section fill — the void shows through.

import { motion } from "framer-motion";
import { INDUSTRIES } from "@/lib/data";
import { ChapterLabel } from "@/components/shared/ChapterLabel";
import { LiquidGlass } from "@/components/glass/LiquidGlass";
import { Reveal } from "@/components/scroll/Reveal";
import { useDepthParallax } from "@/components/scroll/useDepthParallax";

// Per-industry accent — distinct hue per sector for the hover orb. The orbs are
// decorative refraction fuel that lives BEHIND the glass; cobalt stays the one
// interactive accent (carried by the panel rim-light + corner-mark).
const ORBS = [
  "from-cyan-500/30 via-teal-400/10",   // Health Care
  "from-amber-500/30 via-orange-400/10", // Manufacturing
  "from-violet-500/30 via-fuchsia-400/10", // Education
  "from-emerald-500/30 via-lime-400/10",  // Real Estate
  "from-blue-500/30 via-indigo-400/10",   // FinTech
  "from-rose-500/30 via-pink-400/10",     // Supply Chain
];

export function Industries({ bare = false }: { bare?: boolean } = {}) {
  // Subtle antigravity depth: the header block leads scroll (plane 3) while a
  // deep glass veil behind the grid lags (plane 0) — layered parallax, GPU-only.
  const headerDepth = useDepthParallax(3);
  const veilDepth = useDepthParallax(0);

  return (
    <section
      id="industries"
      className="relative z-10 px-[var(--pad-x)] py-[clamp(80px,12vh,160px)]"
    >
      <div className="mx-auto w-full max-w-[var(--col-w)]">
        {!bare && (
          <motion.div style={{ transform: headerDepth }}>
            <ChapterLabel num="06" word="INDUSTRIES" />

            <Reveal direction="up">
              <h2 className="mt-6 font-display text-[length:var(--text-display-lg)] leading-[0.95] tracking-[-0.035em] text-balance text-(--color-fg) max-w-4xl">
                Six high-value{" "}
                <em
                  className="font-serif not-italic italic"
                  style={{ letterSpacing: "-0.02em", fontWeight: 400 }}
                >
                  sectors
                </em>
                <br />we transform.
              </h2>
            </Reveal>

            <Reveal direction="up" delay={0.12}>
              <p className="mt-8 max-w-prose text-[clamp(15px,1.1vw,17px)] leading-relaxed text-(--color-fg-2)">
                Focused on India, the Middle East, and the Americas.
              </p>
            </Reveal>
          </motion.div>
        )}

        {/* Grid — each card is its own Tier-2 glass slab over the void. The
            12–24px black gutter is the grid gap + section padding. */}
        <div
          className={`relative ${bare ? "" : "mt-16"} grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3`}
        >
          {/* Deep glass veil — a back-plane element that lags scroll, letting the
              cube light pool behind the cards. Decorative, pointer-transparent. */}
          <motion.div
            aria-hidden
            style={{ transform: veilDepth }}
            className="pointer-events-none absolute -inset-x-6 -inset-y-10 -z-10 rounded-[28px] bg-[radial-gradient(60%_50%_at_50%_30%,color-mix(in_oklab,var(--color-accent)_8%,transparent),transparent_70%)] blur-2xl"
          />

          {INDUSTRIES.map((ind, i) => (
            <Reveal key={ind.name} direction="up" delay={0.06 * i} amount={0.25}>
              <LiquidGlass
                tier="panel"
                as="article"
                focal={i === 0}
                radius={18}
                className="group relative h-full min-h-[260px] overflow-hidden p-8 transition-transform duration-500 hover:-translate-y-1"
              >
                {/* Gradient orb — refraction fuel behind the glass; reveals on
                    hover. Lives below content, above the panel tint. */}
                <div
                  className={`pointer-events-none absolute -top-32 -right-32 h-72 w-72 rounded-full opacity-0 transition-opacity duration-700 group-hover:opacity-100 bg-gradient-radial bg-gradient-to-br ${ORBS[i]} to-transparent blur-3xl`}
                  aria-hidden
                />
                {/* Index marker */}
                <span className="mono text-(--color-muted)">
                  0{i + 1} / 06
                </span>
                <h3 className="relative mt-8 font-display text-[clamp(20px,1.8vw,28px)] font-medium leading-tight tracking-tight text-(--color-fg)">
                  {ind.name}
                </h3>
                <p className="relative mt-4 text-[14.5px] leading-relaxed text-(--color-fg-2) group-hover:text-(--color-fg-elev) transition-colors">
                  {ind.body}
                </p>
              </LiquidGlass>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
