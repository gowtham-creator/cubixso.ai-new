"use client";

// RotatingEarth — d3 wireframe + halftone-dot globe (geoOrthographic). Adapted
// for Cubixso: the ocean is TRANSPARENT so the sphere floats on the void/dust
// field, colours are THEME-AWARE (white wireframe + cobalt land dots on dark,
// charcoal on light), it PAUSES off-screen and under prefers-reduced-motion,
// and wheel-zoom is removed so hovering it never hijacks page scroll. Drag to
// rotate. Land geometry streams from Natural Earth (client-side).

import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { useTheme } from "@/components/providers/ThemeProvider";

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
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = containerWidth * dpr;
      canvas.height = containerHeight * dpr;
      canvas.style.width = `${containerWidth}px`;
      canvas.style.height = `${containerHeight}px`;
      context.scale(dpr, dpr);
      projection.scale(radius).translate([containerWidth / 2, containerHeight / 2]);
    };
    resize();

    const pointInPolygon = (point: [number, number], polygon: number[][]): boolean => {
      const [x, y] = point;
      let inside = false;
      for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
        const [xi, yi] = polygon[i];
        const [xj, yj] = polygon[j];
        if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
      }
      return inside;
    };
    const pointInFeature = (point: [number, number], feature: any): boolean => {
      const g = feature.geometry;
      if (g.type === "Polygon") {
        if (!pointInPolygon(point, g.coordinates[0])) return false;
        for (let i = 1; i < g.coordinates.length; i++) if (pointInPolygon(point, g.coordinates[i])) return false;
        return true;
      }
      if (g.type === "MultiPolygon") {
        for (const poly of g.coordinates) {
          if (pointInPolygon(point, poly[0])) {
            let inHole = false;
            for (let i = 1; i < poly.length; i++) if (pointInPolygon(point, poly[i])) { inHole = true; break; }
            if (!inHole) return true;
          }
        }
        return false;
      }
      return false;
    };
    const generateDotsInPolygon = (feature: any, dotSpacing = 16) => {
      const dots: [number, number][] = [];
      const [[minLng, minLat], [maxLng, maxLat]] = d3.geoBounds(feature);
      const step = dotSpacing * 0.08;
      for (let lng = minLng; lng <= maxLng; lng += step)
        for (let lat = minLat; lat <= maxLat; lat += step)
          if (pointInFeature([lng, lat], feature)) dots.push([lng, lat]);
      return dots;
    };

    const allDots: { lng: number; lat: number }[] = [];
    let landFeatures: any;

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

      if (landFeatures) {
        const graticule = d3.geoGraticule();
        context.beginPath();
        path(graticule());
        context.strokeStyle = grat;
        context.lineWidth = 1 * sf;
        context.stroke();

        context.beginPath();
        landFeatures.features.forEach((f: any) => path(f));
        context.strokeStyle = ink;
        context.globalAlpha = 0.5;
        context.lineWidth = 1 * sf;
        context.stroke();
        context.globalAlpha = 1;

        context.fillStyle = dotColor;
        allDots.forEach((dot) => {
          const p = projection([dot.lng, dot.lat]);
          if (p && p[0] >= 0 && p[0] <= containerWidth && p[1] >= 0 && p[1] <= containerHeight) {
            context.beginPath();
            context.arc(p[0], p[1], 1.2 * sf, 0, 2 * Math.PI);
            context.fill();
          }
        });
      }
    };

    const rotation: [number, number] = [0, -12];
    projection.rotate(rotation);

    // Paint the sphere + graticule immediately so the globe is visible on the
    // first frame — never a blank canvas that pops in only after the async land
    // fetch resolves (the glitch on the /contact opener). Land dots fill in when
    // loadWorldData() finishes and calls render() again.
    render();

    const loadWorldData = async () => {
      try {
        const res = await fetch(
          "https://raw.githubusercontent.com/martynafford/natural-earth-geojson/refs/heads/master/110m/physical/ne_110m_land.json",
        );
        if (!res.ok) throw new Error("land data");
        landFeatures = await res.json();
        landFeatures.features.forEach((f: any) => {
          generateDotsInPolygon(f, 16).forEach(([lng, lat]) => allDots.push({ lng, lat }));
        });
        render();
      } catch {
        setError("Failed to load globe data");
      }
    };

    // auto-rotate (paused when off-screen / reduced-motion); drag to spin
    let autoRotate = !reduced;
    let onScreen = true;
    const speed = 0.32;
    const rotationTimer = d3.timer(() => {
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
