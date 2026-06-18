"use client";

// BackedBy — accreditation row reborn as a GLASS SLAB over the living void.
// Sits between Testimonial (PROOF) and Global (REACH) in the master scroll.
// The section no longer paints an opaque bg — the cobalt cube/void shows through
// a 12–24px gutter ringing a single Tier-2 panel. Each accreditation becomes its
// own Tier-4 chip glass pill (greyscale text that lifts to full contrast on
// hover). Desktop = a static wrapped row of pills inside the focal panel; mobile
// = a gentle marquee of the same glass pills. Entrance is the signature 3-beat
// <Reveal>; the headline cluster and the pill strip ride two depth planes.
// Aurora Glass v3: a trophy Icon3D (trophy = awards/accreditation) floats
// top-right of the panel — the section's single meaning-matched 3D accent.

import { motion } from "framer-motion";
import { BACKERS } from "@/lib/data";
import { ChapterLabel } from "@/components/shared/ChapterLabel";
import { Icon3D } from "@/components/icons/Icon3D";
import { LiquidGlass, GlassChip } from "@/components/glass/LiquidGlass";
import { Reveal } from "@/components/scroll/Reveal";
import { useDepthParallax } from "@/components/scroll/useDepthParallax";

export function BackedBy() {
  // Doubled for the seamless marquee loop (mobile).
  const loop = [...BACKERS, ...BACKERS];

  // Two layered elements drift on their own depth planes for antigravity feel:
  // the headline cluster slightly overtakes scroll (foreground, plane 3); the
  // pill strip rides the content baseline-plus (plane 2).
  const headTransform = useDepthParallax(3);
  const stripTransform = useDepthParallax(2);

  return (
    <section
      id="backed-by"
      className="relative z-10 px-[var(--pad-x)] py-[clamp(56px,8vh,112px)]"
    >
      {/* Void GUTTER: the panel never paints edge-to-edge — the cobalt light
          lives behind its rim. */}
      <div className="mx-auto w-full max-w-[var(--col-w)] px-[clamp(12px,1.6vw,24px)]">
        <Reveal direction="up">
          <LiquidGlass
            tier="panel"
            focal
            className="px-[clamp(20px,4vw,56px)] py-[clamp(40px,6vh,72px)]"
          >
            {/* Meaning-matched 3D accent (trophy = awards) — decorative only,
                hidden on small screens so the headline keeps its air. */}
            <Icon3D
              name="trophy"
              size={56}
              float
              glow
              className="absolute right-[clamp(20px,4vw,56px)] top-[clamp(40px,6vh,72px)] hidden md:inline-block"
            />

            <motion.div style={{ transform: headTransform }}>
              <ChapterLabel num="09" word="TRUSTED INFRASTRUCTURE" />

              {/* Real semantic heading; spread copy preserved verbatim. */}
              <h2 className="font-display text-[length:var(--text-display-lg)] leading-[0.95] tracking-[-0.04em] text-balance text-(--color-fg) max-w-4xl">
                Built on the{" "}
                <em
                  className="font-serif not-italic italic"
                  style={{ letterSpacing: "-0.02em", fontWeight: 400 }}
                >
                  shoulders
                </em>
                <br />
                of giants.
              </h2>

              <p className="mt-8 max-w-prose text-[clamp(15px,1.15vw,17px)] leading-relaxed text-(--color-fg-2)">
                The programmes, partners and stacks we ship on &mdash; earned, not bought.
              </p>
            </motion.div>

            {/* ── Desktop: wrapped row of glass chip pills ─────────────────── */}
            <motion.div
              style={{ transform: stripTransform }}
              className="mt-16 hidden md:flex flex-wrap gap-[clamp(8px,0.9vw,14px)]"
            >
              {BACKERS.map((label) => (
                <GlassChip
                  key={label}
                  className="group px-[clamp(12px,1.1vw,18px)] py-[clamp(8px,0.9vh,12px)]"
                >
                  <span className="mono text-[11px] text-(--color-fg-2) transition-colors duration-300 group-hover:text-(--color-fg)">
                    {label}
                  </span>
                </GlassChip>
              ))}
            </motion.div>

            {/* ── Mobile: gentle marquee of the same glass pills ──────────── */}
            <div className="mt-12 md:hidden relative overflow-hidden">
              <div className="flex gap-3 py-1 animate-[backed-marquee_34s_linear_infinite] whitespace-nowrap will-change-transform">
                {loop.map((label, i) => (
                  <GlassChip
                    key={`${label}-${i}`}
                    className="shrink-0 px-3.5 py-2"
                    sweep={false}
                  >
                    <span className="mono text-[10.5px] text-(--color-fg-2)">
                      {label}
                    </span>
                  </GlassChip>
                ))}
              </div>
              {/* Edge fades to the void, not to an opaque bg. */}
              <div
                className="pointer-events-none absolute inset-y-0 left-0 w-10 bg-gradient-to-r from-(--color-bg-soft)/60 to-transparent"
                aria-hidden
              />
              <div
                className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-(--color-bg-soft)/60 to-transparent"
                aria-hidden
              />
            </div>
          </LiquidGlass>
        </Reveal>
      </div>

      <style jsx>{`
        @keyframes backed-marquee {
          0% {
            transform: translate3d(0, 0, 0);
          }
          100% {
            transform: translate3d(-50%, 0, 0);
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .animate-\\[backed-marquee_34s_linear_infinite\\] {
            animation: none !important;
          }
        }
      `}</style>
    </section>
  );
}
