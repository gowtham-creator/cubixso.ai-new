"use client";

// KineticStack — chapter 03 KINETIC. "Cobalt Aperture — Liquid Glass over a
// Living Void" pass.
//
// WOW MOMENT — PINNED INFERENCE LENS. The AI-inference panel becomes the page's
// Tier-3 LENS: it is wrapped in <LiquidGlass tier="lens"> with a live
// <GlassLensFilter> applied, so its feDisplacementMap is the ONE place on the
// entire page where geometry distorts — the cobalt VoidCube + particle field
// rendered FIXED behind it are bent and chromatically shifted through the glass.
// Tokens / inference text stream across the lens; on every inference pulse the
// displacement RIPPLES outward (scale bumps then relaxes). The lens IO-pauses
// itself off-screen (LiquidGlass exposes onViewChange) so the costly map and the
// canvas RAF cost nothing when out of view.
//
// The opaque section + panel fills are REMOVED so the void shows through; the
// glass slab keeps a void gutter so the cobalt light always lives behind it. The
// headline word-stack is delivered through <Reveal> + the existing per-word build
// (preserved copy/data/ChapterLabel). Depth planes give the antigravity parallax.
//
// No hard ScrollTrigger pins (they fight Lenis) — the "pinned" beat is achieved
// with lg:sticky + glass + Reveal + the cube morphing behind. GPU-cheap
// (transform/opacity/filter only) and reduced-motion-safe.

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ChapterLabel } from "@/components/shared/ChapterLabel";
import { AIInferenceVis } from "./kinetic/AIInferenceVis";
import { LiquidGlass } from "@/components/glass/LiquidGlass";
import { GlassLensFilter } from "@/components/glass/GlassLensFilter";
import { Reveal } from "@/components/scroll/Reveal";
import { useDepthParallax } from "@/components/scroll/useDepthParallax";

const PHRASE = [
  "What",
  "if",
  "your",
  "AI",
  "could",
  "decompose",
  "any",
  "business",
  "problem",
  "and",
  "synthesize",
  "the",
  "answer",
  "in",
  "production?",
];

// Words to render in serif italic for editorial accent
const ITALIC = new Set(["decompose", "synthesize"]);

// Stable filter id shared by the <defs> producer and the lens consumer.
const LENS_ID = "kinetic-inference-lens";

// Resting + peak displacement strength (px). Each inference pulse bumps the
// lens from REST toward PEAK, then it relaxes back — the ripple.
const LENS_REST = 18;
const LENS_PEAK = 40;

export function KineticStack() {
  const reduced = useReducedMotion();

  // The lens is only refracting / animating while on-screen. IO drives this via
  // LiquidGlass.onViewChange so the displacement map + canvas RAF idle off-screen.
  const [inView, setInView] = useState(false);

  // Live displacement strength — rippled up on each inference pulse, eased back
  // down to rest by a single RAF. Held in a ref for the loop; mirrored to state
  // only when it changes enough to matter (keeps re-renders rare).
  const scaleRef = useRef(LENS_REST);
  const [lensScale, setLensScale] = useState(LENS_REST);
  const rippleRef = useRef(0); // 0..1 envelope of the most recent pulse

  // A pulse kicks the ripple envelope to 1; the RAF decays it and maps it onto
  // the displacement scale. Reduced-motion holds the lens perfectly still.
  const handlePulse = useCallback(() => {
    if (reduced) return;
    rippleRef.current = 1;
  }, [reduced]);

  // Single RAF that relaxes the ripple → displacement scale while the lens is
  // visible. Paused (and never started) when off-screen or reduced-motion, so
  // the most expensive surface on the page costs nothing at rest.
  useEffect(() => {
    if (!inView || reduced) {
      // Settle to rest so the frozen lens is the clean resting pose.
      scaleRef.current = LENS_REST;
      setLensScale(LENS_REST);
      return;
    }
    let raf = 0;
    const loop = () => {
      // Exponential decay of the pulse envelope.
      rippleRef.current *= 0.9;
      const target = LENS_REST + (LENS_PEAK - LENS_REST) * rippleRef.current;
      // Critically-ish damped approach so the ripple reads as a soft swell.
      scaleRef.current += (target - scaleRef.current) * 0.25;
      const next = Math.round(scaleRef.current * 10) / 10;
      setLensScale((prev) => (Math.abs(prev - next) > 0.05 ? next : prev));
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [inView, reduced]);

  // Depth planes (antigravity parallax). Type leads (plane 3); the lens column
  // rides the mid plane so it trails the headline slightly — mass-in-zero-g.
  const stackParallax = useDepthParallax(3);
  const lensParallax = useDepthParallax(1);

  // The lens is "active" (animating turbulence + ripple) only on-screen.
  const lensActive = inView && !reduced;

  return (
    <section
      id="kinetic"
      className="relative z-10 px-[var(--pad-x)] py-[clamp(120px,18vh,240px)]"
    >
      {/* Tier-3 lens filter <defs> — rendered once near its consuming surface.
          scale ripples per inference pulse; paused/static off-screen + reduced. */}
      <GlassLensFilter
        id={LENS_ID}
        scale={lensScale}
        paused={!lensActive}
        animate={lensActive}
      />

      <div className="mx-auto w-full max-w-[var(--col-w)]">
        <ChapterLabel num="03" word="KINETIC" />

        {/* Two-column on desktop: vertical word stack left, live AI lens right.
            Mobile collapses to single column — the lens hides so the typography
            stays the dominant moment on phones. */}
        <div className="mt-12 grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] gap-12 lg:gap-16 items-start">
          {/* ── Left: kinetic word stack ────────────────────────────── */}
          {/* Reveal delivers the slab (mask-wipe + lift + specular sweep); the
              per-word build is the SETTLE inside it. Parallax leads (plane 3). */}
          <Reveal direction="up" className="will-change-transform">
            <motion.div
              style={reduced ? undefined : { transform: stackParallax }}
              className="flex flex-col gap-1"
            >
              {PHRASE.map((w, i) => (
                <motion.span
                  key={`${w}-${i}`}
                  initial={{ opacity: 0, x: -16, filter: "blur(6px)" }}
                  whileInView={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                  viewport={{ once: true, amount: 0.6 }}
                  transition={{
                    duration: 0.55,
                    delay: i * 0.04,
                    ease: [0.16, 1, 0.3, 1] as const,
                  }}
                  className={`font-display font-semibold leading-[0.95] tracking-[-0.03em] text-(--color-fg) text-[clamp(36px,7vw,100px)] ${
                    ITALIC.has(w)
                      ? "font-serif italic font-normal text-(--color-accent-2)"
                      : ""
                  }`}
                >
                  {w}
                </motion.span>
              ))}
            </motion.div>
          </Reveal>

          {/* ── Right: live AI inference LENS (desktop only) ────────────
              Tier-3 LiquidGlass with the displacement filter applied to its
              backdrop → the cube + nodes BEHIND the fixed void canvas are bent
              and chromatically shifted through the glass. lg:sticky gives the
              "pinned" beat without a Lenis-hostile ScrollTrigger pin. The void
              gutter (panel inset) keeps cobalt light living behind the slab. */}
          <motion.div
            style={reduced ? undefined : { transform: lensParallax }}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.9, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="hidden lg:block lg:sticky lg:top-[12vh] h-[70vh] max-h-[680px]"
          >
            <LiquidGlass
              tier="lens"
              focal
              radius={18}
              lensFilterId={lensActive ? LENS_ID : undefined}
              onViewChange={setInView}
              className="block w-full h-full p-6"
            >
              <AIInferenceVis bare paused={!lensActive} onPulse={handlePulse} />
            </LiquidGlass>
          </motion.div>
        </div>

        <motion.p
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.9, delay: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="mt-20 mono text-(--color-muted)"
        >
          THAT&rsquo;S THE QUESTION CUBIXSO. ANSWERS.
        </motion.p>
      </div>
    </section>
  );
}
