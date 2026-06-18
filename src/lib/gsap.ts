"use client";

// GSAP + ScrollTrigger client-only registration. Called once per module
// import in browser; safe to invoke multiple times (gsap dedupes plugins).
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type Lenis from "lenis";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

// ─────────────────────────────────────────────────────────────────────────────
// Lenis ↔ ScrollTrigger bridge — THE one place smooth-scroll and pins meet.
//
// Lenis animates *native* window scroll (no transform wrapper), so ScrollTrigger
// can keep its default window scroller + `pinType: fixed`. Two things must hold
// for pins to never judder or trap scroll:
//   1. every Lenis scroll emit → ScrollTrigger.update() (pins track in lockstep)
//   2. ONE rAF clock: gsap.ticker drives lenis.raf, and lagSmoothing is off so
//      a long frame can never desync pinned position from scroll position.
//
// Called exactly once from SmoothScroll's mount effect. Returns a disposer that
// fully restores gsap's defaults (HMR / route-unmount safe). Idempotent: a
// second call while connected is a no-op returning a no-op disposer.
// ─────────────────────────────────────────────────────────────────────────────
let lenisConnected = false;

export function connectLenisToScrollTrigger(lenis: Lenis): () => void {
  if (lenisConnected) return () => {};
  lenisConnected = true;

  const onScroll = () => ScrollTrigger.update();
  lenis.on("scroll", onScroll);

  // gsap ticker time is seconds; lenis.raf expects milliseconds.
  const tick = (time: number) => lenis.raf(time * 1000);
  gsap.ticker.add(tick);
  gsap.ticker.lagSmoothing(0);

  // Lazy-below-fold content (map, previews, mascot) grows the document AFTER
  // pins measured their start/end — stale positions misplace every pin below
  // the growth. Watch the body and re-measure once the growth settles (400ms
  // debounce keeps refresh() off the scroll hot path).
  let refreshTimer = 0;
  const ro =
    typeof ResizeObserver !== "undefined"
      ? new ResizeObserver(() => {
          window.clearTimeout(refreshTimer);
          refreshTimer = window.setTimeout(() => ScrollTrigger.refresh(), 400);
        })
      : null;
  ro?.observe(document.body);

  return () => {
    lenisConnected = false;
    lenis.off("scroll", onScroll);
    window.clearTimeout(refreshTimer);
    ro?.disconnect();
    gsap.ticker.remove(tick);
    gsap.ticker.lagSmoothing(500, 33); // restore gsap defaults
  };
}

export { gsap, ScrollTrigger };
