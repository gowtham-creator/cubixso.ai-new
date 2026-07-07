import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/PageHeader";
import { Services } from "@/components/sections/Services";
import { WhyUs } from "@/components/sections/WhyUs";
import { FinalCTA } from "@/components/sections/FinalCTA";

export const metadata: Metadata = {
  title: "Services — Cubixso.ai",
  description:
    "LLMOps, agentic systems, AI agents, full-scale apps, workflow orchestration, RAG & knowledge systems. Six enterprise AI services engineered for scale.",
  alternates: { canonical: "/services" },
};

export default function ServicesPage() {
  return (
    <main>
      <PageHeader
        num="01"
        eyebrow="SERVICES"
        title={
          <>
            {/* THE one aurora gradient word for this page's headline. */}
            Six ways we <span className="text-aurora [html[data-theme=light]_&]:[background:none] [html[data-theme=light]_&]:text-(--color-fg)">deploy</span>{" "}
            <em
              className="font-serif not-italic italic"
              style={{ letterSpacing: "-0.02em", fontWeight: 400 }}
            >
              intelligence
            </em>
            .
          </>
        }
        intro="From model ops to autonomous systems — enterprise AI services, engineered for scale and owned end-to-end."
      />
      <Services bare />
      <WhyUs />
      <FinalCTA />
    </main>
  );
}
