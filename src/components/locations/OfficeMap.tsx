"use client";

// OfficeMap — the GLOBAL offices map on /locations. A flat MapLibre point map
// built on the mapcn primitives in @/components/ui/map (the same component set
// the homepage PresenceMap uses) that FLIES to the selected office: each office
// in src/lib/offices.ts carries [lng,lat] + a zoom, and selecting one eases the
// camera there. The active site pings; "soon" sites read muted. Theme-aware
// (CARTO positron / dark-matter), no API key, WebGL client-only.

import { useEffect, useRef } from "react";
import "maplibre-gl/dist/maplibre-gl.css";
import {
  Map,
  MapMarker,
  MarkerContent,
  MarkerLabel,
  type MapRef,
} from "@/components/ui/map";
import { useTheme } from "@/components/providers/ThemeProvider";
import type { Office } from "@/lib/offices";

export function OfficeMap({
  offices,
  activeId,
}: {
  offices: Office[];
  activeId: string;
}) {
  const { resolved } = useTheme();
  const mapRef = useRef<MapRef | null>(null);
  const active = offices.find((o) => o.id === activeId) ?? offices[0];

  // Fly to the selected office. MapRef IS the raw MapLibre map, so flyTo is
  // native; it honours prefers-reduced-motion (jumps rather than pans).
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !active) return;
    map.flyTo({ center: active.coords, zoom: active.zoom, duration: 1500 });
  }, [active]);

  return (
    <div className="relative h-full w-full overflow-hidden rounded-2xl border border-(--color-line) bg-(--color-bg)">
      <Map
        ref={mapRef}
        theme={resolved}
        center={active?.coords ?? [78.3758, 17.4143]}
        zoom={active?.zoom ?? 12}
        className="absolute inset-0 h-full w-full"
      >
        {offices.map((o) => {
          const on = o.id === activeId;
          const soon = o.status === "soon";
          const dot = soon
            ? "bg-(--color-accent-2)"
            : on
              ? "bg-(--color-signal)"
              : "bg-(--color-accent)";
          return (
            <MapMarker key={o.id} longitude={o.coords[0]} latitude={o.coords[1]}>
              <MarkerContent>
                <span className="relative flex h-3 w-3 items-center justify-center">
                  {on && (
                    <span
                      className={`absolute inline-flex h-full w-full rounded-full opacity-60 animate-ping motion-reduce:animate-none ${dot}`}
                    />
                  )}
                  <span
                    className={`relative inline-flex rounded-full ring-2 ring-white/70 ${dot} ${
                      on ? "h-2.5 w-2.5" : "h-2 w-2 opacity-70"
                    }`}
                  />
                </span>
              </MarkerContent>
              <MarkerLabel
                position="top"
                className="rounded-md border border-(--color-line) bg-(--color-bg) px-1.5 py-0.5 mono uppercase tracking-[0.16em] text-[9px] text-(--color-fg) shadow-sm"
              >
                {o.name}
                {soon ? " · soon" : ""}
              </MarkerLabel>
            </MapMarker>
          );
        })}
      </Map>
    </div>
  );
}

export default OfficeMap;
