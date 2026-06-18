import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/shared/PageHeader";
import { FinalCTA } from "@/components/sections/FinalCTA";
import { Ph } from "@/components/icons/Ph";

export const metadata: Metadata = {
  title: "Legal — Cubixso.ai",
  description:
    "Cubixso.ai's legal center — read our Terms & Conditions and Privacy Policy, and reach our team for any legal inquiries.",
};

const DOCS = [
  {
    href: "/terms",
    label: "01",
    title: "Terms & Conditions",
    desc: "The agreement governing access to and use of our websites, platforms, and professional services.",
  },
  {
    href: "/privacy",
    label: "02",
    title: "Privacy Policy",
    desc: "How we collect, use, safeguard, and share information — including AI and model data handling.",
  },
] as const;

export default function LegalPage() {
  return (
    <main>
      <PageHeader
        num="00"
        eyebrow="LEGAL"
        title={
          <>
            The{" "}
            <em
              className="font-serif not-italic italic"
              style={{ letterSpacing: "-0.02em", fontWeight: 400 }}
            >
              fine
            </em>{" "}
            print.
          </>
        }
        intro="The policies that govern how we work with you and handle your data — written plainly, kept current."
      />

      <section className="relative z-10 bg-(--color-bg) px-[var(--pad-x)] py-[clamp(40px,8vh,96px)]">
        <div className="mx-auto w-full max-w-[var(--col-w)]">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
            {DOCS.map((d) => (
              <Link
                key={d.href}
                href={d.href}
                className="group relative flex min-h-[260px] flex-col justify-between overflow-hidden rounded-2xl border border-(--color-line) bg-(--color-bg-soft)/40 backdrop-blur-sm p-8 transition-all duration-500 hover:bg-(--color-bg-soft) hover:border-(--color-line-2) hover:-translate-y-1 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-(--color-accent-2)"
              >
                <span className="mono text-(--color-muted-2) group-hover:text-(--color-accent-2) transition-colors duration-300">
                  {d.label}
                </span>

                <div>
                  <h2 className="font-display text-[clamp(24px,2.4vw,38px)] font-medium leading-[1.05] tracking-[-0.03em] text-(--color-fg)">
                    {d.title}
                  </h2>
                  <p className="mt-4 max-w-[44ch] text-[14.5px] leading-relaxed text-(--color-fg-2) group-hover:text-(--color-fg-elev) transition-colors duration-300">
                    {d.desc}
                  </p>

                  <span className="mt-6 inline-flex items-center gap-2 mono text-(--color-muted) group-hover:text-(--color-fg) transition-colors duration-300">
                    Read
                    <Ph
                      name="arrow-right"
                      weight="thin"
                      size={15}
                      className="transition-transform duration-300 group-hover:translate-x-0.5"
                    />
                  </span>
                </div>
              </Link>
            ))}
          </div>

          <p className="mt-10 mono text-(--color-muted)">
            Legal inquiries —{" "}
            <a
              href="mailto:contact@cubixso.com"
              className="text-(--color-fg-2) underline decoration-(--color-line-2) underline-offset-4 transition-colors duration-300 hover:text-(--color-fg) focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-(--color-accent-2) rounded-xs"
            >
              contact@cubixso.com
            </a>
          </p>
        </div>
      </section>

      <FinalCTA />
    </main>
  );
}
