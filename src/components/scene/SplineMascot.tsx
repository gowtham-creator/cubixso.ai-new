"use client";

// SplineMascot — small floating brand-glyph mascot bottom-right. Lazy-loaded
// (only mounts after the user has scrolled at least one viewport so it never
// competes with the hero cube for first-paint frame budget). Follows the
// cursor with an elastic spring lag.
//
// Spline scene URL is supplied via the SPLINE_SCENE env var or hardcoded
// below once the user authors the scene at spline.design. While the scene
// is missing or fails to load, we render an animated CSS placeholder that
// still serves the cursor-follow gesture so the slot is honest.

import { useEffect, useRef, useState, lazy, Suspense } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

// Switch to a real URL once the Spline scene is authored.
// e.g. process.env.NEXT_PUBLIC_SPLINE_SCENE_URL or a hard string.
const SPLINE_SCENE: string | null = null;

const Spline = SPLINE_SCENE
  ? lazy(() => import("@splinetool/react-spline").then((m) => ({ default: m.default })))
  : null;

export function SplineMascot() {
  const [armed, setArmed] = useState(false);          // mounts only after first scroll
  const [hover, setHover] = useState(false);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  // Elastic lag — the magnetic-cursor mantra: lerp, don't snap
  const sx = useSpring(x, { stiffness: 80, damping: 14, mass: 1 });
  const sy = useSpring(y, { stiffness: 80, damping: 14, mass: 1 });

  useEffect(() => {
    if (typeof window === "undefined") return;
    // Suppress on touch
    if (window.matchMedia("(pointer: coarse)").matches) return;
    // Suppress under reduced-motion
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const onScroll = () => {
      if (window.scrollY > window.innerHeight * 0.8) {
        setArmed(true);
        window.removeEventListener("scroll", onScroll);
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Track cursor — translate small offset relative to the mascot's screen anchor
  useEffect(() => {
    if (!armed) return;
    const onMove = (e: PointerEvent) => {
      const dx = e.clientX - (window.innerWidth - 80);
      const dy = e.clientY - (window.innerHeight - 80);
      x.set(Math.max(-20, Math.min(20, dx * 0.05)));
      y.set(Math.max(-20, Math.min(20, dy * 0.05)));
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [armed, x, y]);

  if (!armed) return null;

  return (
    <motion.div
      style={{ x: sx, y: sy }}
      onPointerEnter={() => setHover(true)}
      onPointerLeave={() => setHover(false)}
      className="pointer-events-auto fixed bottom-20 right-6 z-30 w-[120px] h-[120px]"
      aria-hidden
    >
      {SPLINE_SCENE && Spline ? (
        <Suspense fallback={<Placeholder hover={hover} />}>
          <Spline scene={SPLINE_SCENE} />
        </Suspense>
      ) : (
        <Placeholder hover={hover} />
      )}
    </motion.div>
  );
}

function Placeholder({ hover }: { hover: boolean }) {
  return (
    <motion.div
      className="w-full h-full grid place-items-center"
      animate={{ scale: hover ? 1.08 : 1, rotate: hover ? 18 : 0 }}
      transition={{ type: "spring", stiffness: 140, damping: 12 }}
    >
      <motion.svg
        viewBox="0 0 100 100"
        fill="none"
        stroke="var(--color-fg)"
        strokeWidth="6"
        strokeLinecap="square"
        className="w-full h-full"
        animate={{ rotateY: 360 }}
        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
      >
        <path d="M51 7 L89 30" />
        <path d="M91 33 L91 67" />
        <path d="M89 70 L54 91" />
        <path d="M46 91 L11 70" />
        <path d="M9 67 L9 33" />
        <path d="M11 30 L49 7" />
        <path d="M17 32 L48 40" stroke="var(--color-accent)" />
        <path d="M83 32 L52 40" stroke="var(--color-accent)" />
        <path d="M50 43 L50 88" stroke="var(--color-accent)" />
      </motion.svg>
    </motion.div>
  );
}
