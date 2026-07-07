import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/PageHeader";
import { Industries } from "@/components/sections/Industries";
import { WhyUs } from "@/components/sections/WhyUs";
import { FinalCTA } from "@/components/sections/FinalCTA";

export const metadata: Metadata = {
  title: "Industries — Cubixso.ai",
  description:
    "Built for six high-value sectors — healthcare, manufacturing, education, real estate, fintech, and supply chain — across India, the Middle East, and the Americas.",
  alternates: { canonical: "/industries" },
};

export default function IndustriesPage() {
  return (
    <main>
      <PageHeader
        num="01"
        eyebrow="INDUSTRIES"
        title={
          <>
            {/* THE one aurora gradient word for this page's headline. */}
            <span className="text-aurora [html[data-theme=light]_&]:[background:none] [html[data-theme=light]_&]:text-(--color-fg)">Built</span> for six{" "}
            <em
              className="font-serif not-italic italic"
              style={{ letterSpacing: "-0.02em", fontWeight: 400 }}
            >
              sectors
            </em>
            .
          </>
        }
        intro="Six high-value sectors, from healthcare to supply chain — with deep domain context across India, the Middle East, and the Americas."
      />
      <Industries bare />
      <WhyUs />
      <FinalCTA />
    </main>
  );
}
