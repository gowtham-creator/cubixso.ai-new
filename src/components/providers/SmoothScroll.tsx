"use client";

// SmoothScroll — Lenis-powered inertial scroll for the whole document.
// Mounts once at the root layout; safe to suspend during route transitions.
//
// Lenis is driven by gsap.ticker (NOT a private rAF) and every Lenis scroll
// emit calls ScrollTrigger.update() — see connectLenisToScrollTrigger in
// src/lib/gsap.ts. One clock + lockstep updates is what makes ScrollTrigger
// pins (KineticStack / Global) jank-free over smooth scroll.
// Exported context lets descendants reach the instance if needed.

import { createContext, useContext, useEffect, useState } from "react";
import Lenis from "lenis";
import { connectLenisToScrollTrigger } from "@/lib/gsap";

const LenisCtx = createContext<Lenis | null>(null);
export const useLenis = () => useContext(LenisCtx);

export function SmoothScroll({ children }: { children: React.ReactNode }) {
  // STATE, not a ref: the provider has to re-render once the instance exists,
  // otherwise every useLenis() consumer is handed the initial null forever and
  // silently no-ops (that is what broke the mobile menu's scroll lock).
  const [lenis, setLenis] = useState<Lenis | null>(null);

  useEffect(() => {
    const lenis = new Lenis({
      // lerp drives the wheel smoothing (frame-rate independent). Lenis ignores
      // duration/easing whenever lerp is set, so they only document intent.
      lerp: 0.14,                                    // snappier than default 0.1
      duration: 0.9,
      // Cubic ease-out — quick onset, fast settle
      easing: (t) => 1 - Math.pow(1 - t, 3),
      smoothWheel: true,
      wheelMultiplier: 1,
      // Touch stays NATIVE on purpose: the OS's own momentum scroll runs on the
      // compositor and never waits on a busy main thread, whereas syncTouch
      // would re-drive every finger frame from JS. (touchMultiplier only
      // applies under syncTouch, so it is gone.)
      syncTouch: false,
    });
    setLenis(lenis);

    // gsap.ticker drives lenis.raf + Lenis scroll → ScrollTrigger.update().
    const disconnect = connectLenisToScrollTrigger(lenis);

    return () => {
      disconnect();
      lenis.destroy();
      setLenis(null);
    };
  }, []);

  return <LenisCtx.Provider value={lenis}>{children}</LenisCtx.Provider>;
}
