import type { Metadata } from "next";
import { NotFoundCrystal } from "./not-found.client";

// not-found — CRYSTAL 404 (Aurora Glass v3 §5, noomo reference).
//
// Server shell only, so the route can carry metadata; every hook (reduced
// motion, whoosh on mount, shard drift) lives in the client inner component.
// The global <Aurora/> + <VoidCube/> from layout.tsx already render behind
// every route — this page paints NOTHING opaque, the void shows through.

export const metadata: Metadata = {
  title: "404 — Cubixso.ai",
  description: "This page shattered into the void. Let's get you home.",
};

export default function NotFound() {
  return <NotFoundCrystal />;
}
