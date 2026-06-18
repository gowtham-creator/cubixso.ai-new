// launch — single source of truth for the public go-live instant.
//
// Set NEXT_PUBLIC_LAUNCH_AT to an ISO-8601 timestamp, e.g.
//   NEXT_PUBLIC_LAUNCH_AT="2026-07-01T09:00:00+05:30"
// Until that instant the middleware gates the whole site to /coming-soon (a live
// countdown). The moment the countdown hits zero the real site reveals itself
// automatically — no redeploy, no manual flip. Leave the env var unset (or set
// it to a past time / "off") to treat the site as already live.

// Default is "off" → the site is live now (current showcase + dismissible
// banner stay exactly as they are). To ARM the countdown gate, set one env var to
// your real launch instant, e.g.:
//   NEXT_PUBLIC_LAUNCH_AT="2026-07-01T09:00:00+05:30"
// From then until that moment the public sees /coming-soon; at 00 it auto-reveals.
export const LAUNCH_AT_ISO = process.env.NEXT_PUBLIC_LAUNCH_AT ?? "off";

/** Launch instant in epoch ms. Returns 0 when unset/invalid/"off" → already live. */
export function launchAtMs(): number {
  if (!LAUNCH_AT_ISO || LAUNCH_AT_ISO.toLowerCase() === "off") return 0;
  const t = Date.parse(LAUNCH_AT_ISO);
  return Number.isNaN(t) ? 0 : t;
}

/** True while we are still before launch (so the gate should show). */
export function isPreLaunch(nowMs: number): boolean {
  const at = launchAtMs();
  return at > 0 && nowMs < at;
}
