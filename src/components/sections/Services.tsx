"use client";

// Services — editorial bento grid of the 6 AI services, transformed into a
// GLASS SLAB over the living void. The section paints no opaque bg (the cobalt
// cube light shows through the 12–24px void gutter ringing each panel). Each
// tile is its own Tier-2 LiquidGlass panel with the pointer-tracked cobalt
// rim-light + cobalt corner-mark; the headline block rides a Reveal mask-wipe
// and the tiles stagger their Reveals. Subtle depth parallax floats the
// headline (foreground) and grid (baseline) on layered planes.

import { motion } from "framer-motion";
import { SERVICES } from "@/lib/data";
import { ChapterLabel } from "@/components/shared/ChapterLabel";
import { LiquidGlass } from "@/components/glass/LiquidGlass";
import { Reveal } from "@/components/scroll/Reveal";
import { useDepthParallax } from "@/components/scroll/useDepthParallax";
import { Icon3D, type Icon3DName } from "@/components/icons/Icon3D";
import { Ph } from "@/components/icons/Ph";

// Tiny procedural icons per service (kept lightweight, themable)
function ServiceIcon({ index }: { index: number }) {
  const icons = [
    // LLMOps — stacked layers
    <svg key="0" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.4">
      <path d="M16 4 L28 10 L16 16 L4 10 Z M4 16 L16 22 L28 16 M4 22 L16 28 L28 22" />
    </svg>,
    // Agentic — neural node
    <svg key="1" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.4">
      <circle cx="16" cy="16" r="3.5" /><circle cx="6" cy="16" r="2" /><circle cx="26" cy="16" r="2" />
      <circle cx="16" cy="6" r="2" /><circle cx="16" cy="26" r="2" />
      <path d="M8 16 H12 M20 16 H24 M16 8 V12 M16 20 V24" />
    </svg>,
    // Agents & Automation — workflow squares
    <svg key="2" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.4">
      <rect x="3" y="4" width="9" height="7" /><rect x="20" y="4" width="9" height="7" />
      <rect x="3" y="21" width="9" height="7" /><rect x="20" y="21" width="9" height="7" />
      <path d="M12 7.5 H20 M16 11 V21 M12 24.5 H20" />
    </svg>,
    // Full-Scale Apps — code brackets
    <svg key="3" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 24 30 16 22 8" /><polyline points="10 8 2 16 10 24" /><line x1="19" y1="5" x2="13" y2="27" />
    </svg>,
    // Tools / Orchestration — chain
    <svg key="4" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.4">
      <path d="M9 16 a4 4 0 0 1 4 -4 H17" /><path d="M23 16 a4 4 0 0 1 -4 4 H15" />
      <path d="M11 12 L21 12" /><path d="M11 20 L21 20" />
    </svg>,
    // RAG / Knowledge — database
    <svg key="5" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.4">
      <ellipse cx="16" cy="7" rx="11" ry="3.5" /><path d="M5 7 V16 C5 18 10 19.5 16 19.5 C22 19.5 27 18 27 16 V7" />
      <path d="M5 16 V25 C5 27 10 28.5 16 28.5 C22 28.5 27 27 27 25 V16" />
    </svg>,
  ];
  return <div className="w-7 h-7 text-(--color-fg)">{icons[index] ?? icons[0]}</div>;
}

// Aurora v3 §3 — meaning-matched 3D accents, ONLY on cards whose copy earns
// them: computer = LLMOps (0), rocket = full-scale apps that ship end-to-end
// (3, deployment/launch). Two per section max; the rest keep the quiet
// procedural line icons — no decoration spam. (mobile is reserved for the
// Products story per the v3 icon map.)
const ACCENT_3D: Partial<Record<number, { name: Icon3DName; size: number }>> = {
  0: { name: "computer", size: 72 },
  3: { name: "rocket", size: 56 },
};

// Per-card background "shader" — a distinct-hue radial orb that lives behind the
// glass so each service block (LLMOps, Agentic AI, …) reads with depth and colour
// instead of a flat panel, especially in dark mode. Softly visible by default,
// intensifies on hover. One hue per service, in card order.
const ORBS = [
  "from-cyan-400/30 via-blue-500/10",     // LLMOps
  "from-violet-500/30 via-fuchsia-400/10", // Agentic
  "from-blue-500/30 via-indigo-400/10",    // Agents & Automation
  "from-amber-500/30 via-orange-400/10",   // Full-Scale Apps
  "from-emerald-500/30 via-teal-400/10",   // Orchestration
  "from-rose-500/30 via-pink-400/10",      // RAG / Knowledge
];

// Bento spans — break the uniform grid for visual rhythm
const SPANS = [
  "lg:col-span-4 lg:row-span-2", // featured wide
  "lg:col-span-2",
  "lg:col-span-2",
  "lg:col-span-2",
  "lg:col-span-2",
  "lg:col-span-4",               // wide bottom
];

export function Services({ bare = false }: { bare?: boolean } = {}) {
  // Antigravity depth: headline leads slightly (plane 3), grid rides baseline
  // (plane 2). Pure translate3d, reduced-motion safe (hook handles it).
  const headParallax = useDepthParallax(3);
  const gridParallax = useDepthParallax(2);

  return (
    <section
      id="services"
      className="relative z-10 px-[var(--pad-x)] py-[clamp(56px,8vh,112px)]"
    >
      <div className="mx-auto w-full max-w-[var(--col-w)]">
        {!bare && (
          // Headline block as a refractive slab over the void, ringed by a void
          // gutter (p-* leaves the cube light living behind its edges).
          <motion.div style={{ transform: headParallax }}>
            <Reveal direction="up">
              <LiquidGlass
                tier="panel"
                focal
                className="p-[clamp(20px,3vw,40px)]"
              >
                <ChapterLabel num="04" word="CAPABILITIES" />

                <h2 className="mt-6 font-display text-[length:var(--text-display-lg)] leading-[0.95] tracking-[-0.035em] text-balance text-(--color-fg) max-w-4xl">
                  Generative AI{" "}
                  <em
                    className="font-serif not-italic italic"
                    style={{ letterSpacing: "-0.02em", fontWeight: 400 }}
                  >
                    services
                  </em>
                  ,<br />engineered for{" "}
                  {/* Solid cobalt ink — gradient-to-white text vanished in light
                      mode; a single accent word reads in both themes. */}
                  <span className="text-(--color-cobalt-glow)">scale</span>.
                </h2>

                <p className="mt-8 max-w-prose text-[clamp(15px,1.1vw,17px)] leading-relaxed text-(--color-fg-2)">
                  Enterprise AI, from model ops to autonomous systems.
                </p>
              </LiquidGlass>
            </Reveal>
          </motion.div>
        )}

        {/* Bento grid — each tile is its own Tier-2 glass panel. */}
        <motion.div
          style={{ transform: gridParallax }}
          className={`${bare ? "" : "mt-16"} grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-6 lg:grid-rows-3`}
        >
          {SERVICES.map((s, i) => {
            const accent = ACCENT_3D[i];
            return (
            <Reveal
              key={s.name}
              direction="up"
              delay={i * 0.07}
              className={`group ${SPANS[i]}`}
            >
              <LiquidGlass
                tier="panel"
                as="article"
                className="relative h-full overflow-hidden p-7"
              >
                {/* Background shader orb — distinct hue per service, softly
                    lit by default, fuller on hover. Reads in dark + light. */}
                <div
                  aria-hidden
                  className={`pointer-events-none absolute -top-24 -right-24 h-64 w-64 rounded-full bg-gradient-to-br ${ORBS[i] ?? ORBS[0]} to-transparent opacity-60 blur-3xl transition-opacity duration-700 group-hover:opacity-100`}
                />
                {/* Content sits above the orb. */}
                <div className="relative z-10 flex h-full flex-col gap-4">
                  {/* Meaning-matched 3D accent where one exists; otherwise the
                      quiet procedural line icon. */}
                  {accent ? (
                    <Icon3D name={accent.name} size={accent.size} float glow />
                  ) : (
                    <ServiceIcon index={i} />
                  )}
                  <h3 className="font-display text-[clamp(18px,1.4vw,22px)] font-medium tracking-tight text-(--color-fg)">
                    {s.name}
                  </h3>
                  <p className="text-[14.5px] leading-relaxed text-(--color-fg-2) group-hover:text-(--color-fg) transition-colors">
                    {s.body}
                  </p>
                  <span className="mt-auto inline-flex items-center gap-1.5 mono text-(--color-muted) opacity-0 group-hover:opacity-100 transition-opacity">
                    EXPLORE
                    <Ph name="arrow-up-right" weight="light" size={14} />
                  </span>
                </div>
              </LiquidGlass>
            </Reveal>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
