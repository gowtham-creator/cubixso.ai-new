"use client";

// useDepthParallax — the antigravity "free parallax" primitive.
//
// Declare a depth plane 0–3 and receive a MotionValue<string> ready to drop
// into `style={{ transform }}`. The element is translated on Y by
// scrollY * -depthSpeed using translate3d ONLY (GPU compositor, no layout).
//
//   plane 0 → 0.20×  (deep background: particles, glass veils)
//   plane 1 → 0.40×  (mid background)
//   plane 2 → 1.00×  (content baseline — moves with the page)
//   plane 3 → 1.10×  (foreground: type, chips — slightly overtakes scroll)
//
// Sign convention: back planes lag (smaller magnitude), foreground leads. The
// transform translates content UPWARD relative to its larger-magnitude scroll
// as you go down the page, so far planes appear to drift slower.
//
// Reduced-motion: returns a static "translate3d(0,0,0)" so layout is identical
// and nothing moves on scroll. p (page progress) is consumed only to stay
// reactive; the actual drive is window.scrollY for pixel-accurate parallax.

import { useEffect, useMemo, useState } from "react";
import { motionValue, type MotionValue } from "framer-motion";
import { useScrollP } from "./ScrollProvider";

const PLANE_SPEED: Record<number, number> = {
  0: 0.2,
  1: 0.4,
  2: 1.0,
  3: 1.1,
};

export function useDepthParallax(plane: 0 | 1 | 2 | 3): MotionValue<string> {
  const { pMotion } = useScrollP();
  const [reduced, setReduced] = useState(false);

  // A dedicated transform MotionValue so callers get a stable reference.
  const transform = useMemo(() => motionValue("translate3d(0,0,0)"), []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setReduced(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  useEffect(() => {
    const speed = PLANE_SPEED[plane] ?? 1.0;

    if (reduced) {
      transform.set("translate3d(0,0,0)");
      return;
    }

    const compute = () => {
      // Drive off raw scrollY for pixel-accurate, resolution-independent depth.
      // HARD CAP ±28px: unbounded drift (-scrollY × factor) translated deep
      // sections' content HUNDREDS of px out of their layout slots — headlines
      // ended up floating in the previous section ("nothing is aligned / text
      // missing"). Capped, planes keep a constant, calm 28px separation that
      // reads as depth without ever breaking the grid.
      const raw =
        typeof window !== "undefined"
          ? -window.scrollY * (speed - 1.0)
          : 0;
      const y = Math.max(-28, Math.min(28, raw));
      transform.set(`translate3d(0, ${y.toFixed(2)}px, 0)`);
    };

    compute();
    // pMotion fires once per frame only while scrolling (set-on-change), so
    // subscribing here is cheap and keeps parallax synced to the same clock.
    const unsub = pMotion.on("change", compute);
    return () => unsub();
  }, [plane, reduced, pMotion, transform]);

  return transform;
}
