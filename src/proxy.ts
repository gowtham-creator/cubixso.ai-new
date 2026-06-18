import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { isPreLaunch } from "@/lib/launch";

// Launch gate (Next 16 "proxy" convention, formerly middleware). Before
// NEXT_PUBLIC_LAUNCH_AT every route redirects to the /coming-soon countdown; at
// the launch instant the redirect stops firing and the real site appears
// automatically, with no redeploy. We REDIRECT (not rewrite) so the gate page
// renders chrome-free (its pathname is genuinely /coming-soon).
//
// Team preview: hit any URL with ?preview=1 to set a bypass cookie and browse the
// real site before launch. Static assets + _next + api are excluded by the
// matcher, so the countdown page and its GLB/video still load.

const PREVIEW_COOKIE = "cubixso_preview";

export function proxy(req: NextRequest) {
  const { pathname, searchParams } = req.nextUrl;
  const preLaunch = isPreLaunch(Date.now());

  const hasPreviewParam = searchParams.get("preview") === "1";
  const bypass = hasPreviewParam || req.cookies.get(PREVIEW_COOKIE)?.value === "1";

  // Once live, the gate page is redundant: send visitors to the real home.
  if (!preLaunch && pathname === "/coming-soon") {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // Pre-launch: send every route (except the gate itself) to the countdown.
  if (preLaunch && !bypass && pathname !== "/coming-soon") {
    const url = req.nextUrl.clone();
    url.pathname = "/coming-soon";
    url.search = "";
    return NextResponse.redirect(url);
  }

  // Persist the team-preview bypass for a week when ?preview=1 is used.
  if (hasPreviewParam) {
    const res = NextResponse.next();
    res.cookies.set(PREVIEW_COOKIE, "1", { path: "/", maxAge: 60 * 60 * 24 * 7 });
    return res;
  }

  return NextResponse.next();
}

export const config = {
  // Real page routes only: skip _next internals, /api, and any path ending in a
  // file extension (favicon, GLB, mp4, json, images, …).
  matcher: ["/((?!_next/|api/|.*\\.[\\w]+$).*)"],
};
