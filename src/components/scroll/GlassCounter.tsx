"use client";

// GlassCounter — the fixed lower-left section counter pill (Tier-4 chip).
//
// A translucent liquid-glass pill showing NN/12, where NN is derived from page
// progress p∈[0,1] (1-indexed across `total` sections). It refracts whatever
// scrolls beneath it via backdrop-filter blur + saturate, carries the two glass
// signatures (1px top specular rim + cobalt corner-mark), and never paints an
// opaque fill — its tint is borrowed from the void/cube behind it.
//
// The number track slides on the Y axis as the section changes (transform-only)
// so digits roll like an odometer. Reduced-motion: digit swaps with no slide,
// 200ms opacity only. No-backdrop-filter fallback: flat surface + 1px hairline.

import { useMotionValueEvent } from "framer-motion";
import { useState } from "react";
import { useScrollP } from "./ScrollProvider";

const TOTAL = 12;

export function GlassCounter({ total = TOTAL }: { total?: number }) {
  const { pMotion } = useScrollP();
  const [n, setN] = useState(1);

  // p → section index 1..total. Clamp so the last section reads total, not
  // total+1 at p===1.
  useMotionValueEvent(pMotion, "change", (p) => {
    const next = Math.min(total, Math.max(1, Math.floor(p * total) + 1));
    if (next !== n) setN(next);
  });

  const pad = (v: number) => String(v).padStart(2, "0");

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed bottom-[max(20px,env(safe-area-inset-bottom))] left-[var(--pad-x)] z-40 select-none"
    >
      <div
        className="glass-counter relative flex items-center gap-1.5 overflow-hidden rounded-full px-3.5 py-2"
        style={{
          background:
            "color-mix(in oklab, var(--color-bg-soft) 58%, transparent)",
          backdropFilter: "blur(12px) saturate(150%)",
          WebkitBackdropFilter: "blur(12px) saturate(150%)",
          boxShadow:
            "inset 0 1px 0 rgba(255,255,255,0.14), inset 0 0 0 1px var(--color-line)",
        }}
      >
        {/* Cobalt edge-frame corner-marks — the recurring glass signature. */}
        <span
          aria-hidden
          className="pointer-events-none absolute left-0 top-0 h-2 w-2 border-l border-t"
          style={{ borderColor: "var(--color-accent)" }}
        />
        <span
          aria-hidden
          className="pointer-events-none absolute bottom-0 right-0 h-2 w-2 border-b border-r"
          style={{ borderColor: "var(--color-accent)" }}
        />

        {/* Current section number — odometer roll on the Y axis. */}
        <span
          key={n}
          className="counter-roll mono tabular-nums text-(--color-fg)"
          style={{ fontSize: "11px", letterSpacing: "0.18em" }}
        >
          {pad(n)}
        </span>
        <span
          className="mono text-(--color-muted)"
          style={{ fontSize: "11px", letterSpacing: "0.18em" }}
        >
          /{pad(total)}
        </span>
      </div>

      {/* Scoped styles: odometer roll + reduced-motion + no-backdrop fallback.
          Kept inline-scoped so the component is self-contained per build rules
          (does not touch globals.css). */}
      <style>{`
        .counter-roll {
          display: inline-block;
          animation: counter-roll-in 0.42s cubic-bezier(0.16, 1, 0.3, 1);
          will-change: transform, opacity;
        }
        @keyframes counter-roll-in {
          from { transform: translate3d(0, 0.6em, 0); opacity: 0; }
          to   { transform: translate3d(0, 0, 0);     opacity: 1; }
        }
        @media (prefers-reduced-motion: reduce) {
          .counter-roll { animation: counter-fade-in 0.2s linear; }
          @keyframes counter-fade-in { from { opacity: 0; } to { opacity: 1; } }
        }
        @supports not ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px))) {
          .glass-counter {
            background: color-mix(in oklab, var(--color-bg-soft) 92%, transparent) !important;
            box-shadow: inset 0 0 0 1px var(--color-line) !important;
          }
        }
      `}</style>
    </div>
  );
}
