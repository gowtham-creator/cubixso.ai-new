"use client";

// NotFound404 — clean, minimal 404 (matches the supplied reference): a large
// "404" + a hairline divider + "This page could not be found." centred over the
// void. Theme-aware (reads on black AND white via CSS-var tokens). The layout's
// global Nav already renders above this, so visitors can always navigate away;
// we add an explicit "Back to home" link too for fast recovery. One quiet
// fade-in, disabled under prefers-reduced-motion.

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";

const SIG = [0.16, 1, 0.3, 1] as const;

export function NotFound404() {
  const reduced = useReducedMotion();
  const fade = (delay: number) => ({
    initial: { opacity: 0, y: reduced ? 0 : 12, filter: reduced ? "blur(0px)" : "blur(6px)" },
    animate: { opacity: 1, y: 0, filter: "blur(0px)" },
    transition: reduced ? { duration: 0 } : { duration: 0.8, delay, ease: SIG },
  });

  return (
    <main className="relative z-10 flex min-h-[100svh] flex-col items-center justify-center px-[var(--pad-x)] text-center">
      {/* 404 · divider · message — the reference's clean centred row */}
      <motion.div
        {...fade(0.05)}
        className="flex items-center justify-center gap-5 sm:gap-6"
      >
        <span className="font-display text-[clamp(40px,7vw,64px)] font-semibold leading-none tracking-[-0.03em] text-(--color-fg)">
          404
        </span>
        <span aria-hidden className="h-[clamp(40px,6vw,56px)] w-px bg-(--color-line)" />
        <p className="text-[clamp(15px,1.6vw,20px)] leading-snug text-(--color-fg-2)">
          This page could not be found.
        </p>
      </motion.div>

      {/* Recovery link — proper error handling: always a way back. */}
      <motion.div {...fade(0.18)} className="mt-10">
        <Link
          href="/"
          className="group mono inline-flex min-h-[44px] items-center gap-2 rounded-full border border-(--color-line-2) px-6 py-2.5 text-[12px] tracking-[0.18em] text-(--color-fg-2) transition-colors hover:border-(--color-fg) hover:text-(--color-fg)"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden className="transition-transform group-hover:-translate-x-0.5">
            <path d="M19 12H5" /><path d="m12 19-7-7 7-7" />
          </svg>
          BACK TO HOME
        </Link>
      </motion.div>
    </main>
  );
}
