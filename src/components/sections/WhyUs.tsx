"use client";

// WhyUs — chapter 07 EDGE. Four pillars from data.ts.
// Static layout in this pass; cube-state collapse to dense node comes
// with item 4 (the state machine).

import { motion } from "framer-motion";
import { ChapterLabel } from "@/components/shared/ChapterLabel";
import { WHY } from "@/lib/data";

const reveal = (delay: number) => ({
  initial: { opacity: 0, y: 18, filter: "blur(6px)" },
  whileInView: { opacity: 1, y: 0, filter: "blur(0px)" },
  viewport: { once: true, amount: 0.3 },
  transition: { duration: 0.9, delay, ease: [0.16, 1, 0.3, 1] as const },
});

export function WhyUs() {
  return (
    <section
      id="edge"
      className="relative z-10 bg-(--color-bg) px-[var(--pad-x)] py-[clamp(96px,14vh,180px)]"
    >
      <div className="mx-auto w-full max-w-[var(--col-w)]">
        <ChapterLabel num="07" word="EDGE" />

        <motion.h2
          {...reveal(0.1)}
          className="font-display text-[length:var(--text-display-lg)] leading-[0.95] tracking-[-0.04em] text-balance text-(--color-fg) max-w-4xl"
        >
          The{" "}
          <em
            className="font-serif not-italic italic"
            style={{ letterSpacing: "-0.02em", fontWeight: 400 }}
          >
            edge
          </em>{" "}
          of
          <br />
          an AI-first company.
        </motion.h2>

        <motion.p
          {...reveal(0.25)}
          className="mt-8 max-w-prose text-[clamp(15px,1.15vw,17px)] leading-relaxed text-(--color-fg-2)"
        >
          What sets us apart isn&rsquo;t framework choice or model availability —
          it&rsquo;s ownership across the entire stack and the discipline to ship.
        </motion.p>

        <div className="mt-20 grid grid-cols-1 gap-px bg-(--color-line) sm:grid-cols-2 lg:grid-cols-4">
          {WHY.map((w, i) => (
            <motion.article
              key={w.tag}
              {...reveal(0.35 + i * 0.06)}
              className="group relative bg-(--color-bg) p-8 transition-colors hover:bg-(--color-bg-soft)"
            >
              <span className="mono text-(--color-muted)">0{i + 1}</span>
              <h3 className="mt-6 font-display text-[clamp(20px,1.7vw,26px)] font-medium leading-tight tracking-tight text-(--color-fg)">
                {w.tag}
              </h3>
              <p className="mt-3 text-[14.5px] leading-relaxed text-(--color-fg-2) group-hover:text-(--color-fg-elev) transition-colors">
                {w.body}
              </p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
