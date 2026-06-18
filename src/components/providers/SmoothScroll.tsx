"use client";

// SmoothScroll — Lenis-powered inertial scroll for the whole document.
// Mounts once at the root layout; safe to suspend during route transitions.
//
// Lenis is driven by gsap.ticker (NOT a private rAF) and every Lenis scroll
// emit calls ScrollTrigger.update() — see connectLenisToScrollTrigger in
// src/lib/gsap.ts. One clock + lockstep updates is what makes ScrollTrigger
// pins (KineticStack / Global) jank-free over smooth scroll.
// Exported context lets descendants reach the instance if needed.

import { createContext, useContext, useEffect, useRef } from "react";
import Lenis from "lenis";
import { connectLenisToScrollTrigger } from "@/lib/gsap";

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

    // gsap.ticker drives lenis.raf + Lenis scroll → ScrollTrigger.update().
    const disconnect = connectLenisToScrollTrigger(lenis);

    return () => {
      disconnect();
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  return (
    <LenisCtx.Provider value={lenisRef.current}>{children}</LenisCtx.Provider>
  );
}
