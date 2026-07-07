# Cubixso.ai — SEO & Search Audit + Recommendations

_Audited 2026-07-01 against the codebase + live `app.cubixso.com`._

## TL;DR
The site is **server-rendered and indexable** (content is in the HTML, `<h1>` present, no `noindex`) and most routes already carry unique titles/descriptions. But the **entire technical-SEO layer is missing** (no sitemap, no robots.txt, no structured data, no working social image), and there's a **3-domain identity problem** that will confuse Google. Fix the domain + the P0 technical layer first; they unlock everything else.

---

## 🔴 The structural problem: three domains, no canonical
Live check found:
| Domain | Serves | Status |
|---|---|---|
| `cubixso.com` | 301 → `www.cubixso.com` (a 58-byte splash, not this site) | not the real site |
| `app.cubixso.com` | **the real Next.js site** (200, SSR, `<h1>`) | indexable |
| `cubixso.ai` | referenced by `metadataBase` + `og:image` in metadata | unclear if live |

- No `<link rel="canonical">` on any page (confirmed live).
- `og:image` = `https://cubixso.ai/og.png` — **no `og.png` exists** in the repo/public and no `opengraph-image` route → **social previews (incl. the LinkedIn link you just shared) are broken/blank.**

**Decision needed (blocks canonical/OG correctness):** pick ONE primary marketing domain — recommended **`cubixso.com`** (or `www.cubixso.com`) serving the full site, with `app.cubixso.com` + `cubixso.ai` **301-redirecting** to it. Then set `metadataBase` + per-route `canonical` to that domain. Until decided, Google may split ranking signals across all three.

---

## 🔴 P0 — Critical (do first; mostly domain-independent)
| # | Gap | Fix | Effort |
|---|---|---|---|
| 1 | **No `robots.txt`** (404 live) | add `src/app/robots.ts` — allow all, link the sitemap, disallow `/api`, `/coming-soon` | XS |
| 2 | **No XML sitemap** (404 live) | add `src/app/sitemap.ts` enumerating all ~14 routes w/ lastmod/priority | S |
| 3 | **Broken OG/social image** | add dynamic `src/app/opengraph-image.tsx` (branded, 1200×630) + per-key-route OG; fixes LinkedIn/X/WhatsApp unfurls | S |
| 4 | **No canonical tags** | add `alternates.canonical` in root + per-route metadata (needs domain decision) | S |
| 5 | **`metadataBase` = `cubixso.ai`** but site is on `app.cubixso.com` | point it at the chosen primary domain | XS |
| 6 | **Countdown gate = deindex risk** | `src/proxy.ts` 307-redirects ALL routes → `/coming-soon` when armed. Keep OFF, or make `/coming-soon` `noindex` and never arm it while indexed | XS |

## 🟠 P1 — High impact
| # | Gap | Fix |
|---|---|---|
| 7 | **No structured data (JSON-LD)** | `Organization` + `WebSite` (sitewide) · `BreadcrumbList` · `Service` (services/products) · `LocalBusiness` (Hyderabad T-Hub + Dubai offices) · `Person` (leadership). Drives rich results, knowledge panel, and AI-answer citations |
| 8 | **Metadata polish** | verify a `title.template` (`%s — Cubixso.ai`), add unique OG per route, add `keywords`, `alternates`, `authors`, `category` |
| 9 | **AI search / GEO** | add `public/llms.txt` + passage-level citable copy so ChatGPT / Perplexity / Google AI Overviews can quote you |
| 10 | **Search Console + analytics** | verify **Google Search Console** + **Bing Webmaster**, submit sitemap; add **GA4** (or Vercel Analytics). Nothing is measured today |
| 11 | **Core Web Vitals risk** | heavy R3F/3D + preloader may hurt LCP/INP. Measure (CrUX/Lighthouse), defer non-critical 3D, ensure LCP text paints fast |

## 🟡 P2 — Content & authority (the long game)
- **Content hub** (`/insights` or `/blog`) — there's zero content-marketing surface. Target GenAI-enterprise keywords (agentic AI, LLMOps, RAG, enterprise AI India/UAE) in hub-and-spoke clusters.
- **Keyword strategy** — map each route to a primary + secondary keyword; you currently rank only for "cubixso" (brand).
- **Local SEO** — Google Business Profiles for the Hyderabad (T-Hub) + Dubai (Meydan) offices; `LocalBusiness` schema; NAP consistency.
- **Backlinks / digital PR** — you have strong citation hooks: T-Hub, WeWork Labs, Startup India/DPIIT recognition, Microsoft/AWS/Google-for-Startups. Turn each into a linked mention.
- **Internal linking** — `/collaborators` + `/locations` are footer-only; add contextual links from About/Home.
- **Image alt text audit** — ensure all `next/image` + logos carry descriptive alt.

---

## Suggested sequence
1. **Decide the primary domain** (blocks #4/#5 and correct OG URLs).
2. Ship **P0 #1–3, #6** immediately (robots, sitemap, OG image, gate safety) — domain-independent.
3. Add **canonical + metadataBase** (#4/#5) once domain is chosen.
4. **Structured data** (#7) + **Search Console/GA4** (#10).
5. Then content hub + keywords + local + links (P2).

## What I can implement right now (code, no external accounts)
`robots.ts` · `sitemap.ts` · dynamic `opengraph-image.tsx` + per-route OG · `Organization`/`WebSite`/`LocalBusiness`/`Person` JSON-LD · `llms.txt` · canonical/metadataBase wiring · title template. GSC/GA4/GBP/backlinks need your accounts.
