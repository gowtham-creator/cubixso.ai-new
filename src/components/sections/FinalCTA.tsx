"use client";

// FinalCTA — chapter 11 LEGACY. APERTURE CLOSE.
//
// Mirror of the hero: the global <VoidCube/> spine REFORMS to the clean
// edge-frame logo at exact center-void behind this section, the scroll-rail
// completes its fill at 100%, and every other glass slab has scrolled away —
// leaving only the void + the logo + ONE cobalt liquid-glass CTA pill. The page
// ends exactly where the loader began: one continuous breath.
//
// So there is NO opaque fill here — the section is transparent and the cube
// shows straight through. The closing headline masks in via <Reveal> (one of the
// three sanctioned kinetic-word moments). The CTA is a GlassButton whose specular
// sheen sweeps on a gentle LOOP (the only looping motion on the page) so the
// closing pill reads as living light. Depth parallax floats the column; all of it
// is transform/opacity only and collapses cleanly under reduced motion.
//
// v3 addition: the closing headline is the site's ONE text-distort moment —
// chars near a fine pointer lean away and lift with springy decay (engine
// documented above the constants below). Touch + reduced motion: inert.

import { useEffect, useRef } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ChapterLabel } from "@/components/shared/ChapterLabel";
import { Magnetic } from "@/components/motion/Magnetic";
import { Reveal } from "@/components/scroll/Reveal";
import { useDepthParallax } from "@/components/scroll/useDepthParallax";
import { GlassButton } from "@/components/glass/LiquidGlass";
import { Ph } from "@/components/icons/Ph";
import { CONTACT } from "@/lib/data";

const reveal = (delay: number) => ({
  initial: { opacity: 0, y: 22, filter: "blur(6px)" },
  whileInView: { opacity: 1, y: 0, filter: "blur(0px)" },
  viewport: { once: true, amount: 0.3 },
  transition: { duration: 1.0, delay, ease: [0.16, 1, 0.3, 1] as const },
});

// ── Cursor-proximity headline distortion (Aurora Glass v3 §5) ────────────────
// The ONE text-distort moment on the site: chars near the pointer lean away
// (skewX ≤4°) and lift (≤6px) with a springy decay, falling off smoothly over a
// ~160px radius. ONE pointer listener on the section + ONE rAF loop drive every
// char — never per-char listeners. Disabled entirely on coarse pointers and
// under prefers-reduced-motion (the markup renders identically, just inert).
const DISTORT_RADIUS = 160; // px — proximity falloff radius
const DISTORT_SKEW = 4; // deg — max skewX at zero distance
const DISTORT_LIFT = 6; // px — max upward lift at zero distance
const SPRING_STIFF = 0.14; // semi-implicit Euler spring: one overshoot…
const SPRING_DAMP = 0.8; // …then a quick relaxed decay

/**
 * One headline word split into per-char spans the distortion engine can grab
 * via [data-distort-char]. The wrapper is whitespace-nowrap so inline-block
 * chars can never break mid-word, and aria-hidden because the h2 carries the
 * accessible name via aria-label.
 */
function DistortWord({ word }: { word: string }) {
  return (
    <span aria-hidden className="inline-block whitespace-nowrap">
      {Array.from(word).map((ch, i) => (
        <span key={i} data-distort-char className="inline-block">
          {ch}
        </span>
      ))}
    </span>
  );
}

export function FinalCTA() {
  const reduced = useReducedMotion();
  // Foreground plane — the closing type/CTA gently overtakes scroll so the
  // logo behind it appears to settle into place as the page comes to rest.
  const lift = useDepthParallax(3);

  const sectionRef = useRef<HTMLElement | null>(null);
  const headlineRef = useRef<HTMLHeadingElement | null>(null);

  // The distortion engine. Char centres are cached RELATIVE to the headline
  // (one read per char, on mount + resize only) — Reveal and the parallax move
  // the headline by pure translation, so the relative offsets stay valid and
  // each frame needs just ONE layout read (the headline rect). Each frame is
  // strictly read-then-write, and the loop self-stops once every spring
  // settles, so an idle pointer costs zero.
  useEffect(() => {
    if (reduced) return;
    const section = sectionRef.current;
    const headline = headlineRef.current;
    if (!section || !headline) return;
    // Touch devices have no hover proximity to track — disabled entirely.
    if (!window.matchMedia("(pointer: fine)").matches) return;

    const chars = Array.from(
      headline.querySelectorAll<HTMLSpanElement>("[data-distort-char]")
    );
    if (chars.length === 0) return;

    let centers: { x: number; y: number }[] = [];
    const measure = () => {
      const hr = headline.getBoundingClientRect();
      centers = chars.map((c) => {
        const r = c.getBoundingClientRect();
        return {
          x: r.left + r.width / 2 - hr.left,
          y: r.top + r.height / 2 - hr.top,
        };
      });
    };
    measure();
    window.addEventListener("resize", measure);

    // Per-char spring state in flat typed arrays — no per-frame allocation.
    const n = chars.length;
    const skew = new Float32Array(n);
    const vSkew = new Float32Array(n);
    const liftY = new Float32Array(n);
    const vLift = new Float32Array(n);

    const pointer = { x: 0, y: 0, active: false };
    let raf = 0;
    let running = false;

    const frame = () => {
      const hr = headline.getBoundingClientRect(); // the single read
      const px = pointer.x - hr.left;
      const py = pointer.y - hr.top;
      let alive = false;

      for (let i = 0; i < n; i++) {
        // Target pose — zero outside the radius / when the pointer has left.
        let tSkew = 0;
        let tLift = 0;
        if (pointer.active) {
          const dx = px - centers[i].x;
          const dy = py - centers[i].y;
          const d = Math.hypot(dx, dy);
          if (d < DISTORT_RADIUS) {
            let f = 1 - d / DISTORT_RADIUS;
            f = f * f * (3 - 2 * f); // smoothstep — no hard edge at the radius
            // Chars lean AWAY from the cursor (sign of dx), capped at ±4°.
            tSkew = Math.max(-1, Math.min(1, dx / DISTORT_RADIUS)) * DISTORT_SKEW * f;
            tLift = -DISTORT_LIFT * f;
          }
        }
        // Spring toward target — overshoots once, then relaxes (SETTLE verb).
        vSkew[i] = (vSkew[i] + (tSkew - skew[i]) * SPRING_STIFF) * SPRING_DAMP;
        vLift[i] = (vLift[i] + (tLift - liftY[i]) * SPRING_STIFF) * SPRING_DAMP;
        skew[i] += vSkew[i];
        liftY[i] += vLift[i];
        if (
          Math.abs(vSkew[i]) > 0.01 ||
          Math.abs(tSkew - skew[i]) > 0.01 ||
          Math.abs(vLift[i]) > 0.01 ||
          Math.abs(tLift - liftY[i]) > 0.01
        ) {
          alive = true;
        }
        chars[i].style.transform =
          `translateY(${liftY[i].toFixed(2)}px) skewX(${skew[i].toFixed(2)}deg)`;
      }

      if (alive) {
        raf = requestAnimationFrame(frame);
      } else {
        // Settled (residuals <0.01) — park the loop; wake() restarts it.
        running = false;
        if (!pointer.active) {
          for (const c of chars) c.style.transform = "";
        }
      }
    };

    const wake = () => {
      if (!running) {
        running = true;
        raf = requestAnimationFrame(frame);
      }
    };
    const onMove = (e: PointerEvent) => {
      pointer.x = e.clientX;
      pointer.y = e.clientY;
      pointer.active = true;
      wake();
    };
    const onLeave = () => {
      pointer.active = false;
      wake(); // run the springs back home
    };

    section.addEventListener("pointermove", onMove, { passive: true });
    section.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", measure);
      section.removeEventListener("pointermove", onMove);
      section.removeEventListener("pointerleave", onLeave);
      for (const c of chars) c.style.transform = "";
    };
  }, [reduced]);

  return (
    <section
      id="legacy"
      ref={sectionRef}
      // NO opaque background — the void + the cube reforming to the logo show
      // straight through. min-h trimmed from full screen: a centered layout in
      // a 100vh box left an entire empty viewport before the headline arrived
      // (user: "see the space").
      className="relative z-10 flex min-h-[68svh] flex-col items-center justify-center px-[var(--pad-x)] py-[clamp(64px,9vh,120px)] text-center"
    >
      <motion.div
        style={{ transform: reduced ? undefined : lift }}
        className="mx-auto flex w-full max-w-[var(--col-w)] flex-col items-center"
      >
        <ChapterLabel num="11" word="LEGACY" className="justify-center" />

        {/* Closing headline masks in via the signature 3-beat Reveal — the
            aperture closing over the type. Same copy/structure, but split into
            per-char spans for the cursor-proximity distortion: the h2 carries
            the accessible name, the visual chars are aria-hidden. */}
        <Reveal direction="up" className="mt-2">
          <h2
            ref={headlineRef}
            aria-label="Ready to operationalize AI?"
            className="font-display text-[length:var(--text-display-2xl)] leading-[0.9] tracking-[-0.05em] text-balance text-(--color-fg)"
          >
            <DistortWord word="Ready" />
            <br />
            <DistortWord word="to" />{" "}
            <em
              className="font-serif not-italic italic"
              style={{ letterSpacing: "-0.025em", fontWeight: 400 }}
            >
              <DistortWord word="operationalize" />
            </em>
            <br />
            <DistortWord word="AI?" />
          </h2>
        </Reveal>

        <motion.p
          {...reveal(0.3)}
          className="mt-12 mx-auto max-w-[52ch] text-[clamp(15px,1.25vw,19px)] leading-relaxed text-(--color-fg-2)"
        >
          Honest scoping. Real timelines.
          <br />
          Cubixso<span className="text-(--color-accent-2)">.</span> hands you a system
          {" "}&mdash; not a notebook.
        </motion.p>

        {/* THE one cobalt liquid-glass CTA pill. Specular sheen sweeps on a
            gentle loop (lg-sweep-loop, defined below). Magnetic tug stays. */}
        <motion.div
          {...reveal(0.5)}
          className="mt-16 inline-flex flex-wrap items-center justify-center gap-x-10 gap-y-6"
        >
          <Magnetic>
            <Link href="/contact" aria-label="Start the conversation" className="inline-block">
              <GlassButton
                as="span"
                sweep={false}
                className="lg-cta-loop group inline-flex items-center gap-3 pl-7 pr-2 py-2 font-medium tracking-tight bg-(--color-cobalt)! text-white!"
              >
                <span className="text-white">Start the conversation</span>
                <span className="grid place-items-center w-10 h-10 rounded-full bg-white/15 text-white transition-transform group-hover:rotate-45">
                  <Ph name="arrow-up-right" weight="light" size={18} />
                </span>
              </GlassButton>
            </Link>
          </Magnetic>

          <a
            href={`mailto:${CONTACT.email}`}
            className="group relative mono inline-flex items-center gap-2 pb-2 text-(--color-fg-2) hover:text-(--color-fg) transition-colors"
          >
            <Ph name="envelope" weight="light" size={14} />
            OR EMAIL · {CONTACT.email.toUpperCase()}
            {/* neon hover-underline — cobalt gradient, theme-independent */}
            <span className="pointer-events-none absolute inset-x-0 bottom-0 h-px w-3/4 mx-auto bg-gradient-to-r from-transparent via-[var(--color-cobalt)] to-transparent opacity-0 transition-opacity duration-500 ease-in-out group-hover:opacity-100" />
          </a>
        </motion.div>

        {/* Subtle secondary link — routes interested readers to the newsletter.
            Token colors so it stays legible in both themes. Renders on every
            page that mounts FinalCTA (Contact, Case Studies, …). */}
        <motion.div {...reveal(0.6)} className="mt-8">
          <Link
            href="/newsletter"
            className="inline-flex items-center gap-1.5 text-[13px] tracking-tight text-(--color-fg-2) hover:text-(--color-cobalt-glow) transition-colors"
          >
            Subscribe to our newsletter
            <span aria-hidden>→</span>
          </Link>
        </motion.div>

        <motion.div
          {...reveal(0.7)}
          className="mt-32 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 mono text-(--color-fg-2)"
        >
          <span>© 2026 CUBIXSO.</span>
          <span className="text-(--color-line-2)">·</span>
          <span>STARTUP INDIA RECOGNISED</span>
          <span className="text-(--color-line-2)">·</span>
          <span>17.385°N · 78.486°E</span>
        </motion.div>
      </motion.div>

      {/* Looping specular sheen for the single closing CTA. Transform-only via the
          glass primitive's --sweep prop on its ::before, so it stays GPU-clean and
          inherits the family material. Frozen under reduced motion. */}
      <style>{`
        .lg-cta-loop.lg-glass::before{
          opacity:0;
          animation:lg-cta-sheen 3.6s var(--ease-smooth) 1.2s infinite;
        }
        @keyframes lg-cta-sheen{
          0%{ background-position:-30% 0; opacity:0; }
          8%{ opacity:1; }
          26%{ background-position:130% 0; opacity:0; }
          100%{ background-position:130% 0; opacity:0; }
        }
        @media (prefers-reduced-motion: reduce){
          .lg-cta-loop.lg-glass::before{ animation:none; opacity:0; }
        }
      `}</style>
    </section>
  );
}
