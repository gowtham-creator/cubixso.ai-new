"use client";

// Manifesto — chapter 02 INTELLIGENCE. Editorial declaration of what
// Cubixso is. Line-broken poetic copy, serif italic accents on the verbs
// that carry the philosophical weight.

import { motion } from "framer-motion";
import { ChapterLabel } from "@/components/shared/ChapterLabel";

const reveal = (delay: number) => ({
  initial: { opacity: 0, y: 18, filter: "blur(6px)" },
  whileInView: { opacity: 1, y: 0, filter: "blur(0px)" },
  viewport: { once: true, amount: 0.4 },
  transition: { duration: 0.9, delay, ease: [0.16, 1, 0.3, 1] as const },
});

export function Manifesto() {
  return (
    <section
      id="manifesto"
      className="relative z-10 bg-(--color-bg) px-[var(--pad-x)] py-[clamp(96px,16vh,200px)]"
    >
      <div className="mx-auto w-full max-w-[var(--col-w)]">
        <ChapterLabel num="02" word="INTELLIGENCE" />

        <motion.h2
          {...reveal(0.1)}
          className="font-display text-[length:var(--text-display-xl)] leading-[0.94] tracking-[-0.045em] text-balance text-(--color-fg) max-w-5xl"
        >
          We build
          <br />
          <em
            className="font-serif not-italic italic"
            style={{ letterSpacing: "-0.02em", fontWeight: 400 }}
          >
            intelligent
          </em>{" "}
          systems
          <br />
          that shape the future
          <br />
          of your business.
        </motion.h2>

        <motion.dl
          {...reveal(0.4)}
          className="mt-16 grid grid-cols-1 gap-px bg-(--color-line) sm:grid-cols-3"
        >
          {[
            { stat: "10+",  label: "Enterprise clients" },
            { stat: "15+",  label: "Accelerators & partners" },
            { stat: "2+1",  label: "Cities · IN · UAE · US opening" },
          ].map((row) => (
            <div key={row.label} className="bg-(--color-bg) p-8">
              <dt className="font-serif italic text-[clamp(38px,5vw,68px)] leading-none tracking-tight text-(--color-fg) tabular-nums">
                {row.stat}
              </dt>
              <dd className="mt-4 mono text-(--color-muted)">
                {row.label}
              </dd>
            </div>
          ))}
        </motion.dl>

        <motion.div
          {...reveal(0.55)}
          className="mt-16 flex flex-wrap gap-x-12 gap-y-4 mono text-(--color-muted)"
        >
          <span>STRATEGIZE</span>
          <span className="text-(--color-line-2)">·</span>
          <span>BUILD</span>
          <span className="text-(--color-line-2)">·</span>
          <span>DEPLOY</span>
        </motion.div>
      </div>
    </section>
  );
}
