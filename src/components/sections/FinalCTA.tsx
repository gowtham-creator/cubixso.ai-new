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

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ChapterLabel } from "@/components/shared/ChapterLabel";
import { Magnetic } from "@/components/motion/Magnetic";
import { Reveal } from "@/components/scroll/Reveal";
import { useDepthParallax } from "@/components/scroll/useDepthParallax";
import { GlassButton } from "@/components/glass/LiquidGlass";
import { CONTACT } from "@/lib/data";

const reveal = (delay: number) => ({
  initial: { opacity: 0, y: 22, filter: "blur(6px)" },
  whileInView: { opacity: 1, y: 0, filter: "blur(0px)" },
  viewport: { once: true, amount: 0.3 },
  transition: { duration: 1.0, delay, ease: [0.16, 1, 0.3, 1] as const },
});

export function FinalCTA() {
  const reduced = useReducedMotion();
  // Foreground plane — the closing type/CTA gently overtakes scroll so the
  // logo behind it appears to settle into place as the page comes to rest.
  const lift = useDepthParallax(3);

  return (
    <section
      id="legacy"
      // NO opaque background — the void + the cube reforming to the logo show
      // straight through. A void gutter (the px padding) rings the content so the
      // cobalt light always lives behind it. min-h-screen so the close gets the
      // full dead-center stage the loader had.
      className="relative z-10 flex min-h-screen flex-col items-center justify-center px-[var(--pad-x)] py-[clamp(120px,18vh,240px)] text-center"
    >
      <motion.div
        style={{ transform: reduced ? undefined : lift }}
        className="mx-auto flex w-full max-w-[var(--col-w)] flex-col items-center"
      >
        <ChapterLabel num="11" word="LEGACY" className="justify-center" />

        {/* Closing headline masks in via the signature 3-beat Reveal — the
            aperture closing over the type. Preserves the exact copy/structure. */}
        <Reveal direction="up" className="mt-2">
          <h2 className="font-display text-[length:var(--text-display-2xl)] leading-[0.9] tracking-[-0.05em] text-balance text-(--color-fg)">
            Ready
            <br />
            to{" "}
            <em
              className="font-serif not-italic italic"
              style={{ letterSpacing: "-0.025em", fontWeight: 400 }}
            >
              operationalize
            </em>
            <br />
            AI?
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
                className="lg-cta-loop group inline-flex items-center gap-3 pl-7 pr-2 py-2 font-medium tracking-tight"
              >
                <span>Start the conversation</span>
                <span className="grid place-items-center w-10 h-10 rounded-full bg-white/15 text-white transition-transform group-hover:rotate-45">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <path d="M7 17 L17 7 M9 7 L17 7 L17 15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              </GlassButton>
            </Link>
          </Magnetic>

          <a
            href={`mailto:${CONTACT.email}`}
            className="mono text-(--color-fg-2) underline decoration-(--color-line-2) underline-offset-8 hover:decoration-(--color-fg) hover:text-(--color-fg) transition-colors"
          >
            OR EMAIL · {CONTACT.email.toUpperCase()}
          </a>
        </motion.div>

        <motion.div
          {...reveal(0.7)}
          className="mt-32 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 mono text-(--color-muted)"
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
