"use client";

// LayoutChrome — wraps page content with the global site chrome (grain, Nav,
// Footer, mascot). Only the /coming-soon launch gate is STANDALONE (no chrome).
// Every other route — including /newsletter — keeps the global Nav so visitors
// can always navigate away (the floating glass nav pill sits cleanly over the
// newsletter's video hero).

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { Nav } from "@/components/layout/Nav";
import { Footer } from "@/components/layout/Footer";
import { markSoftNavigation } from "@/lib/useWarmMount";
import { detectTier } from "@/lib/perf";

// The mascot is a WebGL scene rendered on EVERY route, so a static import put
// three/fiber/drei into the shared bundle site-wide — parsed and executed before
// any page could become interactive, for a decorative element that is purely
// below-the-fold garnish. Lazy + client-only: pages hydrate first, the mascot
// arrives after.
const SplineMascot = dynamic(
  () => import("@/components/scene/SplineMascot").then((m) => m.SplineMascot),
  { ssr: false },
);

const BARE_ROUTES = new Set(["/coming-soon"]);

export function LayoutChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const bare = BARE_ROUTES.has(pathname);

  // Any pathname change after the first render is a client-side navigation;
  // heavy WebGL warm-ups then wait for the new page to settle (useWarmMount).
  // Marked during render, not in an effect: the new page's effects run before
  // this component's, so an effect would flag it one navigation too late. The
  // call only sets a module flag, so repeating it is harmless.
  const firstPath = useRef(pathname);
  if (pathname !== firstPath.current) markSoftNavigation();

  // The mascot never appears on low tier (it bails there and on coarse
  // pointers), but merely rendering the lazy component still fetched and ran
  // its chunk — a second 870 KB copy of three.js — plus its module-scope GLB +
  // Draco preload, all on phones and all during the intro. Only load it where
  // it can actually show.
  const [mascot, setMascot] = useState(false);
  useEffect(() => { if (detectTier() === "high") setMascot(true); }, []);

  if (bare) {
    return (
      <div id="main" tabIndex={-1}>
        {children}
      </div>
    );
  }

  return (
    <>
      <div className="grain" aria-hidden />
      <Nav />
      <div id="main" tabIndex={-1}>
        {children}
      </div>
      <Footer />
      {mascot && <SplineMascot />}
    </>
  );
}
