"use client";

// WhyUs — chapter 07 EDGE. Four pillars from data.ts.
//
// Cobalt Aperture transform: the section is now a GLASS SLAB over the living
// void — no opaque fill. The intro (label + headline + lede) rides one
// Tier-2 panel; the four differentiators are each their own Tier-2 panel with
// the pointer-tracked cobalt rim-light. Entrances use the signature 3-beat
// <Reveal>; calm depth parallax separates the headline (foreground) from the
// card list (mid) so the EDGE reads with antigravity weight.

import { motion } from "framer-motion";
import { ChapterLabel } from "@/components/shared/ChapterLabel";
import { LiquidGlass } from "@/components/glass/LiquidGlass";
import { Reveal } from "@/components/scroll/Reveal";
import { useDepthParallax } from "@/components/scroll/useDepthParallax";
import { WHY } from "@/lib/data";

export function WhyUs() {
  // Headline block leads (foreground), card list lags (mid) → calm depth split.
  const headParallax = useDepthParallax(3);
  const listParallax = useDepthParallax(1);

  return (
    <section
      id="edge"
      className="relative z-10 px-[var(--pad-x)] py-[clamp(96px,14vh,180px)]"
    >
      <div className="mx-auto w-full max-w-[var(--col-w)]">
        {/* Intro slab — void gutter rings it so the cube light lives behind. */}
        <motion.div style={{ transform: headParallax }}>
          <Reveal direction="up">
            <LiquidGlass
              tier="panel"
              focal
              className="px-[clamp(24px,4vw,56px)] py-[clamp(32px,5vh,64px)]"
            >
              <ChapterLabel num="07" word="EDGE" />

              <h2 className="mt-2 font-display text-[length:var(--text-display-lg)] leading-[0.95] tracking-[-0.04em] text-balance text-(--color-fg) max-w-4xl">
                The{" "}
                <em
                  className="font-serif not-italic italic"
                  style={{ letterSpacing: "-0.02em", fontWeight: 400 }}
                >
                  edge
                </em>{" "}
                of
                <br />
                an AI-first company.
              </h2>

              <p className="mt-8 max-w-prose text-[clamp(15px,1.15vw,17px)] leading-relaxed text-(--color-fg-2)">
                Ownership across the whole stack &mdash; and the discipline to ship.
              </p>
            </LiquidGlass>
          </Reveal>
        </motion.div>

        {/* Card grid — each differentiator is its own Tier-2 glass panel. */}
        <motion.div
          style={{ transform: listParallax }}
          className="mt-[clamp(20px,3vh,40px)] grid grid-cols-1 gap-[clamp(12px,1.5vw,20px)] sm:grid-cols-2 lg:grid-cols-4"
        >
          {WHY.map((w, i) => (
            <Reveal key={w.tag} direction="up" delay={i * 0.06}>
              <LiquidGlass
                tier="panel"
                as="article"
                className="group h-full p-8"
              >
                <span className="mono text-(--color-muted)">0{i + 1}</span>
                <h3 className="mt-6 font-display text-[clamp(20px,1.7vw,26px)] font-medium leading-tight tracking-tight text-(--color-fg)">
                  {w.tag}
                </h3>
                <p className="mt-3 text-[14.5px] leading-relaxed text-(--color-fg-2) transition-colors group-hover:text-(--color-fg-elev)">
                  {w.body}
                </p>
              </LiquidGlass>
            </Reveal>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
