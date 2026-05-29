import type { Metadata } from "next";
import { Work } from "@/components/sections/Work";

export const metadata: Metadata = {
  title: "Products — Cubixso.ai",
  description:
    "Six standalone AI products: Logic Gen, Aumic Flow AI, Law Suit GPT, NXT School ERP, Cons.ai, DocMind AI. Purpose-built, ready to deploy.",
};

export default function ProductsPage() {
  return (
    <main className="pt-24">
      <Work />
    </main>
  );
}
