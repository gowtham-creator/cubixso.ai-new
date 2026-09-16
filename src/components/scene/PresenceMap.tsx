"use client";

// PresenceMap — the REACH-section globe. A dark, theme-aware 3D globe
// (mapcn + MapLibre GL · CARTO basemap · no API key) that turns the office
// roster into something spatial: glowing markers on the live hubs, a cobalt
// arc linking Hyderabad ↔ Dubai (the "one stack"), and a slow auto-rotation
// that brings the "coming soon" New York marker around the horizon.
//
// Client + WebGL only (loaded via next/dynamic ssr:false from Global). The
// spin pauses on hover/interaction, when scrolled off-screen, and entirely
// under prefers-reduced-motion.

import { useEffect, useMemo, useRef, useState } from "react";
import "maplibre-gl/dist/maplibre-gl.css";
import {
  Map,
  MapMarker,
  MarkerContent,
  MarkerLabel,
  MapArc,
  type MapRef,
  type MapArcDatum,
} from "@/components/ui/map";
import { useTheme } from "@/components/providers/ThemeProvider";
import { PRESENCE } from "@/lib/data";

// office → [longitude, latitude]
const CITY_LL: Record<string, [number, number]> = {
  Hyderabad: [78.486, 17.385],
  Dubai: [55.296, 25.276],
  "New York": [-74.005, 40.712],
};

// office → IANA zone for the REAL-TIME marker clocks
const CITY_TZ: Record<string, string> = {
  Hyderabad: "Asia/Kolkata",
  Dubai: "Asia/Dubai",
  "New York": "America/New_York",
};

// Ticking local time, "01:12" — re-renders once per minute (seconds shown in
// the pane's LIVE strip instead; per-marker second-ticks would thrash MapLibre).
function useLocalTime(timeZone: string, withSeconds = false) {
  const [now, setNow] = useState("");
  useEffect(() => {
    const fmt = new Intl.DateTimeFormat("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      ...(withSeconds ? { second: "2-digit" } : {}),
      hour12: false,
      timeZone,
    });
    const tick = () => setNow(fmt.format(new Date()));
    tick();
    const id = setInterval(tick, withSeconds ? 1000 : 15000);
    return () => clearInterval(id);
  }, [timeZone, withSeconds]);
  return now;
}

function CityClock({ city }: { city: string }) {
  const t = useLocalTime(CITY_TZ[city] ?? "UTC");
  return <span className="text-(--color-accent-2) tabular-nums"> · {t}</span>;
}

const ARC_COLOR = "#4d7cff"; // cobalt brand line (MapLibre needs a literal color)
const SPIN_DEG_PER_S = 3.4;

export function PresenceMap({
  heightClass = "h-[clamp(360px,52vh,620px)]",
}: { heightClass?: string } = {}) {
  const { resolved } = useTheme();
  const mapRef = useRef<MapRef | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const spinning = useRef(true);

  const arcs = useMemo<MapArcDatum[]>(() => {
    const live = PRESENCE.filter((p) => p.status === "active");
    const a = live[0] && CITY_LL[live[0].city];
    const b = live[1] && CITY_LL[live[1].city];
    return a && b ? [{ id: "hub-link", from: a, to: b }] : [];
  }, []);

  // Slow globe auto-rotation — geo-anchored, so the arc + markers ride along.
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const el = containerRef.current;
    let raf = 0;
    let visible = true;
    let last = 0;

    const io =
      el && typeof IntersectionObserver !== "undefined"
        ? new IntersectionObserver(([e]) => (visible = e.isIntersecting), {
            threshold: 0.05,
          })
        : null;
    if (io && el) io.observe(el);

    const tick = (t: number) => {
      raf = requestAnimationFrame(tick);
      const map = mapRef.current;
      const dt = last ? (t - last) / 1000 : 0;
      last = t;
      if (map && spinning.current && visible) {
        const c = map.getCenter();
        map.setCenter([c.lng + SPIN_DEG_PER_S * dt, c.lat]);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      io?.disconnect();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      onPointerEnter={() => {
        spinning.current = false;
      }}
      onPointerLeave={() => {
        spinning.current = true;
      }}
      className={`relative w-full ${heightClass} overflow-hidden rounded-2xl border border-(--color-line) bg-(--color-bg)`}
      style={{ boxShadow: "0 30px 80px rgba(0,0,0,0.28)" }}
    >
      <Map
        ref={mapRef}
        theme={resolved}
        projection={{ type: "globe" }}
        center={[66.9, 21.3]}
        zoom={1.9}
        className="absolute inset-0 h-full w-full"
      >
        {PRESENCE.map((p) => {
          const ll = CITY_LL[p.city];
          if (!ll) return null;
          const soon = p.status === "soon";
          const dot = soon ? "bg-(--color-accent-2)" : "bg-(--color-signal)";
          return (
            <MapMarker key={p.city} longitude={ll[0]} latitude={ll[1]}>
              <MarkerContent>
                <span className="relative flex h-3 w-3 items-center justify-center">
                  <span
                    // Explicit h-3/w-3 rather than h-full/w-full. The percentage
                    // form only stays small while the marker wrapper keeps its
                    // own 12px box; if the map library ever sizes that wrapper
                    // to the map pane, animate-ping scales the FULL PANE to 2x
                    // and paints a map-sized pulsing disc. Pinning the size
                    // removes that failure mode entirely.
                    className={`absolute inline-flex h-3 w-3 rounded-full opacity-60 animate-ping motion-reduce:animate-none ${dot}`}
                  />
                  <span
                    className={`relative inline-flex h-2 w-2 rounded-full ring-2 ring-white/70 ${dot}`}
                  />
                </span>
              </MarkerContent>
              <MarkerLabel
                position="top"
                className="rounded-md border border-(--color-line) bg-(--color-bg) px-1.5 py-0.5 mono uppercase tracking-[0.16em] text-[9px] text-(--color-fg) shadow-sm"
              >
                {p.city}
                {soon ? " · soon" : <CityClock city={p.city} />}
              </MarkerLabel>
            </MapMarker>
          );
        })}

        <MapArc
          data={arcs}
          curvature={0.4}
          paint={{ "line-color": ARC_COLOR, "line-width": 2, "line-opacity": 0.9 }}
        />
      </Map>

      {/* REAL-TIME strip — the pane wears its liveness on its sleeve. */}
      <LiveStrip />
    </div>
  );
}

// "● LIVE · UTC 19:42:08 · drag to explore" — seconds tick here (one cheap
// DOM node, outside MapLibre's render loop).
function LiveStrip() {
  const utc = useLocalTime("UTC", true);
  return (
    <div className="pointer-events-none absolute left-3 top-3 z-10 flex items-center gap-2 rounded-full border border-white/10 bg-black/45 px-3 py-1.5 mono text-[9px] uppercase tracking-[0.18em] text-white/75 backdrop-blur-md">
      <span className="relative flex h-1.5 w-1.5">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-(--color-crimson) opacity-75 motion-reduce:animate-none" />
        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-(--color-crimson)" />
      </span>
      <span>Live</span>
      <span className="text-white/35">·</span>
      <span className="tabular-nums">UTC {utc}</span>
      <span className="text-white/35">·</span>
      <span className="text-white/45">drag to explore</span>
    </div>
  );
}
