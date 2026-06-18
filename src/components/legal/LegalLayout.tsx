"use client";

// LegalLayout — the shared shell for /terms and /privacy. Renders the
// PageHeader hero, then a two-column reading layout: a sticky, numbered
// mono table of contents on the left (anchor links into each section) and
// the legal prose on the right. Calm by design — no scroll motion — and
// respectful of prefers-reduced-motion for the smooth-scroll behavior.

import Link from "next/link";
import { PageHeader } from "@/components/shared/PageHeader";
import { Ph } from "@/components/icons/Ph";
import type { LegalSection } from "@/lib/legal";

interface LegalLayoutProps {
  /** chapter number, e.g. "01" */
  num: string;
  /** bracketed eyebrow word, e.g. "TERMS" */
  eyebrow: string;
  title: React.ReactNode;
  /** short italic disclaimer */
  note: string;
  /** e.g. "Effective 1 June 2026" */
  updated: string;
  sections: readonly LegalSection[];
}

// two-digit label for each section, e.g. 01, 02, …
const two = (i: number) => String(i + 1).padStart(2, "0");

export function LegalLayout({
  num,
  eyebrow,
  title,
  note,
  updated,
  sections,
}: LegalLayoutProps) {
  return (
    <>
      <PageHeader num={num} eyebrow={eyebrow} title={title} />

      <section className="relative z-10 bg-(--color-bg) px-[var(--pad-x)] pb-[clamp(100px,16vh,200px)] pt-[clamp(8px,2vh,24px)]">
        <div className="mx-auto w-full max-w-[var(--col-w)]">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-[220px_1fr] lg:gap-16">
            {/* ── Table of contents ─────────────────────────────────── */}
            <nav
              aria-label="On this page"
              className="lg:sticky lg:top-28 lg:self-start"
            >
              <p className="mono text-(--color-muted-2) mb-5">Contents</p>
              <ol className="flex flex-col gap-2.5">
                {sections.map((s, i) => (
                  <li key={s.id}>
                    <a
                      href={`#${s.id}`}
                      className="group inline-flex items-baseline gap-2.5 mono text-(--color-muted) transition-colors duration-300 hover:text-(--color-fg) focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-(--color-accent-2) rounded-xs"
                    >
                      <span className="text-(--color-muted-2) group-hover:text-(--color-accent-2) transition-colors duration-300">
                        {two(i)}
                      </span>
                      <span className="tracking-[0.04em]">{s.heading}</span>
                    </a>
                  </li>
                ))}
              </ol>
            </nav>

            {/* ── Document body ─────────────────────────────────────── */}
            <div>
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-(--color-line) pb-8">
                <span className="inline-flex items-center rounded-full border border-(--color-line) bg-(--color-bg-soft)/40 backdrop-blur-sm px-4 py-2 mono text-(--color-fg-2)">
                  {updated}
                </span>
                {/* Back to the legal center — the document's one Ph glyph. */}
                <Link
                  href="/legal"
                  className="group inline-flex items-center gap-2 mono text-(--color-muted) transition-colors duration-300 hover:text-(--color-fg) focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-(--color-accent-2) rounded-xs"
                >
                  <Ph
                    name="arrow-left"
                    weight="thin"
                    size={14}
                    className="transition-transform duration-300 group-hover:-translate-x-0.5"
                  />
                  All legal documents
                </Link>
              </div>

              <p className="mt-8 max-w-prose text-[14px] italic leading-relaxed text-(--color-muted)">
                {note}
              </p>

              <div className="mt-4 flex flex-col gap-[clamp(48px,7vh,80px)]">
                {sections.map((s, i) => (
                  <section
                    key={s.id}
                    id={s.id}
                    className="scroll-mt-28"
                  >
                    <p className="mono text-(--color-accent-2) mb-4">{two(i)}</p>
                    <h2 className="font-display text-[length:var(--text-display-md)] leading-[1.0] tracking-[-0.035em] text-balance text-(--color-fg) max-w-[20ch]">
                      {s.heading}
                    </h2>
                    <div className="mt-6 flex flex-col gap-5">
                      {s.body.map((para, j) => (
                        <p
                          key={j}
                          className="max-w-prose text-[clamp(15px,1.05vw,17px)] leading-relaxed text-(--color-fg-2)"
                        >
                          {para}
                        </p>
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
