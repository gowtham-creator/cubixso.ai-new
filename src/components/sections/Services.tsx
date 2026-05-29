"use client";

// Services — editorial bento grid of the 6 AI services.
// Each tile has a procedural geometric icon, hover lift, and an asymmetric
// span pattern that breaks the perfect 3x2 grid.

import { motion } from "framer-motion";
import { SERVICES } from "@/lib/data";
import { ChapterLabel } from "@/components/shared/ChapterLabel";

const reveal = (delay: number) => ({
  initial: { opacity: 0, y: 18, filter: "blur(6px)" },
  whileInView: { opacity: 1, y: 0, filter: "blur(0px)" },
  viewport: { once: true, amount: 0.3 },
  transition: { duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] as const },
});

// Tiny procedural icons per service (kept lightweight, themable)
function ServiceIcon({ index }: { index: number }) {
  const icons = [
    // LLMOps — stacked layers
    <svg key="0" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.4">
      <path d="M16 4 L28 10 L16 16 L4 10 Z M4 16 L16 22 L28 16 M4 22 L16 28 L28 22" />
    </svg>,
    // Agentic — neural node
    <svg key="1" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.4">
      <circle cx="16" cy="16" r="3.5" /><circle cx="6" cy="16" r="2" /><circle cx="26" cy="16" r="2" />
      <circle cx="16" cy="6" r="2" /><circle cx="16" cy="26" r="2" />
      <path d="M8 16 H12 M20 16 H24 M16 8 V12 M16 20 V24" />
    </svg>,
    // Agents & Automation — workflow squares
    <svg key="2" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.4">
      <rect x="3" y="4" width="9" height="7" /><rect x="20" y="4" width="9" height="7" />
      <rect x="3" y="21" width="9" height="7" /><rect x="20" y="21" width="9" height="7" />
      <path d="M12 7.5 H20 M16 11 V21 M12 24.5 H20" />
    </svg>,
    // Full-Scale Apps — code brackets
    <svg key="3" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 24 30 16 22 8" /><polyline points="10 8 2 16 10 24" /><line x1="19" y1="5" x2="13" y2="27" />
    </svg>,
    // Tools / Orchestration — chain
    <svg key="4" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.4">
      <path d="M9 16 a4 4 0 0 1 4 -4 H17" /><path d="M23 16 a4 4 0 0 1 -4 4 H15" />
      <path d="M11 12 L21 12" /><path d="M11 20 L21 20" />
    </svg>,
    // RAG / Knowledge — database
    <svg key="5" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.4">
      <ellipse cx="16" cy="7" rx="11" ry="3.5" /><path d="M5 7 V16 C5 18 10 19.5 16 19.5 C22 19.5 27 18 27 16 V7" />
      <path d="M5 16 V25 C5 27 10 28.5 16 28.5 C22 28.5 27 27 27 25 V16" />
    </svg>,
  ];
  return <div className="w-7 h-7 text-(--color-fg)">{icons[index] ?? icons[0]}</div>;
}

// Bento spans — break the uniform grid for visual rhythm
const SPANS = [
  "lg:col-span-4 lg:row-span-2", // featured wide
  "lg:col-span-2",
  "lg:col-span-2",
  "lg:col-span-2",
  "lg:col-span-2",
  "lg:col-span-4",               // wide bottom
];

export function Services() {
  return (
    <section
      id="services"
      className="relative z-10 bg-(--color-bg) px-[var(--pad-x)] py-[clamp(80px,12vh,160px)]"
    >
      <div className="mx-auto w-full max-w-[var(--col-w)]">
        <ChapterLabel num="04" word="CAPABILITIES" />

        <motion.h2
          {...reveal(0.1)}
          className="mt-6 font-display text-[length:var(--text-display-lg)] leading-[0.95] tracking-[-0.035em] text-balance text-(--color-fg) max-w-4xl"
        >
          Generative AI{" "}
          <em
            className="font-serif not-italic italic"
            style={{ letterSpacing: "-0.02em", fontWeight: 400 }}
          >
            services
          </em>
          ,<br />engineered for scale.
        </motion.h2>

        <motion.p
          {...reveal(0.22)}
          className="mt-8 max-w-prose text-[clamp(15px,1.1vw,17px)] leading-relaxed text-(--color-fg-2)"
        >
          A comprehensive suite of enterprise AI services — from foundational model
          ops to fully autonomous systems.
        </motion.p>

        {/* Bento grid */}
        <div className="mt-16 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-6 lg:grid-rows-3">
          {SERVICES.map((s, i) => (
            <motion.article
              key={s.name}
              {...reveal(0.3 + i * 0.06)}
              className={`group relative flex flex-col gap-4 rounded-2xl border border-(--color-line) bg-(--color-bg-soft)/40 backdrop-blur-sm p-7 transition-all duration-500 hover:bg-(--color-bg-soft) hover:border-(--color-line-2) hover:-translate-y-1 ${SPANS[i]}`}
            >
              <ServiceIcon index={i} />
              <h3 className="font-display text-[clamp(18px,1.4vw,22px)] font-medium tracking-tight text-(--color-fg)">
                {s.name}
              </h3>
              <p className="text-[14.5px] leading-relaxed text-(--color-fg-2) group-hover:text-(--color-fg-elev) transition-colors">
                {s.body}
              </p>
              <span className="mt-auto inline-flex items-center gap-1.5 mono text-(--color-muted) opacity-0 group-hover:opacity-100 transition-opacity">
                EXPLORE
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path d="M7 17 L17 7 M9 7 L17 7 L17 15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
