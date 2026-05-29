"use client";

// KineticStack — chapter 03 KINETIC.
// Epiminds-style vertical word stack. Static reveal in this pass;
// per-word scramble + sticky stacking comes in item 5 of the build plan.

import { motion } from "framer-motion";
import { ChapterLabel } from "@/components/shared/ChapterLabel";
import { AIInferenceVis } from "./kinetic/AIInferenceVis";

const PHRASE = [
  "What",
  "if",
  "your",
  "AI",
  "could",
  "decompose",
  "any",
  "business",
  "problem",
  "and",
  "synthesize",
  "the",
  "answer",
  "in",
  "production?",
];

// Words to render in serif italic for editorial accent
const ITALIC = new Set(["decompose", "synthesize"]);

export function KineticStack() {
  return (
    <section
      id="kinetic"
      className="relative z-10 bg-(--color-bg) px-[var(--pad-x)] py-[clamp(120px,18vh,240px)]"
    >
      <div className="mx-auto w-full max-w-[var(--col-w)]">
        <ChapterLabel num="03" word="KINETIC" />

        {/* Two-column on desktop: vertical word stack left, live AI panel right.
            Mobile collapses to single column — vis hides so the typography
            stays the dominant moment on phones. */}
        <div className="mt-12 grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] gap-12 lg:gap-16 items-start">
          {/* ── Left: kinetic word stack ────────────────────────────── */}
          <div className="flex flex-col gap-1">
            {PHRASE.map((w, i) => (
              <motion.span
                key={`${w}-${i}`}
                initial={{ opacity: 0, x: -16, filter: "blur(6px)" }}
                whileInView={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                viewport={{ once: true, amount: 0.6 }}
                transition={{
                  duration: 0.55,
                  delay: i * 0.04,
                  ease: [0.16, 1, 0.3, 1] as const,
                }}
                className={`font-display font-semibold leading-[0.95] tracking-[-0.03em] text-(--color-fg) text-[clamp(36px,7vw,100px)] ${
                  ITALIC.has(w) ? "font-serif italic font-normal text-(--color-accent-2)" : ""
                }`}
              >
                {w}
              </motion.span>
            ))}
          </div>

          {/* ── Right: live AI inference visualization (desktop only) ─ */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.9, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="hidden lg:block lg:sticky lg:top-[12vh] h-[70vh] max-h-[680px]"
          >
            <AIInferenceVis />
          </motion.div>
        </div>

        <motion.p
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.9, delay: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="mt-20 mono text-(--color-muted)"
        >
          THAT&rsquo;S THE QUESTION CUBIXSO. ANSWERS.
        </motion.p>
      </div>
    </section>
  );
}
