"use client";

// FrameCap — drives a frameloop="demand" Canvas at a fixed frame rate.
//
// R3F's "always" loop renders on every display refresh: 120 times a second on
// ProMotion Macs and 144Hz laptops. For slow, ambient scenes (the hero cube,
// the scroll cube, the globe, the footer mascot) that doubled the GPU work for
// no visible gain and was the main reason laptop fans spun up on the homepage.
// Put the Canvas on frameloop="demand" and mount <FrameCap fps={60} /> inside
// it: frames are requested at most `fps` times a second, and none at all while
// `active` is false. Interaction that calls invalidate() still renders at once.

import { useEffect } from "react";
import { useThree } from "@react-three/fiber";

export function FrameCap({ fps = 60, active = true }: { fps?: number; active?: boolean }) {
  const invalidate = useThree((s) => s.invalidate);

  useEffect(() => {
    if (!active) return;
    const step = 1000 / fps;
    let raf = 0;
    let last = 0;
    const loop = (t: number) => {
      raf = requestAnimationFrame(loop);
      // 1ms slack so a 60Hz display (16.67ms frames) is not throttled to 30.
      if (t - last >= step - 1) {
        last = t;
        invalidate();
      }
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [fps, active, invalidate]);

  return null;
}
