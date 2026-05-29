"use client";

// Global — chapter 10 REACH. Editorial location list with mono coordinates.
// The cube morphs into a low-poly globe at this scroll position (item 4).

import { motion } from "framer-motion";
import { ChapterLabel } from "@/components/shared/ChapterLabel";
import { PRESENCE } from "@/lib/data";

const reveal = (delay: number) => ({
  initial: { opacity: 0, y: 18, filter: "blur(6px)" },
  whileInView: { opacity: 1, y: 0, filter: "blur(0px)" },
  viewport: { once: true, amount: 0.3 },
  transition: { duration: 0.9, delay, ease: [0.16, 1, 0.3, 1] as const },
});

export function Global() {
  return (
    <section
      id="reach"
      className="relative z-10 bg-(--color-bg) px-[var(--pad-x)] py-[clamp(96px,14vh,180px)]"
    >
      <div className="mx-auto w-full max-w-[var(--col-w)]">
        <ChapterLabel num="10" word="REACH" />

        <motion.h2
          {...reveal(0.1)}
          className="font-display text-[length:var(--text-display-lg)] leading-[0.95] tracking-[-0.04em] text-balance text-(--color-fg) max-w-4xl"
        >
          Two cities,
          <br />
          one{" "}
          <em
            className="font-serif not-italic italic"
            style={{ letterSpacing: "-0.02em", fontWeight: 400 }}
          >
            stack
          </em>
          .
        </motion.h2>

        <motion.p
          {...reveal(0.25)}
          className="mt-8 max-w-prose text-[clamp(15px,1.15vw,17px)] leading-relaxed text-(--color-fg-2)"
        >
          Headquartered at T-Hub Hyderabad, operating across India and the UAE.
          United States office opening soon.
        </motion.p>

        <ul className="mt-20 flex flex-col">
          {PRESENCE.map((p, i) => (
            <motion.li
              key={p.city}
              {...reveal(0.35 + i * 0.06)}
              className="group grid grid-cols-[auto_1fr_auto] md:grid-cols-[auto_1fr_auto_auto] items-baseline gap-x-4 md:gap-x-8 gap-y-1 border-b border-(--color-line) py-6 md:py-7 transition-colors hover:border-(--color-fg)"
            >
              <span className="mono text-[10px] md:text-[11px] text-(--color-muted)">
                0{i + 1}
              </span>
              <span
                className={`font-serif italic text-[clamp(26px,3.4vw,46px)] leading-none tracking-tight group-hover:translate-x-1 transition-transform ${
                  p.status === "soon" ? "text-(--color-fg-2)" : "text-(--color-fg)"
                }`}
              >
                {p.city}
              </span>
              <span className="mono text-[10px] md:text-[11px] text-(--color-fg-2)">{p.country}</span>
              <span className="hidden md:inline mono text-(--color-muted)">
                {p.coords}
              </span>
              <span
                className={`col-start-2 col-span-2 md:col-span-3 mono text-[10px] md:text-[11px] inline-flex items-center gap-2 ${
                  p.status === "soon" ? "text-(--color-accent-2)" : "text-(--color-muted)"
                }`}
              >
                {p.status === "soon" && (
                  <span
                    className="inline-block w-1.5 h-1.5 rounded-full bg-(--color-accent-2) animate-pulse"
                    aria-hidden
                  />
                )}
                {p.role}
              </span>
            </motion.li>
          ))}
        </ul>
      </div>
    </section>
  );
}
