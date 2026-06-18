"use client";

// LayoutChrome — wraps page content with the global site chrome (grain, Nav,
// Footer, mascot). Only the /coming-soon launch gate is STANDALONE (no chrome).
// Every other route — including /newsletter — keeps the global Nav so visitors
// can always navigate away (the floating glass nav pill sits cleanly over the
// newsletter's video hero).

import { usePathname } from "next/navigation";
import { Nav } from "@/components/layout/Nav";
import { Footer } from "@/components/layout/Footer";
import { SplineMascot } from "@/components/scene/SplineMascot";

const BARE_ROUTES = new Set(["/coming-soon"]);

export function LayoutChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const bare = BARE_ROUTES.has(pathname);

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
      <SplineMascot />
    </>
  );
}
