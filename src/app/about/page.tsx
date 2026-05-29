import type { Metadata } from "next";
import { About } from "@/components/sections/About";

export const metadata: Metadata = {
  title: "About — Cubixso.ai",
  description:
    "An AI-first company building enterprise systems end-to-end. 10+ clients, 95% model accuracy, 92% on-time delivery. T-Hub · Hyderabad.",
};

export default function AboutPage() {
  return (
    <main className="pt-24">
      <About />
    </main>
  );
}
