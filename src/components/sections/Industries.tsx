"use client";

// Industries — six sectors as Tier-2 Liquid-Glass PANEL cards floating over the
// living void. Each card is its own refractive slab (pointer-tracked cobalt
// rim-light); the grid arrives via the signature 3-beat <Reveal> with a per-card
// stagger. A 12–24px black gutter rings every slab so the cobalt cube light
// lives behind the edges. No opaque section fill — the void shows through.
//
// Each card carries a real value description plus 2–3 problem→solution use
// cases, kept scannable behind a click-to-expand "Use cases" disclosure so the
// collapsed grid stays compact (no overflow / overlap) and only the opened card
// grows its row. All copy uses CSS-var tokens so it stays legible in both themes.

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChapterLabel } from "@/components/shared/ChapterLabel";
import { LiquidGlass } from "@/components/glass/LiquidGlass";
import { Reveal } from "@/components/scroll/Reveal";
import { useDepthParallax } from "@/components/scroll/useDepthParallax";
import { Ph } from "@/components/icons/Ph";

// Industries data — expanded inline (intentionally NOT in src/lib/data.ts).
// body: 3–5 sentence value description. cases: concrete problem→solution pairs.
type Industry = {
  name: string;
  body: string;
  cases: { problem: string; solution: string }[];
};

const INDUSTRIES: Industry[] = [
  {
    name: "Health Care & Management",
    body: "We unify fragmented patient records, scheduling, and billing into one governed clinical data layer that hospital and clinic teams can actually trust. Predictive models surface deterioration risk and no-show likelihood early, so care teams intervene before outcomes slip. Every inference is auditable and HIPAA-aligned, with PHI encrypted in transit and at rest. The result is less administrative drag on clinicians and faster, evidence-backed decisions at the point of care.",
    cases: [
      {
        problem: "Clinicians lose hours reconciling records scattered across EHR, lab, and imaging systems.",
        solution: "A unified patient timeline that auto-resolves duplicates and flags gaps in seconds.",
      },
      {
        problem: "Avoidable readmissions and missed appointments erode capacity and revenue.",
        solution: "Risk scoring that ranks patients for proactive outreach and tailored reminders.",
      },
      {
        problem: "Manual coding and claims review slow reimbursement and invite denials.",
        solution: "Assisted coding that suggests compliant codes and pre-checks claims before submission.",
      },
    ],
  },
  {
    name: "Manufacturing Technology",
    body: "We instrument production lines with sensor and historian data to give operators a live, explainable picture of plant health. Predictive maintenance models forecast equipment failure days ahead, turning unplanned downtime into scheduled, low-cost service. Computer vision inspects parts at line speed, catching defects human checks routinely miss. Each insight ties back to a clear cause, so engineers trust the call and act on it without second-guessing the model.",
    cases: [
      {
        problem: "Unplanned machine failures stall lines and blow through maintenance budgets.",
        solution: "Vibration and thermal models that predict failure windows and auto-schedule service.",
      },
      {
        problem: "Manual quality inspection is slow, inconsistent, and misses fine surface defects.",
        solution: "Vision inspection that grades every unit at line speed and quarantines failures.",
      },
      {
        problem: "Throughput losses are invisible until they show up in monthly reports.",
        solution: "Real-time OEE dashboards that localize bottlenecks down to the station.",
      },
    ],
  },
  {
    name: "Education Sector & Technology",
    body: "We build education technology and institutional ERP that connect admissions, learning, and operations into one coherent system. Adaptive learning models meet each student at their level, pacing content to keep them engaged rather than overwhelmed. Early-warning analytics flag at-risk learners while there is still time to support them. Administrators get a single source of truth for enrolment, attendance, and outcomes, replacing brittle spreadsheets with governed data.",
    cases: [
      {
        problem: "One-size content loses both struggling and advanced students.",
        solution: "Adaptive pathways that adjust difficulty and recommend the next best lesson per learner.",
      },
      {
        problem: "Dropout risk surfaces only after a student has already disengaged.",
        solution: "Engagement scoring that alerts faculty to intervene weeks earlier.",
      },
      {
        problem: "Admissions, fees, and records live in disconnected tools.",
        solution: "A unified ERP that automates enrolment-to-graduation workflows end to end.",
      },
    ],
  },
  {
    name: "Real Estate & Realtors Tech",
    body: "We give brokerages and developers AI agents that qualify leads, answer property questions, and book viewings around the clock. Marketing automation routes each prospect to the right listing and nurtures them with content tuned to their intent. Valuation models price inventory against live market signals so teams list with confidence. Agents spend their time closing rather than chasing cold contacts and updating listings by hand.",
    cases: [
      {
        problem: "High-intent inquiries go cold while agents are busy or off-hours.",
        solution: "An AI concierge that qualifies, answers, and schedules viewings instantly, day or night.",
      },
      {
        problem: "Marketing spend scatters across leads that never convert.",
        solution: "Intent scoring that focuses budget and nurture on prospects ready to transact.",
      },
      {
        problem: "Pricing relies on stale comparables and gut feel.",
        solution: "Valuation models that price against live demand and comparable activity.",
      },
    ],
  },
  {
    name: "FinTech",
    body: "We deploy fraud detection that scores transactions in real time, blocking bad actors without throttling legitimate customers. Forecasting models sharpen credit, liquidity, and revenue predictions so finance teams plan on signal rather than instinct. Every decision is explainable and audit-ready, which matters when regulators and risk committees ask why. Controls are tuned to cut false positives, protecting both the balance sheet and the customer experience.",
    cases: [
      {
        problem: "Rules-based fraud checks miss novel attacks and over-block good users.",
        solution: "Adaptive scoring that catches emerging fraud patterns while cutting false declines.",
      },
      {
        problem: "Manual underwriting is slow and inconsistent across reviewers.",
        solution: "Explainable credit models that standardize decisions and document the rationale.",
      },
      {
        problem: "Cash-flow and revenue forecasts drift from reality between quarters.",
        solution: "Forecasting that updates continuously as new transaction data arrives.",
      },
    ],
  },
  {
    name: "Supply Chain & Hospitality",
    body: "We optimize last-mile routing, inventory, and demand planning so goods move on time at the lowest viable cost. Forecasting models anticipate demand swings, keeping stock lean without risking stockouts during peaks. For hospitality, we automate booking, pricing, and guest workflows to lift occupancy and the guest experience together. Operators get one control tower over a fragmented network instead of reacting to disruptions after they bite.",
    cases: [
      {
        problem: "Last-mile delivery cost and delay creep up as the network grows.",
        solution: "Route optimization that re-plans against live traffic, capacity, and SLAs.",
      },
      {
        problem: "Demand spikes trigger stockouts while slow movers tie up capital.",
        solution: "Forecasting and replenishment that balance service level against inventory cost.",
      },
      {
        problem: "Hospitality teams juggle pricing and bookings across disconnected channels.",
        solution: "Dynamic pricing and unified booking that lift occupancy and guest satisfaction.",
      },
    ],
  },
];

// Sector list markers — thin Phosphor glyphs (editorial UI chrome; this
// section stays 3D-icon-free by design). One muted marker per card, paired
// with the mono index.
const SECTOR_PH = [
  "heartbeat",      // Health Care
  "factory",        // Manufacturing
  "graduation-cap", // Education
  "buildings",      // Real Estate
  "bank",           // FinTech
  "package",        // Supply Chain
];

// Per-industry accent — distinct hue per sector for the hover orb. The orbs are
// decorative refraction fuel that lives BEHIND the glass; cobalt stays the one
// interactive accent (carried by the panel rim-light + corner-mark).
const ORBS = [
  "from-cyan-500/30 via-teal-400/10",   // Health Care
  "from-amber-500/30 via-orange-400/10", // Manufacturing
  "from-violet-500/30 via-fuchsia-400/10", // Education
  "from-emerald-500/30 via-lime-400/10",  // Real Estate
  "from-blue-500/30 via-indigo-400/10",   // FinTech
  "from-rose-500/30 via-pink-400/10",     // Supply Chain
];

function IndustryCard({ ind, i }: { ind: Industry; i: number }) {
  const [open, setOpen] = useState(false);

  return (
    <LiquidGlass
      tier="panel"
      as="article"
      focal={i === 0}
      radius={18}
      className="group relative flex h-full min-h-[260px] flex-col overflow-hidden p-7 transition-transform duration-500 hover:-translate-y-1"
    >
      {/* Gradient orb — refraction fuel behind the glass; reveals on hover.
          Lives below content, above the panel tint. */}
      <div
        className={`pointer-events-none absolute -top-32 -right-32 h-72 w-72 rounded-full opacity-0 transition-opacity duration-700 group-hover:opacity-100 bg-gradient-radial bg-gradient-to-br ${ORBS[i]} to-transparent blur-3xl`}
        aria-hidden
      />
      {/* Index marker + thin sector glyph (Ph, UI-chrome layer) */}
      <div className="relative flex items-center justify-between">
        <span className="mono text-(--color-muted)">0{i + 1} / 06</span>
        <Ph
          name={SECTOR_PH[i]}
          weight="thin"
          size={22}
          className="text-(--color-muted) transition-colors duration-500 group-hover:text-(--color-fg-2)"
        />
      </div>

      <h3 className="relative mt-8 font-display text-[clamp(20px,1.8vw,28px)] font-medium leading-tight tracking-tight text-(--color-fg)">
        {ind.name}
      </h3>

      <p className="relative mt-4 text-[14.5px] leading-relaxed text-(--color-fg-2) group-hover:text-(--color-fg-elev) transition-colors">
        {ind.body}
      </p>

      {/* Use-cases disclosure — keeps the grid compact while exposing real
          depth on demand. Height-animated so only the opened card grows. */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="cases"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
            className="relative overflow-hidden"
          >
            <ul className="mt-6 space-y-4 border-t border-(--color-line) pt-6">
              {ind.cases.map((c) => (
                <li key={c.problem} className="flex gap-3">
                  <Ph
                    name="arrow-bend-down-right"
                    weight="thin"
                    size={18}
                    className="mt-0.5 shrink-0 text-(--color-accent)"
                  />
                  <div>
                    <p className="text-[13.5px] leading-relaxed text-(--color-fg-2)">
                      {c.problem}
                    </p>
                    <p className="mt-1 text-[13.5px] leading-relaxed text-(--color-fg) [html[data-theme=dark]_&]:text-(--color-fg-elev)">
                      {c.solution}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Disclosure trigger — pinned to the foot of the slab. */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="relative mt-auto flex items-center gap-2 pt-6 text-left text-[12px] font-medium uppercase tracking-[0.16em] text-(--color-fg-2) transition-colors hover:text-(--color-fg)"
      >
        {open ? "Hide use cases" : "Use cases"}
        <Ph
          name="caret-down"
          weight="bold"
          size={14}
          className={`text-(--color-accent) transition-transform duration-300 ${open ? "rotate-180" : ""}`}
        />
      </button>
    </LiquidGlass>
  );
}

export function Industries({ bare = false }: { bare?: boolean } = {}) {
  // Subtle antigravity depth: the header block leads scroll (plane 3) while a
  // deep glass veil behind the grid lags (plane 0) — layered parallax, GPU-only.
  const headerDepth = useDepthParallax(3);
  const veilDepth = useDepthParallax(0);

  return (
    <section
      id="industries"
      className="relative z-10 px-[var(--pad-x)] py-[clamp(56px,8vh,112px)]"
    >
      <div className="mx-auto w-full max-w-[var(--col-w)]">
        {!bare && (
          <motion.div style={{ transform: headerDepth }}>
            <ChapterLabel num="06" word="INDUSTRIES" />

            <Reveal direction="up">
              <h2 className="mt-6 font-display text-[length:var(--text-display-lg)] leading-[0.95] tracking-[-0.035em] text-balance text-(--color-fg) max-w-4xl">
                Six high-value{" "}
                <em
                  className="font-serif not-italic italic"
                  style={{ letterSpacing: "-0.02em", fontWeight: 400 }}
                >
                  sectors
                </em>
                <br />we transform.
              </h2>
            </Reveal>

            <Reveal direction="up" delay={0.12}>
              <p className="mt-8 max-w-prose text-[clamp(15px,1.1vw,17px)] leading-relaxed text-(--color-fg-2)">
                Focused on India, the Middle East, and the Americas.
              </p>
            </Reveal>
          </motion.div>
        )}

        {/* Grid — each card is its own Tier-2 glass slab over the void. The
            12–24px black gutter is the grid gap + section padding. */}
        <div
          className={`relative ${bare ? "" : "mt-16"} grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3`}
        >
          {/* Deep glass veil — a back-plane element that lags scroll, letting the
              cube light pool behind the cards. Decorative, pointer-transparent. */}
          <motion.div
            aria-hidden
            style={{ transform: veilDepth }}
            className="pointer-events-none absolute -inset-x-6 -inset-y-10 -z-10 rounded-[28px] bg-[radial-gradient(60%_50%_at_50%_30%,color-mix(in_oklab,var(--color-accent)_8%,transparent),transparent_70%)] blur-2xl"
          />

          {INDUSTRIES.map((ind, i) => (
            <Reveal key={ind.name} direction="up" delay={0.06 * i} amount={0.25}>
              <IndustryCard ind={ind} i={i} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
