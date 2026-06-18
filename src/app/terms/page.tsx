import type { Metadata } from "next";
import { LegalLayout } from "@/components/legal/LegalLayout";
import { FinalCTA } from "@/components/sections/FinalCTA";
import { TERMS, LEGAL_UPDATED, LEGAL_NOTE } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Terms & Conditions — Cubixso.ai",
  description:
    "The Terms & Conditions governing access to and use of Cubixso.ai's enterprise AI websites, platforms, and professional services.",
};

export default function TermsPage() {
  return (
    <main>
      <LegalLayout
        num="01"
        eyebrow="TERMS"
        title={
          <>
            Terms &amp;{" "}
            <em
              className="font-serif not-italic italic"
              style={{ letterSpacing: "-0.02em", fontWeight: 400 }}
            >
              Conditions
            </em>
            .
          </>
        }
        note={LEGAL_NOTE}
        updated={LEGAL_UPDATED}
        sections={TERMS}
      />
      <FinalCTA />
    </main>
  );
}
