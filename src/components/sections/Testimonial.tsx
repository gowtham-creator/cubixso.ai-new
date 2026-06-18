"use client";

// Testimonial — Epiminds-style bold quote, no quote marks, attribution
// bottom-right. Sits between Metrics (PROOF) and Global (REACH).
// No chapter label per the build doc — the quote IS the proof.
//
// ASTONISH ("Cobalt Aperture — Liquid Glass over a Living Void"):
// The section no longer paints an opaque bg — the global <VoidCube/> shows
// through. The quote lives in the ONE focal Tier-2 glass slab (the single
// allowed real shadow), ringed by a void gutter so the cobalt light breathes
// behind its edges. The quote text mask-wipes in via the 3-beat <Reveal>;
// the attribution wipes from its leading edge. Subtle depth parallax floats
// the slab against the void.
//
// Aurora Glass v3: a chat-bubble Icon3D sits where an opening quote mark
// would — the section's single meaning-matched 3D accent. The pull-quote
// keeps its serif counterpoint (aperios reference); no gradient text here.

import { motion } from "framer-motion";
import { Icon3D } from "@/components/icons/Icon3D";
import { LiquidGlass } from "@/components/glass/LiquidGlass";
import { Reveal } from "@/components/scroll/Reveal";
import { useDepthParallax } from "@/components/scroll/useDepthParallax";

export function Testimonial() {
  // Slab floats on the content baseline-plus plane; the attribution rule rides
  // a slightly deeper plane so it drifts against the quote (antigravity depth).
  const slabParallax = useDepthParallax(2);
  const accentParallax = useDepthParallax(1);

  return (
    <section
      id="testimonial"
      className="relative z-10 px-[var(--pad-x)] py-[clamp(72px,10vh,136px)]"
    >
      {/* Void GUTTER: the slab is inset from the section edge so the cobalt
          light lives behind its rim. Depth-parallax floats it against the void. */}
      <motion.div
        style={{ transform: slabParallax }}
        className="mx-auto w-full max-w-[var(--col-w)] p-[clamp(12px,1.6vw,24px)]"
      >
        <LiquidGlass
          tier="panel"
          focal
          radius={18}
          className="block px-[clamp(28px,5vw,72px)] py-[clamp(40px,7vh,96px)]"
        >
          {/* BEAT 1·2·3 — the quote mask-wipes UP, lifts, then settles. The
              chat-bubble accent reads as the opening quotation mark. */}
          <Reveal direction="up" as="div">
            <Icon3D name="chat-bubble" size={56} float glow className="mb-8" />
            <blockquote className="font-display text-[length:var(--text-display-md)] leading-[1.1] tracking-[-0.025em] text-balance text-(--color-fg) max-w-5xl">
              Cubixso turned a fifteen-year-old underwriting{" "}
              <em
                className="font-serif not-italic italic"
                style={{ letterSpacing: "-0.02em", fontWeight: 400 }}
              >
                ruleset
              </em>{" "}
              into a deployable DMN system in six weeks. 40 percent of decisions
              run on it now.
            </blockquote>
          </Reveal>

          {/* Attribution wipes from its leading (right) edge a beat later. */}
          <Reveal direction="left" delay={0.35} as="div">
            <figcaption className="mt-12 flex items-end justify-end gap-6 mono text-(--color-fg-2)">
              <motion.span
                style={{ transform: accentParallax }}
                className="block w-16 h-px bg-(--color-line-2)"
                aria-hidden
              />
              <div className="text-right">
                <div>DIRECTOR OF UNDERWRITING</div>
                <div className="mt-1 text-(--color-muted)">
                  TIER-1 INSURE-TECH · INDIA
                </div>
                <div className="mt-2 text-[10px] text-(--color-muted-2)">
                  [ PENDING CLIENT APPROVAL ]
                </div>
              </div>
            </figcaption>
          </Reveal>
        </LiquidGlass>
      </motion.div>
    </section>
  );
}
