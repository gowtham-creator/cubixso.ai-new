"use client";

// Industries — 6 sectors with hover-revealing gradient orbs and editorial
// names. 3-col on desktop, vertical stack on mobile.

import { motion } from "framer-motion";
import { INDUSTRIES } from "@/lib/data";
import { ChapterLabel } from "@/components/shared/ChapterLabel";

const reveal = (delay: number) => ({
  initial: { opacity: 0, y: 18, filter: "blur(6px)" },
  whileInView: { opacity: 1, y: 0, filter: "blur(0px)" },
  viewport: { once: true, amount: 0.3 },
  transition: { duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] as const },
});

// Per-industry accent — distinct hue per sector for the hover orb
const ORBS = [
  "from-cyan-500/30 via-teal-400/10",   // Health Care
  "from-amber-500/30 via-orange-400/10", // Manufacturing
  "from-violet-500/30 via-fuchsia-400/10", // Education
  "from-emerald-500/30 via-lime-400/10",  // Real Estate
  "from-blue-500/30 via-indigo-400/10",   // FinTech
  "from-rose-500/30 via-pink-400/10",     // Supply Chain
];

export function Industries() {
  return (
    <section
      id="industries"
      className="relative z-10 bg-(--color-bg) px-[var(--pad-x)] py-[clamp(80px,12vh,160px)]"
    >
      <div className="mx-auto w-full max-w-[var(--col-w)]">
        <ChapterLabel num="06" word="INDUSTRIES" />

        <motion.h2
          {...reveal(0.1)}
          className="mt-6 font-display text-[length:var(--text-display-lg)] leading-[0.95] tracking-[-0.035em] text-balance text-(--color-fg) max-w-4xl"
        >
          Six high-value{" "}
          <em
            className="font-serif not-italic italic"
            style={{ letterSpacing: "-0.02em", fontWeight: 400 }}
          >
            sectors
          </em>
          <br />we transform.
        </motion.h2>

        <motion.p
          {...reveal(0.22)}
          className="mt-8 max-w-prose text-[clamp(15px,1.1vw,17px)] leading-relaxed text-(--color-fg-2)"
        >
          The company strategically targets six high-value sectors with primary focus
          on India, Middle East, and Americas.
        </motion.p>

        {/* Grid */}
        <div className="mt-16 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {INDUSTRIES.map((ind, i) => (
            <motion.article
              key={ind.name}
              {...reveal(0.3 + i * 0.06)}
              className="group relative overflow-hidden rounded-2xl border border-(--color-line) bg-(--color-bg-soft)/40 backdrop-blur-sm p-8 min-h-[260px] transition-all duration-500 hover:border-(--color-line-2) hover:-translate-y-1"
            >
              {/* Gradient orb — reveals on hover */}
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
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
