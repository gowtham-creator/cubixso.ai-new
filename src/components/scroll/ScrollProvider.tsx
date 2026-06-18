"use client";

// ScrollProvider — the single source of truth for normalized page progress.
//
// Exposes ONE value p ∈ [0,1] (document scroll position / total scrollable
// height) in TWO shapes so consumers can pick the cheapest tool:
//   • pRef   — a plain ref read inside rAF / useFrame loops (zero re-render)
//   • pMotion — a framer-motion MotionValue for declarative useTransform chains
//
// Progress is derived off window.scrollY (which the Lenis instance keeps in
// sync) and is rAF-throttled: scroll/resize events only flip a dirty flag; the
// single rAF loop recomputes p at most once per frame. Reduced-motion does not
// change the value (layout/progress must stay truthful) — consumers decide how
// to animate.

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
} from "react";
import { motionValue, type MotionValue } from "framer-motion";

type ScrollCtx = {
  /** Live page progress 0→1, read synchronously inside rAF/useFrame loops. */
  pRef: React.MutableRefObject<number>;
  /** Same value as a MotionValue for useTransform / motion bindings. */
  pMotion: MotionValue<number>;
};

const Ctx = createContext<ScrollCtx | null>(null);

/** Access normalized page progress p∈[0,1] as both a ref and a MotionValue. */
export function useScrollP(): ScrollCtx {
  const ctx = useContext(Ctx);
  if (!ctx) {
    throw new Error("useScrollP must be used within <ScrollProvider>");
  }
  return ctx;
}

export function ScrollProvider({ children }: { children: React.ReactNode }) {
  const pRef = useRef(0);
  // Created once — a stable MotionValue for the lifetime of the provider.
  const pMotion = useMemo(() => motionValue(0), []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    let rafId = 0;
    let dirty = true; // compute once on mount so SSR→hydrate lands correct

    const compute = () => {
      const doc = document.documentElement;
      const max = doc.scrollHeight - window.innerHeight;
      const next = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      // Only touch the MotionValue when it actually moves — avoids waking
      // every subscriber on a still page.
      if (next !== pRef.current) {
        pRef.current = next;
        pMotion.set(next);
      }
    };

    const tick = () => {
      if (dirty) {
        dirty = false;
        compute();
      }
      rafId = requestAnimationFrame(tick);
    };

    const markDirty = () => {
      dirty = true;
    };

    window.addEventListener("scroll", markDirty, { passive: true });
    window.addEventListener("resize", markDirty, { passive: true });
    rafId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("scroll", markDirty);
      window.removeEventListener("resize", markDirty);
    };
  }, [pMotion]);

  const value = useMemo<ScrollCtx>(() => ({ pRef, pMotion }), [pMotion]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
