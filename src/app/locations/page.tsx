"use client";

// Locations — partner-reach across India. The visitor selects ONE state at a
// time from the five where Cubixso.ai operates; the choice highlights that state
// on a d3-geo canvas map (cobalt glow) and swaps in its partner-reach copy.
// Client component because selection is interactive — so no `metadata` export
// here (handled at the layout/route level).

import { useState } from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import { PageHeader } from "@/components/shared/PageHeader";
import { LiquidGlass } from "@/components/glass/LiquidGlass";
import { FinalCTA } from "@/components/sections/FinalCTA";
import { Ph } from "@/components/icons/Ph";
import IndiaStatesMap from "@/components/locations/IndiaStatesMap";
import { STATES, DEFAULT_STATE_ID } from "@/lib/states";
import { OFFICES, DEFAULT_OFFICE_ID, OFFICE_COUNTRIES } from "@/lib/offices";

// Heavy WebGL map — code-split + client-only (mirrors how PresenceMap is loaded).
const OfficeMap = dynamic(
  () => import("@/components/locations/OfficeMap").then((m) => m.OfficeMap),
  {
    ssr: false,
    loading: () => (
      <div className="h-full w-full animate-pulse rounded-2xl bg-(--color-surface)" />
    ),
  },
);

export default function LocationsPage() {
  const [activeId, setActiveId] = useState(DEFAULT_STATE_ID);
  const active = STATES.find((s) => s.id === activeId) ?? STATES[0];

  const [activeOfficeId, setActiveOfficeId] = useState(DEFAULT_OFFICE_ID);
  const activeOffice =
    OFFICES.find((o) => o.id === activeOfficeId) ?? OFFICES[0];

  return (
    <main>
      <PageHeader
        num="01"
        eyebrow="LOCATIONS"
        title={
          <>
            From Hyderabad,{" "}
            <em
              className="font-serif not-italic italic text-aurora"
              style={{ letterSpacing: "-0.02em", fontWeight: 400 }}
            >
              global
            </em>{" "}
            reach.
          </>
        }
        intro="Cubixso.ai is built in Hyderabad — T-Hub and WeWork — with a partner network across South and West India, an office in Dubai, and the United States next. Explore the partner network by state, then our physical offices on the world map."
      />

      {/* Incubated at — the hosts of our Hyderabad HQ, as credibility chips */}
      <section className="relative z-10 bg-(--color-bg) px-[var(--pad-x)] pb-[clamp(24px,4vh,48px)]">
        <div className="mx-auto w-full max-w-[var(--col-w)]">
          <div className="flex flex-col items-start gap-5 border-t border-(--color-line) pt-7 sm:flex-row sm:items-center sm:gap-8">
            <span className="mono shrink-0 text-[10px] tracking-[0.2em] text-(--color-muted)">
              INCUBATED&nbsp;AT
            </span>
            <div className="flex flex-wrap items-center gap-4">
              {[
                { src: "/partners/t-hub.png", alt: "T-Hub", h: "max-h-9" },
                { src: "/partners/wework-labs.png", alt: "WeWork Labs", h: "max-h-5" },
              ].map((l) => (
                <span
                  key={l.alt}
                  // Solid white, not white/90: the logos carry dark ink, so they
                  // need a real plate to read against the dark canvas. At 90%
                  // the page bled through and the plate looked muddy grey —
                  // which, next to the logos' own baked-in white boxes (now
                  // keyed out to alpha), read as two mismatched backgrounds.
                  className="flex h-14 items-center justify-center rounded-xl border border-(--color-line) bg-white px-6 [html[data-theme=dark]_&]:border-white/10"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={l.src}
                    alt={l.alt}
                    loading="lazy"
                    decoding="async"
                    className={`${l.h} w-auto object-contain`}
                  />
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="relative z-10 bg-(--color-bg) px-[var(--pad-x)] pb-[clamp(80px,12vh,160px)]">
        <div className="mx-auto w-full max-w-[var(--col-w)]">
          <div className="mb-3 flex items-center justify-between">
            <span className="mono text-[10px] tracking-[0.2em] text-(--color-muted)">
              PRESENCE//INDIA
            </span>
            <span className="mono text-[10px] tracking-[0.2em] text-(--color-muted)">
              SELECT A STATE ↓
            </span>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[0.85fr_1.15fr] lg:gap-8">
            {/* LEFT — selector + active-state copy */}
            <div className="flex flex-col gap-6">
              {/* state pill selector */}
              <div
                role="radiogroup"
                aria-label="Select an Indian state"
                className="flex flex-wrap gap-2"
              >
                {STATES.map((s) => {
                  const on = s.id === activeId;
                  return (
                    <button
                      key={s.id}
                      role="radio"
                      aria-checked={on}
                      onClick={() => setActiveId(s.id)}
                      className={`mono text-[11px] tracking-[0.12em] rounded-full border px-4 py-2 transition-all duration-300 ${
                        on
                          ? "border-(--color-accent) bg-(--color-accent)/12 text-(--color-fg)"
                          : "border-(--color-line) text-(--color-fg-2) hover:border-(--color-line-2) hover:text-(--color-fg)"
                      }`}
                    >
                      <span
                        className={`mr-2 inline-block h-1.5 w-1.5 rounded-full align-middle ${
                          on ? "bg-(--color-accent-2)" : "bg-(--color-line-2)"
                        }`}
                        aria-hidden
                      />
                      {s.name}
                    </button>
                  );
                })}
              </div>

              {/* active-state partner-reach card */}
              <LiquidGlass tier="panel" radius={24} className="block p-6 sm:p-8">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={active.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <span className="mono text-[10px] tracking-[0.2em] text-(--color-accent-2)">
                      {active.reach}
                    </span>

                    <h2 className="mt-4 flex items-center gap-2.5 font-serif italic text-[clamp(30px,4vw,52px)] leading-none text-(--color-fg)">
                      <Ph
                        name="map-pin"
                        size={24}
                        weight="light"
                        className="shrink-0 text-(--color-accent-2)"
                      />
                      {active.name}
                    </h2>

                    <p className="mt-2 mono text-[11px] tracking-[0.08em] text-(--color-fg-2)">
                      {active.tagline}
                    </p>

                    <p className="mt-6 max-w-prose text-[15px] leading-relaxed text-(--color-fg-2)">
                      {active.blurb}
                    </p>

                    <div className="mt-7 border-t border-(--color-line) pt-5">
                      <span className="mono text-[10px] tracking-[0.2em] text-(--color-muted)">
                        KEY CITIES
                      </span>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {active.cities.map((c) => (
                          <span
                            key={c}
                            className="mono text-[11px] tracking-[0.06em] rounded-full border border-(--color-line) px-3 py-1.5 text-(--color-fg)"
                          >
                            {c}
                          </span>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </LiquidGlass>
            </div>

            {/* RIGHT — the India map */}
            <LiquidGlass tier="panel" radius={24} className="block p-2 sm:p-3">
              <div className="h-[clamp(380px,58vh,640px)] w-full">
                <IndiaStatesMap selectedGeoName={active.geoName} />
              </div>
            </LiquidGlass>
          </div>
        </div>
      </section>

      {/* ── GLOBAL OFFICES — physical sites on a fly-to mapcn point map ───── */}
      <section className="relative z-10 bg-(--color-bg) px-[var(--pad-x)] pb-[clamp(80px,12vh,160px)]">
        <div className="mx-auto w-full max-w-[var(--col-w)]">
          <div className="mb-3 flex items-center justify-between">
            <span className="mono text-[10px] tracking-[0.2em] text-(--color-muted)">
              PRESENCE//GLOBAL
            </span>
            <span className="mono text-[10px] tracking-[0.2em] text-(--color-muted)">
              SELECT AN OFFICE ↓
            </span>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[0.85fr_1.15fr] lg:gap-8">
            {/* LEFT — office selector grouped by country + active-office card */}
            <div className="flex flex-col gap-6">
              <div
                role="radiogroup"
                aria-label="Select an office"
                className="flex flex-col gap-4"
              >
                {OFFICE_COUNTRIES.map((country) => {
                  const list = OFFICES.filter((o) => o.country === country);
                  if (list.length === 0) return null;
                  return (
                    <div key={country}>
                      <p className="mono mb-2 text-[10px] tracking-[0.2em] text-(--color-muted)">
                        {country}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {list.map((o) => {
                          const on = o.id === activeOfficeId;
                          return (
                            <button
                              key={o.id}
                              role="radio"
                              aria-checked={on}
                              onClick={() => setActiveOfficeId(o.id)}
                              className={`mono text-[11px] tracking-[0.12em] rounded-full border px-4 py-2 transition-all duration-300 ${
                                on
                                  ? "border-(--color-accent) bg-(--color-accent)/12 text-(--color-fg)"
                                  : "border-(--color-line) text-(--color-fg-2) hover:border-(--color-line-2) hover:text-(--color-fg)"
                              }`}
                            >
                              <span
                                className={`mr-2 inline-block h-1.5 w-1.5 rounded-full align-middle ${
                                  o.status === "soon"
                                    ? "bg-(--color-accent-2)"
                                    : on
                                      ? "bg-(--color-signal)"
                                      : "bg-(--color-line-2)"
                                }`}
                                aria-hidden
                              />
                              {o.name}
                              {o.status === "soon" ? " · soon" : ""}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

              <LiquidGlass tier="panel" radius={24} className="block p-6 sm:p-8">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeOffice.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <span className="mono text-[10px] tracking-[0.2em] text-(--color-accent-2)">
                      {activeOffice.type}
                      {activeOffice.status === "soon" ? " · coming soon" : ""}
                    </span>

                    <h2 className="mt-4 flex items-center gap-2.5 font-serif italic text-[clamp(30px,4vw,52px)] leading-none text-(--color-fg)">
                      <Ph
                        name="map-pin"
                        size={24}
                        weight="light"
                        className="shrink-0 text-(--color-accent-2)"
                      />
                      {activeOffice.name}
                    </h2>

                    <p className="mt-2 mono text-[11px] tracking-[0.08em] text-(--color-fg-2)">
                      {activeOffice.city}, {activeOffice.country}
                    </p>

                    <p className="mt-6 max-w-prose text-[15px] leading-relaxed text-(--color-fg-2)">
                      {activeOffice.blurb}
                    </p>

                    <div className="mt-7 border-t border-(--color-line) pt-5">
                      <span className="mono text-[10px] tracking-[0.2em] text-(--color-muted)">
                        ADDRESS
                      </span>
                      <p className="mt-3 max-w-prose text-[13.5px] leading-relaxed text-(--color-fg)">
                        {activeOffice.address}
                      </p>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </LiquidGlass>
            </div>

            {/* RIGHT — the global fly-to office map (mapcn / MapLibre) */}
            <LiquidGlass tier="panel" radius={24} className="block p-2 sm:p-3">
              <div className="h-[clamp(380px,58vh,640px)] w-full">
                <OfficeMap offices={OFFICES} activeId={activeOfficeId} />
              </div>
            </LiquidGlass>
          </div>
        </div>
      </section>

      <FinalCTA />
    </main>
  );
}
