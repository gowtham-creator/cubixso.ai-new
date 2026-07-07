import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/PageHeader";
import { Work } from "@/components/sections/Work";
import { Metrics } from "@/components/sections/Metrics";
import { FinalCTA } from "@/components/sections/FinalCTA";

export const metadata: Metadata = {
  title: "Products — Cubixso.ai",
  description:
    "Six standalone AI products in the wild — purpose-built to solve specific business challenges with no custom build required. Ready to deploy from day one.",
  alternates: { canonical: "/products" },
};

export default function ProductsPage() {
  return (
    <main>
      <PageHeader
        num="01"
        eyebrow="PRODUCTS"
        title={
          <>
            {/* THE one aurora gradient word for this page's headline. */}
            Six <span className="text-aurora [html[data-theme=light]_&]:[background:none] [html[data-theme=light]_&]:text-(--color-fg)">products</span> in the{" "}
            <em
              className="font-serif not-italic italic"
              style={{ letterSpacing: "-0.02em", fontWeight: 400 }}
            >
              wild
            </em>
            .
          </>
        }
        intro="Purpose-built AI, ready to deploy. Six standalone products that ship — no notebooks, no custom build."
      />
      <Work bare />
      <Metrics />
      <FinalCTA />
    </main>
  );
}
