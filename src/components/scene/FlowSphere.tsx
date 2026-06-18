"use client";

// FlowSphere — the Cubixso "vercel hero" look: a dotted sphere whose points
// drift along the surface following a flow field, each leaving a soft curved
// motion-trail (the comet-streak look). Pure Canvas-2D (deterministic, no
// WebGL), theme-aware: blue dots on white in light mode, white/ice dots on a
// near-black field in dark mode. White-led — no green, no purple.
//
// Trails come from the classic "fade the frame" technique (translucent bg fill
// each tick) rather than storing history, so it's cheap on mobile too.

import { useEffect, useRef } from "react";
import { useTheme } from "@/components/providers/ThemeProvider";

interface FlowSphereProps {
  className?: string;
  density?: number;   // particle count (scaled down on mobile)
  speed?: number;     // surface flow speed
  opacity?: number;   // whole-field opacity
}

export function FlowSphere({ className, density = 2600, speed = 1, opacity = 1 }: FlowSphereProps) {
  const ref = useRef<HTMLCanvasElement>(null);
  const { resolved } = useTheme();
  const dark = resolved === "dark";

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true })!;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let W = 0, H = 0, R = 0, cx = 0, cy = 0;
    const fit = () => {
      const r = canvas.getBoundingClientRect();
      W = r.width; H = r.height;
      canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
      R = Math.min(W, H) * 0.52; cx = W / 2; cy = H / 2;
    };
    fit();

    const mobile = W < 768;
    const N = Math.round(density * (mobile ? 0.42 : 1));
    const golden = Math.PI * (3 - Math.sqrt(5));
    const th = new Float32Array(N); // azimuth
    const ph = new Float32Array(N); // polar
    for (let i = 0; i < N; i++) {
      const y = 1 - (i / (N - 1)) * 2;
      ph[i] = Math.acos(Math.max(-1, Math.min(1, y)));
      th[i] = golden * i;
    }

    // theme palette — white-led, no green/purple
    const bg = dark ? "5,6,13" : "248,250,253";
    const dotR = dark ? 120 : 60;      // dot color tone
    const dotG = dark ? 180 : 110;
    const dotB = dark ? 255 : 210;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let raf = 0, spin = 0, last = 0;
    const tick = (now: number) => {
      const dt = last ? Math.min(0.05, (now - last) / 1000) : 0.016;
      last = now;
      if (!reduced) spin += dt * 0.12 * speed;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      // fade previous frame → motion trails
      ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle = `rgba(${bg},${reduced ? 1 : 0.14})`;
      ctx.fillRect(0, 0, W, H);

      for (let i = 0; i < N; i++) {
        if (!reduced) {
          // tangential flow field over the surface
          const f = Math.sin(ph[i] * 4 + now * 0.0004) + Math.cos(th[i] * 3 - now * 0.00032);
          th[i] += dt * 0.5 * speed * Math.cos(f) / Math.max(0.25, Math.sin(ph[i]));
          ph[i] += dt * 0.32 * speed * Math.sin(f);
          if (ph[i] < 0.06) ph[i] = 0.06; else if (ph[i] > Math.PI - 0.06) ph[i] = Math.PI - 0.06;
        }
        const a = th[i] + spin;
        const sp = Math.sin(ph[i]);
        const x = sp * Math.cos(a);
        const y = Math.cos(ph[i]);
        const z = sp * Math.sin(a);
        const sx = cx + x * R;
        const sy = cy - y * R;
        const d = (z + 1) * 0.5;            // 0 back … 1 front
        const alpha = (0.22 + 0.78 * d) * opacity;
        const r = 0.85 + d * 1.9;
        ctx.fillStyle = `rgba(${dotR},${dotG},${dotB},${alpha})`;
        ctx.beginPath();
        ctx.arc(sx, sy, r, 0, Math.PI * 2);
        ctx.fill();
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    window.addEventListener("resize", fit);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", fit); };
  }, [dark, density, speed, opacity]);

  return <canvas ref={ref} className={className} aria-hidden />;
}
