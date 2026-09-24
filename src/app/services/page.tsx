import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/shared/PageHeader";
import { FinalCTA } from "@/components/sections/FinalCTA";
import { FieldIndex } from "@/components/services/FieldIndex";
import { SpecEntry } from "@/components/services/SpecEntry";
import { ENGAGEMENT, SHIFTS, STACK, STANDARDS, TRACKS, type Track } from "@/lib/services";

// /services — a technical field guide rather than a brochure.
//
// The previous page was six one-line cards and a "why us" block of generic
// tags ("Battle-tested results", "Scalable solutions"): too brief for a buyer to
// act on, and exactly the buzzword grid PRODUCT.md lists as an anti-reference.
// This version answers what a lead actually asks: what each service is, how it
// is built, what goes wrong and how it is prevented, what they receive, and
// where it already runs. All copy lives in src/lib/services.ts.

export const metadata: Metadata = {
  title: "Services — Cubixso.ai",
  description:
    "A field guide to Cubixso's AI services: agent harness engineering, agentic loops, evals, MCP, RAG, LLMOps, AI products, workflow automation, and AI storytelling and film pipelines.",
  alternates: { canonical: "/services" },
};

function SectionHeading({ id, kicker, title, lead }: { id: string; kicker?: string; title: React.ReactNode; lead?: string }) {
  return (
    <div id={id} className="scroll-mt-32">
      {kicker ? <p className="mono text-[12px] text-(--color-accent-2)">{kicker}</p> : null}
      <h2 className="mt-3 font-display text-[length:var(--text-display-md)] leading-[1.02] tracking-[-0.035em] text-balance text-(--color-fg)">
        {title}
      </h2>
      {lead ? <p className="mt-5 max-w-[62ch] text-[17px] leading-relaxed text-(--color-fg-2)">{lead}</p> : null}
    </div>
  );
}

function Shifts() {
  return (
    <section aria-labelledby="shifts-title" className="pb-[clamp(56px,8vw,112px)]">
      <SectionHeading
        id="shifts"
        title={<span id="shifts-title">What changed in 2026</span>}
        lead="Six shifts that changed what a good AI build looks like, and what each one means when you are choosing who builds yours."
      />
      <div className="mt-10 border-t border-(--color-line)">
        <div className="hidden grid-cols-[minmax(160px,0.8fr)_1.6fr_1.2fr] gap-8 border-b border-(--color-line) py-3 text-[12px] text-(--color-muted) md:grid">
          <p>Shift</p>
          <p>What changed</p>
          <p>What it means for you</p>
        </div>
        <ul>
          {SHIFTS.map((s) => (
            <li
              key={s.shift}
              className="grid gap-2 border-b border-(--color-line) py-6 md:grid-cols-[minmax(160px,0.8fr)_1.6fr_1.2fr] md:gap-8"
            >
              <p className="text-[16px] font-semibold text-(--color-fg)">{s.shift}</p>
              <p className="text-[15px] leading-relaxed text-(--color-fg-2)">{s.changed}</p>
              <p className="text-[15px] leading-relaxed text-(--color-fg)">
                <span className="text-(--color-muted) md:hidden">For you: </span>
                {s.meaning}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function TrackSection({ track: t }: { track: Track }) {
  return (
    <section aria-labelledby={`${t.id}-title`} className="pb-[clamp(56px,8vw,112px)]">
      <div id={t.id} className="scroll-mt-32 grid gap-6 border-t-2 border-(--color-fg) pt-8 lg:grid-cols-12 lg:gap-10">
        <p className="mono text-[clamp(56px,7vw,112px)] leading-[0.85] text-(--color-line-2) lg:col-span-2" aria-hidden>
          {t.letter}
        </p>
        <div className="lg:col-span-10">
          <p className="text-[13px] text-(--color-accent-2)">
            Track {t.letter} · {t.audience}
          </p>
          <h2
            id={`${t.id}-title`}
            className="mt-2 font-display text-[length:var(--text-display-lg)] leading-[0.95] tracking-[-0.04em] text-balance text-(--color-fg)"
          >
            {t.name}
          </h2>
          <p className="mt-5 max-w-[62ch] text-[17px] leading-relaxed text-(--color-fg-2)">{t.intro}</p>
        </div>
      </div>

      <div className="mt-8">
        {t.practices.map((p) => (
          <SpecEntry key={p.id} practice={p} />
        ))}
      </div>

      <div className="flex flex-col gap-4 border-t border-(--color-line) pt-8 sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-[48ch] text-[16px] text-(--color-fg-2)">
          {t.letter === "A"
            ? "Bring the system you need to build. We will scope it honestly, including what should not be automated."
            : "Bring the product or the story. We will tell you what is real today, and build it."}
        </p>
        <Link
          href={t.cta.href}
          className="tap-target inline-flex items-center justify-center gap-2 rounded-full bg-(--color-accent) px-6 py-3 text-[15px] font-semibold text-[oklch(0.99_0.005_265)] transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-0.5"
        >
          {t.cta.label}
          <span aria-hidden>→</span>
        </Link>
      </div>
    </section>
  );
}

function Engagement() {
  return (
    <section aria-labelledby="engagement-title" className="pb-[clamp(56px,8vw,112px)]">
      <SectionHeading
        id="engagement"
        title={<span id="engagement-title">How an engagement runs</span>}
        lead="Honest scoping, real timelines. We hand you a system, not a notebook."
      />
      <ol className="mt-10 grid gap-px overflow-hidden rounded-xl border border-(--color-line) bg-(--color-line) sm:grid-cols-2 lg:grid-cols-4">
        {ENGAGEMENT.map((e) => (
          <li key={e.step} className="bg-(--color-bg) p-6">
            <p className="mono text-[clamp(32px,3.4vw,48px)] leading-none text-(--color-line-2)">{e.step}</p>
            <h3 className="mt-6 text-[18px] font-semibold text-(--color-fg)">{e.name}</h3>
            <p className="mt-2 text-[14px] leading-relaxed text-(--color-fg-2)">{e.body}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}

function Stack() {
  return (
    <section aria-labelledby="stack-title">
      <SectionHeading id="stack" title={<span id="stack-title">Stack and standards</span>} />
      <div className="mt-10 grid gap-12 lg:grid-cols-12">
        <dl className="border-t border-(--color-line) lg:col-span-8">
          {STACK.map((s) => (
            <div key={s.area} className="grid gap-1 border-b border-(--color-line) py-5 sm:grid-cols-[180px_1fr] sm:gap-8">
              <dt className="text-[15px] font-semibold text-(--color-fg)">{s.area}</dt>
              <dd className="text-[15px] leading-relaxed text-(--color-fg-2)">{s.detail}</dd>
            </div>
          ))}
        </dl>
        <div className="lg:col-span-4">
          <p className="text-[13px] text-(--color-muted)">Standards we hold on every engagement</p>
          <ul className="mt-4 space-y-3">
            {STANDARDS.map((s) => (
              <li key={s} className="flex gap-3 text-[16px] leading-snug text-(--color-fg)">
                <span aria-hidden className="mt-[9px] h-1.5 w-1.5 shrink-0 rounded-full bg-(--color-accent-2)" />
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

export default function ServicesPage() {
  return (
    <main>
      <PageHeader
        num="01"
        eyebrow="SERVICES"
        title={
          <>
            How we build AI that{" "}
            <em className="font-serif not-italic italic" style={{ letterSpacing: "-0.02em", fontWeight: 400 }}>
              ships
            </em>
            .
          </>
        }
        intro="A field guide to our services: what each one is, how we build it, the failure modes we design against, and where it already runs. Two tracks, one for enterprise systems and one for products and creative work."
      />

      <div className="relative z-10 px-[var(--pad-x)] pb-[clamp(64px,10vh,128px)]">
        <div className="mx-auto w-full max-w-[var(--col-w)]">
          <FieldIndex variant="chips" />
          <div className="mt-10 grid gap-16 xl:grid-cols-[200px_minmax(0,1fr)]">
            {/* Rail only exists at xl; below that an empty grid item would still
                take a 64px row gap before the content. */}
            <aside className="hidden xl:block">
              <FieldIndex variant="rail" />
            </aside>
            <div className="min-w-0">
              <Shifts />
              {TRACKS.map((t) => (
                <TrackSection key={t.id} track={t} />
              ))}
              <Engagement />
              <Stack />
            </div>
          </div>
        </div>
      </div>

      <FinalCTA />
    </main>
  );
}
