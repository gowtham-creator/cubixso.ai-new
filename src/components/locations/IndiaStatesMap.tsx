"use client";

// IndiaStatesMap — d3-geo + <canvas> map of India. Mirrors the proven pattern in
// wireframe-dotted-globe.tsx: theme-aware via useTheme(), paints the outline
// IMMEDIATELY on first frame (no blank pop-in), PAUSES its glow pulse off-screen
// and under prefers-reduced-motion. All states render as faint outlines; the
// `selected` state fills with cobalt (#1B4FFF dark / a deeper readable cobalt on
// light) plus a soft outer glow that breathes. GeoJSON is served from the repo
// (/geo/india-states.json) — no flaky runtime CDN — and framed with
// geoMercator().fitSize so India fills the box on any width.

import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { useTheme } from "@/components/providers/ThemeProvider";

interface IndiaStatesMapProps {
  /** st_nm of the state to highlight (must match the GeoJSON property) */
  selectedGeoName: string;
  className?: string;
}

export default function IndiaStatesMap({ selectedGeoName, className = "" }: IndiaStatesMapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const { resolved } = useTheme();
  const dark = resolved === "dark";

  // keep the latest selection in a ref so the rAF loop reads it without
  // re-running the whole effect (which would refetch + reframe) on every change.
  const selRef = useRef(selectedGeoName);
  selRef.current = selectedGeoName;

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // theme-aware palette
    const outline = dark ? "rgba(199,205,216,0.22)" : "rgba(24,35,80,0.18)"; // faint state borders
    const landFill = dark ? "rgba(199,205,216,0.05)" : "rgba(24,35,80,0.04)"; // barely-there land
    const fillColor = dark ? "#1B4FFF" : "#1437B8"; // selected — deeper cobalt on light for contrast
    const glowColor = dark ? "rgba(74,123,255,0.55)" : "rgba(27,79,255,0.4)";

    // size to the wrapper box; India is wider-than-tall so reserve a 4:3-ish box
    const wrapW = wrapRef.current?.clientWidth || 600;
    const wrapH = wrapRef.current?.clientHeight || 520;
    const w = wrapW;
    const h = wrapH;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    context.scale(dpr, dpr);

    const projection = d3.geoMercator();
    const path = d3.geoPath().projection(projection).context(context);

    let fc: d3.ExtendedFeatureCollection | null = null;
    let selectedFeature: d3.ExtendedFeature | null = null;

    const findSelected = () =>
      fc?.features.find((f) => f.properties?.st_nm === selRef.current) ?? null;

    // glow breathes 0..1 (paused off-screen / reduced-motion)
    let pulse = 0;
    let onScreen = true;

    const render = () => {
      context.clearRect(0, 0, w, h);

      if (!fc) {
        // first-frame placeholder: a faint frame so the box is never blank while
        // the async fetch resolves.
        return;
      }

      // all states — faint land fill + thin outline
      context.beginPath();
      fc.features.forEach((f) => path(f));
      context.fillStyle = landFill;
      context.fill();
      context.lineWidth = 0.7;
      context.strokeStyle = outline;
      context.stroke();

      // selected state — cobalt fill + breathing outer glow
      if (selectedFeature) {
        const glowAmt = reduced ? 0.5 : 0.35 + 0.45 * pulse;
        context.save();
        context.beginPath();
        path(selectedFeature);
        context.shadowColor = glowColor;
        context.shadowBlur = 18 + 14 * (reduced ? 0.5 : pulse);
        context.globalAlpha = 0.9;
        context.fillStyle = fillColor;
        context.fill();
        context.restore();

        // crisp rim on top (no shadow) so the edge stays sharp
        context.beginPath();
        path(selectedFeature);
        context.lineWidth = 1.4;
        context.strokeStyle = dark ? "#4A7BFF" : "#1B4FFF";
        context.globalAlpha = glowAmt;
        context.stroke();
        context.globalAlpha = 1;
      }
    };

    // paint immediately (empty frame) so layout is stable, then load + reframe.
    render();

    const reframe = () => {
      if (!fc) return;
      // pad so glow isn't clipped at the box edge
      projection.fitExtent(
        [
          [14, 14],
          [w - 14, h - 14],
        ],
        fc,
      );
    };

    const load = async () => {
      try {
        const res = await fetch("/geo/india-states.json");
        if (!res.ok) throw new Error("geo");
        fc = (await res.json()) as d3.ExtendedFeatureCollection;
        reframe();
        selectedFeature = findSelected();
        render();
      } catch {
        setError("Failed to load map");
      }
    };

    // animation: breathe the glow; also re-resolve the selected feature each tick
    // so prop changes (state switch) reflect without re-running the effect.
    const timer = d3.timer((elapsed) => {
      if (!fc) return;
      const next = findSelected();
      const changed = next !== selectedFeature;
      selectedFeature = next;
      if (!onScreen) return;
      if (reduced) {
        if (changed) render();
        return;
      }
      // 0..1 sine pulse, ~2.4s period
      pulse = (Math.sin(elapsed / 380) + 1) / 2;
      render();
    });

    const io =
      wrapRef.current && typeof IntersectionObserver !== "undefined"
        ? new IntersectionObserver(([e]) => {
            onScreen = e.isIntersecting;
          }, { threshold: 0.05 })
        : null;
    if (io && wrapRef.current) io.observe(wrapRef.current);

    load();

    return () => {
      timer.stop();
      io?.disconnect();
    };
  }, [dark]);

  if (error) {
    return (
      <div ref={wrapRef} className={`flex items-center justify-center ${className}`}>
        <p className="text-(--color-muted) text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div ref={wrapRef} className={`relative h-full w-full ${className}`}>
      <canvas ref={canvasRef} className="absolute inset-0" />
      <div className="pointer-events-none absolute bottom-2 left-2 mono text-[10px] tracking-[0.18em] text-(--color-muted)">
        INDIA // PARTNER REACH
      </div>
    </div>
  );
}
