"use client";

// Reveal — the signature 3-BEAT slab entrance.
//
// When the wrapper crosses ~35% of the viewport (framer useInView), it plays
// three chained beats, each strictly transform/opacity/clip-path (GPU-cheap):
//
//   BEAT 1 · MASK-WIPE  — content opens from behind a clip-path inset on
//                          --ease-out-expo, keyed to `direction`.
//   BEAT 2 · LIFT       — slab translateY(40 → 0) while a 1px specular
//                          highlight sweeps the top edge ONCE.
//   BEAT 3 · SETTLE      — a single overshoot via --ease-spring, then relax.
//
// Reduced-motion → one 200ms opacity fade with IDENTICAL final layout (no
// transform offset, no clip, no sweep) — the content lands in the same place.
//
// Direction controls the clip-wipe origin (headlines wipe up; columns from
// their leading edge), matching the cube edge-frame language.

import {
  motion,
  useInView,
  useReducedMotion,
  type Variants,
} from "framer-motion";
import { useRef } from "react";

// Tokenized eases (mirror globals.css --ease-*) — never inline ad-hoc curves.
export const easeOutExpo = [0.16, 1, 0.3, 1] as const;
export const easeSpring = [0.34, 1.56, 0.64, 1] as const;
export const easeSmooth = [0.22, 1, 0.36, 1] as const;

type Direction = "up" | "down" | "left" | "right";

// Closed clip-path insets per direction (the "shut aperture" start state).
const CLOSED: Record<Direction, string> = {
  up: "inset(100% 0% 0% 0%)", // reveals upward
  down: "inset(0% 0% 100% 0%)", // reveals downward
  left: "inset(0% 100% 0% 0%)", // reveals from the right edge inward
  right: "inset(0% 0% 0% 100%)", // reveals from the left edge inward
};
const OPEN = "inset(0% 0% 0% 0%)";

export function Reveal({
  children,
  direction = "up",
  delay = 0,
  className,
  amount = 0.35,
  as: Tag = "div",
}: {
  children: React.ReactNode;
  direction?: Direction;
  delay?: number;
  className?: string;
  /** In-view threshold (fraction of element visible). Default 0.35. */
  amount?: number;
  as?: "div" | "section" | "article" | "li" | "header";
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount });
  const reduced = useReducedMotion();

  const MotionTag = motion[Tag] as typeof motion.div;

  // Reduced-motion: pure opacity fade, final layout identical.
  if (reduced) {
    return (
      <MotionTag
        ref={ref}
        className={className}
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 0.2, ease: "linear", delay }}
        style={{ willChange: "opacity" }}
      >
        {children}
      </MotionTag>
    );
  }

  // Full 3-beat sequence. BEAT 1 (mask) + BEAT 2 (lift) run together on
  // --ease-out-expo; BEAT 3 (settle overshoot) rides on the y track via a
  // separate spring-eased keyframe so the slab overshoots once then relaxes.
  const variants: Variants = {
    hidden: {
      opacity: 0,
      y: 40,
      clipPath: CLOSED[direction],
    },
    visible: {
      opacity: 1,
      y: [40, -6, 0], // LIFT → single overshoot → SETTLE
      clipPath: OPEN,
      transition: {
        clipPath: { duration: 0.7, ease: easeOutExpo, delay },
        opacity: { duration: 0.5, ease: easeOutExpo, delay },
        y: {
          duration: 0.85,
          ease: easeSpring,
          times: [0, 0.7, 1],
          delay,
        },
      },
    },
  };

  return (
    <MotionTag
      ref={ref}
      className={`reveal-slab ${className ?? ""}`}
      variants={variants}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      onAnimationStart={() => {
        if (ref.current) ref.current.style.willChange = "transform, opacity, clip-path";
      }}
      onAnimationComplete={() => {
        // Strip will-change once settled (perf law: add on enter, drop on leave).
        if (ref.current) ref.current.style.willChange = "auto";
      }}
      style={{ position: "relative" }}
    >
      {/* BEAT 2 specular highlight — a 1px line sweeping the TOP edge once.
          Transform-only, decorative, plays in lockstep with the lift. */}
      <motion.span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 z-[2] h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(255,255,255,0.55) 50%, transparent)",
          willChange: "transform, opacity",
        }}
        initial={{ x: "-100%", opacity: 0 }}
        animate={
          inView
            ? { x: ["-100%", "100%"], opacity: [0, 1, 0] }
            : { x: "-100%", opacity: 0 }
        }
        transition={{ duration: 0.9, ease: easeSmooth, delay: delay + 0.12 }}
      />
      {children}
    </MotionTag>
  );
}
