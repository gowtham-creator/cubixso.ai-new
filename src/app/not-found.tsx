import type { Metadata } from "next";
import { NotFound404 } from "./not-found.client";

// not-found — clean minimal 404 (server shell carries metadata; the interactive
// bits live in the client component). The global background + Nav from
// layout.tsx render behind/above every route, so this page paints nothing
// opaque and visitors can always navigate away.

export const metadata: Metadata = {
  title: "404 — Cubixso.ai",
  description: "This page could not be found. Let's get you home.",
};

export default function NotFound() {
  return <NotFound404 />;
}
