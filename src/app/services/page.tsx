import type { Metadata } from "next";
import Link from "next/link";
import { FinalCTA } from "@/components/sections/FinalCTA";
import { ChapterLabel } from "@/components/shared/ChapterLabel";
import { Reveal } from "@/components/scroll/Reveal";
import { Catalogue } from "@/components/services/Catalogue";
import { EngagementPipeline } from "@/components/services/EngagementPipeline";
import { ServiceChapter } from "@/components/services/ServiceChapter";
import { ALL_SERVICES, SERVICE_GROUPS, SHIFTS, STACK, STANDARDS } from "@/lib/services";

// /services — the service catalogue.
//
// A services page has one job: show everything Cubixso provides, then answer a
// lead's questions about each. So the whole catalogue comes first (every
// service, grouped, with a live preview), and each service then gets a full
// chapter: a real product screen or a diagram of how it works, what we build,
// use cases, deliverables, failure modes, stack and proof. Context about the
// field and how we work comes after the services, not before them.
// All copy lives in src/lib/services.ts.

export const metadata: Metadata = {
  title: "Services — Cubixso.ai",
  description:
    "Eleven AI services: agentic systems, agent harness engineering, voice agents, RAG and knowledge systems, document intelligence, AI storytelling and film pipelines, full-scale AI products, workflow automation, MCP integration, evals and LLMOps.",
  alternates: { canonical: "/services" },
};

const wrap = "relative z-10 px-[var(--pad-x)]";
const col = "mx-auto w-full max-w-[var(--col-w)]";

function CtaButton({ children }: { children: React.ReactNode }) {
  return (
    <Link
      href="/contact"
      className="tap-target inline-flex items-center justify-center gap-2 rounded-full bg-(--color-accent) px-6 py-3.5 text-[15px] font-semibold text-[oklch(0.99_0.005_265)] transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-0.5 active:scale-[0.98]"
    >
      {children}
      <span aria-hidden>→</span>
    </Link>
  );
}

export default function ServicesPage() {
  const count = ALL_SERVICES.length;
  const words = ["Zero", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve"];

  return (
    <main className="svc-theme">
      {/* ── Opener ─────────────────────────────────────────────────────── */}
      <header className={`${wrap} pt-[clamp(140px,20vh,220px)] pb-[clamp(40px,6vh,80px)]`}>
        <div className={col}>
          <ChapterLabel num="01" word="SERVICES" />
          <Reveal direction="up" as="div">
            <h1 className="font-display text-[length:var(--text-display-xl)] leading-[0.92] tracking-[-0.045em] text-balance text-(--color-fg) max-w-[14ch]">
              {words[count] ?? count} ways we put AI{" "}
              <em className="font-serif not-italic italic" style={{ letterSpacing: "-0.02em", fontWeight: 400 }}>
                to work
              </em>
              .
            </h1>
          </Reveal>
          <div className="mt-10 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <p className="max-w-[58ch] text-[clamp(17px,1.35vw,20px)] leading-relaxed text-(--color-fg-2)">
              From agents that act, to knowledge systems that cite their sources, to pipelines that turn a script into film.
              Every service below sets out what we build, what it guards against, what you receive, and where it already runs.
            </p>
            <CtaButton>Book a scoping call</CtaButton>
          </div>
        </div>
      </header>

      {/* ── The catalogue ──────────────────────────────────────────────── */}
      <section aria-label="All services" className={`${wrap} pb-[clamp(72px,10vw,140px)]`}>
        <div className={col}>
          <Catalogue />
        </div>
      </section>

      {/* ── One chapter per service, grouped ───────────────────────────── */}
      <div className={wrap}>
        <div className={col}>
          {SERVICE_GROUPS.map((g, gi) => {
            const offset = SERVICE_GROUPS.slice(0, gi).reduce((n, x) => n + x.services.length, 0);
            return (
              <section key={g.id} aria-labelledby={`group-${g.id}`} className="pt-[clamp(40px,6vw,80px)]">
                <div className="flex flex-col gap-3 border-t-2 border-(--color-fg) pt-6 sm:flex-row sm:items-baseline sm:justify-between">
                  <h2 id={`group-${g.id}`} className="font-display text-[length:var(--text-display-md)] leading-none tracking-[-0.035em] text-(--color-fg)">
                    {g.name}
                  </h2>
                  <p className="text-[15px] text-(--color-fg-2)">
                    {g.line} <span className="mono ml-2 text-(--color-muted)">{String(g.services.length).padStart(2, "0")} services</span>
                  </p>
                </div>
                {g.services.map((s, i) => (
                  <ServiceChapter key={s.id} service={s} groupName={g.name} flip={(offset + i) % 2 === 1} />
                ))}
              </section>
            );
          })}
        </div>
      </div>

      {/* ── Why now ────────────────────────────────────────────────────── */}
      <section aria-labelledby="shifts-title" className={`${wrap} pt-[clamp(72px,10vw,140px)]`}>
        <div className={col}>
          <div>
            <h2 id="shifts-title" className="font-display text-[length:var(--text-display-md)] leading-[1.02] tracking-[-0.035em] text-balance text-(--color-fg)">
              Built for how AI works in 2026
            </h2>
            <p className="mt-5 max-w-[60ch] text-[17px] leading-relaxed text-(--color-fg-2)">
              Six shifts changed what a good AI build looks like. Each one is already inside the services above.
            </p>
          </div>
          <ol className="mt-12 grid gap-px overflow-hidden rounded-3xl border border-(--color-line) bg-(--color-line) sm:grid-cols-2 lg:grid-cols-3">
            {SHIFTS.map((s, i) => (
              <li key={s.shift} className="bg-(--color-bg) p-7 sm:p-8">
                <p className="mono text-[12px] text-(--svc-ink)">{String(i + 1).padStart(2, "0")} · {s.shift}</p>
                <p className="mt-5 text-[18px] leading-snug text-(--color-fg)">{s.changed}</p>
                <p className="mt-4 text-[14px] leading-relaxed text-(--color-fg-2)">{s.meaning}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ── How we work ────────────────────────────────────────────────── */}
      <section aria-labelledby="engagement-title" className={`${wrap} pt-[clamp(72px,10vw,140px)]`}>
        <div className={col}>
          <div>
            <h2 id="engagement-title" className="font-display text-[length:var(--text-display-md)] leading-[1.02] tracking-[-0.035em] text-balance text-(--color-fg)">
              How an engagement runs
            </h2>
            <p className="mt-5 max-w-[60ch] text-[17px] leading-relaxed text-(--color-fg-2)">
              Honest scoping, real timelines. We hand you a system, not a notebook.
            </p>
          </div>
          <EngagementPipeline />
        </div>
      </section>

      {/* ── Stack and standards ────────────────────────────────────────── */}
      <section aria-labelledby="stack-title" className={`${wrap} pt-[clamp(72px,10vw,140px)] pb-[clamp(72px,10vw,140px)]`}>
        <div className={col}>
          <h2 id="stack-title" className="font-display text-[length:var(--text-display-md)] leading-[1.02] tracking-[-0.035em] text-(--color-fg)">
            Stack and standards
          </h2>
          <div className="mt-12 grid gap-12 lg:grid-cols-12">
            <dl className="border-t border-(--color-line) lg:col-span-8">
              {STACK.map((s) => (
                <div key={s.area} className="grid gap-1 border-b border-(--color-line) py-5 sm:grid-cols-[200px_1fr] sm:gap-8">
                  <dt className="text-[16px] font-semibold text-(--color-fg)">{s.area}</dt>
                  <dd className="text-[16px] leading-relaxed text-(--color-fg-2)">{s.detail}</dd>
                </div>
              ))}
            </dl>
            <div className="lg:col-span-4">
              <p className="text-[13px] font-semibold text-(--color-muted)">On every engagement</p>
              <ul className="mt-4 space-y-4">
                {STANDARDS.map((s) => (
                  <li key={s} className="flex gap-3 text-[18px] leading-snug text-(--color-fg)">
                    <span aria-hidden className="mt-[10px] h-1.5 w-1.5 shrink-0 rounded-full bg-(--color-accent-2)" />
                    {s}
                  </li>
                ))}
              </ul>
              <div className="mt-10">
                <CtaButton>Start a project</CtaButton>
              </div>
            </div>
          </div>
        </div>
      </section>

      <FinalCTA />
    </main>
  );
}
