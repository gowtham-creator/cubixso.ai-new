"use client";

// ScrollIndicator — Ascend pattern. Mono "/ SCROLL TO EXPLORE" with a
// gently pulsing slash glyph. Opacity ramps 1 → 0 between scrollY 0 → 120,
// then stays hidden so it never competes with content below the fold.

import { motion, useScroll, useTransform } from "framer-motion";
import { Ph } from "@/components/icons/Ph";

export function ScrollIndicator({ className = "" }: { className?: string }) {
  const { scrollY } = useScroll();
  const opacity = useTransform(scrollY, [0, 120], [1, 0]);
  const y = useTransform(scrollY, [0, 120], [0, 12]);

  return (
    <motion.a
      href="#manifesto"
      aria-label="Scroll to explore"
      style={{ opacity, y }}
      className={`mono inline-flex items-center gap-2.5 text-(--color-muted) hover:text-(--color-fg) transition-colors ${className}`}
    >
      <motion.span
        aria-hidden
        className="inline-block text-(--color-accent-2)"
        animate={{ opacity: [0.55, 1, 0.55] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
      >
        /
      </motion.span>
      <span>SCROLL TO EXPLORE</span>
      <motion.span
        aria-hidden
        className="inline-block"
        animate={{ y: [0, 3, 0] }}
        transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
      >
        <Ph name="arrow-down" weight="thin" size={13} />
      </motion.span>
    </motion.a>
  );
}
