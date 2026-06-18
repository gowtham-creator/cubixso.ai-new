"use client";

// InfoBand — chapter 02 "WHO WE ARE". The concrete-facts band the homepage
// was missing (user: "information about cubixso is missing"): three glass
// columns that answer Who / What / How in plain terms, with the hard numbers
// inline. Dense, factual, zero slogan-fat — mobbin-grade information design
// over the void.

import { Reveal } from "@/components/scroll/Reveal";
import { LiquidGlass } from "@/components/glass/LiquidGlass";
import { ChapterLabel } from "@/components/shared/ChapterLabel";
import { Icon3D } from "@/components/icons/Icon3D";
import { Ph } from "@/components/icons/Ph";

// Each card wears a distinct LUXURY accent drawn from the site's own Aurora
// Glass v3 palette (globals.css) — cobalt, powder-ice, champagne — so the trio
// reads premium and varied while staying on-brand over the void. `accent` tints
// the divider / checks / icon halo; `rgb` drives the glass wash + soft glow.
const COLUMNS = [
  {
    title: "Who we are",
    icon: "cube" as const,
    accent: "#5B86FF", // cobalt
    rgb: "27,79,255",
    lead: "An applied-AI studio headquartered at T-HUB Hyderabad, operating across India and the UAE.",
    facts: [
      "Startup India recognised",
      "One accountable senior team",
      "HQ 17.385°N · 78.486°E",
    ],
  },
  {
    title: "What we ship",
    icon: "computer" as const,
    accent: "#AFD2FA", // powder ice
    rgb: "120,170,235",
    lead: "Agentic systems, retrieval (RAG/CAG) platforms, and LLM operations — engineered into production, not demos.",
    facts: [
      "6 standalone products",
      "6 industry sectors served",
      "95% model accuracy in prod",
    ],
  },
  {
    title: "How we work",
    icon: "rocket" as const,
    accent: "#D8A86A", // champagne (pale-brown luxury cameo)
    rgb: "185,145,94",
    lead: "End-to-end ownership: first whiteboard to production telemetry, with outcomes in the contract.",
    facts: [
      "First deployment in ~6 weeks",
      "92% on-time delivery",
      "Operate + improve post-launch",
    ],
  },
];

export function InfoBand() {
  return (
    <section
      id="who"
      aria-label="Who is Cubixso"
      className="relative z-10 px-[var(--pad-x)] py-[clamp(48px,7vh,96px)]"
    >
      <div className="mx-auto w-full max-w-[var(--col-w)]">
        <Reveal>
          <ChapterLabel num="02" word="WHO WE ARE" />
        </Reveal>

        <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-3">
          {COLUMNS.map((c, i) => (
            <Reveal key={c.title} delay={i * 0.08}>
              <LiquidGlass
                tier="panel"
                radius={20}
                className="relative h-full overflow-hidden p-7"
                style={{
                  boxShadow: `inset 0 0 0 1px rgba(${c.rgb},0.16), 0 24px 70px -34px rgba(${c.rgb},0.55)`,
                }}
              >
                {/* luxury accent wash — a soft corner glow of the card's jewel
                    tone, plus a thin top sheen line. Decorative, behind content. */}
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0"
                  style={{
                    background: `radial-gradient(130% 90% at 0% 0%, rgba(${c.rgb},0.18), transparent 58%)`,
                  }}
                />
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-x-0 top-0 h-px"
                  style={{ background: `linear-gradient(90deg, transparent, rgba(${c.rgb},0.7), transparent)` }}
                />
                <div className="relative flex h-full flex-col gap-5">
                  <div className="flex items-start justify-between gap-4">
                    <h3 className="font-display text-[clamp(19px,1.6vw,24px)] font-medium tracking-tight text-(--color-fg)">
                      {c.title}
                    </h3>
                    {/* icon with a tinted halo matching the card's accent */}
                    <div className="relative shrink-0">
                      <div
                        aria-hidden
                        className="absolute inset-0 -m-2 rounded-full blur-xl"
                        style={{ background: `rgba(${c.rgb},0.4)` }}
                      />
                      <Icon3D name={c.icon} size={44} float glow />
                    </div>
                  </div>
                  <p className="text-[14.5px] leading-relaxed text-(--color-fg-2)">
                    {c.lead}
                  </p>
                  <ul
                    className="mt-auto flex flex-col gap-2.5 border-t pt-4"
                    style={{ borderColor: `rgba(${c.rgb},0.22)` }}
                  >
                    {c.facts.map((f) => (
                      <li
                        key={f}
                        className="flex items-center gap-2.5 mono text-[10.5px] tracking-[0.08em] text-(--color-fg-2)"
                      >
                        <span className="inline-flex shrink-0" style={{ color: c.accent }}>
                          <Ph name="check" weight="bold" size={11} />
                        </span>
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              </LiquidGlass>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
