"use client";

// PageHeader — the shared hero for standalone routes (/services, /products,
// /industries, /about, /contact). Eyebrow chapter-tag + large display title +
// intro, in the homepage's typographic language but sized as a page-opener.
// Its top padding clears the fixed Nav, so pages render <PageHeader/> first.

import { motion, useReducedMotion } from "framer-motion";
import { ChapterLabel } from "@/components/shared/ChapterLabel";

// Entrance fade. `initial`/`animate` keep a STABLE shape (both always carry a
// defined opacity/y/filter) across every render — only the transition changes
// with reduced-motion. The previous version returned `{}` (or `initial:false`)
// under reduced-motion; when `useReducedMotion()` resolves null→value after the
// first paint, that swapped `initial` out mid-flight and framer animated
// "opacity from undefined" — the flash on the /about + /contact openers. A
// reduced-motion user gets a 0s transition (snaps in, no drift), motion users
// get the eased fade.
function useFade() {
  const reduced = useReducedMotion();
  return (delay: number) => ({
    initial: { opacity: 0, y: reduced ? 0 : 18, filter: reduced ? "blur(0px)" : "blur(6px)" },
    animate: { opacity: 1, y: 0, filter: "blur(0px)" },
    transition: reduced
      ? { duration: 0 }
      : { duration: 0.9, delay, ease: [0.16, 1, 0.3, 1] as const },
  });
}

interface PageHeaderProps {
  /** chapter number, e.g. "01" */
  num: string;
  /** bracketed eyebrow word, e.g. "SERVICES" */
  eyebrow: string;
  title: React.ReactNode;
  intro?: React.ReactNode;
  /** optional right-side visual (e.g. the wireframe globe on /contact). When
      present the opener becomes a two-column layout; the aside is desktop-only. */
  aside?: React.ReactNode;
}

export function PageHeader({ num, eyebrow, title, intro, aside }: PageHeaderProps) {
  const fade = useFade();
  return (
    // Transparent over the void — no opaque fill, so the Aurora gradient field
    // and the VoidCube spine stay alive behind the page-opener type.
    <header className="relative z-10 px-[var(--pad-x)] pt-[clamp(140px,22vh,240px)] pb-[clamp(40px,7vh,90px)]">
      <div className="mx-auto w-full max-w-[var(--col-w)]">
        <div className={aside ? "grid grid-cols-1 items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]" : ""}>
          <div>
            <ChapterLabel num={num} word={eyebrow} />

            <motion.h1
              {...fade(0.1)}
              className="font-display text-[length:var(--text-display-2xl)] leading-[0.9] tracking-[-0.045em] text-balance text-(--color-fg) max-w-5xl"
            >
              {title}
            </motion.h1>

            {intro && (
              <motion.p
                {...fade(0.25)}
                className="mt-8 max-w-prose text-[clamp(15px,1.2vw,18px)] leading-relaxed text-(--color-fg-2)"
              >
                {intro}
              </motion.p>
            )}
          </div>

          {aside && (
            <motion.div
              {...fade(0.4)}
              className="hidden lg:flex justify-end will-change-transform"
            >
              {aside}
            </motion.div>
          )}
        </div>
      </div>
    </header>
  );
}
