import type { Metadata } from "next";
import { NewsletterHero } from "./NewsletterHero";

export const metadata: Metadata = {
  title: "Newsletter — Cubixso.ai",
  description:
    "Stay in the loop. One concise dispatch on production AI — what we shipped, what we learned, and where the field is heading. No noise, no spam.",
  alternates: { canonical: "/newsletter" },
};

// Standalone newsletter page — a SINGLE centered subscribe section. Adapted
// from the asme HeroSection (heading + email input + subscribe + supporting
// copy) into our Cobalt-Aperture tokens. The global site Nav renders this
// page's chrome, so there is intentionally NO local navbar and NO secondary
// CTA section — the signup is the only thing on the page.
export default function NewsletterPage() {
  return (
    <main>
      <NewsletterHero />
    </main>
  );
}
