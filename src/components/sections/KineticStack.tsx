"use client";

// KineticStack — chapter 03 KINETIC. "Cobalt Aperture — Liquid Glass over a
// Living Void" pass.
//
// WOW MOMENT — IMMERSIVE SCROLL PIN (altitude101). On desktop the whole
// section PINS for ~1.5 viewports of scrubbed timeline: the kinetic headline
// re-lights word by word ("decompose"… emphasis travels down the stack while
// the stack crawls up to keep the lit word in frame), the Tier-3 inference
// LENS counter-drifts on its own plane, and the confidence readout
// interpolates 0 → 99.74% with the scrub. One gsap timeline, scrub:true,
// pin:true, anticipatePin:1, created inside gsap.matchMedia so mobile
// (<768px) and prefers-reduced-motion get NO pin — the section flows
// normally with the original entrance choreography.
//
// Lenis + ScrollTrigger cooperate via connectLenisToScrollTrigger (one rAF
// clock, lockstep updates — see src/lib/gsap.ts), which is what makes this
// pin safe over smooth scroll. While the pin owns motion, the free
// depth-parallax planes are suspended for this section (the timeline IS the
// parallax) so the two systems never fight over transforms.
//
// The AI-inference panel remains the page's Tier-3 LENS: wrapped in
// <LiquidGlass tier="lens"> with a live <GlassLensFilter>, the ONE place on
// the page where geometry distorts. Tokens stream across the lens; every
// inference pulse RIPPLES the displacement outward. The lens IO-pauses
// itself off-screen (LiquidGlass onViewChange) so the costly map and the
// canvas RAF cost nothing when out of view — pin or no pin.

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ChapterLabel } from "@/components/shared/ChapterLabel";
import { AIInferenceVis } from "./kinetic/AIInferenceVis";
import { LiquidGlass } from "@/components/glass/LiquidGlass";
import { GlassLensFilter } from "@/components/glass/GlassLensFilter";
import { Reveal } from "@/components/scroll/Reveal";
import { useDepthParallax } from "@/components/scroll/useDepthParallax";
import { gsap } from "@/lib/gsap";

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

// Words to render in serif italic for editorial accent; "decompose" is the
// section's ONE aurora gradient word (v3 §1 — max one per section).
const ITALIC = new Set(["decompose", "synthesize"]);
const AURORA = "decompose";

// Stable filter id shared by the <defs> producer and the lens consumer.
const LENS_ID = "kinetic-inference-lens";

// Resting + peak displacement strength (px). Each inference pulse bumps the
// lens from REST toward PEAK, then it relaxes back — the ripple.
const LENS_REST = 18;
const LENS_PEAK = 40;

// The scrubbed confidence readout converges here at full pin progress —
// matches the AIInferenceVis internal target so both modes read the same.
const CONFIDENCE_TARGET = 99.74;

// Pin runs only where it can't trap anyone: pointer-accurate desktop with
// motion allowed. Mobile + reduced-motion flow normally (task rule §4).
const PIN_MEDIA = "(min-width: 768px) and (prefers-reduced-motion: no-preference)";

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

  // ── Pin state ──────────────────────────────────────────────────────────
  const sectionRef = useRef<HTMLElement>(null);
  const stackRef = useRef<HTMLDivElement>(null); // word column (internal crawl)
  const lensDriftRef = useRef<HTMLDivElement>(null); // lens counter-drift plane
  const stackPlaneRef = useRef<HTMLDivElement>(null); // free-parallax wrappers —
  const lensPlaneRef = useRef<HTMLDivElement>(null); //  cleared when pin owns motion
  // True while the ScrollTrigger pin owns this section's motion (desktop, no
  // reduced-motion). Suspends the free depth-parallax planes + switches the
  // confidence readout to the scrubbed value.
  const [pinActive, setPinActive] = useState(false);
  const [scrubConfidence, setScrubConfidence] = useState(0);

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

  // ── THE PIN — one scrubbed timeline, desktop-only, reduced-motion-exempt ──
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const mm = gsap.matchMedia();

    mm.add(PIN_MEDIA, () => {
      const stack = stackRef.current;
      const lensDrift = lensDriftRef.current;
      const words = gsap.utils.toArray<HTMLElement>(
        "[data-kinetic-word]",
        section,
      );
      if (!stack || words.length === 0) return;

      setPinActive(true);

      // Words rest dimmed; the scrub re-lights them one at a time. (Entrance
      // opacity/x/blur lives on the OUTER framer span — no shared properties,
      // so gsap and framer never fight.)
      gsap.set(words, { opacity: 0.24 });

      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: section,
          start: "top 11%", // clears the fixed banner + nav pill
          end: "+=150%", // ~1.5 viewports of scrub
          scrub: true,
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            // Confidence interpolates with the scrub. Quantized to 0.25% so
            // setState only fires when the displayed value actually moves.
            const next =
              Math.round(self.progress * CONFIDENCE_TARGET * 4) / 4;
            setScrubConfidence((prev) => (prev === next ? prev : next));
          },
        },
      });

      // Word-by-word emphasis wave: the current word pops to full presence
      // (slight x lead), then settles to a readable afterglow as the next
      // takes focus. The final word ("production?") stays lit.
      const STEP = 0.5;
      words.forEach((el, i) => {
        const at = i * STEP;
        const last = i === words.length - 1;
        tl.to(el, { opacity: 1, x: 14, duration: 0.4 }, at);
        tl.to(el, { opacity: last ? 1 : 0.6, x: 0, duration: 0.4 }, at + STEP);
      });

      // Hold beat after the last word so the release never feels abrupt.
      const total = tl.duration() + 0.8;

      // Internal crawl — the stack is taller than one viewport at display
      // sizes, so it drifts up across the pin to keep the lit word in frame.
      // Function-based value + invalidateOnRefresh = resize-correct.
      tl.to(
        stack,
        {
          y: () => {
            const avail = Math.max(window.innerHeight - 320, 300);
            return -Math.max(0, stack.offsetHeight - avail);
          },
          duration: total,
        },
        0,
      );

      // Lens panel parallax counter-drift across the whole pin — mass in
      // zero-g while the type does the talking.
      if (lensDrift) {
        tl.fromTo(lensDrift, { y: 40 }, { y: -40, duration: total }, 0);
      }

      // Cleanup when the media condition stops matching (resize / rm toggle)
      // or on unmount: mm reverts the timeline + pin spacer; we clear our
      // inline styles + hand motion back to the depth-parallax planes.
      return () => {
        setPinActive(false);
        setScrubConfidence(0);
        gsap.set(words, { clearProps: "opacity,transform" });
        gsap.set(stack, { clearProps: "transform" });
        if (lensDrift) gsap.set(lensDrift, { clearProps: "transform" });
      };
    });

    return () => mm.revert();
  }, []);

  // When the pin takes ownership, scrub any inline transform framer left on
  // the parallax wrappers (removing a MotionValue from `style` unbinds it but
  // does NOT reset the DOM) — runs after the re-render that unbinds.
  useEffect(() => {
    if (!pinActive) return;
    const planes = [stackPlaneRef.current, lensPlaneRef.current].filter(
      (el): el is HTMLDivElement => el !== null,
    );
    if (planes.length) gsap.set(planes, { clearProps: "transform" });
  }, [pinActive]);

  // Depth planes (antigravity parallax). Type leads (plane 3); the lens column
  // rides the mid plane so it trails the headline slightly — mass-in-zero-g.
  // Suspended while the pin owns this section (the timeline IS the parallax).
  const stackParallax = useDepthParallax(3);
  const lensParallax = useDepthParallax(1);
  const freeParallax = !reduced && !pinActive;

  // The lens is "active" (animating turbulence + ripple) only on-screen.
  const lensActive = inView && !reduced;

  return (
    <section
      ref={sectionRef}
      id="kinetic"
      className="relative z-10 px-[var(--pad-x)] py-[clamp(72px,10vh,136px)]"
    >
      {/* Tier-3 lens filter <defs> — rendered once near its consuming surface.
          scale ripples per inference pulse; paused/static off-screen + reduced. */}
      <GlassLensFilter
        id={LENS_ID}
        scale={lensScale}
        paused={!lensActive}
        animate={lensActive}
      />

      {/* section-03 signature — a soft azure/teal ambient (luxury-palette pick,
          stored in design-system/luxury-palettes.md), distinct from the cobalt
          hero, pooled near the inference lens. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(52% 46% at 82% 30%, rgba(77,216,255,0.11), transparent 62%)" }}
      />
      <div className="relative mx-auto w-full max-w-[var(--col-w)]">
        <ChapterLabel num="03" word="THE IDEA" />
        {/* Plain-language anchor so a first-time visitor knows exactly what
            the kinetic words + live console are demonstrating. */}
        <p className="mt-6 max-w-2xl text-[clamp(15.5px,1.3vw,19px)] leading-relaxed text-(--color-fg-2)">
          We turn operating knowledge (rulebooks, workflows, tribal know-how)
          into deployable decision systems. Watch one decompose in real time
          <span className="hidden lg:inline"> on the right</span>.
        </p>

        {/* Two-column on desktop: vertical word stack left, live AI lens right.
            Mobile collapses to single column — the lens hides so the typography
            stays the dominant moment on phones. */}
        <div className="mt-16 grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] gap-12 lg:gap-16 items-start">
          {/* ── Left: kinetic word stack ────────────────────────────── */}
          {/* Reveal delivers the slab (mask-wipe + lift + specular sweep); the
              per-word build is the SETTLE inside it. The OUTER motion.span owns
              the entrance (opacity/x/blur); the INNER [data-kinetic-word] span
              owns typography + the pin's scrubbed emphasis — disjoint targets. */}
          <Reveal direction="up" className="will-change-transform">
            <motion.div
              ref={stackPlaneRef}
              style={freeParallax ? { transform: stackParallax } : undefined}
            >
              <div ref={stackRef} className="flex flex-col gap-1 will-change-transform">
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
                    className="block"
                  >
                    <span
                      data-kinetic-word
                      className={`block font-display font-semibold leading-[0.98] tracking-[-0.03em] text-[clamp(30px,5.2vw,74px)] ${
                        ITALIC.has(w)
                          ? `font-serif italic font-normal ${
                              w === AURORA
                                ? "text-(--color-fg)"
                                : "text-(--color-accent-2)"
                            }`
                          : "text-(--color-fg)"
                      }`}
                    >
                      {w}
                    </span>
                  </motion.span>
                ))}
              </div>
            </motion.div>
          </Reveal>

          {/* ── Right: live AI inference LENS (desktop only) ────────────
              Tier-3 LiquidGlass with the displacement filter applied to its
              backdrop → the cube + nodes BEHIND the fixed void canvas are bent
              and chromatically shifted through the glass. During the pin the
              inner drift plane carries the gsap counter-parallax; lg:sticky
              still covers the md..lg no-pin window. The void gutter (panel
              inset) keeps cobalt light living behind the slab. */}
          <motion.div
            ref={lensPlaneRef}
            style={freeParallax ? { transform: lensParallax } : undefined}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.9, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="block lg:sticky lg:top-[14vh]"
          >
            <div ref={lensDriftRef} className="will-change-transform">
              <LiquidGlass
                tier="lens"
                focal
                radius={18}
                lensFilterId={lensActive ? LENS_ID : undefined}
                onViewChange={setInView}
                className="block w-full h-full p-6"
              >
                <AIInferenceVis
                  bare
                  paused={!lensActive}
                  onPulse={handlePulse}
                  confidence={pinActive ? scrubConfidence : null}
                />
              </LiquidGlass>
            </div>
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
