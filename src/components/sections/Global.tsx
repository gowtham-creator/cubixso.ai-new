"use client";

// Global — chapter 10 REACH. "CUBE BECOMES WORLD" wow-moment.
//
// The void/cube-globe behind blooms THROUGH this section: no opaque fill, just
// glass slabs ringed by a void gutter. An interactive 3D globe sits inside a
// Tier-2 DEPTH-GLASS pane — it spins on its own, can be dragged and zoomed, and
// tags each hub (Hyderabad / Dubai / New York). The roster below reads as glass
// rows; "New York · Coming soon" pulses softly. Aurora Glass v3: "one stack"
// carries the section's single aurora-gradient text moment.
//
// This section used to run a desktop ScrollTrigger PIN (~1 viewport of scrub)
// that cinched the headline and pulsed city nodes under a magnify lens. It is
// gone for two reasons:
//   • A pin reserves its scroll distance as pin-spacing, and the content crawl
//     inside it lifted the column by the viewport overflow. Together they left
//     roughly a full empty viewport under the roster before FinalCTA — the gap.
//   • The lens and the node pulses were positioned in flat-map percentages for
//     the old MapLibre map. On a rotating 3D globe a screen position no longer
//     corresponds to a city, so they could only ever point at the wrong place.

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ChapterLabel } from "@/components/shared/ChapterLabel";
import { LiquidGlass } from "@/components/glass/LiquidGlass";
import { Reveal } from "@/components/scroll/Reveal";
import { useDepthParallax } from "@/components/scroll/useDepthParallax";
import { PRESENCE } from "@/lib/data";
import type { GlobeMarker, Globe3DConfig } from "@/components/ui/3d-globe";

const GLOBE_FRAME =
  "relative w-full h-[clamp(360px,52vh,620px)] overflow-hidden rounded-2xl border border-(--color-line) bg-(--color-bg)";

// The same three hubs, at the same coordinates, as the MapLibre map this replaces.
const HUB_LL: Record<string, { lat: number; lng: number }> = {
  Hyderabad: { lat: 17.385, lng: 78.486 },
  Dubai: { lat: 25.276, lng: 55.296 },
  "New York": { lat: 40.712, lng: -74.005 },
};

const GLOBE_MARKERS: GlobeMarker[] = PRESENCE.flatMap((p) => {
  const ll = HUB_LL[p.city];
  if (!ll) return [];
  return [{ ...ll, label: p.status === "soon" ? `${p.city} · Soon` : p.city }];
});

// Module-level so its identity is stable: Globe3D memoises its merged config on
// this reference, and an inline literal would re-merge on every render.
const GLOBE_CONFIG: Globe3DConfig = {
  showAtmosphere: true,
  atmosphereColor: "#4A7BFF", // brand cobalt-glow, not Aceternity's sky blue
  atmosphereIntensity: 20,
  bumpScale: 5,
  autoRotateSpeed: 0.4,
  enableZoom: true,
  // The camera starts at radius x 3.5 = 7 and the pins stand to radius x 1.18.
  // 3.6 is as close as it can come before sliding in among the pins; 9 caps the
  // zoom-out so the globe can never shrink to a small ball lost in the frame.
  minDistance: 3.6,
  maxDistance: 9,
  // Open facing longitude ~67°E (between Dubai and Hyderabad) instead of the
  // component's default −90° (the Americas), tilted ~17° so the northern-
  // hemisphere hubs sit near the centre. Rotation for longitude L is −90° − L.
  initialRotation: { x: 0.3, y: ((-90 - 67) * Math.PI) / 180 },
};

// Client + WebGL only — load lazily, never on the server. The placeholder has
// the globe's exact footprint so nothing shifts when it swaps in.
const Globe3D = dynamic(
  () => import("@/components/ui/3d-globe").then((m) => m.Globe3D),
  { ssr: false, loading: () => <div className={GLOBE_FRAME} aria-hidden /> },
);

export function Global() {

  // Back plane (glass veils / map) drifts slowly; foreground type leads.
  const mapPlane = useDepthParallax(1);

  const paneRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const mapPlaneRef = useRef<HTMLDivElement>(null); // free-parallax wrapper
  const [mapNear, setMapNear] = useState(false);

  // Hold the map's WebGL context only while it is near the screen. This used to
  // latch on (disconnect after the first intersection), so once you had scrolled
  // past the map its context stayed alive for the rest of the session — the
  // third simultaneous context on the page. iOS Safari evicts the oldest context
  // when it runs out, which is what left the hero cube frozen on its last frame.
  // Releasing it on the way out keeps the page to one live context at a time.
  useEffect(() => {
    const el = paneRef.current;
    if (!el || typeof IntersectionObserver === "undefined") { setMapNear(true); return; }
    const io = new IntersectionObserver(([e]) => setMapNear(e.isIntersecting),
      { rootMargin: "100% 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="reach"
      className="relative z-10 px-[var(--pad-x)] py-[clamp(64px,9vh,120px)]"
    >
      <div className="mx-auto w-full max-w-[var(--col-w)]">
        <ChapterLabel num="10" word="REACH" />

        <Reveal direction="up">
          <h2
            className="font-display text-[length:var(--text-display-lg)] leading-[0.95] tracking-[-0.04em] text-balance text-(--color-fg) max-w-4xl"
          >
            Two cities,
            <br />
            {/* The ONE aurora-gradient text element allowed in this section —
                the gradient lives INSIDE the glyphs, glass stays neutral. */}
            <span className="text-(--color-accent-2)">
              one{" "}
              <em
                className="font-serif not-italic italic"
                style={{ letterSpacing: "-0.02em", fontWeight: 400 }}
              >
                stack
              </em>
            </span>
            .
          </h2>
        </Reveal>

        <Reveal direction="up" delay={0.12}>
          <p className="mt-8 max-w-prose text-[clamp(15px,1.15vw,17px)] leading-relaxed text-(--color-fg-2)">
            HQ at T-Hub Hyderabad. India and UAE today, US office soon.
          </p>
        </Reveal>

        {/* DEPTH-GLASS PANE — the globe floats inside a Tier-2 focal panel with
            a 12–24px void gutter so the cube-globe light lives behind the glass.
            A Tier-3 lens layer magnifies + brightens the hovered city node. */}
        <Reveal direction="up" delay={0.18}>
          <motion.div
            ref={mapPlaneRef}
            className="mt-14 p-3 sm:p-4"
            style={{ transform: mapPlane }}
          >
            <LiquidGlass
              tier="panel"
              focal
              radius={22}
              className="relative block overflow-hidden p-2 sm:p-3"
            >
              <div ref={paneRef} className="relative">
                {/* The globe holds its own WebGL context, so it mounts only
                    while the pane is near the screen: on iOS a third live
                    context evicts the oldest one, which is what once froze the
                    hero cube on its last frame. Textures are preloaded as soon
                    as the component module loads, so by the time this mounts
                    they are normally already decoded. */}
                {mapNear ? (
                  <Globe3D
                    markers={GLOBE_MARKERS}
                    config={GLOBE_CONFIG}
                    className={GLOBE_FRAME}
                  />
                ) : (
                  <div className={GLOBE_FRAME} aria-hidden />
                )}
              </div>
            </LiquidGlass>
          </motion.div>
        </Reveal>

        {/* PRESENCE ROSTER — glass rows. */}
        <ul className="mt-20 flex flex-col gap-3">
          {PRESENCE.map((p, i) => {
            const soon = p.status === "soon";
            return (
              <Reveal
                key={p.city}
                as="li"
                direction="up"
                delay={0.04 * i}
              >
                <LiquidGlass
                  tier="panel"
                  rimLight
                  radius={16}
                  className="group block"
                  style={{ cursor: "default" }}
                >
                  <div
                    className="grid grid-cols-[auto_1fr_auto] md:grid-cols-[auto_1fr_auto_auto] items-baseline gap-x-4 md:gap-x-8 gap-y-1 px-5 py-6 md:px-7 md:py-7 outline-none"
                  >
                    <span className="mono text-[10px] md:text-[11px] text-(--color-muted)">
                      0{i + 1}
                    </span>
                    <span
                      className={`font-serif italic text-[clamp(26px,3.4vw,46px)] leading-none tracking-tight transition-transform group-hover:translate-x-1 ${
                        soon ? "text-(--color-fg-2)" : "text-(--color-fg)"
                      }`}
                    >
                      {p.city}
                    </span>
                    <span className="mono text-[10px] md:text-[11px] text-(--color-fg-2)">
                      {p.country}
                    </span>
                    <span className="hidden md:inline mono text-(--color-muted)">
                      {p.coords}
                    </span>
                    <span
                      className={`col-start-2 col-span-2 md:col-span-3 mono text-[10px] md:text-[11px] inline-flex items-center gap-2 ${
                        soon ? "text-(--color-accent-2)" : "text-(--color-muted)"
                      }`}
                    >
                      {soon && (
                        <span
                          className="inline-block h-1.5 w-1.5 rounded-full bg-(--color-accent-2) animate-pulse motion-reduce:animate-none"
                          aria-hidden
                        />
                      )}
                      {p.role}
                    </span>
                  </div>
                </LiquidGlass>
              </Reveal>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
