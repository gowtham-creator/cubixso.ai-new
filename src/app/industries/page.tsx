import type { Metadata } from "next";
import { Industries } from "@/components/sections/Industries";

export const metadata: Metadata = {
  title: "Industries — Cubixso.ai",
  description:
    "Healthcare, manufacturing, education, real estate, fintech, supply chain & hospitality. Six high-value sectors we transform with AI.",
};

export default function IndustriesPage() {
  return (
    <main className="pt-24">
      <Industries />
    </main>
  );
}
