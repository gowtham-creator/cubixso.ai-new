"use client";

// SmoothScroll — Lenis-powered inertial scroll for the whole document.
// Mounts once at the root layout; safe to suspend during route transitions.
// GSAP ScrollTrigger components can hook into Lenis via `lenis.on('scroll', ...)`
// — exported context lets descendants reach the instance if needed.

import { createContext, useContext, useEffect, useRef } from "react";
import Lenis from "lenis";

const LenisCtx = createContext<Lenis | null>(null);
export const useLenis = () => useContext(LenisCtx);

export function SmoothScroll({ children }: { children: React.ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    const lenis = new Lenis({
      lerp: 0.14,                                    // snappier than default 0.1
      duration: 0.9,
      // Cubic ease-out — quick onset, fast settle
      easing: (t) => 1 - Math.pow(1 - t, 3),
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.5,
    });
    lenisRef.current = lenis;

    let rafId = 0;
    const tick = (time: number) => {
      lenis.raf(time);
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  return (
    <LenisCtx.Provider value={lenisRef.current}>{children}</LenisCtx.Provider>
  );
}
