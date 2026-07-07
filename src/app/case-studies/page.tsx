import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/PageHeader";
import { TiltCaseStudyCard } from "./TiltCard";
import { FinalCTA } from "@/components/sections/FinalCTA";
import { CASE_STUDIES, ARTICLES } from "@/lib/data";

export const metadata: Metadata = {
  title: "Case Studies — Cubixso.ai",
  description:
    "Proof, not promises. Outcomes from production AI across fintech, media, judiciary, education, construction and enterprise — plus insights from the team building it.",
  alternates: { canonical: "/case-studies" },
};

export default function CaseStudiesPage() {
  return (
    <main>
      <PageHeader
        num="02"
        eyebrow="CASE STUDIES"
        title={
          <>
            Proof, not{" "}
            <em
              className="font-serif not-italic italic"
              style={{ letterSpacing: "-0.02em", fontWeight: 400 }}
            >
              promises
            </em>
            .
          </>
        }
        intro="Six systems in production across six sectors — each owned end-to-end, with the outcome to show for it."
      />

      {/* Proof grid */}
      <section className="relative z-10 bg-(--color-bg) px-[var(--pad-x)] py-[clamp(40px,7vh,90px)]">
        <div className="mx-auto w-full max-w-[var(--col-w)]">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {CASE_STUDIES.map((c, i) => (
              <TiltCaseStudyCard key={c.code} index={i} {...c} />
            ))}
          </div>
        </div>
      </section>

      {/* Insights subsection */}
      <section className="relative z-10 bg-(--color-bg) px-[var(--pad-x)] py-[clamp(40px,7vh,90px)] pb-[clamp(80px,12vh,160px)]">
        <div className="mx-auto w-full max-w-[var(--col-w)]">
          <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
            <p className="mono text-[12px] tracking-[0.2em] text-(--color-muted) inline-flex items-center gap-3">
              <span className="text-(--color-muted)">03</span>
              [ INSIGHTS ]
            </p>
            <a
              href="/newsletter"
              className="group mono text-[12px] tracking-[0.16em] text-(--color-fg-2) hover:text-(--color-cobalt-glow) transition-colors inline-flex items-center gap-2"
            >
              GET THESE INSIGHTS IN YOUR INBOX
              <span className="text-(--color-cobalt-glow)">→</span>
              <span className="underline underline-offset-4 decoration-(--color-line-2) group-hover:decoration-(--color-cobalt-glow) transition-colors">
                SUBSCRIBE
              </span>
            </a>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {ARTICLES.map((a) => (
              <a
                key={a.title}
                href="/newsletter"
                className="group flex flex-col rounded-2xl border border-(--color-line) bg-(--color-bg-soft)/40 backdrop-blur-sm p-7 cursor-pointer transition-all duration-500 hover:bg-(--color-bg-soft) hover:border-(--color-line-2) hover:-translate-y-1 focus-visible:outline-2 focus-visible:outline-(--color-accent-2) focus-visible:outline-offset-2"
              >
                <p className="mono text-[11px] tracking-[0.18em] text-(--color-muted)">
                  {a.tag}
                  <span className="text-(--color-muted)">
                    {" · "}
                    {a.date}
                    {" · "}
                    {a.read}
                  </span>
                </p>

                <h3 className="mt-4 font-display text-[clamp(19px,1.5vw,24px)] font-medium tracking-tight text-balance text-(--color-fg)">
                  {a.title}
                </h3>

                <p className="mt-3 text-[14.5px] leading-relaxed text-(--color-fg-2) group-hover:text-(--color-fg-elev) transition-colors">
                  {a.excerpt}
                </p>

                <span className="mt-6 inline-flex items-center gap-1.5 mono text-[11px] tracking-[0.16em] text-(--color-muted) opacity-0 group-hover:opacity-100 transition-opacity">
                  READ
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <path
                      d="M7 17 L17 7 M9 7 L17 7 L17 15"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              </a>
            ))}
          </div>
        </div>
      </section>

      <FinalCTA />
    </main>
  );
}
