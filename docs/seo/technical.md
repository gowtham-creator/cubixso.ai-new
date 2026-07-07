# Cubixso — Technical SEO Audit

Date: 2026-07-07
Scope: static analysis of `/Volumes/WD Green SSD/cubixso` (Next.js 16, App Router, React 19, TS strict, Tailwind v4) + established live observations for `https://app.cubixso.com`.
Canonical domain decision: **https://cubixso.com** (apex). `app.cubixso.com` currently hosts the real Next app; `cubixso.com` apex is presently a splash that 301s to `www`; `cubixso.ai` is the legacy/wrong domain baked into metadata. `cubixso.com` for Maryland/US is planned but not yet live.

## Technical Score: 44 / 100

Strong SSR/content foundation, but the crawl/discovery layer (robots, sitemap, canonical, structured data) is effectively absent, domain identity is split three ways with no redirect chain enforcing the canonical, and there's a site-wide deindex trap in the launch gate.

---

## 1. Crawlability — FAIL

- `robots.txt` → 404 live, not in repo (`public/robots.txt` absent, no `src/app/robots.ts`). No crawl directives, no sitemap pointer, no AI-bot policy.
- `sitemap.xml` → 404 live, no `src/app/sitemap.ts`. Nothing to accelerate discovery/re-crawl of the 14 real routes.
- `src/proxy.ts` (Next 16's middleware convention) gates the **entire site** behind `/coming-soon` via `NextResponse.redirect` (**307**, temporary) whenever `NEXT_PUBLIC_LAUNCH_AT` is armed and in the future. Matcher excludes `_next/`, `api/`, and any extensioned path, so it genuinely catches every page route. Today `LAUNCH_AT_ISO` defaults to `"off"` (site live), but there is **no code-level guard preventing this from being re-armed after the site is indexed** — doing so would redirect Googlebot off every URL to a thin countdown page, a fast path to mass deindexing. **Critical.**
- `src/app/api/notify` and `src/app/api/subscribe` are not pages (fine for indexing) but should be explicitly `Disallow`-ed for hygiene/quota.
- `src/app/coming-soon/page.tsx` is a real, potentially-indexable route once live traffic hits it directly; it has no `metadata` export (inherits root title) and no `noindex`. Should carry `robots: { index: false }` unconditionally — it's a countdown, never canonical content.

## 2. Indexability — FAIL

- **Zero canonical tags anywhere.** No page sets `alternates.canonical`, and root layout doesn't establish one either. With three live domains resolving the same content (`cubixso.com`, `app.cubixso.com`, `cubixso.ai`), this is a duplicate-content risk today. **Critical.**
- `metadataBase` in `src/app/layout.tsx:49` is `new URL("https://cubixso.ai")` — the **wrong domain** per the canonical decision. Every relative OG/Twitter image and (once added) canonical URL resolves against `cubixso.ai`, not `cubixso.com`. **Critical.**
- 13 of 14 routes have unique `metadata` (title/description) — good. **Gap:** `src/app/locations/page.tsx` is a client component (`"use client"`, needed for interactive map state) with **no metadata export at all**, so it silently inherits the root layout's homepage title/description — duplicate title/description with `/`. Fix: add a `layout.tsx` inside `src/app/locations/` that exports `metadata`, or hoist a server wrapper.
- `src/app/page.tsx` (home) has no explicit `metadata` export either, but that's acceptable since it should carry the root layout's title as-is — no action needed.
- No `noindex` found on any real content route — good, nothing accidentally deindexed today.

## 3. Security — FAIL (headers), PASS (transport, presumed)

- `next.config.ts` only defines `Cache-Control` rules (for `/models`, `/draco`, `/video`, `/geo`, `/audio`, and a media-extension catch-all) — **no security headers at all**: no `Strict-Transport-Security`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, or `Content-Security-Policy`/`X-Frame-Options`. Medium-High priority — cheap to add, and increasingly a trust/quality signal.
- HTTPS itself is presumed enforced by the hosting platform (Vercel auto-TLS) for the domains already live; not independently re-verified here per static-analysis scope, but should be confirmed for `cubixso.com` once cut over.

## 4. URL Structure & Redirects — NEEDS WORK

- Route paths are clean, flat, kebab-case, no trailing slashes, no query-param-driven pages (`/about`, `/case-studies`, `/collaborators`, `/contact`, `/industries`, `/leadership`, `/legal`, `/locations`, `/newsletter`, `/privacy`, `/products`, `/services`, `/terms`) — good baseline.
- **Three-domain problem** (Critical, ties to #2): there is currently no enforced redirect chain from `app.cubixso.com` → `cubixso.com`, nor `cubixso.ai` → `cubixso.com`. `next.config.ts` has no `redirects()` block and there's no `vercel.json` in the repo, so any such redirect must be either host-level (Vercel domain settings) or edge-level (`proxy.ts`). Recommended fix ships below (§ Redirect wiring).
- `?preview=1` sets a `cubixso_preview` cookie for pre-launch bypass — not indexable/crawlable by design (query param), no risk, but worth confirming it's never linked externally (canonical `?preview=1` URLs could get crawled/indexed if ever shared publicly — add `Disallow: /*?preview=*` in robots as a belt-and-suspenders measure, included below).

## 5. Mobile — PASS (by default)

- No custom `viewport` export found in `layout.tsx` or any `page.tsx` — Next.js App Router injects the default `width=device-width, initial-scale=1` viewport meta tag automatically, so this is fine as-is; nothing to fix.
- Tailwind v4 responsive utilities are in use throughout; no static evidence of fixed sub-mobile-width containers was found in the routes reviewed. Not exhaustively re-verified pixel-by-pixel (would need rendered/visual QA, out of static-analysis scope).

## 6. Core Web Vitals (source-inspection risk flags) — NEEDS WORK

- **`src/components/loader/IntroSequence.tsx`**: full-screen intro overlay runs for `DURATION = 3600`ms (3.6s) on every *new session* (gated by `sessionStorage.getItem("cubixso.seen")`), dropping to 700ms only under `prefers-reduced-motion`. Every first-time visitor — and every bot/crawler render pass, since headless renders rarely carry session storage — sits behind this overlay before the real hero paints. This is a **direct LCP risk** for real-user field data (CrUX/INP-adjacent page-experience signals that feed Google's ranking system), independent of the fact that the HTML itself contains real content. **High priority**: either shorten materially, make it non-blocking (paint hero underneath, animate overlay on top with `pointer-events` only, no delayed mount), or skip entirely for bot user agents.
- Root layout mounts a stack of always-on client effects on every route — `SmoothScroll`, `ThemeProvider`, `IntroSequence`, `CursorFollower`, `DotField`, `ScrollProvider`, `ScrollRail`, `GlassCounter` — all hydrate globally regardless of page. This raises baseline JS execution/hydration cost site-wide, which is the classic driver of **INP** regressions on lower-end mobile devices even though it doesn't block SSR content. Consider lazy/`next/dynamic` loading for `CursorFollower` (desktop-only, no-op on touch) and gating `DotField`/`ScrollRail` behind `IntersectionObserver`/idle callbacks.
- 3D/media assets (GLB models, Draco decoder, hero videos) are correctly given 1-year immutable caching in `next.config.ts` (good — the comment in the file correctly identifies re-validation of multi-MB assets as the biggest historical slowness cause), but there's no evidence of `next/image` usage or explicit `width`/`height`/`aspect-ratio` reservation checked here for the hero video/poster — worth a targeted CLS check on `poster.jpg`/`void-poster.jpg` usage to ensure reserved aspect ratio before video mounts.
- Custom fonts (`Inter`, `Instrument_Serif`, `JetBrains_Mono`, `Caveat`) all correctly use `display: "swap"` — good, low CLS/FOIT risk from fonts specifically.

## 7. Structured Data — FAIL

- No `application/ld+json`, no JSON-LD helper/component, no schema markup anywhere in `src`. Zero Organization, LocalBusiness, Service, BreadcrumbList, or FAQ schema. For a multi-location B2B enterprise (T-Hub Hyderabad HQ, Meydan Dubai, Maryland/US pending) this is a real missed opportunity for Knowledge Panel eligibility and rich results. See ready-to-paste component below.

## 8. JavaScript Rendering — PASS (SSR), with caveats

- Root layout and page components are server components by default (Next App Router); `locations` and `coming-soon` are the only client-boundary pages (`"use client"`), both for legitimate interactivity reasons (map state, countdown). Established finding confirms real content renders in initial HTML (no client-only content gating for crawlers) — good, no CSR-only indexability risk detected in the routes reviewed.
- The `IntroSequence` overlay is client-only animation layered on top of SSR'd content — it does not hide content from crawlers (content exists in HTML underneath), but it does affect *real-user* perceived performance as noted in §6.

## 9. IndexNow Protocol — NOT IMPLEMENTED

- No IndexNow key file, no submission integration found anywhere in the repo (`public/`, `src/app/api/`). Bing, Yandex, and Naver all support IndexNow for near-instant crawl notification on publish/update — currently 100% unused, meaning this site relies solely on passive re-crawl scheduling for non-Google engines. Recommended minimal wiring included below.

---

## Prioritized Issues

| # | Priority | Issue | Fix |
|---|----------|-------|-----|
| 1 | Critical | `robots.txt` & `sitemap.xml` both 404 | Ship `src/app/robots.ts` + `src/app/sitemap.ts` (below) |
| 2 | Critical | `metadataBase` = wrong domain (`cubixso.ai`); zero canonical tags; 3-way domain split with no redirects | Fix `metadataBase` to `cubixso.com`; add per-page `alternates.canonical`; enforce host-based 308 redirects `app.cubixso.com` + `cubixso.ai` → `cubixso.com` (below) |
| 3 | Critical | `proxy.ts` gate can 307 the entire site to `/coming-soon` if re-armed post-launch | Add explicit `noindex` to `/coming-soon`, and a hard "never re-arm after `GO_LIVE`" guard/comment + ops runbook note |
| 4 | High | `IntroSequence` blocks visual paint ~3.6s every new session/bot render | Make overlay non-blocking (paint hero underneath) or skip for bot UAs; shrink duration |
| 5 | High | Broken `og.png` (referenced, file absent in `public/`); no JSON-LD anywhere | Add real 1200×630 OG image at `public/og.png`; add Organization/LocalBusiness JSON-LD (below) |
| 6 | Medium | No security headers in `next.config.ts` | Add HSTS, X-Content-Type-Options, Referrer-Policy, Permissions-Policy (below) |
| 7 | Medium | `/locations` has no unique metadata (client component, inherits homepage title) | Add `src/app/locations/layout.tsx` exporting `metadata` |
| 8 | Medium | No IndexNow integration for Bing/Yandex/Naver | Add key file + submit-on-publish call (below) |
| 9 | Low | Global client-effect stack (`CursorFollower`, `DotField`, `ScrollRail`, etc.) hydrates on every route | Lazy-load / gate behind idle callbacks or `next/dynamic` |
| 10 | Low | `/coming-soon` and `?preview=1` have no explicit crawl guard beyond middleware | Add to robots `Disallow`; add `noindex` metadata to coming-soon page |

---

## Ready-to-Paste Code

### `src/app/robots.ts`

```ts
import type { MetadataRoute } from "next";

const BASE_URL = "https://cubixso.com";

// AI Crawler Management: Cubixso is a GenAI studio — being visible in AI
// answer engines (ChatGPT, Perplexity, Claude, Gemini) is a GEO/AEO asset,
// not a threat, so AI crawlers are explicitly allowed alongside classic
// search engines. Adjust the blocked list below only if a specific bot proves
// abusive (e.g. Bytespider is commonly rate-limited/blocked for aggressive,
// low-value crawling with no attributable referral traffic).
export default function robots(): MetadataRoute.Robots {
  const disallow = ["/api/", "/coming-soon", "/*?preview=*"];

  return {
    rules: [
      { userAgent: "*", allow: "/", disallow },

      // Classic search engines
      { userAgent: "Googlebot", allow: "/", disallow },
      { userAgent: "Bingbot", allow: "/", disallow },

      // AI crawlers / answer engines — explicitly allowed (GEO/AEO)
      { userAgent: "GPTBot", allow: "/", disallow },
      { userAgent: "ChatGPT-User", allow: "/", disallow },
      { userAgent: "OAI-SearchBot", allow: "/", disallow },
      { userAgent: "ClaudeBot", allow: "/", disallow },
      { userAgent: "Claude-User", allow: "/", disallow },
      { userAgent: "Claude-SearchBot", allow: "/", disallow },
      { userAgent: "PerplexityBot", allow: "/", disallow },
      { userAgent: "Perplexity-User", allow: "/", disallow },
      { userAgent: "Google-Extended", allow: "/", disallow },
      { userAgent: "Applebot", allow: "/", disallow },
      { userAgent: "Applebot-Extended", allow: "/", disallow },
      { userAgent: "Amazonbot", allow: "/", disallow },
      { userAgent: "meta-externalagent", allow: "/", disallow },

      // Aggressive/low-value scraper — blocked by default; remove if desired
      { userAgent: "Bytespider", disallow: "/" },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
    host: BASE_URL,
  };
}
```

### `src/app/sitemap.ts`

```ts
import type { MetadataRoute } from "next";

const BASE_URL = "https://cubixso.com";

// Enumerated from src/app/*/page.tsx. /coming-soon and /api/* are
// intentionally excluded (gate page + non-page routes).
const ROUTES: Array<{
  path: string;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  priority: number;
}> = [
  { path: "/", changeFrequency: "weekly", priority: 1.0 },
  { path: "/services", changeFrequency: "monthly", priority: 0.8 },
  { path: "/products", changeFrequency: "monthly", priority: 0.8 },
  { path: "/industries", changeFrequency: "monthly", priority: 0.7 },
  { path: "/case-studies", changeFrequency: "weekly", priority: 0.7 },
  { path: "/about", changeFrequency: "monthly", priority: 0.7 },
  { path: "/leadership", changeFrequency: "monthly", priority: 0.6 },
  { path: "/collaborators", changeFrequency: "monthly", priority: 0.6 },
  { path: "/locations", changeFrequency: "monthly", priority: 0.6 },
  { path: "/contact", changeFrequency: "monthly", priority: 0.6 },
  { path: "/newsletter", changeFrequency: "monthly", priority: 0.5 },
  { path: "/legal", changeFrequency: "yearly", priority: 0.3 },
  { path: "/privacy", changeFrequency: "yearly", priority: 0.3 },
  { path: "/terms", changeFrequency: "yearly", priority: 0.3 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return ROUTES.map(({ path, changeFrequency, priority }) => ({
    url: `${BASE_URL}${path}`,
    lastModified: now,
    changeFrequency,
    priority,
  }));
}
```

### `metadataBase` + canonical wiring (`src/app/layout.tsx`)

```ts
export const metadata: Metadata = {
  title: "Cubixso — Generative AI for the autonomous enterprise.",
  description:
    "Cubixso builds intelligent AI systems, agentic products, and enterprise platforms — engineered for scale and impact.",
  metadataBase: new URL("https://cubixso.com"), // was https://cubixso.ai — WRONG domain
  alternates: { canonical: "/" },
  openGraph: {
    title: "Cubixso — Generative AI for the autonomous enterprise.",
    description:
      "Intelligent AI systems, MCPs, agentic products, and enterprise platforms.",
    type: "website",
    url: "https://cubixso.com",
    siteName: "Cubixso",
    images: ["/og.png"], // ensure public/og.png actually exists (1200x630)
  },
  twitter: {
    card: "summary_large_image",
    title: "Cubixso",
    description: "Generative AI for the autonomous enterprise.",
    images: ["/og.png"],
  },
};
```

Per-page pattern (repeat for every route in `ROUTES` above — do **not** let child pages silently inherit the root's `alternates.canonical: "/"`, since Next's metadata merge is shallow and each page must set its own):

```ts
// e.g. src/app/about/page.tsx
export const metadata: Metadata = {
  title: "About — Cubixso",
  description: "…",
  alternates: { canonical: "/about" },
};
```

Fix for the `/locations` gap — add `src/app/locations/layout.tsx`:

```tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Locations — Cubixso",
  description:
    "Cubixso's partner reach across India, plus our Meydan Dubai and T-Hub Hyderabad offices.",
  alternates: { canonical: "/locations" },
};

export default function LocationsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
```

### Redirect wiring — collapse the 3-domain split onto `cubixso.com`

Add host-based canonicalization at the edge, alongside the existing launch gate in `src/proxy.ts` (runs before the pre-launch check so redirects apply regardless of gate state):

```ts
const CANONICAL_HOST = "cubixso.com";
const REDIRECT_HOSTS = new Set(["app.cubixso.com", "www.cubixso.com", "cubixso.ai", "www.cubixso.ai"]);

export function proxy(req: NextRequest) {
  const host = req.headers.get("host")?.split(":")[0] ?? "";
  if (REDIRECT_HOSTS.has(host)) {
    const url = new URL(req.nextUrl.pathname + req.nextUrl.search, `https://${CANONICAL_HOST}`);
    return NextResponse.redirect(url, 308); // permanent, preserves method semantics
  }
  // ...existing launch-gate logic below
}
```

Also add the equivalent redirect at the Vercel project/domain level (Domains → Redirect) as a belt-and-suspenders fallback that fires even if the edge function is ever bypassed by a CDN edge case.

### Security headers (`next.config.ts`, add to the existing `headers()` array)

```ts
{
  source: "/:path*",
  headers: [
    { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
    { key: "X-Content-Type-Options", value: "nosniff" },
    { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
    { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  ],
},
```

### Structured Data — Organization + multi-location (drop into `src/app/layout.tsx` body, or a `<JsonLd />` server component)

```tsx
const orgLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Cubixso",
  url: "https://cubixso.com",
  logo: "https://cubixso.com/logo.png",
  sameAs: ["https://www.linkedin.com/company/cubixso"],
  location: [
    {
      "@type": "Place",
      name: "Cubixso — T-Hub, Hyderabad (HQ)",
      address: { "@type": "PostalAddress", addressLocality: "Hyderabad", addressCountry: "IN" },
    },
    {
      "@type": "Place",
      name: "Cubixso — Meydan, Dubai",
      address: { "@type": "PostalAddress", addressLocality: "Dubai", addressCountry: "AE" },
    },
  ],
};

// in JSX: <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgLd) }} />
```

### IndexNow (Bing / Yandex / Naver)

1. Generate a key (any UUID/hex string), create `public/<key>.txt` containing just the key.
2. Minimal submit-on-publish helper (call from a deploy hook or CMS webhook):

```ts
// src/lib/indexnow.ts
export async function submitIndexNow(urls: string[]) {
  const key = process.env.INDEXNOW_KEY!;
  await fetch("https://api.indexnow.org/indexnow", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      host: "cubixso.com",
      key,
      keyLocation: `https://cubixso.com/${key}.txt`,
      urlList: urls,
    }),
  });
}
```

---

## Notes / Out of Scope

- Live HTTP fetch tooling (`scripts/render_page.py`) referenced in the general SEO skill is not present in this repo and the working copy lives on a slow external SSD, so no dev server/build was run; findings for `app.cubixso.com` reuse the already-established live observations supplied with the task (robots/sitemap 404, broken OG image, wrong `metadataBase`) rather than re-fetching.
- Detailed hreflang validation is out of scope here (defer to the `seo-hreflang` sub-skill) — not currently applicable since no `hreflang`/locale routing exists in the repo.
- Pixel-level mobile touch-target/CLS verification would need a rendered visual pass; only source-level risk flags are given above.
