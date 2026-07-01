import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/PageHeader";
import { Contact } from "@/components/sections/Contact";
import { FinalCTA } from "@/components/sections/FinalCTA";
import RotatingEarth from "@/components/ui/wireframe-dotted-globe";

export const metadata: Metadata = {
  title: "Contact — Cubixso.ai",
  description:
    "Start the conversation — honest scoping, real timelines, and pricing on the call. We hand you a system, not a notebook. Replies within 24 hours.",
};

export default function ContactPage() {
  return (
    <main>
      <PageHeader
        num="01"
        eyebrow="CONTACT"
        title={
          <>
            Start the{" "}
            <em
              className="font-serif not-italic italic"
              style={{ letterSpacing: "-0.02em", fontWeight: 400 }}
            >
              conversation
            </em>
            .
          </>
        }
        intro="Honest scoping, real timelines, pricing on the call. Tell us what you're building — we reply within 24 hours."
        aside={<RotatingEarth className="w-full max-w-[210px] sm:max-w-[300px] lg:max-w-[440px]" />}
      />
      <Contact bare />
      <FinalCTA />
    </main>
  );
}
