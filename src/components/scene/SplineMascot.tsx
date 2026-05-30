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
import Image from "next/image";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { useTheme } from "@/components/providers/ThemeProvider";

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
  // Use the REAL brand logo PNG (same asset as the Nav) so the mark is always
  // pixel-accurate — the previous hand-traced SVG had the inner Y inverted.
  const { resolved } = useTheme();
  const src = resolved === "dark" ? "/logo-on-dark.png" : "/logo.png";
  return (
    <motion.div
      className="w-full h-full grid place-items-center"
      animate={{ scale: hover ? 1.1 : 1, rotate: hover ? 10 : 0 }}
      transition={{ type: "spring", stiffness: 140, damping: 12 }}
    >
      <motion.div
        className="w-[78%] h-[78%]"
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 3.6, repeat: Infinity, ease: "easeInOut" }}
      >
        <Image
          src={src}
          alt="Cubixso"
          width={120}
          height={120}
          className="w-full h-full object-contain drop-shadow-[0_4px_24px_rgba(27,79,255,0.35)]"
        />
      </motion.div>
    </motion.div>
  );
}
