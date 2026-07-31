// Dependency-free spam guard shared by the contact (/api/notify) and newsletter
// (/api/subscribe) routes. Three cheap layers stop the common cases:
//   1. Honeypot — a hidden `company` field. Humans never see it; form-scraping
//      bots fill every field, so a non-empty value = bot.
//   2. Origin — cross-site bots POST with a foreign Origin. Same-site browser
//      submissions always carry one of our own origins.
//   3. Rate limit — throttles a single IP hammering the endpoint.
// A tripped guard is a SILENT drop: the route returns ok without sending, so the
// bot gets no signal to adapt and no error ever surfaces to a real visitor.
// Tune the origin allowlist without a redeploy via ALLOWED_ORIGINS (comma-sep).

const ALLOWED = (
  process.env.ALLOWED_ORIGINS ??
  "https://app.cubixso.com,https://cubixso.com,https://www.cubixso.com,http://localhost:3000"
)
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

function originAllowed(origin: string): boolean {
  if (ALLOWED.includes(origin)) return true;
  // allow Vercel preview deployments (…-gowthamreddys-projects.vercel.app)
  try {
    return new URL(origin).hostname.endsWith(".vercel.app");
  } catch {
    return false;
  }
}

const MIN_FILL_MS = 2500; // a human takes longer than this to fill a form
const MAX_AGE_MS = 6 * 60 * 60 * 1000; // stale / replayed page token

// Best-effort in-memory per-IP limit. Serverless instances aren't shared, so
// this throttles per warm instance rather than globally — one useful layer, not
// a hard guarantee. Pair with Vercel Firewall / BotID for that.
const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 5;
const hits = new Map<string, number[]>();
function rateLimited(ip: string | null): boolean {
  if (!ip) return false;
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) {
    for (const [k, v] of hits) if (v[v.length - 1]! < now - WINDOW_MS) hits.delete(k);
  }
  return recent.length > MAX_PER_WINDOW;
}

export interface GuardInput {
  origin: string | null;
  ip: string | null;
  honeypot?: string;
  ts?: unknown;
}
export type GuardResult = { ok: true } | { ok: false; reason: string };

export function spamGuard({ origin, ip, honeypot, ts }: GuardInput): GuardResult {
  if (honeypot && honeypot.trim() !== "") return { ok: false, reason: "honeypot" };
  if (origin && !originAllowed(origin)) return { ok: false, reason: "origin" };
  if (typeof ts === "number" && Number.isFinite(ts)) {
    const age = Date.now() - ts;
    if (age < MIN_FILL_MS || age > MAX_AGE_MS) return { ok: false, reason: "timing" };
  }
  if (rateLimited(ip)) return { ok: false, reason: "rate" };
  return { ok: true };
}

export function clientIp(req: Request): string | null {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0]!.trim();
  return req.headers.get("x-real-ip");
}

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Strip control chars (header-injection safety) and cap length. */
export function sanitize(value: string, max: number): string {
  return value.replace(/[\r\n\t]+/g, " ").trim().slice(0, max);
}

export function linkCount(s: string): number {
  return (s.match(/https?:\/\//gi) ?? []).length;
}
