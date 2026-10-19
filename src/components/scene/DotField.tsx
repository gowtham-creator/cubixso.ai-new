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
import { detectTier } from "@/lib/perf";

interface Dot {
  x: number; y: number; r: number;
  vx: number; vy: number;
}

// Dots are drawn in a few alpha buckets, one path + one fill per bucket, each
// bucket twinkling on its own phase. Per-dot fills (640 fillStyle strings and
// fill calls a frame) plus a 120Hz loop were a large share of the idle CPU
// that spun laptop fans; the drift is 1-4px/sec, so 30fps looks identical.
const BUCKETS = 8;
const FRAME_MS = 1000 / 30;
interface Bucket { a: number; tw: number; ph: number; dots: Dot[] }

export function DotField() {
  const { resolved } = useTheme();
  const dark = resolved === "dark";
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // Device-tier adaptation: "high" (desktop / server) is unchanged. On "low"
    // tier (few cores, little RAM, coarse-pointer mobile, reduced-motion) we
    // thin the field by ~half and skip the per-dot twinkle (the per-frame
    // Math.sin), which is the most expensive work in the draw loop.
    const lowTier = detectTier() === "low";
    const ink = dark ? "255,255,255" : "0,0,0";
    const rand = (a: number, b: number) => a + Math.random() * (b - a);

    let W = 0, H = 0;
    let buckets: Bucket[] = [];

    const build = () => {
      const mobile = W < 768;
      // High tier: EXACT original formula (kept verbatim so desktop is pixel-
      // identical). Low tier: ~50% fewer dots, with a lower floor so very small
      // constrained screens stay light.
      const count = lowTier
        ? Math.max(60, Math.min(320, Math.round(((W * H) / 5400) * (mobile ? 0.55 : 1) * 0.5)))
        : Math.max(110, Math.min(640, Math.round((W * H) / 5400) * (mobile ? 0.55 : 1)));
      const baseAng = -0.4; // overall drift: gentle up-and-right
      buckets = Array.from({ length: BUCKETS }, () => ({ a: 0, tw: rand(0.25, 0.9), ph: rand(0, Math.PI * 2), dots: [] }));
      const sums = new Array(BUCKETS).fill(0);
      for (let n = 0; n < count; n++) {
        const t = Math.random();
        let r: number, a: number;
        if (t < 0.72) { r = rand(0.4, 0.9); a = rand(0.1, 0.34); }      // far dust
        else if (t < 0.95) { r = rand(0.9, 1.5); a = rand(0.3, 0.6); }  // mid
        else { r = rand(1.5, 2.3); a = rand(0.5, 0.85); }              // near, brighter
        const sp = rand(1.4, 3.6) * (0.4 + r);   // px/sec — parallax: bigger drifts faster
        const ang = baseAng + rand(-0.5, 0.5);
        // Bucket by alpha (0.1..0.85 → 0..BUCKETS-1); the bucket draws at the
        // mean alpha of its dots.
        const k = Math.min(BUCKETS - 1, Math.floor(((a - 0.1) / 0.75) * BUCKETS));
        buckets[k].dots.push({ x: Math.random() * W, y: Math.random() * H, r, vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp });
        sums[k] += a;
      }
      buckets.forEach((bk, k) => { bk.a = bk.dots.length ? sums[k] / bk.dots.length : 0; });
    };

    const fit = () => {
      const rect = canvas.getBoundingClientRect();
      W = rect.width; H = rect.height;
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      build();
    };
    fit();

    // Held still while the intro curtain is up: the curtain is opaque, yet the
    // field was redrawn 30x a second underneath it — a full-screen canvas
    // upload per frame competing with the intro on phones. One frame is
    // painted now (so the field is there when the curtain lifts); the drift
    // starts on the reveal. Nobody can see 4 seconds of 1-4px/sec drift missed.
    let held = false;
    try { held = sessionStorage.getItem("cubixso.seen") !== "1"; } catch { /* private mode */ }

    // Frozen while the page is scrolling: a redraw re-uploads the full-screen
    // canvas AND forces every glass panel above it to re-blur its backdrop, on
    // the frames where scroll already has the GPU busiest. A 1-4px/sec drift
    // that halts while everything else moves is invisible.
    let scrolledAt = 0;
    const onScroll = () => { scrolledAt = performance.now(); };

    let raf = 0, last = 0, running = true;
    const draw = (now: number) => {
      if (running && !reduced && !held) raf = requestAnimationFrame(draw);
      if (last && now - last < FRAME_MS - 1) return;
      if (now - scrolledAt < 160) { last = now; return; }
      const dt = last ? Math.min(0.1, (now - last) / 1000) : 0.016;
      last = now;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      for (const bk of buckets) {
        if (!bk.dots.length) continue;
        const tw = reduced || lowTier ? 1 : 0.82 + 0.18 * Math.sin(now * 0.001 * bk.tw + bk.ph);
        ctx.fillStyle = `rgba(${ink},${bk.a * tw})`;
        ctx.beginPath();
        for (const d of bk.dots) {
          if (!reduced) {
            d.x += d.vx * dt; d.y += d.vy * dt;
            if (d.x < -4) d.x = W + 4; else if (d.x > W + 4) d.x = -4;
            if (d.y < -4) d.y = H + 4; else if (d.y > H + 4) d.y = -4;
          }
          ctx.moveTo(d.x + d.r, d.y);
          ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        }
        ctx.fill();
      }
    };
    raf = requestAnimationFrame(draw);

    const onVis = () => {
      if (document.hidden) { running = false; cancelAnimationFrame(raf); }
      else if (!reduced) { running = true; last = 0; raf = requestAnimationFrame(draw); }
    };
    const onReveal = () => {
      held = false;
      if (running && !reduced) { cancelAnimationFrame(raf); last = 0; raf = requestAnimationFrame(draw); }
    };
    if (held) window.addEventListener("cubixso:revealed", onReveal, { once: true });
    window.addEventListener("resize", fit);
    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("visibilitychange", onVis);
    return () => {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("cubixso:revealed", onReveal);
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
