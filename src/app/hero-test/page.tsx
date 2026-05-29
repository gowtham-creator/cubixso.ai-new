// /hero-test — isolated full-screen view of the HeroScene exploration.
// Server component shell; client component does the dynamic import with ssr: false.
// Use this URL to evaluate the 60-line Hubtown-vibe scene WITHOUT the global
// CubeScene fighting it. Once you decide, this route can be deleted.

import { HeroTestClient } from "./HeroTestClient";

export const metadata = {
  title: "Hero scene exploration — Cubixso.ai",
  description: "Isolated preview of the experimental hero scene.",
};

export default function HeroTestPage() {
  return <HeroTestClient />;
}
