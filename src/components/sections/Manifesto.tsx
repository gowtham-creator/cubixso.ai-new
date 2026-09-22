"use client";

// Manifesto — chapter 02 INTELLIGENCE. Editorial declaration of what
// Cubixso is, transformed into ONE tall focal GLASS SLAB over the living void.
// Line-broken poetic copy, serif italic accents on the verbs that carry the
// philosophical weight; the headline mask-wipes line by line over the cobalt cube.
//
// Cobalt-Aperture pass:
//   • the opaque section bg is GONE — the fixed VoidCube spine shows through.
//   • the statement lives inside a single <LiquidGlass tier="panel" focal> slab,
//     ringed by a ~16–20px void gutter so the cube light lives behind its edges.
//   • the 3-beat <Reveal> replaces the old whileInView fade on the headline
//     (line-by-line mask-wipe), the stat grid, and the verb row.
//   • subtle depth parallax floats the headline (foreground) against the inner
//     stat grid (baseline). Primitives handle reduced-motion + GPU safety.

import { motion } from "framer-motion";
import { ChapterLabel } from "@/components/shared/ChapterLabel";
import { LiquidGlass } from "@/components/glass/LiquidGlass";
import { Reveal } from "@/components/scroll/Reveal";
import { useDepthParallax } from "@/components/scroll/useDepthParallax";

// Headline lines wipe in line-by-line via staggered Reveals (direction "up"),
// keeping the kinetic editorial cadence reserved for this Manifesto moment.
const HEADLINE_LINES = [
  { text: "We build", em: false },
  { text: "intelligent", em: true },
  { text: "systems", em: false },
  { text: "that shape the future", em: false },
  { text: "of your business.", em: false },
] as const;

const STATS = [
  { stat: "10+", label: "Startups & enterprises" },
  { stat: "2+", label: "Enterprise clients" },
  { stat: "15+", label: "Accelerators & partners" },
  { stat: "2+1", label: "Cities · IN · UAE · US opening" },
] as const;

export function Manifesto() {
  // Foreground type slightly overtakes scroll; inner grid rides the baseline.
  const headlineParallax = useDepthParallax(3);
  const gridParallax = useDepthParallax(2);

  return (
    <section
      id="manifesto"
      className="relative z-10 px-[var(--pad-x)] py-[clamp(96px,16vh,200px)]"
    >
      {/* Void GUTTER: the panel is inset ~16–20px so the cobalt cube light
          lives behind its edges, never painting the section edge-to-edge. */}
      <div className="mx-auto w-full max-w-[var(--col-w)] p-[clamp(16px,2vw,20px)]">
        <LiquidGlass
          tier="panel"
          focal
          radius={18}
          className="block p-[clamp(28px,5vw,72px)]"
        >
          <ChapterLabel num="02" word="INTELLIGENCE" />

          {/* Headline — mask-wipes line by line over the cube. aria-label
              carries the full statement; visible lines are decorative. */}
          <motion.h2
            aria-label="We build intelligent systems that shape the future of your business."
            style={{ transform: headlineParallax }}
            className="font-display text-[length:var(--text-display-xl)] leading-[0.94] tracking-[-0.045em] text-balance text-(--color-fg) max-w-5xl"
          >
            {HEADLINE_LINES.map((line, i) => (
              <Reveal
                key={line.text}
                direction="up"
                delay={i * 0.08}
                amount={0.4}
                className="block overflow-hidden"
              >
                <span aria-hidden className="block">
                  {line.em ? (
                    <em
                      className="font-serif not-italic italic"
                      style={{ letterSpacing: "-0.02em", fontWeight: 400 }}
                    >
                      {line.text}
                    </em>
                  ) : (
                    line.text
                  )}
                </span>
              </Reveal>
            ))}
          </motion.h2>

          <Reveal direction="up" delay={0.3} amount={0.4}>
            <motion.dl
              style={{ transform: gridParallax }}
              // Four stats: 2x2 on tablet, one row on desktop. At sm:grid-cols-3
              // the fourth cell sat alone on its own row with a full-width rule
              // above it, which read as a mistake rather than a stat.
              className="mt-16 grid grid-cols-1 gap-px bg-(--color-line) sm:grid-cols-2 lg:grid-cols-4"
            >
              {STATS.map((row) => (
                <div key={row.label} className="bg-(--color-bg)/40 p-8">
                  <dt className="font-serif italic text-[clamp(38px,5vw,68px)] leading-none tracking-tight text-(--color-fg) tabular-nums">
                    {row.stat}
                  </dt>
                  <dd className="mt-4 mono text-(--color-fg-2)">
                    {row.label}
                  </dd>
                </div>
              ))}
            </motion.dl>
          </Reveal>

          <Reveal direction="up" delay={0.42} amount={0.4}>
            <div className="mt-16 flex flex-wrap gap-x-12 gap-y-4 mono text-(--color-muted)">
              <span>STRATEGIZE</span>
              <span className="text-(--color-line-2)">·</span>
              <span>BUILD</span>
              <span className="text-(--color-line-2)">·</span>
              <span>DEPLOY</span>
            </div>
          </Reveal>
        </LiquidGlass>
      </div>
    </section>
  );
}
