import type { Metadata } from "next";
import { Services } from "@/components/sections/Services";

export const metadata: Metadata = {
  title: "Services — Cubixso.ai",
  description:
    "LLMOps, agentic systems, AI agents, full-scale apps, workflow orchestration, RAG & knowledge systems. Six enterprise services engineered for scale.",
};

export default function ServicesPage() {
  return (
    <main className="pt-24">
      <Services />
    </main>
  );
}
