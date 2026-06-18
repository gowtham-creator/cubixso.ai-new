"use client";

// LayoutChrome — wraps page content with the global site chrome (grain,
// construction notice, Nav, Footer, mascot). A few routes are meant to be
// STANDALONE (no header/footer) — e.g. the /newsletter signup hero, which the
// brief calls for as a focused, chrome-free page. On those we render only the
// page itself. Every other route keeps the full chrome unchanged.

import { usePathname } from "next/navigation";
import { Nav } from "@/components/layout/Nav";
import { ConstructionNotice } from "@/components/layout/ConstructionNotice";
import { Footer } from "@/components/layout/Footer";
import { SplineMascot } from "@/components/scene/SplineMascot";

const BARE_ROUTES = new Set(["/newsletter"]);

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
      <ConstructionNotice />
      <Nav />
      <div id="main" tabIndex={-1}>
        {children}
      </div>
      <Footer />
      <SplineMascot />
    </>
  );
}
