"use client";

// Global — chapter 10 REACH. "CUBE BECOMES WORLD" wow-moment.
//
// The void/cube-globe behind blooms THROUGH this section: no opaque fill, just
// glass slabs ringed by a void gutter. The PresenceMap floats inside a Tier-2
// DEPTH-GLASS pane whose Tier-3 lens MAGNIFIES + BRIGHTENS the city node behind
// it as you hover (the map glow visibly bends through the glass). The presence
// roster (Hyderabad / Dubai / New York) reads as glass rows that, when hovered,
// drive the lens focal point over their node so the globe behind responds. The
// headline Reveals; the map's cobalt glow is coordinated with the globe behind.
// "New York · Coming soon" pulses softly. No GSAP pin — the pinned feel comes
// from the glass + Reveal + scroll-linked depth parallax + the cube morphing.

import dynamic from "next/dynamic";
import { useMemo, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ChapterLabel } from "@/components/shared/ChapterLabel";
import { LiquidGlass } from "@/components/glass/LiquidGlass";
import { GlassLensFilter, lensFilterUrl } from "@/components/glass/GlassLensFilter";
import { Reveal } from "@/components/scroll/Reveal";
import { useDepthParallax } from "@/components/scroll/useDepthParallax";
import { PRESENCE } from "@/lib/data";

// Approximate on-pane focal positions (% of the map frame) for each hub, so a
// hovered roster row can magnify the matching node behind the depth-glass lens.
// center=[66.9,21.3] zoom≈1.9 globe — values tuned to read as "over the node".
const NODE_FOCUS: Record<string, { x: number; y: number }> = {
  Hyderabad: { x: 64, y: 56 },
  Dubai: { x: 38, y: 44 },
  "New York": { x: 14, y: 40 },
};

const LENS_ID = "reach-presence-lens";

// The globe is client + WebGL only — load it lazily, never on the server.
const PresenceMap = dynamic(
  () => import("@/components/scene/PresenceMap").then((m) => m.PresenceMap),
  {
    ssr: false,
    loading: () => (
      <div
        className="h-[clamp(360px,52vh,620px)] w-full rounded-2xl border border-(--color-line)"
        aria-hidden
      />
    ),
  },
);

export function Global() {
  const reduced = useReducedMotion();

  // Back plane (glass veils / map) drifts slowly; foreground type leads.
  const mapPlane = useDepthParallax(1);

  // Which hub is being magnified behind the depth-glass lens (null = idle).
  const [focusCity, setFocusCity] = useState<string | null>(null);
  // Pause the costly displacement map when the lens scrolls off-screen.
  const [lensInView, setLensInView] = useState(false);
  const paneRef = useRef<HTMLDivElement>(null);

  const focus = focusCity ? NODE_FOCUS[focusCity] : null;
  const lensActive = !!focus && !reduced;

  // Coordinate the map's cobalt glow with the globe behind: a single radial
  // cobalt bloom keyed to the focal node, brightening the magnified hub.
  const lensVars = useMemo(
    () => ({
      "--lx": `${focus?.x ?? 50}%`,
      "--ly": `${focus?.y ?? 44}%`,
    }) as React.CSSProperties & Record<`--${string}`, string>,
    [focus],
  );

  return (
    <section
      id="reach"
      className="relative z-10 px-[var(--pad-x)] py-[clamp(96px,14vh,180px)]"
    >
      {/* Tier-3 refractive lens defs — paused when the pane is off-screen so
          the displacement map costs nothing. Reduced-motion freezes it too. */}
      <GlassLensFilter
        id={LENS_ID}
        scale={20}
        baseFrequency={0.011}
        paused={!lensInView || !!reduced}
        animate={!reduced}
      />

      <div className="mx-auto w-full max-w-[var(--col-w)]">
        <ChapterLabel num="10" word="REACH" />

        <Reveal direction="up">
          <h2 className="font-display text-[length:var(--text-display-lg)] leading-[0.95] tracking-[-0.04em] text-balance text-(--color-fg) max-w-4xl">
            Two cities,
            <br />
            one{" "}
            <em
              className="font-serif not-italic italic"
              style={{ letterSpacing: "-0.02em", fontWeight: 400 }}
            >
              stack
            </em>
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
            className="mt-14 p-3 sm:p-4"
            style={{ transform: mapPlane }}
          >
            <LiquidGlass
              tier="panel"
              focal
              radius={22}
              className="relative block overflow-hidden p-2 sm:p-3"
            >
              <div ref={paneRef} className="relative" style={lensVars}>
                {/* The live globe. Its cobalt arc + glowing markers are the
                    "world" the spine cube blooms into behind this glass. */}
                <PresenceMap />

                {/* MAGNIFY LENS — a refractive disc that warps + enlarges the
                    map node beneath the focal point. filter:url(lens) bends the
                    backdrop; scale lifts the hub label/marker into a lens read.
                    Pointer-transparent so the globe stays interactive. */}
                <motion.span
                  aria-hidden
                  className="pointer-events-none absolute z-[2] rounded-full"
                  style={{
                    left: `var(--lx)`,
                    top: `var(--ly)`,
                    width: "clamp(120px,18vw,200px)",
                    height: "clamp(120px,18vw,200px)",
                    marginLeft: "calc(clamp(120px,18vw,200px) / -2)",
                    marginTop: "calc(clamp(120px,18vw,200px) / -2)",
                    filter: lensActive ? lensFilterUrl(LENS_ID) : undefined,
                    background:
                      "radial-gradient(circle at center, color-mix(in oklab, var(--color-accent-2) 22%, transparent), transparent 68%)",
                    boxShadow:
                      "inset 0 1px 0 rgba(255,255,255,.18), inset 0 0 0 1px color-mix(in oklab, var(--color-accent) 28%, transparent)",
                    backdropFilter: "saturate(150%) brightness(1.18)",
                    WebkitBackdropFilter: "saturate(150%) brightness(1.18)",
                  }}
                  initial={false}
                  animate={
                    reduced
                      ? { opacity: lensActive ? 1 : 0 }
                      : {
                          opacity: lensActive ? 1 : 0,
                          scale: lensActive ? 1 : 0.72,
                        }
                  }
                  transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                />

                {/* Lens IntersectionObserver host — invisible Tier-3 surface
                    only used to toggle the displacement map on/off-screen. */}
                <LiquidGlass
                  tier="lens"
                  sweep={false}
                  onViewChange={setLensInView}
                  className="pointer-events-none absolute inset-0 z-0 opacity-0"
                  aria-hidden
                />
              </div>
            </LiquidGlass>
          </motion.div>
        </Reveal>

        {/* PRESENCE ROSTER — glass rows. Hovering a row magnifies its node
            behind the depth-glass lens above (coordinated cobalt glow). */}
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
                    onPointerEnter={() => setFocusCity(p.city)}
                    onPointerLeave={() =>
                      setFocusCity((c) => (c === p.city ? null : c))
                    }
                    onFocus={() => setFocusCity(p.city)}
                    onBlur={() =>
                      setFocusCity((c) => (c === p.city ? null : c))
                    }
                    tabIndex={0}
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
