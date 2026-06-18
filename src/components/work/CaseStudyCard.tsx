"use client";

// CaseStudyCard — canonical glass card for a single proof point.
// Top row: mono `code` + sector tag. Then `name` in font-display, a `summary`
// body, and the `result` outcome metric highlighted in electric cobalt.

import { motion } from "framer-motion";

const reveal = (delay: number) => ({
  initial: { opacity: 0, y: 18, filter: "blur(6px)" },
  whileInView: { opacity: 1, y: 0, filter: "blur(0px)" },
  viewport: { once: true, amount: 0.3 },
  transition: { duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] as const },
});

interface CaseStudyCardProps {
  code: string;
  name: string;
  sector: string;
  summary: string;
  result: string;
  index?: number;
}

export function CaseStudyCard({
  code,
  name,
  sector,
  summary,
  result,
  index = 0,
}: CaseStudyCardProps) {
  return (
    <motion.article
      {...reveal(0.1 + index * 0.06)}
      className="group flex flex-col rounded-2xl border border-(--color-line) bg-(--color-bg-soft)/40 backdrop-blur-sm p-7 transition-all duration-500 hover:bg-(--color-bg-soft) hover:border-(--color-line-2) hover:-translate-y-1"
    >
      <div className="flex items-center justify-between gap-4">
        <span className="mono text-[12px] tracking-[0.16em] text-(--color-muted-2)">
          {code}
        </span>
        <span className="mono text-[11px] tracking-[0.18em] text-(--color-muted)">
          {sector}
        </span>
      </div>

      <h3 className="mt-5 font-display text-[clamp(20px,1.6vw,26px)] font-medium tracking-tight text-(--color-fg)">
        {name}
      </h3>

      <p className="mt-3 text-[14.5px] leading-relaxed text-(--color-fg-2) group-hover:text-(--color-fg-elev) transition-colors">
        {summary}
      </p>

      <div className="mt-auto pt-6">
        <div className="h-px w-full bg-(--color-line) group-hover:bg-(--color-line-2) transition-colors" />
        <p className="mt-4 font-display text-[clamp(17px,1.3vw,21px)] font-medium tracking-tight text-(--color-accent-2)">
          {result}
        </p>
      </div>
    </motion.article>
  );
}
