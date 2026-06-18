"use client";

// NotFoundCrystal — the CRYSTAL 404 (Aurora Glass v3 §5, noomo /kk reference).
//
// 404 as art: giant shattered iridescent-crystal numerals over the black void.
// The layout's global <Aurora/> + <VoidCube/> render behind this route, so the
// page adds ONLY foreground content — no remounted scene, no opaque fill.
//
// The numerals are a single SVG <text> pushed through feTurbulence +
// feDisplacementMap (the shattered-crystal fracture), stroked AND faintly
// filled with one iridescent gradient (powder → cobalt → violet — the same
// family Aurora drifts through the void). Motion stays whisper-quiet:
//   • 4 small glass shards drift on slow framer-motion loops (9–13.5s).
//   • The shards also parallax a few px toward the mouse (spring-smoothed,
//     mouse pointers only — touch never jitters).
//   • The fracture itself breathes: the turbulence baseFrequency oscillates
//     on an 8s rAF loop (throttled ~30fps — filter recompute isn't free).
// ALL of it is disabled under prefers-reduced-motion. whoosh() fires once on
// mount (gated inside the feedback bus on the AudioToggle + gesture unlock).

import { useEffect, useRef } from "react";
import Link from "next/link";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { GlassButton } from "@/components/glass/LiquidGlass";
import { Ph } from "@/components/icons/Ph";
import { useFeedback } from "@/lib/feedback";

// Drifting crystal shards — clip-path facets filled with the iridescent
// gradient at low alpha (gradients live in the void + type, never on glass).
// Durations spread 9–13.5s so the loops never visibly sync.
// `depth` = pointer-parallax travel in px (a few px — bigger shards feel
// nearer, so they move more).
const SHARDS = [
  { clip: "polygon(50% 0%, 100% 86%, 0% 100%)", w: 46, h: 58, left: "14%", top: "20%", drift: -26, rot: 12, dur: 11, delay: 0, depth: 8 },
  { clip: "polygon(0% 0%, 100% 18%, 64% 100%)", w: 30, h: 38, left: "76%", top: "14%", drift: 20, rot: -10, dur: 13.5, delay: 0.8, depth: 5 },
  { clip: "polygon(28% 0%, 100% 52%, 0% 100%)", w: 22, h: 26, left: "84%", top: "60%", drift: -16, rot: 16, dur: 9, delay: 0.4, depth: 4 },
  { clip: "polygon(0% 30%, 100% 0%, 72% 100%)", w: 38, h: 46, left: "6%", top: "64%", drift: 22, rot: -14, dur: 12.5, delay: 1.2, depth: 7 },
] as const;

const SHARD_FILL =
  "linear-gradient(135deg, color-mix(in oklab, var(--color-powder) 30%, transparent), color-mix(in oklab, var(--color-accent) 12%, transparent) 55%, transparent)";

// One drifting shard. Outer span carries the spring parallax (x/y motion
// values), inner span carries the slow keyframe drift loop — two transforms
// on two elements, so they never fight over the same property.
function DriftShard({
  s,
  nx,
  ny,
  reduced,
}: {
  s: (typeof SHARDS)[number];
  nx: MotionValue<number>;
  ny: MotionValue<number>;
  reduced: boolean;
}) {
  const x = useTransform(nx, (v) => v * s.depth);
  const y = useTransform(ny, (v) => v * s.depth);
  return (
    <motion.span
      className="pointer-events-none absolute"
      style={{ left: s.left, top: s.top, width: s.w, height: s.h, x, y }}
    >
      <motion.span
        className="absolute inset-0 block"
        style={{ clipPath: s.clip, background: SHARD_FILL }}
        animate={reduced ? undefined : { y: [0, s.drift, 0], rotate: [0, s.rot, 0] }}
        transition={
          reduced
            ? undefined
            : { duration: s.dur, delay: s.delay, repeat: Infinity, ease: "easeInOut" }
        }
      />
    </motion.span>
  );
}

export function NotFoundCrystal() {
  const reduced = useReducedMotion();
  const { whoosh } = useFeedback();

  // One whoosh as the crystal lands — the bus gates it on audio opt-in, so an
  // unconditional call is safe (and silent before the first user gesture).
  useEffect(() => {
    whoosh();
  }, [whoosh]);

  // Pointer parallax — normalized viewport position (−1..1), spring-smoothed
  // once here; each shard multiplies by its own depth. Mouse only: a touch
  // drag should scroll, never wobble the crystal.
  const pmx = useMotionValue(0);
  const pmy = useMotionValue(0);
  const nx = useSpring(pmx, { stiffness: 110, damping: 18, mass: 0.6 });
  const ny = useSpring(pmy, { stiffness: 110, damping: 18, mass: 0.6 });

  const onPointerMove = (e: React.PointerEvent) => {
    if (reduced || e.pointerType !== "mouse") return;
    pmx.set((e.clientX / window.innerWidth) * 2 - 1);
    pmy.set((e.clientY / window.innerHeight) * 2 - 1);
  };
  const onPointerLeave = () => {
    pmx.set(0);
    pmy.set(0);
  };

  // The fracture breathes — baseFrequency oscillates ±~10% on an 8s sine
  // loop. rAF (auto-pauses in background tabs) throttled to ~30fps because
  // every update re-runs the turbulence + displacement filter. Reduced
  // motion: the effect never starts; the fracture stays a static carving.
  const turbRef = useRef<SVGFETurbulenceElement>(null);
  useEffect(() => {
    if (reduced) return;
    const el = turbRef.current;
    if (!el) return;
    let raf = 0;
    let last = 0;
    const t0 = performance.now();
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      if (now - last < 33) return;
      last = now;
      const s = Math.sin((((now - t0) % 8000) / 8000) * Math.PI * 2);
      el.setAttribute(
        "baseFrequency",
        `${(0.0085 + s * 0.0009).toFixed(5)} ${(0.016 + s * 0.0014).toFixed(5)}`
      );
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [reduced]);

  return (
    <section
      // NO opaque background — the aurora void + cube show straight through.
      // z-10 lifts the content above the fixed z-0 scene layers.
      className="relative z-10 flex min-h-screen flex-col items-center justify-center px-[var(--pad-x)] py-[clamp(120px,16vh,200px)] text-center"
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
    >
      <h1 className="sr-only">404 — page not found</h1>

      <p className="mono text-(--color-muted)">LOST IN THE VOID · 404</p>

      {/* The shattered crystal. Decorative (the sr-only h1 carries meaning). */}
      <div aria-hidden className="relative mt-6 select-none">
        <svg
          // fontSize 320 inside a 360-unit viewBox → the rendered numeral em is
          // 8/9 of the CSS height, so this clamp lands the type at 160px→360px.
          viewBox="0 0 760 360"
          style={{ height: "clamp(180px, 36vw, 405px)", width: "auto" }}
          className="overflow-visible"
        >
          <defs>
            {/* One iridescent ramp — powder → cobalt → violet (Aurora family). */}
            <linearGradient id="nf-iridescent" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="var(--color-powder)" />
              <stop offset="48%" stopColor="var(--color-accent)" />
              <stop offset="100%" stopColor="#4338ca" />
            </linearGradient>
            {/* The shatter — sharp turbulence displacing the glyph outlines into
                crystal facets. baseFrequency breathes via the rAF loop above
                (static under reduced motion). */}
            <filter id="nf-shatter" x="-25%" y="-25%" width="150%" height="150%">
              <feTurbulence
                ref={turbRef}
                type="turbulence"
                baseFrequency="0.0085 0.016"
                numOctaves="2"
                seed="7"
                result="nf-noise"
              />
              <feDisplacementMap
                in="SourceGraphic"
                in2="nf-noise"
                scale="30"
                xChannelSelector="R"
                yChannelSelector="G"
              />
            </filter>
          </defs>
          <text
            x="50%"
            y="50%"
            textAnchor="middle"
            dominantBaseline="central"
            className="font-display"
            fontSize="320"
            fontWeight="600"
            letterSpacing="-0.05em"
            fill="url(#nf-iridescent)"
            fillOpacity="0.14"
            stroke="url(#nf-iridescent)"
            strokeWidth="2.5"
            filter="url(#nf-shatter)"
          >
            404
          </text>
        </svg>

        {/* Loose shards drifting off the fracture + parallaxing toward the
            mouse. Transform-only; rendered static under reduced motion. */}
        {SHARDS.map((s, i) => (
          <DriftShard key={i} s={s} nx={nx} ny={ny} reduced={!!reduced} />
        ))}
      </div>

      <p className="mt-10 max-w-[40ch] text-[clamp(15px,1.25vw,19px)] leading-relaxed text-white/60">
        Don&apos;t feel lost &mdash; let&apos;s go home.
      </p>

      <div className="mt-10">
        <Link href="/" aria-label="Take me home" className="inline-block">
          <GlassButton
            as="span"
            className="inline-flex items-center gap-2.5 px-8 py-3.5 font-medium tracking-tight"
          >
            Take me home
            <Ph name="arrow-up-right" weight="light" size={16} />
          </GlassButton>
        </Link>
      </div>
    </section>
  );
}
