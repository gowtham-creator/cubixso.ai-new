"use client";

import dynamic from "next/dynamic";

const HeroScene = dynamic(
  () => import("@/components/scene/HeroScene").then((m) => m.HeroScene),
  { ssr: false, loading: () => null },
);

export function HeroTestClient() {
  return (
    <main style={{ position: "fixed", inset: 0, background: "#03050C" }}>
      <HeroScene />
      <div
        style={{
          position: "absolute",
          bottom: 24,
          left: 24,
          color: "#9DB8FF",
          fontFamily: "var(--font-mono)",
          fontSize: 11,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          opacity: 0.7,
        }}
      >
        / hero-test · 60-line scene preview · isolated
      </div>
    </main>
  );
}
