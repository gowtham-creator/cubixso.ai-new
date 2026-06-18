import type { Metadata } from "next";
import { LegalLayout } from "@/components/legal/LegalLayout";
import { FinalCTA } from "@/components/sections/FinalCTA";
import { PRIVACY, LEGAL_UPDATED, LEGAL_NOTE } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Privacy Policy — Cubixso.ai",
  description:
    "How Cubixso.ai collects, uses, safeguards, and shares information across its enterprise AI services, including AI and model data handling.",
};

export default function PrivacyPage() {
  return (
    <main>
      <LegalLayout
        num="02"
        eyebrow="PRIVACY"
        title={
          <>
            Privacy{" "}
            <em
              className="font-serif not-italic italic"
              style={{ letterSpacing: "-0.02em", fontWeight: 400 }}
            >
              Policy
            </em>
            .
          </>
        }
        note={LEGAL_NOTE}
        updated={LEGAL_UPDATED}
        sections={PRIVACY}
      />
      <FinalCTA />
    </main>
  );
}
