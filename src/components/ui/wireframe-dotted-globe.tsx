"use client";

// RotatingEarth — d3 wireframe + halftone-dot globe (geoOrthographic). Adapted
// for Cubixso: the ocean is TRANSPARENT so the sphere floats on the void/dust
// field, colours are THEME-AWARE (white wireframe + cobalt land dots on dark,
// charcoal on light), it PAUSES off-screen and under prefers-reduced-motion,
// and wheel-zoom is removed so hovering it never hijacks page scroll. Drag to
// rotate. Land data is precomputed and served from public/data.

import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { useTheme } from "@/components/providers/ThemeProvider";

// Land outline + halftone dots, precomputed from Natural Earth 110m into
// public/data (same 1.28° grid the component used to build at runtime). Building
// them in the browser ran ~20k point-in-polygon tests in one synchronous block,
// which froze the /contact opener, badly on phones; it also fetched from GitHub
// on every visit. Now it is two static files, loaded once per session.
type LandData = { outline: d3.GeoPermissibleObjects; dots: Float32Array; vec: Float32Array };
let landCache: LandData | null = null;
let landPromise: Promise<LandData> | null = null;

function loadLand(): Promise<LandData> {
  if (!landPromise) {
    const get = (u: string) => fetch(u).then((r) => { if (!r.ok) throw new Error(u); return r.json(); });
    landPromise = Promise.all([get("/data/land-110m.json"), get("/data/land-dots.json")])
      .then(([outline, flat]: [d3.GeoPermissibleObjects, number[]]) => {
        const dots = Float32Array.from(flat);
        const n = dots.length / 2;
        const vec = new Float32Array(n * 3);
        const RAD = Math.PI / 180;
        for (let i = 0; i < n; i++) {
          const l = dots[i * 2] * RAD, p = dots[i * 2 + 1] * RAD;
          vec[i * 3] = Math.cos(p) * Math.cos(l);
          vec[i * 3 + 1] = Math.cos(p) * Math.sin(l);
          vec[i * 3 + 2] = Math.sin(p);
        }
        landCache = { outline, dots, vec };
        return landCache;
      })
      .catch((e) => { landPromise = null; throw e; });
  }
  return landPromise;
}

interface RotatingEarthProps {
  width?: number;
  height?: number;
  className?: string;
  /** show the "DRAG TO ROTATE" hint (off for the preloader). */
  hint?: boolean;
}

export default function RotatingEarth({ width = 460, height = 460, className = "", hint = true }: RotatingEarthProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const { resolved } = useTheme();
  const dark = resolved === "dark";
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;

    // theme-aware GREY palette — soft monochrome wireframe + grey land dots
    const ink = dark ? "#c7cdd8" : "#4b515c";       // sphere + land wireframe
    const grat = dark ? "rgba(199,205,216,0.2)" : "rgba(75,81,92,0.16)"; // graticule
    const dotColor = dark ? "#9aa1ad" : "#8b92a0";  // grey land dots

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Size to a SQUARE that fits the rendered wrapper (its CSS box), not the raw
    // window — the aside column is narrow (max-w-440) so window math would
    // overshoot and clip. A single square dimension keeps the canvas in lockstep
    // with the wrapper's aspect-square box → no layout jump on first paint.
    // These are `let` because resize() recomputes them, so the globe TRACKS the
    // container (orientation change, tablet split-view, first-paint 0-width)
    // instead of a one-time measurement.
    let containerWidth = 0;
    let containerHeight = 0;
    let radius = 0;

    const projection = d3.geoOrthographic().clipAngle(90);
    const path = d3.geoPath().projection(projection).context(context);

    // (Re)measure the wrapper and re-sync the canvas backing store (DPR-scaled),
    // CSS size, and projection. Setting canvas.width/height resets the 2D
    // transform, so context.scale(dpr) is applied fresh (never compounded).
    const resize = () => {
      const wrapW = wrapRef.current?.clientWidth || width;
      const box = Math.min(width, height, wrapW || width);
      containerWidth = box;
      containerHeight = box;
      radius = box / 2.5;
      const dpr = Math.min(window.devicePixelRatio || 1, box < 480 ? 1.5 : 2);
      canvas.width = containerWidth * dpr;
      canvas.height = containerHeight * dpr;
      canvas.style.width = `${containerWidth}px`;
      canvas.style.height = `${containerHeight}px`;
      context.scale(dpr, dpr);
      projection.scale(radius).translate([containerWidth / 2, containerHeight / 2]);
    };
    resize();

    // Land data is precomputed and cached for the session (see loadLand).
    let land: LandData | null = landCache;
    let cancelled = false;
    const graticule = d3.geoGraticule()();
    const RAD = Math.PI / 180;

    const render = () => {
      context.clearRect(0, 0, containerWidth, containerHeight);
      const currentScale = projection.scale();
      const sf = currentScale / radius;

      // sphere outline (transparent ocean — floats on the void)
      context.beginPath();
      context.arc(containerWidth / 2, containerHeight / 2, currentScale, 0, 2 * Math.PI);
      context.strokeStyle = ink;
      context.lineWidth = 1.4 * sf;
      context.globalAlpha = 0.85;
      context.stroke();
      context.globalAlpha = 1;

      if (land) {
        context.beginPath();
        path(graticule);
        context.strokeStyle = grat;
        context.lineWidth = 1 * sf;
        context.stroke();

        context.beginPath();
        path(land.outline);
        context.strokeStyle = ink;
        context.globalAlpha = 0.5;
        context.lineWidth = 1 * sf;
        context.stroke();
        context.globalAlpha = 1;

        // All visible dots in ONE path and one fill (it was a beginPath/fill per
        // dot, ~13k canvas calls a frame). Far-side dots are culled with a dot
        // product against the view centre; they used to be drawn through the
        // globe on top of the near side.
        const cl = -rotation[0] * RAD, cp = -rotation[1] * RAD;
        const cx = Math.cos(cp) * Math.cos(cl), cy = Math.cos(cp) * Math.sin(cl), cz = Math.sin(cp);
        const r = 1.2 * sf;
        const { dots, vec } = land;
        context.beginPath();
        for (let i = 0, n = dots.length / 2; i < n; i++) {
          if (vec[i * 3] * cx + vec[i * 3 + 1] * cy + vec[i * 3 + 2] * cz <= 0.02) continue;
          const pt = projection([dots[i * 2], dots[i * 2 + 1]]);
          if (!pt) continue;
          context.moveTo(pt[0] + r, pt[1]);
          context.arc(pt[0], pt[1], r, 0, 2 * Math.PI);
        }
        context.fillStyle = dotColor;
        context.fill();
      }
    };

    const rotation: [number, number] = [0, -12];
    projection.rotate(rotation);

    // Paint the sphere immediately so the globe is visible on the first frame;
    // land fills in when the (cached) data resolves.
    render();

    const loadWorldData = () => {
      if (land) return;
      loadLand()
        .then((d) => { if (cancelled) return; land = d; render(); })
        .catch(() => { if (!cancelled) setError("Failed to load globe data"); });
    };

    // auto-rotate (paused when off-screen / reduced-motion); drag to spin
    let autoRotate = !reduced;
    let onScreen = true;
    // Auto-rotation is slow enough that 30fps looks identical to 60 and halves
    // the redraw cost; dragging still repaints on every pointer move.
    const speed = 0.64;
    let lastFrame = 0;
    const rotationTimer = d3.timer((elapsed) => {
      if (elapsed - lastFrame < 32) return;
      lastFrame = elapsed;
      if (autoRotate && onScreen) {
        rotation[0] += speed;
        projection.rotate(rotation);
        render();
      }
    });

    const io = wrapRef.current && typeof IntersectionObserver !== "undefined"
      ? new IntersectionObserver(([e]) => { onScreen = e.isIntersecting; }, { threshold: 0.05 })
      : null;
    if (io && wrapRef.current) io.observe(wrapRef.current);

    // Track container/orientation changes — re-sync canvas + projection, repaint.
    // Fires once on observe, which self-corrects a 0-width first paint on mobile.
    const ro = wrapRef.current && typeof ResizeObserver !== "undefined"
      ? new ResizeObserver(() => { resize(); render(); })
      : null;
    if (ro && wrapRef.current) ro.observe(wrapRef.current);

    // Pointer (not mouse) events so drag-to-rotate works on TOUCH too — mobile
    // browsers don't reliably synthesize mouse events during a touch drag.
    // setPointerCapture keeps the gesture; `touch-action:none` on the canvas
    // stops the browser stealing it for page scroll.
    const onPointerDown = (event: PointerEvent) => {
      autoRotate = false;
      try { canvas.setPointerCapture(event.pointerId); } catch {}
      const sx = event.clientX, sy = event.clientY;
      const start: [number, number] = [rotation[0], rotation[1]];
      const move = (m: PointerEvent) => {
        const s = 0.4;
        rotation[0] = start[0] + (m.clientX - sx) * s;
        rotation[1] = Math.max(-90, Math.min(90, start[1] - (m.clientY - sy) * s));
        projection.rotate(rotation);
        render();
      };
      const up = () => {
        document.removeEventListener("pointermove", move);
        document.removeEventListener("pointerup", up);
        document.removeEventListener("pointercancel", up);
        if (!reduced) setTimeout(() => { autoRotate = true; }, 400);
      };
      document.addEventListener("pointermove", move);
      document.addEventListener("pointerup", up);
      document.addEventListener("pointercancel", up);
    };
    canvas.addEventListener("pointerdown", onPointerDown);

    loadWorldData();

    return () => {
      cancelled = true;
      rotationTimer.stop();
      io?.disconnect();
      ro?.disconnect();
      canvas.removeEventListener("pointerdown", onPointerDown);
    };
  }, [width, height, dark]);

  if (error) {
    return (
      <div ref={wrapRef} className={`relative aspect-square flex items-center justify-center ${className}`}>
        <p className="text-(--color-muted) text-sm">{error}</p>
      </div>
    );
  }

  return (
    // Reserve a square box up front (aspect-square) so the canvas never resizes
    // the layout when the effect sets its explicit px dimensions — no first-paint
    // jump on the /contact opener. The canvas fills the box; the effect keeps its
    // backing-store px sizing in sync via the same min(width/height) math.
    <div ref={wrapRef} className={`relative aspect-square ${className}`}>
      <canvas ref={canvasRef} className="absolute inset-0 m-auto cursor-grab active:cursor-grabbing touch-none" style={{ maxWidth: "100%", touchAction: "none" }} />
      {hint && (
        <div className="pointer-events-none absolute bottom-2 left-2 mono text-[10px] tracking-[0.18em] text-(--color-muted)">
          DRAG TO ROTATE
        </div>
      )}
    </div>
  );
}
