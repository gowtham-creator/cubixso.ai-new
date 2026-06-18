"use client";

// DotField — site-wide ambient "floating dust" background, rendered procedurally
// on a Canvas-2D so the drift is buttery-smooth at 60fps.
//
// Why not the <video>: slowing a 30fps clip to a calm drift (playbackRate ~0.26)
// only surfaces ~8 unique frames/sec, so the dots STEP instead of gliding, and
// blend-mode + filter + scale on a full-screen 1080p video is expensive to
// composite each frame. Procedural points move sub-pixel every frame → smooth,
// slow, and cheap.
//
// Theme-adaptive by drawing the dots directly in the right ink (white on the
// black page, black on the white page) — no blend modes. Depth via varied
// size / alpha / parallax speed + a whisper of twinkle, for the premium dust
// feel. Fixed, behind content, pointer-inert, decorative. Honours
// prefers-reduced-motion (static field) and pauses when the tab is hidden.

import { useEffect, useRef } from "react";
import { useTheme } from "@/components/providers/ThemeProvider";

interface Dot {
  x: number; y: number; r: number; a: number;
  vx: number; vy: number; tw: number; ph: number;
}

export function DotField() {
  const { resolved } = useTheme();
  const dark = resolved === "dark";
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const ink = dark ? "255,255,255" : "0,0,0";
    const rand = (a: number, b: number) => a + Math.random() * (b - a);

    let W = 0, H = 0;
    let dots: Dot[] = [];

    const build = () => {
      const mobile = W < 768;
      const count = Math.max(110, Math.min(640, Math.round((W * H) / 5400) * (mobile ? 0.55 : 1)));
      const baseAng = -0.4; // overall drift: gentle up-and-right
      dots = Array.from({ length: count }, () => {
        const t = Math.random();
        let r: number, a: number;
        if (t < 0.72) { r = rand(0.4, 0.9); a = rand(0.1, 0.34); }      // far dust
        else if (t < 0.95) { r = rand(0.9, 1.5); a = rand(0.3, 0.6); }  // mid
        else { r = rand(1.5, 2.3); a = rand(0.5, 0.85); }              // near, brighter
        const sp = rand(1.4, 3.6) * (0.4 + r);   // px/sec — parallax: bigger drifts faster
        const ang = baseAng + rand(-0.5, 0.5);
        return {
          x: Math.random() * W, y: Math.random() * H, r, a,
          vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp,
          tw: rand(0.25, 0.9), ph: rand(0, Math.PI * 2),
        };
      });
    };

    const fit = () => {
      const rect = canvas.getBoundingClientRect();
      W = rect.width; H = rect.height;
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      build();
    };
    fit();

    let raf = 0, last = 0, running = true;
    const draw = (now: number) => {
      const dt = last ? Math.min(0.05, (now - last) / 1000) : 0.016;
      last = now;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      for (const d of dots) {
        if (!reduced) {
          d.x += d.vx * dt; d.y += d.vy * dt;
          if (d.x < -4) d.x = W + 4; else if (d.x > W + 4) d.x = -4;
          if (d.y < -4) d.y = H + 4; else if (d.y > H + 4) d.y = -4;
        }
        const tw = reduced ? 1 : 0.82 + 0.18 * Math.sin(now * 0.001 * d.tw + d.ph);
        ctx.fillStyle = `rgba(${ink},${d.a * tw})`;
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx.fill();
      }
      if (running && !reduced) raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);

    const onVis = () => {
      if (document.hidden) { running = false; cancelAnimationFrame(raf); }
      else if (!reduced) { running = true; last = 0; raf = requestAnimationFrame(draw); }
    };
    window.addEventListener("resize", fit);
    document.addEventListener("visibilitychange", onVis);
    return () => {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", fit);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [dark]);

  return (
    <canvas
      ref={ref}
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0 h-full w-full"
    />
  );
}
