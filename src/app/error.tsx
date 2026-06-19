"use client";

// error — page-level safety net. Catches errors thrown in a route's content
// subtree (a Hero/section 3D scene, a data hiccup) and shows a branded recovery
// UI INSIDE the normal chrome (Nav stays above) instead of white-screening.
// Theme-aware via the same CSS-var tokens as the rest of the site.

import Link from "next/link";

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="relative z-10 flex min-h-[100svh] flex-col items-center justify-center px-[var(--pad-x)] text-center">
      <div className="font-display text-[clamp(32px,5vw,52px)] font-semibold leading-[1.05] tracking-[-0.03em] text-(--color-fg)">
        Something went wrong
      </div>
      <p className="mt-4 max-w-prose text-[clamp(15px,1.4vw,18px)] leading-relaxed text-(--color-fg-2)">
        This part of the page hit an unexpected error. Try again, or head back home.
      </p>
      <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
        <button
          onClick={() => reset()}
          className="mono min-h-[44px] rounded-full bg-(--color-cobalt) px-7 py-2.5 text-[12px] tracking-[0.14em] text-white transition-transform hover:-translate-y-0.5"
        >
          TRY AGAIN
        </button>
        <Link
          href="/"
          className="mono inline-flex min-h-[44px] items-center rounded-full border border-(--color-line-2) px-7 py-2.5 text-[12px] tracking-[0.14em] text-(--color-fg-2) transition-colors hover:border-(--color-fg) hover:text-(--color-fg)"
        >
          BACK TO HOME
        </Link>
      </div>
    </main>
  );
}
