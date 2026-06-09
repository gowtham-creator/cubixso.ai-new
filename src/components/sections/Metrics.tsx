"use client";

// Metrics — chapter 08 PROOF · THE SPOTLIGHT INVERSION (wow-moment 08).
//
// After seven near-black tiles this is the ONE earned light moment: the section
// flips to the rare light/parchment surface via a REAL token swap (data-theme=
// "light" scoped to this <section> only) — the surface inversion itself IS the
// divider and lands like a spotlight snapping on. The page stays dark-locked
// everywhere else; this is the deliberate inversion.
//
// The six stats COUNT UP behind a clip mask inside Tier-4 glass CHIPS as the
// section settles. The lone #ff3950 "LIVE" status dot — the ONLY non-cobalt
// colour on the entire page — sits here and nowhere else.
//
// Glass over void: the section is transparent (no opaque bg) so the cube light
// rings the slab through a void gutter; the primary content rides a tier="panel"
// liquid-glass slab; the 3-beat <Reveal> replaces the old whileInView entrance;
// two layered elements drift on depth planes.

import { useEffect, useRef, useState } from "react";
import {
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
  animate,
} from "framer-motion";
import { LiquidGlass } from "@/components/glass/LiquidGlass";
import { Reveal, easeOutExpo } from "@/components/scroll/Reveal";
import { useDepthParallax } from "@/components/scroll/useDepthParallax";
import { ChapterLabel } from "@/components/shared/ChapterLabel";
import { STATS } from "@/lib/data";

// Split a stat like "$850B+" into prefix ("$"), the animatable number (850),
// and suffix ("B+") so the leading figure can count up while the decoration
// (currency, unit, "+", "%") stays pinned.
function parseStat(raw: string) {
  const m = raw.match(/^(\D*)(\d+(?:\.\d+)?)(.*)$/);
  if (!m) return { prefix: "", value: 0, suffix: raw };
  return { prefix: m[1], value: parseFloat(m[2]), suffix: m[3] };
}

// Count-up behind a clip mask — fires once when the chip enters view. The
// digits wipe up from behind a clip-path inset (the "shut aperture") while the
// value tweens; reduced-motion lands on the final number with no animation.
function CountUpStat({ raw, play }: { raw: string; play: boolean }) {
  const { prefix, value, suffix } = parseStat(raw);
  const reduced = useReducedMotion();
  const mv = useMotionValue(0);
  const [shown, setShown] = useState(reduced ? value : 0);
  const isInt = Number.isInteger(value);

  useEffect(() => {
    if (!play || reduced) {
      setShown(value);
      return;
    }
    const controls = animate(mv, value, {
      duration: 1.2,
      ease: easeOutExpo,
      onUpdate: (v) => setShown(v),
    });
    return () => controls.stop();
  }, [play, reduced, value, mv]);

  const display = isInt ? Math.round(shown).toString() : shown.toFixed(1);

  return (
    <span className="block overflow-hidden leading-none">
      <motion.span
        className="block font-serif italic text-[clamp(36px,4.8vw,68px)] leading-none tracking-tight text-(--color-fg) tabular-nums"
        initial={reduced ? false : { y: "100%" }}
        animate={play || reduced ? { y: 0 } : { y: "100%" }}
        transition={{ duration: 0.7, ease: easeOutExpo }}
      >
        {prefix}
        {display}
        {suffix}
      </motion.span>
    </span>
  );
}

export function Metrics() {
  // Drive the count-up + clip-mask once the grid crosses into view.
  const gridRef = useRef<HTMLDivElement>(null);
  const play = useInView(gridRef, { once: true, amount: 0.3 });

  // Two layered depth planes: the parchment slab sits at content baseline (2)
  // and the headline overtakes scroll slightly (3) for the antigravity drift.
  const slabDrift = useDepthParallax(2);
  const headDrift = useDepthParallax(3);

  return (
    // SPOTLIGHT INVERSION — real light-theme token swap scoped to THIS section
    // only. No opaque bg on the <section> itself: the void shows through the
    // 12–24px gutter around the slab so the cube light lives behind the edges.
    <section
      id="proof"
      data-theme="light"
      className="relative z-10 px-[var(--pad-x)] py-[clamp(96px,14vh,180px)]"
    >
      <motion.div className="mx-auto w-full max-w-[var(--col-w)] p-3 md:p-4" style={{ transform: slabDrift }}>
        {/* Primary content rides ONE refractive parchment slab (tier=panel,
            focal = the single allowed shadow for this section). The void gutter
            is the p-3/p-4 ring above + the section padding around it. */}
        <LiquidGlass
          tier="panel"
          focal
          radius={22}
          className="px-6 py-12 md:px-12 md:py-16"
        >
          <Reveal direction="up">
            <ChapterLabel num="08" word="PROOF" />
          </Reveal>

          <Reveal direction="up" delay={0.05}>
            <motion.h2
              style={{ transform: headDrift }}
              className="font-display text-[length:var(--text-display-lg)] leading-[0.95] tracking-[-0.04em] text-balance text-(--color-fg) max-w-3xl"
            >
              The{" "}
              <em
                className="font-serif not-italic italic"
                style={{ letterSpacing: "-0.02em", fontWeight: 400 }}
              >
                numbers
              </em>
              <br />
              behind the work.
            </motion.h2>
          </Reveal>

          {/* The lone #ff3950 LIVE dot — the ONLY non-cobalt colour on the page. */}
          <Reveal direction="up" delay={0.1}>
            <p className="mt-8 inline-flex items-center gap-2 mono text-[11px] tracking-[0.18em] uppercase text-(--color-fg-2)">
              <span className="relative flex h-2 w-2">
                <span
                  aria-hidden
                  className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 motion-reduce:hidden"
                  style={{ background: "#ff3950" }}
                />
                <span
                  className="relative inline-flex h-2 w-2 rounded-full"
                  style={{ background: "#ff3950" }}
                />
              </span>
              Live · updated in real time
            </p>
          </Reveal>

          {/* CARD GRID — each stat is its own Tier-4 glass CHIP; the figure
              counts up behind a clip mask inside it. */}
          <Reveal direction="up" delay={0.15}>
            <div
              ref={gridRef}
              className="mt-16 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6"
            >
              {STATS.map((s, i) => (
                <LiquidGlass
                  key={s.label}
                  tier="chip"
                  radius={16}
                  className="px-5 py-9"
                  style={{ transitionDelay: `${i * 40}ms` }}
                >
                  <CountUpStat raw={s.num} play={play} />
                  <span className="mt-4 block mono text-[10.5px] tracking-[0.04em] text-(--color-fg-2)">
                    {s.label}
                  </span>
                </LiquidGlass>
              ))}
            </div>
          </Reveal>
        </LiquidGlass>
      </motion.div>
    </section>
  );
}
