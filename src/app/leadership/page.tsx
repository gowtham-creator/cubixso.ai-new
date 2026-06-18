// /leadership — Apple-leadership-page DNA (portrait grid, name-as-link, quiet
// role lines, grouped sections) in the Cobalt Aperture material system. The
// page is data-driven from src/lib/team.ts; portraits drop into /public/team.

import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/PageHeader";
import { LeadershipGrid } from "./LeadershipGrid";

export const metadata: Metadata = {
  title: "Leadership — Cubixso.ai",
  description:
    "The people building Cubixso.ai — one accountable team designing, shipping, and operating generative-AI systems for the autonomous enterprise.",
};

export default function LeadershipPage() {
  return (
    <main className="relative">
      <PageHeader
        num="08"
        eyebrow="LEADERSHIP"
        title={
          <>
            The <span className="text-aurora">people</span> behind
            <br />
            the systems.
          </>
        }
        intro="One team, one accountability line — from first whiteboard to production telemetry. These are the people who carry it, and the seats we are building next."
      />
      <LeadershipGrid />
    </main>
  );
}
