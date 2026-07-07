import type { Metadata } from "next";

// Safeguard: the /coming-soon launch gate must NEVER be indexed. Combined with
// the robots.ts disallow, this ensures that if the countdown gate is ever
// re-armed (src/proxy.ts) it cannot deindex the live site — the gate page
// itself stays out of the index. The page is a client component (can't export
// metadata), so noindex lives on this route-segment layout.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function ComingSoonLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
