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

// TODO: drop in the real profile URLs (placeholders for now).
const SOCIALS = [
  { name: "LinkedIn", icon: "linkedin-logo", href: "https://www.linkedin.com/company/cubixso/" },
  { name: "Instagram", icon: "instagram-logo", href: "https://www.instagram.com/cubixso.ai/" },
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
      <span className="mono text-[11px] tracking-[0.2em] text-(--color-fg-2)">
        {title.toUpperCase()}
      </span>
      {links.map((l) => (
        <Link
          key={l.href}
          href={l.href}
          onPointerEnter={hoverTick}
          className="w-fit text-[16px] font-light text-(--color-fg-2) transition-all duration-300 hover:translate-x-1.5 hover:text-(--color-fg)"
        >
          {l.label}
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
            className="inline-flex w-fit items-center font-display text-[26px] font-semibold tracking-[-0.015em] text-(--color-fg)"
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
              <Ph name={s.icon} weight="regular" size={16} />
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
          © 2026 Cubixso.ai — All rights reserved.
        </span>
        <span className="mono text-[11px] text-(--color-fg-2)">
          17.385°N · 78.486°E — HYDERABAD · IN
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
