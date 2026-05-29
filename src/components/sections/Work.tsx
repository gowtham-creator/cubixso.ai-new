"use client";

// Work — editorial grid of Cubixso products with a sticky 3D preview
// that morphs to match the hovered card. Two-column on desktop, stacked
// on mobile (preview canvas hides on small viewports for perf).

import { useState } from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { PRODUCTS } from "@/lib/data";
import { cn } from "@/lib/cn";
import { ChapterLabel } from "@/components/shared/ChapterLabel";

// Lazy-load the sticky 3D preview — it's hidden lg:block, only matters on
// desktop, and dropping it from the home bundle is a clean perf win.
// The surrounding section text still SSRs because the rest of Work.tsx is
// synchronous; only the canvas tree is deferred.
const WorkPreview = dynamic(
  () => import("@/components/canvas/WorkPreview").then((m) => m.WorkPreview),
  { ssr: false, loading: () => null },
);

export function Work() {
  const [hovered, setHovered] = useState<number>(0);

  return (
    <section
      id="work"
      className="relative z-10 bg-(--color-bg) px-[var(--pad-x)] py-[clamp(80px,12vh,160px)]"
    >
      <div className="mx-auto w-full max-w-[var(--col-w)]">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 24, filter: "blur(6px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="mb-16 max-w-3xl"
        >
          <ChapterLabel num="05" word="PRODUCTS" />
          <h2 className="mt-6 font-display text-[length:var(--text-display-lg)] leading-[0.95] tracking-[-0.035em] text-balance text-(--color-fg)">
            Purpose-built AI,<br />
            <em
              className="font-serif not-italic italic"
              style={{ letterSpacing: "-0.02em", fontWeight: 400 }}
            >
              ready to deploy.
            </em>
          </h2>
          <p className="mt-6 max-w-prose text-[clamp(15px,1.1vw,17px)] leading-relaxed text-(--color-fg-2)">
            Six standalone products designed to solve specific business challenges —
            no custom build required.
          </p>
        </motion.div>

        {/* Two-column: cards left, sticky preview right */}
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1.4fr_1fr] lg:gap-20">
          {/* ── Cards ───────────────────────────────────────────────── */}
          <ul className="flex flex-col" onMouseLeave={() => setHovered(0)}>
            {PRODUCTS.map((p, i) => (
              <motion.li
                key={p.code}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{
                  duration: 0.7,
                  delay: i * 0.05,
                  ease: [0.16, 1, 0.3, 1],
                }}
                onMouseEnter={() => setHovered(i)}
                className={cn(
                  "group relative cursor-pointer border-b border-(--color-line) py-7 transition-colors",
                  hovered === i ? "text-(--color-fg)" : "text-(--color-fg-2)",
                )}
              >
                {/* Top meta — code + tag */}
                <div className="mb-3 flex items-center justify-between">
                  <span className="mono text-(--color-muted)">{p.code}</span>
                  <span className="mono text-(--color-muted)">{p.tag}</span>
                </div>

                {/* Name + body */}
                <h3
                  className={cn(
                    "font-display text-[clamp(28px,3.6vw,46px)] leading-[1.02] tracking-[-0.025em] transition-transform",
                    hovered === i && "translate-x-1",
                  )}
                >
                  {p.name}
                </h3>
                <p
                  className={cn(
                    "mt-3 max-w-[60ch] text-[15px] leading-relaxed transition-opacity",
                    hovered === i ? "opacity-100" : "opacity-60",
                  )}
                >
                  {p.body}
                </p>

                {/* Hover arrow */}
                <span
                  className={cn(
                    "pointer-events-none absolute right-0 top-7 inline-flex items-center gap-2 transition-all",
                    hovered === i
                      ? "translate-x-0 opacity-100"
                      : "-translate-x-2 opacity-0",
                  )}
                  aria-hidden
                >
                  <span className="mono text-(--color-muted)">EXPLORE</span>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M7 17 L17 7 M9 7 L17 7 L17 15"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              </motion.li>
            ))}
          </ul>

          {/* ── Sticky preview ──────────────────────────────────────── */}
          <div className="hidden lg:block">
            <div className="sticky top-[calc(50vh-220px)] aspect-square w-full rounded-2xl border border-(--color-line) bg-(--color-bg-soft)/40 backdrop-blur-md overflow-hidden">
              <WorkPreview index={hovered} />

              {/* Floating label — current product name */}
              <div className="pointer-events-none absolute left-5 bottom-5 right-5 flex items-end justify-between">
                <div>
                  <span className="mono text-(--color-muted)">{PRODUCTS[hovered]?.code}</span>
                  <p className="mt-1 font-display text-xl tracking-tight text-(--color-fg)">
                    {PRODUCTS[hovered]?.name}
                  </p>
                </div>
                <span className="mono text-(--color-muted)">
                  {String(hovered + 1).padStart(2, "0")}&nbsp;/&nbsp;{String(PRODUCTS.length).padStart(2, "0")}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
