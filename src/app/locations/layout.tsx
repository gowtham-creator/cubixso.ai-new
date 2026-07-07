import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/JsonLd";
import { officeSchemas, breadcrumbSchema } from "@/lib/schema";

// /locations is a client component, so it can't export metadata — this
// route-segment layout supplies its title/description/canonical (previously
// MISSING) and emits the per-office ProfessionalService + breadcrumb JSON-LD.
export const metadata: Metadata = {
  title: "Locations — Cubixso.ai",
  description:
    "Cubixso.ai is built in Hyderabad (T-Hub + WeWork) with an office in Dubai (Meydan) and a partner network across India — the US next. See where our offices, partners, and clients operate.",
  alternates: { canonical: "/locations" },
};

export default function LocationsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <JsonLd
        data={[
          ...officeSchemas(),
          breadcrumbSchema([{ name: "Locations", path: "/locations" }]),
        ]}
      />
      {children}
    </>
  );
}
