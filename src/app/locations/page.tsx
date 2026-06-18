"use client";

// Locations — partner-reach across India. The visitor selects ONE state at a
// time from the five where Cubixso.ai operates; the choice highlights that state
// on a d3-geo canvas map (cobalt glow) and swaps in its partner-reach copy.
// Client component because selection is interactive — so no `metadata` export
// here (handled at the layout/route level).

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PageHeader } from "@/components/shared/PageHeader";
import { LiquidGlass } from "@/components/glass/LiquidGlass";
import { FinalCTA } from "@/components/sections/FinalCTA";
import { Ph } from "@/components/icons/Ph";
import IndiaStatesMap from "@/components/locations/IndiaStatesMap";
import { STATES, DEFAULT_STATE_ID } from "@/lib/states";

export default function LocationsPage() {
  const [activeId, setActiveId] = useState(DEFAULT_STATE_ID);
  const active = STATES.find((s) => s.id === activeId) ?? STATES[0];

  return (
    <main>
      <PageHeader
        num="01"
        eyebrow="LOCATIONS"
        title={
          <>
            One country.{" "}
            <em
              className="font-serif not-italic italic text-aurora"
              style={{ letterSpacing: "-0.02em", fontWeight: 400 }}
            >
              Five
            </em>{" "}
            states of reach.
          </>
        }
        intro="Cubixso.ai is built in Hyderabad and runs through a partner network across South and West India. Select a state to see where our partners and clients operate."
      />

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

      <FinalCTA />
    </main>
  );
}
