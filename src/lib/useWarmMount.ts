"use client";

// useWarmMount — decides whether a heavy WebGL canvas should exist right now.
//
// Why this exists: the site's 3D sections used to mount only while near the
// viewport and UNMOUNT when scrolled away. Every return then rebuilt from
// nothing — a new WebGL context, geometry and texture uploads, shader and
// post-processing compiles — which is half a second to well over a second of
// the section sitting empty before its content pops in.
//
// High tier (desktop): build ONCE, early, and keep it. The canvas warms up in
// idle time shortly after the intro curtain lifts, so it is compiled long
// before anyone scrolls to it; afterwards it only ever pauses its frameloop.
// Desktop browsers have no practical live-context cap, so holding it is free.
//
// Low tier (phones): mount only while near the viewport. iOS Safari evicts the
// OLDEST WebGL context when it runs out, leaving that canvas frozen on its last
// frame, so a phone genuinely cannot hold every 3D section for the session.
//
// `stagger` spreads the warm-ups out so two canvases do not compile shaders in
// the same idle slot and hitch the page together.

import { useEffect, useState } from "react";
import type { DeviceTier } from "@/lib/perf";

type IdleWindow = Window & {
  requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number;
  cancelIdleCallback?: (id: number) => void;
};

/** Run `fn` in idle time once the intro curtain has lifted (or at once if it already has). */
export function afterReveal(fn: () => void, stagger = 0): () => void {
  const w = window as IdleWindow;
  let idle: number | undefined;
  let timer: number | undefined;
  const schedule = () => {
    timer = window.setTimeout(() => {
      if (w.requestIdleCallback) idle = w.requestIdleCallback(fn, { timeout: 2500 });
      else fn();
    }, stagger);
  };
  // The intro plays once per session; on later visits there is no reveal event.
  let seen = false;
  try { seen = sessionStorage.getItem("cubixso.seen") === "1"; } catch { /* private mode */ }
  if (seen) schedule();
  else window.addEventListener("cubixso:revealed", schedule, { once: true });
  return () => {
    window.removeEventListener("cubixso:revealed", schedule);
    if (timer !== undefined) window.clearTimeout(timer);
    if (idle !== undefined) w.cancelIdleCallback?.(idle);
  };
}

export function useWarmMount(near: boolean, tier: DeviceTier, stagger = 0): boolean {
  const [warm, setWarm] = useState(false);
  useEffect(() => {
    if (tier === "low") return;
    return afterReveal(() => setWarm(true), stagger);
  }, [tier, stagger]);

  // Once mounted on a high-tier device it stays mounted.
  const [latched, setLatched] = useState(false);
  useEffect(() => {
    if (near || warm) setLatched(true);
  }, [near, warm]);

  return tier === "low" ? near : latched;
}
