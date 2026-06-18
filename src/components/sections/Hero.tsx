"use client";

// Hero — vercel-style flow-sphere backdrop + the neon "light-tube" cube,
// THEME-ADAPTIVE (white field in light mode like the reference, near-black in
// dark mode). The cube edges scroll-illuminate (see CubixsoCube). As you scroll
// the cube scales + the headline parallaxes away; reverses on scroll up.
// prefers-reduced-motion collapses the scroll stage.

import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import { HeroGlassCube } from "@/components/scene/HeroGlassCube";
import { useTheme } from "@/components/providers/ThemeProvider";
import { Ph } from "@/components/icons/Ph";

const SIG = [0.2, 0.8, 0.2, 1] as const;

export function Hero() {
  const heroRef = useRef<HTMLElement>(null);
  const { resolved } = useTheme();
  const dark = resolved === "dark";

  const [revealed, setRevealed] = useState(false);
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    let seen = false;
    try { seen = sessionStorage.getItem("cubixso.seen") === "1"; } catch {}
    if (seen) { setRevealed(true); return; }
    const onReveal = () => setRevealed(true);
    window.addEventListener("cubixso:revealed", onReveal);
    const safety = window.setTimeout(() => setRevealed(true), 4500);
    return () => { window.removeEventListener("cubixso:revealed", onReveal); clearTimeout(safety); };
  }, []);
  const show = revealed;

  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const cubeY = useTransform(scrollYProgress, [0, 1], [0, 70]);
  const headY = useTransform(scrollYProgress, [0, 1], [0, -150]);
  const headOpacity = useTransform(scrollYProgress, [0, 0.62], [1, 0]);
  const copyOpacity = useTransform(scrollYProgress, [0, 0.45], [1, 0]);
  const copyY = useTransform(scrollYProgress, [0, 0.5], [0, 60]);
  const headStyle = reduced ? undefined : { y: headY, opacity: headOpacity };
  const copyStyle = reduced ? undefined : { opacity: copyOpacity, y: copyY };

  return (
    <section
      ref={heroRef}
      className={`relative ${reduced ? "min-h-svh" : "h-[170vh]"} text-(--color-fg)`}
      style={{ background: "transparent" }}
    >
      <div className={`${reduced ? "relative" : "sticky top-0"} h-svh overflow-hidden`}>
        {/* glass cube + cobalt Y — the hero centerpiece (Vercel-faithful).
            DESKTOP (lg): large, vertically centred — the headline reads over it.
            MOBILE/TABLET: there is no horizontal room, so the cube is smaller and
            sits in the UPPER band, leaving the lower half clear for the headline +
            copy (instead of the cube filling the whole screen behind the text). */}
        <motion.div style={reduced ? undefined : { y: cubeY }} className="absolute inset-0 z-[1] will-change-transform">
          <HeroGlassCube
            className="pointer-events-none absolute inset-0 z-0 flex justify-center items-start pt-[8vh] lg:items-center lg:pt-0"
            // `relative` on mobile/tablet CONSTRAINS the inner Canvas (which is
            // absolute inset-0) to this box, so the cube actually scales down to
            // the box size. `lg:static` lets the Canvas escape to the full-screen
            // ancestor on desktop — keeping the approved large centred cube there.
            boxClassName="relative lg:static aspect-square w-[min(56vw,250px)] sm:w-[min(48vw,380px)] lg:w-[min(80vw,680px)]"
          />
        </motion.div>

        {/* legibility vignette — blends the cube's edges into the pure
            black / white field so the headline always reads */}
        <div
          className="pointer-events-none absolute inset-0 z-[2]"
          style={{
            background: dark
              ? "radial-gradient(125% 95% at 50% 46%, transparent 54%, rgba(0,0,0,0.45))"
              : "radial-gradient(125% 95% at 50% 46%, transparent 58%, rgba(255,255,255,0.45))",
          }}
        />

        <h1 className="sr-only">Generative AI for the autonomous enterprise</h1>

        {/* MOBILE/TABLET: headline + copy flow as one grouped column anchored in
            the lower band (under the cube) so there are no messy overlaps or dead
            gaps. DESKTOP (lg): the wrapper becomes display:contents and each block
            resumes its original absolute position (headline centred, copy bottom). */}
        <div className="absolute inset-0 z-10 flex flex-col justify-end gap-6 px-[var(--pad-x)] pb-[15vh] lg:contents">

        {/* headline */}
        <motion.div
          style={headStyle}
          className="z-10 will-change-transform lg:absolute lg:inset-0 lg:flex lg:flex-col lg:justify-center lg:px-[var(--pad-x)]"
          aria-hidden
        >
          <motion.span
            initial={{ opacity: 0, y: 26, filter: "blur(7px)" }}
            animate={show ? { opacity: 1, y: 0, filter: "blur(0px)" } : { opacity: 0, y: 26, filter: "blur(7px)" }}
            transition={{ duration: reduced ? 0.4 : 0.95, ease: SIG }}
            className="max-w-[13ch] font-display text-[clamp(40px,8.4vw,132px)] font-normal leading-[0.9] tracking-[-0.045em] text-(--color-fg)"
          >
            <span className="block">Generative AI</span>
            <span className="block">
              <em className="headline-shimmer mr-[0.18em] font-serif italic font-normal tracking-[-0.02em]">
                for the
              </em>
              autonomous
            </span>
            <span className="block">enterprise.</span>
          </motion.span>
        </motion.div>

        {/* bottom-left copy + CTAs */}
        <motion.div
          style={copyStyle}
          className="z-10 will-change-transform lg:absolute lg:inset-x-0 lg:bottom-[clamp(28px,6vh,64px)] lg:px-[var(--pad-x)]"
        >
          <motion.div
            initial={{ opacity: 0, y: 18, filter: "blur(6px)" }}
            animate={show ? { opacity: 1, y: 0, filter: "blur(0px)" } : { opacity: 0, y: 18, filter: "blur(6px)" }}
            transition={{ duration: reduced ? 0.4 : 1.0, delay: reduced ? 0.1 : 0.5, ease: SIG }}
            className="max-w-[48ch]"
          >
            <p className="text-[clamp(13px,1.35vw,16px)] font-light leading-relaxed text-(--color-fg-2)">
              Cubixso.ai is the AI-first company building intelligent systems, agentic
              products and enterprise platforms, engineered for scale, impact, and the
              decade that&rsquo;s coming.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 rounded-full bg-(--color-fg) px-6 py-3 text-[14px] font-medium text-(--color-bg) transition-transform duration-300 hover:scale-[1.04]"
              >
                Start the conversation <Ph name="arrow-up-right" weight="light" size={15} />
              </Link>
              <Link
                href="/products"
                className="group relative mono inline-flex items-center gap-2 pb-1.5 text-[12px] tracking-[0.18em] text-(--color-muted) transition-colors hover:text-(--color-fg)"
              >
                EXPLORE PRODUCTS <Ph name="arrow-up-right" weight="light" size={13} />
                {/* neon hover-underline — cobalt gradient, theme-independent */}
                <span className="pointer-events-none absolute inset-x-0 -bottom-px h-px w-3/4 mx-auto bg-gradient-to-r from-transparent via-[var(--color-cobalt)] to-transparent opacity-0 transition-opacity duration-500 ease-in-out group-hover:opacity-100" />
              </Link>
            </div>
          </motion.div>
        </motion.div>
        </div>

        {!reduced && (
          <motion.div
            style={{ opacity: copyOpacity }}
            className="pointer-events-none absolute bottom-6 left-1/2 z-10 -translate-x-1/2 mono text-[10px] tracking-[0.3em] text-(--color-muted)"
          >
            SCROLL ↓
          </motion.div>
        )}
      </div>
    </section>
  );
}
