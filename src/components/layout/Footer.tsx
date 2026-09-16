"use client";

// Footer — Cubixso's site-wide footer in the uilora "grid-footer" language:
// a full-bleed bordered grid (brand · explore · company) with hover-fill cells,
// mono section labels, a big brand headline, and translate-on-hover links, then
// a socials + legal bar and a copyright bar. Below-fold on every page via the
// root layout. Uses the project's CSS-var tokens + offline Ph (Phosphor) icons,
// NOT the component's stock lucide imports (lucide 1.18 omits the brand logos).
// Client component solely for the feedback bus — no state, no effects.

import Link from "next/link";
import { CONTACT } from "@/lib/data";
import { Ph } from "@/components/icons/Ph";
import { tick } from "@/lib/feedback";

// Feedback bus — tick() only on a true mouse hover, so a touch tap never
// stacks tick + click on the same gesture. (Same guard as Nav.tsx.)
const hoverTick = (e: React.PointerEvent) => {
  if (e.pointerType === "mouse") tick();
};

const EXPLORE = [
  { href: "/services", label: "Services" },
  { href: "/products", label: "Products" },
  { href: "/industries", label: "Industries" },
  { href: "/case-studies", label: "Case Studies" },
];

const COMPANY = [
  { href: "/about", label: "About" },
  { href: "/leadership", label: "Leadership" },
  { href: "/collaborators", label: "Collaborators" },
  { href: "/locations", label: "Locations" },
  { href: "/contact", label: "Contact" },
];

// Filled badge marks (rounded square + knocked-out glyph), matching the supplied
// icons. Drawn inline rather than shipped as the 50px PNGs so they stay crisp at
// any size and ride currentColor — a baked black badge would vanish on the dark
// footer and a white one on the light theme.
const LinkedInMark = () => (
  <svg viewBox="0 0 24 24" width="17" height="17" fill="currentColor" aria-hidden>
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M4.8 0h14.4A4.8 4.8 0 0 1 24 4.8v14.4a4.8 4.8 0 0 1-4.8 4.8H4.8A4.8 4.8 0 0 1 0 19.2V4.8A4.8 4.8 0 0 1 4.8 0ZM7.2 9.6H4.32v9.6H7.2V9.6Zm.24-3.12a1.68 1.68 0 1 0-3.36 0 1.68 1.68 0 0 0 3.36 0ZM19.68 13.7c0-2.77-1.48-4.06-3.46-4.06-1.6 0-2.31.88-2.71 1.5V9.6H10.8c.04.82 0 9.6 0 9.6h2.71v-5.36c0-.24.02-.49.09-.66.19-.49.63-.99 1.38-.99.97 0 1.36.74 1.36 1.83v5.18h2.88s.46-4.52.46-5.5Z"
    />
  </svg>
);
const InstagramMark = () => (
  <svg viewBox="0 0 24 24" width="17" height="17" fill="currentColor" aria-hidden>
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M4.8 0h14.4A4.8 4.8 0 0 1 24 4.8v14.4a4.8 4.8 0 0 1-4.8 4.8H4.8A4.8 4.8 0 0 1 0 19.2V4.8A4.8 4.8 0 0 1 4.8 0Zm7.2 5.76a6.24 6.24 0 1 0 0 12.48 6.24 6.24 0 0 0 0-12.48Zm0 2.16a4.08 4.08 0 1 1 0 8.16 4.08 4.08 0 0 1 0-8.16Zm6.72-2.88a1.2 1.2 0 1 0 0 2.4 1.2 1.2 0 0 0 0-2.4Z"
    />
  </svg>
);

const SOCIALS = [
  { name: "LinkedIn", Mark: LinkedInMark, href: "https://www.linkedin.com/company/cubixso/" },
  { name: "Instagram", Mark: InstagramMark, href: "https://www.instagram.com/cubixso.ai/" },
];

const LEGAL = [
  { href: "/legal", label: "Legal" },
  { href: "/terms", label: "Terms" },
  { href: "/privacy", label: "Privacy" },
];

function LinkColumn({ title, links }: { title: string; links: { href: string; label: string }[] }) {
  return (
    <nav
      aria-label={title}
      className="flex flex-col gap-5 p-7 sm:p-10 transition-colors duration-500 hover:bg-white/[0.02]"
    >
      {/* Column headings were 11px regular on --color-fg-2 and read as faint
          grey noise above the links they label. Now semibold, full-strength
          ink, with a short cobalt rule to anchor them. */}
      <span className="mono inline-flex items-center gap-2.5 text-[11px] font-semibold tracking-[0.2em] text-(--color-fg)">
        <span aria-hidden className="h-px w-5 bg-(--color-accent)" />
        {title.toUpperCase()}
      </span>
      {links.map((l) => (
        <Link
          key={l.href}
          href={l.href}
          onPointerEnter={hoverTick}
          // Same swipe-mask fill as the nav pills: a cobalt plate slides UP
          // from below on hover and the label flips to read on it. Classes, not
          // inline transforms — an inline style would beat group-hover.
          className="group/nav relative w-fit overflow-hidden rounded-md px-2 py-1 -ml-2 text-[16px] font-normal text-(--color-fg-2) transition-colors duration-300"
        >
          <span
            aria-hidden
            className="absolute inset-0 rounded-md bg-(--color-accent) translate-y-full transition-transform duration-300 ease-out group-hover/nav:translate-y-0"
          />
          <span className="relative z-10 transition-colors duration-300 group-hover/nav:text-white">
            {l.label}
          </span>
        </Link>
      ))}
    </nav>
  );
}

export function Footer() {
  return (
    <footer className="relative z-10 overflow-hidden border-t border-(--color-line) bg-(--color-bg)/70 backdrop-blur-2xl">
      {/* Hairline grid: a clean Klarheit-style ruled grid. The top border above,
          plus the column dividers below, form thin --color-line verticals +
          horizontals that read on both themes. */}
      {/* Tablets used to jump straight from 1 column to 4 at 768px, which left
          the two link columns ~110px wide and wrapped "Case Studies" mid-word.
          Now: 1 col on phones → 2 on tablets (brand on its own row) → 4 on
          desktop, with the dividers flipping to vertical only at that point. */}
      <div className="grid grid-cols-1 divide-y divide-(--color-line) md:grid-cols-2 lg:grid-cols-4 lg:divide-x lg:divide-y-0">
        {/* Brand + direct contact */}
        <div className="flex flex-col justify-between gap-10 p-7 sm:p-10 transition-colors duration-500 hover:bg-white/[0.02] md:col-span-2 md:gap-12 lg:min-h-[400px]">
          <Link
            href="/"
            onPointerEnter={hoverTick}
            aria-label="Cubixso — back to homepage"
            // Reads as a control, not decoration: explicit pointer, a hover
            // tint and a focus ring. It always routed home; nothing signalled
            // that it was clickable.
            className="group/brand inline-flex w-fit cursor-pointer items-center rounded-md font-display text-[26px] font-semibold tracking-[-0.015em] text-(--color-fg) transition-colors duration-300 hover:text-(--color-accent) focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-(--color-accent-2)"
          >
            {/* Solid ink wordmark — must read in both themes (the aurora gradient
                fades to #fff and vanishes on a light background). */}
            <span className="text-(--color-fg)">Cubixso</span>
            <span className="text-(--color-accent-2)">.</span>
          </Link>

          <div>
            <h2 className="max-w-[16ch] font-display text-[clamp(28px,3.4vw,46px)] font-semibold leading-[1.04] tracking-[-0.02em] text-(--color-fg)">
              Generative AI for the autonomous enterprise.
            </h2>
            <div className="mt-7 flex flex-col gap-1.5 mono text-[12px] text-(--color-fg-2)">
              <a
                href={`mailto:${CONTACT.email}`}
                onPointerEnter={hoverTick}
                className="inline-flex w-fit items-center gap-2 transition-colors hover:text-(--color-fg)"
              >
                <Ph name="envelope-simple" weight="thin" size={14} />
                {CONTACT.email}
              </a>
              <a
                href={`tel:${CONTACT.phone1.replace(/\s/g, "")}`}
                onPointerEnter={hoverTick}
                className="inline-flex w-fit items-center gap-2 transition-colors hover:text-(--color-fg)"
              >
                <Ph name="phone" weight="thin" size={14} />
                {CONTACT.phone1}
              </a>
              <a
                href={`tel:${CONTACT.phone2.replace(/\s/g, "")}`}
                onPointerEnter={hoverTick}
                className="inline-flex w-fit items-center gap-2 transition-colors hover:text-(--color-fg)"
              >
                <Ph name="phone" weight="thin" size={14} />
                {CONTACT.phone2}
              </a>
              <span className="inline-flex items-center gap-2">
                <Ph name="map-pin" weight="thin" size={14} />
                {CONTACT.location}
              </span>
            </div>
          </div>
        </div>

        <LinkColumn title="Explore" links={EXPLORE} />
        <LinkColumn title="Company" links={COMPANY} />
      </div>

      {/* Socials + legal bar */}
      <div className="flex flex-col gap-6 border-t border-(--color-line) px-7 py-6 sm:px-10 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
          {SOCIALS.map((s) => (
            <a
              key={s.name}
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              onPointerEnter={hoverTick}
              aria-label={s.name}
              className="group/link inline-flex items-center gap-1.5 mono text-[12px] text-(--color-fg-2) transition-colors hover:text-(--color-fg)"
            >
              <s.Mark />
              <span>{s.name}</span>
              <Ph
                name="arrow-up-right"
                weight="regular"
                size={12}
                className="opacity-0 transition-opacity group-hover/link:opacity-100"
              />
            </a>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3 mono text-[11px] text-(--color-fg-2)">
          {LEGAL.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onPointerEnter={hoverTick}
              className="transition-colors hover:text-(--color-fg)"
            >
              {l.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Copyright bar */}
      <div className="flex flex-col gap-2 border-t border-(--color-line) px-7 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-10">
        <span className="mono text-[11px] text-(--color-fg-2)">
          © 2026 Cubixso Solutions Private Limited — All rights reserved.
        </span>
        {/* WeWork RMZ Spire, Hyderabad — exact coordinates supplied by the
            client (17.43302345275879, 78.38460540771484), rounded to 4dp.
            Replaces the old 17.385/78.486, which pointed at central Hyderabad
            (Abids) rather than the office. */}
        <span className="mono text-[11px] text-(--color-fg-2)">
          17.4330°N · 78.3846°E — HYDERABAD · IN
        </span>
      </div>

      {/* Large gradient brand wordmark — the ONE allowed gradient-text moment.
          Bottom-aligned and slightly clipped (negative bottom margin) like the
          Klarheit reference. Theme-adaptive via CSS vars: DARK leans bright
          (cobalt-glow → cobalt → deep-blue) to pop on the near-black void;
          LIGHT resolves to dark ink (cobalt → deep-blue, both dark colors) so
          it never washes out on white. The ancestor variant retargets the
          stops when html[data-theme="light"] is set by the ThemeProvider.

          CENTRED via text-center on the wrapper + inline-block on the span.
          inline-block matters: as a full-width block the gradient painted
          across the whole footer, so centring the glyphs would have parked them
          in the middle of the ramp and thrown away the light-to-deep range.
          Shrink-wrapped, the gradient maps to the wordmark itself. The 0.04em
          paddingLeft cancels the trailing letter-space (tracking applies after
          every glyph, including the last), which would otherwise leave the
          wordmark reading a hair left of true centre. */}
      <div
        aria-hidden
        className="pointer-events-none select-none overflow-hidden border-t border-(--color-line) px-4 pt-6 text-center"
      >
        <span
          className="inline-block bg-clip-text font-display font-semibold leading-[0.78] tracking-[-0.04em] text-transparent [-webkit-background-clip:text] [background-image:linear-gradient(100deg,var(--color-cobalt-glow),var(--color-cobalt)_45%,var(--color-deep-blue))] [html[data-theme=light]_&]:[background-image:linear-gradient(100deg,var(--color-cobalt),var(--color-deep-blue)_60%,var(--color-cobalt))]"
          style={{ fontSize: "clamp(72px, 19vw, 320px)", marginBottom: "-0.14em", paddingLeft: "0.04em" }}
        >
          Cubixso
        </span>
      </div>
    </footer>
  );
}
