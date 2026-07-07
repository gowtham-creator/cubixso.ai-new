import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/PageHeader";
import { Collaborators } from "@/components/sections/Collaborators";
import { FinalCTA } from "@/components/sections/FinalCTA";

export const metadata: Metadata = {
  title: "Collaborators — Cubixso.ai",
  description:
    "The ecosystem behind Cubixso — accelerators, programs, recognitions and platform partners, from T-Hub and NASSCOM 10000 Start-ups to Microsoft for Startups, NVIDIA Inception and OpenAI.",
  alternates: { canonical: "/collaborators" },
};

export default function CollaboratorsPage() {
  return (
    <main>
      <PageHeader
        num="01"
        eyebrow="COLLABORATORS"
        title={
          <>
            The{" "}
            <em
              className="font-serif not-italic italic"
              style={{ letterSpacing: "-0.02em", fontWeight: 400 }}
            >
              ecosystem
            </em>{" "}
            behind us.
          </>
        }
        intro="We don't build alone. The collaborators we build alongside, and the supporters — programmes, clouds and stacks — we run on."
      />
      <Collaborators />
      <FinalCTA />
    </main>
  );
}
