"use client";

// Testimonial — Epiminds-style bold quote, no quote marks, attribution
// bottom-right. Sits between Metrics (PROOF) and Global (REACH).
// No chapter label per the build doc — the quote IS the proof.

import { motion } from "framer-motion";

export function Testimonial() {
  return (
    <section
      id="testimonial"
      className="relative z-10 bg-(--color-bg-soft) px-[var(--pad-x)] py-[clamp(120px,18vh,240px)]"
    >
      <div className="mx-auto w-full max-w-[var(--col-w)]">
        <motion.blockquote
          initial={{ opacity: 0, y: 28, filter: "blur(8px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
          className="font-display text-[length:var(--text-display-md)] leading-[1.1] tracking-[-0.025em] text-balance text-(--color-fg) max-w-5xl"
        >
          Cubixso decomposed a fifteen-year-old legacy underwriting{" "}
          <em
            className="font-serif not-italic italic"
            style={{ letterSpacing: "-0.02em", fontWeight: 400 }}
          >
            ruleset
          </em>{" "}
          into a deployable DMN system in six weeks. We&rsquo;ve moved 40 percent
          of decisions onto it.
        </motion.blockquote>

        <motion.figcaption
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.9, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="mt-12 flex items-end justify-end gap-6 mono text-(--color-fg-2)"
        >
          <span className="block w-16 h-px bg-(--color-line-2)" aria-hidden />
          <div className="text-right">
            <div>DIRECTOR OF UNDERWRITING</div>
            <div className="mt-1 text-(--color-muted)">TIER-1 INSURE-TECH · INDIA</div>
            <div className="mt-2 text-[10px] text-(--color-muted-2)">[ PENDING CLIENT APPROVAL ]</div>
          </div>
        </motion.figcaption>
      </div>
    </section>
  );
}
