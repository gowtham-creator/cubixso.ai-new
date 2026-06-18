"use client";

// Work — 05 · PRODUCTS — the screenshot gallery, over the living void.
//
// REBUILT (Cobalt Aperture): the heavy 3D preview blob + floating PhotoStack
// card-stacks are GONE. Each product is now a real screenshot CARD on an
// edge-framed Tier-2 LiquidGlass slab:
//   • The WHOLE card is a link to the product URL (new tab) — except
//     "coming soon" entries, which are non-interactive and wear a COMING SOON
//     pill instead of a live affordance.
//   • Screenshots are local /public files via next/image (no remotePatterns
//     config needed — that only governs remote hosts).
//   • Hover → subtle lift + an "EXPLORE ↗" affordance (Ph arrow-up-right).
//   • A second "Collaborative Products" subsection sits below the mains.
//
// Theme-adaptive + readable in BOTH light and dark: copy rides full-contrast
// tokens (--color-fg / --color-fg-2 / --color-muted), never a low-contrast
// gradient fade, and never overlaps the screenshot (image and text are in
// separate rows of the card). Motion is transform/opacity only (GPU) and the
// hover lift is reduced-motion safe. The ChapterLabel + section intro are kept.

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { cn } from "@/lib/cn";
import { ChapterLabel } from "@/components/shared/ChapterLabel";
import { LiquidGlass } from "@/components/glass/LiquidGlass";
import { Reveal } from "@/components/scroll/Reveal";
import { Ph } from "@/components/icons/Ph";

// ── Roster ───────────────────────────────────────────────────────────────────
// Self-contained so the shared PRODUCTS export (consumed by WorkPreview /
// CASE_STUDIES / Hero) stays untouched. `href`/`image` absent ⇒ "coming soon".
type Product = {
  code: string;
  name: string;
  tag: string;
  body: string;
  href?: string;
  image?: string;
  comingSoon?: boolean;
};

const MAIN_PRODUCTS: Product[] = [
  {
    code: "LG/01",
    name: "Logic Gen",
    tag: "FINTECH",
    body: "Extracts rules from legacy policy docs to DMN, FICO, Python.",
    href: "https://logic-gen-website.vercel.app",
    image: "/products/logic-gen.jpg",
  },
  {
    code: "AF/02",
    name: "Aumic Flow AI",
    tag: "MEDIA",
    body: "Indian story and script engine across every dialect and language.",
    href: "https://aumicflow-website.vercel.app",
    image: "/products/aumic-flow.jpg",
  },
  {
    code: "NX/03",
    name: "NXT School ERP",
    tag: "EDUCATION",
    body: "End-to-end school operations + intelligence.",
    href: "https://www.nxtschools.com",
    image: "/products/nxt-school.jpg",
  },
  {
    code: "SL/04",
    name: "Sliyp AI",
    tag: "RETAIL",
    body: "AI commerce / checkout intelligence.",
    href: "https://sliyp-website.vercel.app",
    image: "/products/sliyp.jpg",
  },
  {
    code: "LG/05",
    name: "Law GPT",
    tag: "JUDICIARY",
    body: "Distributed RAG over legal PDFs for real-time retrieval.",
    comingSoon: true,
  },
];

const COLLAB_PRODUCTS: Product[] = [
  {
    code: "NX/01",
    name: "Nox AI",
    tag: "VOICE",
    body: "Agentic calling platform & agent.",
    comingSoon: true,
    // Logo may not exist yet — handled with a graceful text-mark fallback.
    image: "/products/nox-ai.png",
  },
  {
    code: "RZ/02",
    name: "Resumize AI",
    tag: "CAREERS",
    body: "Real-time, use-case-format resume generation.",
    href: "https://resumize.in",
    image: "/products/resumize.jpg",
  },
  {
    code: "AIG/03",
    name: "AIG API System",
    tag: "DIAMONDS",
    body: "DRC & API system for diamond vendors.",
    comingSoon: true,
  },
];

export function Work({ bare = false }: { bare?: boolean } = {}) {
  return (
    <section
      id="work"
      className="relative z-10 px-[var(--pad-x)] py-[clamp(56px,8vh,112px)]"
    >
      <div className="mx-auto w-full max-w-[var(--col-w)]">
        {/* Section header — a refractive focal slab over the void, ringed by a
            void gutter. (THE one allowed shadow per section.) */}
        {!bare && (
          <div className="mb-16 max-w-3xl">
            <Reveal direction="up">
              <LiquidGlass tier="panel" focal className="p-[clamp(20px,3vw,40px)]">
                <ChapterLabel num="05" word="PRODUCTS" />
                <h2 className="mt-6 font-display text-[length:var(--text-display-lg)] leading-[0.95] tracking-[-0.035em] text-balance text-(--color-fg)">
                  Purpose-built AI,<br />
                  <em
                    className="font-serif not-italic italic"
                    style={{ letterSpacing: "-0.02em", fontWeight: 400 }}
                  >
                    ready to deploy.
                  </em>
                </h2>
                <p className="mt-6 max-w-prose text-[clamp(15px,1.1vw,17px)] leading-relaxed text-(--color-fg-2)">
                  Standalone products, live in production. No custom build
                  required — open one and see it run.
                </p>
              </LiquidGlass>
            </Reveal>
          </div>
        )}

        {/* ── Main products grid ─────────────────────────────────────────── */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {MAIN_PRODUCTS.map((p, i) => (
            <Reveal key={p.code} direction="up" delay={i * 0.06}>
              <ProductCard product={p} priority={i < 2} />
            </Reveal>
          ))}
        </div>

        {/* ── Collaborative products subsection ──────────────────────────── */}
        <div className="mt-20">
          <Reveal direction="up">
            <div className="mb-8 flex items-baseline gap-4">
              <h3 className="font-display text-[clamp(22px,2.4vw,32px)] leading-tight tracking-[-0.025em] text-(--color-fg)">
                Collaborative Products
              </h3>
              <span className="mono text-[12px] tracking-[0.14em] text-(--color-muted)">
                BUILT WITH PARTNERS
              </span>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {COLLAB_PRODUCTS.map((p, i) => (
              <Reveal key={p.code} direction="up" delay={i * 0.06}>
                <ProductCard product={p} />
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ── ProductCard ────────────────────────────────────────────────────────────
// The whole card is the link target (when live). Image and copy live in
// separate stacked rows — text NEVER overlaps the screenshot. Hover lifts the
// card and surfaces the EXPLORE affordance. Coming-soon cards render the same
// shell, non-interactive, with a COMING SOON pill.

function ProductCard({
  product,
  priority = false,
}: {
  product: Product;
  priority?: boolean;
}) {
  const live = !product.comingSoon && Boolean(product.href);

  const card = (
    <LiquidGlass
      tier="panel"
      as="article"
      className={cn(
        "group relative flex h-full flex-col overflow-hidden p-0",
        "transition-transform duration-300 will-change-transform",
        live && "motion-safe:group-hover/link:-translate-y-1",
      )}
    >
      {/* Visual — fixed 16:10 frame so the grid stays even regardless of the
          underlying screenshot aspect. */}
      <div className="relative aspect-[16/10] w-full overflow-hidden border-b border-(--color-line) bg-(--color-bg-soft)">
        <ProductVisual product={product} priority={priority} />

        {/* Top-meta overlay — sits on the image's own scrim band, kept legible
            by the gradient under it (not over body copy). */}
        <div className="pointer-events-none absolute inset-x-0 top-0 z-[2] flex items-center justify-between p-4">
          <span className="mono rounded-full bg-black/45 px-2.5 py-1 text-[11px] tracking-[0.12em] text-white backdrop-blur-sm">
            {product.code}
          </span>
          {product.comingSoon ? (
            <span className="mono rounded-full border border-(--color-accent) bg-black/45 px-2.5 py-1 text-[11px] tracking-[0.12em] text-(--color-accent-2) backdrop-blur-sm">
              COMING SOON
            </span>
          ) : (
            <span className="mono rounded-full bg-black/45 px-2.5 py-1 text-[11px] tracking-[0.12em] text-white backdrop-blur-sm">
              {product.tag}
            </span>
          )}
        </div>
      </div>

      {/* Copy row — full-contrast tokens, never overlapping the image. */}
      <div className="flex flex-1 flex-col p-6">
        <div className="flex items-start justify-between gap-3">
          <h4 className="font-display text-[clamp(20px,1.8vw,26px)] leading-tight tracking-[-0.02em] text-(--color-fg)">
            {product.name}
          </h4>
          {live && (
            <span
              aria-hidden
              className="mt-1 inline-flex shrink-0 items-center gap-1.5 text-(--color-muted) transition-all duration-300 motion-safe:-translate-x-1 motion-safe:opacity-0 motion-safe:group-hover/link:translate-x-0 motion-safe:group-hover/link:opacity-100"
            >
              <span className="mono text-[11px] tracking-[0.12em]">EXPLORE</span>
              <Ph name="arrow-up-right" weight="bold" size={15} />
            </span>
          )}
        </div>
        <p className="mt-2 text-[14px] leading-relaxed text-(--color-fg-2)">
          {product.body}
        </p>
      </div>
    </LiquidGlass>
  );

  if (live) {
    return (
      <a
        href={product.href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`${product.name} — open product (new tab)`}
        className="group/link block h-full rounded-[18px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-accent-2)"
      >
        {card}
      </a>
    );
  }

  // Coming soon — same shell, non-interactive.
  return <div className="block h-full">{card}</div>;
}

// ── ProductVisual ────────────────────────────────────────────────────────────
// Renders the local screenshot via next/image. If the asset is missing (e.g.
// nox-ai.png not yet shipped), `onError` swaps to a styled text mark so the
// card never shows a broken image. Coming-soon screenshots still render when
// present; otherwise the text mark fills the frame.

function ProductVisual({
  product,
  priority,
}: {
  product: Product;
  priority: boolean;
}) {
  const initials = product.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 3)
    .toUpperCase();

  const [errored, setErrored] = useState(false);
  const showImage = Boolean(product.image) && !errored;

  if (!showImage) {
    return (
      <div className="absolute inset-0 grid place-items-center bg-[linear-gradient(135deg,color-mix(in_oklab,var(--color-accent)_22%,var(--color-bg-soft)),var(--color-bg-soft))]">
        <span className="font-display text-[clamp(28px,5vw,44px)] tracking-tight text-(--color-fg)">
          {initials}
        </span>
        <motion.span
          aria-hidden
          className="pointer-events-none absolute inset-0 z-[1]"
          style={{
            background:
              "radial-gradient(120% 80% at 50% -10%, color-mix(in oklab, var(--color-accent-2) 16%, transparent), transparent 60%)",
          }}
        />
      </div>
    );
  }

  return (
    <>
      <Image
        src={product.image as string}
        alt={`${product.name} product screenshot`}
        fill
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        priority={priority}
        onError={() => setErrored(true)}
        className="object-cover object-top transition-transform duration-500 motion-safe:group-hover/link:scale-[1.04]"
      />
      {/* Scrim under the top-meta chips so code/tag stay legible on any shot. */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 z-[1] h-20 bg-[linear-gradient(180deg,rgba(0,0,0,0.42),transparent)]"
      />
    </>
  );
}
