"use client";

// ScrollRail — the "aperture line".
//
// A fixed 1px cobalt hairline on the right edge of the viewport whose fill
// height tracks page progress p∈[0,1] (the gravity gauge). The track is a
// near-invisible line; the fill is cobalt with a soft accent-2 glow at its
// leading tip. Scales on the Y axis only (transform-origin top) so the fill
// "ignites" top→bottom — no height animation, no layout.
//
// Reduced-motion: the rail still reflects true progress (it's informational,
// not decorative) but the tip glow is dropped. Hidden on coarse/touch via the
// `hidden md:block` guard since edge rails read poorly on mobile.

import { motion, useTransform } from "framer-motion";
import { useScrollP } from "./ScrollProvider";

export function ScrollRail() {
  const { pMotion } = useScrollP();

  // Fill scale 0→1 maps directly to progress.
  const scaleY = pMotion;
  // Tip glow follows the leading edge: 0% (top) → 100% (bottom).
  const tipTop = useTransform(pMotion, (p) => `${(p * 100).toFixed(2)}%`);

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed right-0 top-0 z-40 hidden h-screen w-px md:block"
      style={{ background: "color-mix(in oklab, var(--color-line-2) 60%, transparent)" }}
    >
      {/* Cobalt fill — scaleY only, origin top so it grows downward with p. */}
      <motion.div
        className="absolute inset-x-0 top-0 h-full w-px origin-top"
        style={{
          scaleY,
          background:
            "linear-gradient(to bottom, var(--color-accent), var(--color-accent-2))",
        }}
      />
      {/* Leading-tip bloom — a tiny accent-2 glow riding the fill edge. */}
      <motion.div
        className="absolute left-1/2 h-6 w-[3px] -translate-x-1/2 -translate-y-1/2 rounded-full motion-reduce:hidden"
        style={{
          top: tipTop,
          background: "var(--color-accent-2)",
          boxShadow:
            "0 0 8px var(--color-accent-2), 0 0 16px color-mix(in oklab, var(--color-accent-2) 60%, transparent)",
          willChange: "top",
        }}
      />
    </div>
  );
}
