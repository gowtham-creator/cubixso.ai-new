"use client";

// BackedBy — Epiminds-style trust strip. Sits between Testimonial (PROOF)
// and Global (REACH) in the master scroll. Greyscale-by-default mark wall;
// hovering an item brings it to full contrast. Horizontal marquee on mobile,
// 4-col static grid on desktop.

import { motion } from "framer-motion";
import { BACKERS } from "@/lib/data";
import { ChapterLabel } from "@/components/shared/ChapterLabel";

const reveal = (delay: number) => ({
  initial: { opacity: 0, y: 18, filter: "blur(6px)" },
  whileInView: { opacity: 1, y: 0, filter: "blur(0px)" },
  viewport: { once: true, amount: 0.3 },
  transition: { duration: 0.9, delay, ease: [0.16, 1, 0.3, 1] as const },
});

export function BackedBy() {
  // Doubled for seamless marquee loop
  const loop = [...BACKERS, ...BACKERS];

  return (
    <section
      id="backed-by"
      className="relative z-10 bg-(--color-bg) px-[var(--pad-x)] py-[clamp(80px,12vh,160px)]"
    >
      <div className="mx-auto w-full max-w-[var(--col-w)]">
        <ChapterLabel num="09" word="TRUSTED INFRASTRUCTURE" />

        <motion.h2
          {...reveal(0.1)}
          className="font-display text-[length:var(--text-display-lg)] leading-[0.95] tracking-[-0.04em] text-balance text-(--color-fg) max-w-4xl"
        >
          Built on the{" "}
          <em
            className="font-serif not-italic italic"
            style={{ letterSpacing: "-0.02em", fontWeight: 400 }}
          >
            shoulders
          </em>
          <br />
          of giants.
        </motion.h2>

        <motion.p
          {...reveal(0.25)}
          className="mt-8 max-w-prose text-[clamp(15px,1.15vw,17px)] leading-relaxed text-(--color-fg-2)"
        >
          Programmes, partners and infrastructure stacks Cubixso ships on top of
          — credentials earned, not bought.
        </motion.p>

        {/* ── Desktop static grid ───────────────────────────────────── */}
        <motion.div
          {...reveal(0.4)}
          className="mt-20 hidden md:grid grid-cols-2 gap-px bg-(--color-line) lg:grid-cols-4"
        >
          {BACKERS.map((label) => (
            <div
              key={label}
              className="group flex items-center justify-center bg-(--color-bg) px-6 py-10 transition-colors hover:bg-(--color-bg-soft)"
            >
              <span className="mono text-[11px] text-(--color-muted) opacity-60 group-hover:opacity-100 group-hover:text-(--color-fg) transition-all">
                {label}
              </span>
            </div>
          ))}
        </motion.div>

        {/* ── Mobile marquee ────────────────────────────────────────── */}
        <motion.div
          {...reveal(0.4)}
          className="mt-16 md:hidden relative overflow-hidden border-y border-(--color-line)"
        >
          <div className="flex gap-10 py-6 animate-[marquee_30s_linear_infinite] whitespace-nowrap">
            {loop.map((label, i) => (
              <span
                key={`${label}-${i}`}
                className="mono text-[10.5px] text-(--color-muted) shrink-0"
              >
                {label}
              </span>
            ))}
          </div>
          {/* Edge fades */}
          <div
            className="pointer-events-none absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-(--color-bg) to-transparent"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-(--color-bg) to-transparent"
            aria-hidden
          />
        </motion.div>
      </div>

      <style jsx>{`
        @keyframes marquee {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </section>
  );
}
