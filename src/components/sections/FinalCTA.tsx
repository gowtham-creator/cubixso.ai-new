"use client";

// FinalCTA — chapter 11 LEGACY. Big editorial close. The cube
// reforms here (state machine, item 4). For now: static headline + CTAs.

import Link from "next/link";
import { motion } from "framer-motion";
import { ChapterLabel } from "@/components/shared/ChapterLabel";
import { Magnetic } from "@/components/motion/Magnetic";
import { CONTACT } from "@/lib/data";

const reveal = (delay: number) => ({
  initial: { opacity: 0, y: 22, filter: "blur(6px)" },
  whileInView: { opacity: 1, y: 0, filter: "blur(0px)" },
  viewport: { once: true, amount: 0.3 },
  transition: { duration: 1.0, delay, ease: [0.16, 1, 0.3, 1] as const },
});

export function FinalCTA() {
  return (
    <section
      id="legacy"
      className="relative z-10 bg-(--color-bg) px-[var(--pad-x)] py-[clamp(140px,22vh,280px)] text-center"
    >
      <div className="mx-auto w-full max-w-[var(--col-w)]">
        <ChapterLabel num="11" word="LEGACY" className="justify-center" />

        <motion.h2
          {...reveal(0.1)}
          className="font-display text-[length:var(--text-display-2xl)] leading-[0.9] tracking-[-0.05em] text-balance text-(--color-fg)"
        >
          Ready
          <br />
          to{" "}
          <em
            className="font-serif not-italic italic"
            style={{ letterSpacing: "-0.025em", fontWeight: 400 }}
          >
            operationalize
          </em>
          <br />
          AI?
        </motion.h2>

        <motion.p
          {...reveal(0.3)}
          className="mt-12 mx-auto max-w-[52ch] text-[clamp(15px,1.25vw,19px)] leading-relaxed text-(--color-fg-2)"
        >
          Honest scoping. Real timelines. Pricing on the call.
          <br />
          Cubixso<span className="text-(--color-accent-2)">.</span> hands you a system
          {" "}&mdash; not a notebook.
        </motion.p>

        <motion.div
          {...reveal(0.5)}
          className="mt-16 inline-flex flex-wrap items-center justify-center gap-x-10 gap-y-6"
        >
          <Magnetic>
            <Link
              href="/contact"
              className="group inline-flex items-center gap-3 bg-(--color-fg) text-(--color-bg) rounded-full pl-7 pr-2 py-2 font-medium tracking-tight transition-transform hover:scale-[1.02]"
            >
              <span>Start the conversation</span>
              <span className="grid place-items-center w-10 h-10 rounded-full bg-(--color-bg) text-(--color-fg) transition-transform group-hover:rotate-45">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M7 17 L17 7 M9 7 L17 7 L17 15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            </Link>
          </Magnetic>

          <a
            href={`mailto:${CONTACT.email}`}
            className="mono text-(--color-fg-2) underline decoration-(--color-line-2) underline-offset-8 hover:decoration-(--color-fg) hover:text-(--color-fg) transition-colors"
          >
            OR EMAIL · {CONTACT.email.toUpperCase()}
          </a>
        </motion.div>

        <motion.div
          {...reveal(0.7)}
          className="mt-32 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 mono text-(--color-muted)"
        >
          <span>© 2026 CUBIXSO.</span>
          <span className="text-(--color-line-2)">·</span>
          <span>STARTUP INDIA RECOGNISED</span>
          <span className="text-(--color-line-2)">·</span>
          <span>17.385°N · 78.486°E</span>
        </motion.div>
      </div>
    </section>
  );
}
