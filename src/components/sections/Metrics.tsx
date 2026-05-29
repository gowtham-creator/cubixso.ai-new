"use client";

// Metrics — chapter 08 PROOF. Count-up stats grid. GSAP scroll-trigger
// counter will land in item 4; static numbers for the scaffold pass.

import { motion } from "framer-motion";
import { ChapterLabel } from "@/components/shared/ChapterLabel";
import { STATS } from "@/lib/data";

const reveal = (delay: number) => ({
  initial: { opacity: 0, y: 18, filter: "blur(6px)" },
  whileInView: { opacity: 1, y: 0, filter: "blur(0px)" },
  viewport: { once: true, amount: 0.3 },
  transition: { duration: 0.9, delay, ease: [0.16, 1, 0.3, 1] as const },
});

export function Metrics() {
  return (
    <section
      id="proof"
      className="relative z-10 bg-(--color-bg) px-[var(--pad-x)] py-[clamp(96px,14vh,180px)]"
    >
      <div className="mx-auto w-full max-w-[var(--col-w)]">
        <ChapterLabel num="08" word="PROOF" />

        <motion.h2
          {...reveal(0.1)}
          className="font-display text-[length:var(--text-display-lg)] leading-[0.95] tracking-[-0.04em] text-balance text-(--color-fg) max-w-3xl"
        >
          The{" "}
          <em
            className="font-serif not-italic italic"
            style={{ letterSpacing: "-0.02em", fontWeight: 400 }}
          >
            numbers
          </em>
          <br />
          behind the work.
        </motion.h2>

        <div className="mt-20 grid grid-cols-2 gap-px bg-(--color-line) md:grid-cols-3 lg:grid-cols-6">
          {STATS.map((s, i) => (
            <motion.div
              key={s.label}
              {...reveal(0.2 + i * 0.05)}
              className="bg-(--color-bg) px-6 py-10"
            >
              <span className="block font-serif italic text-[clamp(36px,4.8vw,68px)] leading-none tracking-tight text-(--color-fg) tabular-nums">
                {s.num}
              </span>
              <span className="mt-4 block mono text-[10.5px] text-(--color-muted)">
                {s.label}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
