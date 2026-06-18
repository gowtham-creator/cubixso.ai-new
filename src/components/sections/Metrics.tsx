"use client";

// Metrics — chapter 08 PROOF · THE SPOTLIGHT INVERSION (wow-moment 08).
//
// After seven near-black tiles this is the ONE earned light moment: the section
// flips to the rare light/parchment surface via a REAL token swap (data-theme=
// "light" scoped to this <section> only) — the surface inversion itself IS the
// divider and lands like a spotlight snapping on. The page stays dark-locked
// everywhere else; this is the deliberate inversion.
//
// SPOTLIGHT SNAP: the parchment surface is a child layer of the focal panel
// that wipes in via a clip-path circle() expanding from the LIVE dot (~600ms,
// --ease-out-expo) the first time the slab crosses the reveal line; the token
// swap (deep-blue ink on Floral White #FEFAEF) crossfades in lockstep. It is
// ONE-WAY: once lit it never reverts — the page around the slab stays dark,
// the slab is the light island, glowing softly into the void. All scoped CSS
// lives in globals.css under the "METRICS SPOTLIGHT INVERSION" block, keyed to
// #proof[data-theme="light"][data-lit="true"]. Reduced motion: no wipe — the
// slab is instantly light when it enters view.
//
// The six stats COUNT UP behind a clip mask inside Tier-4 glass CHIPS as the
// section settles. The lone crimson (--color-crimson #C1121F) "LIVE" status
// dot — the ONLY non-cobalt colour on the entire page — sits here and nowhere
// else. Aurora Glass v3: a chart Icon3D floats over the slab (chart = metrics,
// meaning-matched) and ONE aurora-gradient word lives inside the headline.
//
// Glass over void: the section is transparent (no opaque bg) so the cube light
// rings the slab through a void gutter; the primary content rides a tier="panel"
// liquid-glass slab; the 3-beat <Reveal> replaces the old whileInView entrance;
// two layered elements drift on depth planes.

import { useEffect, useRef, useState, type RefObject } from "react";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  animate,
} from "framer-motion";
import { LiquidGlass } from "@/components/glass/LiquidGlass";
import { Icon3D } from "@/components/icons/Icon3D";
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

// Raw-IntersectionObserver "fire once" gate — the verified pattern from
// Reveal.tsx (framer-motion's useInView has been observed to never fire in
// this codebase: 0/62 slabs). Latches true as the node crosses a line ~12% up
// from the viewport bottom, in lockstep with the Reveal slabs. `onEnter`
// (optional) runs synchronously INSIDE the IO callback, BEFORE the state flip
// commits — used to pin the spotlight origin before the lit styles apply.
function useOnceInView(
  ref: RefObject<HTMLElement | null>,
  onEnter?: () => void
) {
  const [seen, setSeen] = useState(false);
  const enterRef = useRef(onEnter);
  enterRef.current = onEnter;
  useEffect(() => {
    if (seen) return;
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        enterRef.current?.();
        setSeen(true);
        io.disconnect();
      },
      // Lead the scroll (+18%): the spotlight snap + count-up are already
      // playing as the panel enters — no dark beat for fast scrollers.
      { rootMargin: "0px 0px 18% 0px", threshold: 0 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [ref, seen]);
  return seen;
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
        // 3.4vw cap (was 4.8) — "$850B+" must NEVER clip its "+" inside the
        // chip at wide viewports (it read as "$850B-").
        className="block whitespace-nowrap font-serif italic text-[clamp(30px,3.4vw,52px)] leading-none tracking-tight text-(--color-fg) tabular-nums"
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
  const play = useOnceInView(gridRef);

  // SPOTLIGHT SNAP — when the focal slab first crosses the reveal line we
  // measure the LIVE dot's position inside the panel and pin --spot-x/--spot-y
  // on the panel element BEFORE data-lit commits, so the clip-path circle()
  // wipe emanates from the dot itself. (The dot may still ride its Reveal's
  // pre-lift 40px offset at measure time — accepted: the origin lands within
  // a few percent of the dot, visually identical.) Latches once, never dark
  // again. Reduced motion: CSS drops the transition → instant light.
  const panelRef = useRef<HTMLElement>(null);
  const dotRef = useRef<HTMLSpanElement>(null);
  const lit = useOnceInView(panelRef, () => {
    const panel = panelRef.current;
    const dot = dotRef.current;
    if (!panel || !dot) return;
    const p = panel.getBoundingClientRect();
    const d = dot.getBoundingClientRect();
    if (p.width <= 0 || p.height <= 0) return;
    const x = (((d.left + d.right) / 2 - p.left) / p.width) * 100;
    const y = (((d.top + d.bottom) / 2 - p.top) / p.height) * 100;
    panel.style.setProperty("--spot-x", `${x.toFixed(2)}%`);
    panel.style.setProperty("--spot-y", `${y.toFixed(2)}%`);
  });

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
      // SPOTLIGHT INVERSION latch — globals.css keys every light style off
      // [data-lit="true"]; flips once on reveal, never back.
      data-lit={lit ? "true" : "false"}
      className="relative z-10 px-[var(--pad-x)] py-[clamp(64px,9vh,120px)]"
    >
      <motion.div className="mx-auto w-full max-w-[var(--col-w)] p-3 md:p-4" style={{ transform: slabDrift }}>
        {/* Primary content rides ONE refractive parchment slab (tier=panel,
            focal = the single allowed shadow for this section). The void gutter
            is the p-3/p-4 ring above + the section padding around it. */}
        <LiquidGlass
          ref={panelRef}
          tier="panel"
          focal
          radius={22}
          className="metrics-panel px-6 py-12 md:px-12 md:py-16"
        >
          {/* THE PARCHMENT LIGHT SURFACE — wipes in via clip-path circle()
              from the LIVE dot (--spot-x/--spot-y, pinned above) when data-lit
              flips. Sits at z-0: under all panel content, under the specular
              sweep (::before, z-1) and the cobalt corner-mark (::after, z-3).
              Look + motion live in globals.css (METRICS SPOTLIGHT INVERSION). */}
          <div aria-hidden className="metrics-spotlight-surface" />

          {/* Meaning-matched 3D accent (chart = metrics) — floats top-right of
              the parchment slab above the stat grid header. Decorative only;
              hidden on small screens so the headline keeps its air. */}
          <Icon3D
            name="chart"
            size={64}
            float
            glow
            className="absolute right-[clamp(24px,5vw,64px)] top-[clamp(40px,6vh,72px)] hidden md:inline-block"
          />

          <Reveal direction="up">
            <ChapterLabel num="08" word="PROOF" />
          </Reveal>

          <Reveal direction="up" delay={0.05}>
            <motion.h2
              style={{ transform: headDrift }}
              className="font-display text-[length:var(--text-display-lg)] leading-[0.95] tracking-[-0.04em] text-balance text-(--color-fg) max-w-3xl"
            >
              The{" "}
              {/* The ONE aurora-gradient word allowed in this section. */}
              <em
                className="font-serif not-italic italic text-aurora"
                style={{ letterSpacing: "-0.02em", fontWeight: 400 }}
              >
                numbers
              </em>
              <br />
              behind the work.
            </motion.h2>
          </Reveal>

          {/* The lone crimson LIVE dot — the ONLY non-cobalt colour on the page. */}
          <Reveal direction="up" delay={0.1}>
            <p className="mt-8 inline-flex items-center gap-2 mono text-[11px] tracking-[0.18em] uppercase text-(--color-fg-2)">
              {/* dotRef = the spotlight wipe origin (--spot-x/--spot-y). */}
              <span ref={dotRef} className="relative flex h-2 w-2">
                <span
                  aria-hidden
                  className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 motion-reduce:hidden"
                  style={{ background: "var(--color-crimson)" }}
                />
                <span
                  className="relative inline-flex h-2 w-2 rounded-full"
                  style={{ background: "var(--color-crimson)" }}
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
              className="mt-16 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6 2xl:gap-4"
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
                  {/* min-h normalizes 1- vs 2-line labels so all six chips
                      share one baseline grid. */}
                  <span className="mt-4 block min-h-[2.7em] mono text-[10.5px] leading-snug tracking-[0.04em] text-(--color-fg-2)">
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
