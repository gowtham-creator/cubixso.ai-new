# Cubixso.ai — SEO Audit (unified synthesis)

_`/seo audit` — 7 specialist passes, 2026-07-01. Canonical domain decided: **cubixso.com**._
_Per-area detail: `technical.md` · `schema.md` · `content.md` · `geo.md` · `performance.md` · `sxo.md` · `local.md`._

## SEO Health Score: **≈ 38 / 100** — "foundation missing, but salvageable"
The site is **server-rendered and indexable** and the copy is real — but the entire technical/entity layer is absent and identity is split across three domains.

| Dimension | Weight | Score | Verdict |
|---|---|---|---|
| Technical | 22% | **44** | no robots/sitemap/canonical; wrong metadataBase; deindex trap |
| Content / E-E-A-T | 23% | **38** | real proof but thin depth + richest content hidden from crawlers |
| On-Page | 20% | ~45 | titles/descriptions good; pages thin; no canonical |
| Schema | 10% | **8** | zero JSON-LD anywhere |
| Performance (CWV) | 10% | ~45 | heavy 3D on first paint; needs field data |
| AI Search (GEO) | 10% | **22** | no robots/llms.txt/schema → weak AI citability |
| Images | 5% | ~55 | next/image ok; **OG image broken** |

## The 4 root causes (each shows up across multiple passes)
1. **Three-domain identity split** — `cubixso.com` (splash) / `app.cubixso.com` (real site) / `cubixso.ai` (in `metadataBase`, not owned). No canonical tags. Dilutes every downstream signal. → canonicalize on **cubixso.com**.
2. **Entire technical/entity layer missing** — no `robots.txt`, `sitemap.xml`, JSON-LD, working OG image, or `llms.txt`. (All now generated & ready in the per-area files.)
3. **Richest content is hidden from crawlers** — Industries use-cases + most Locations/office blurbs mount **client-side on click**, so Googlebot/AI crawlers never see the long-tail content. The site looks rich; crawlers see thin pages.
4. **No non-brand ranking surface** — Services/Products thin, case studies anonymized/undated/quote-free, no `/insights` blog. Ranks only for "cubixso" today.

Plus: a **deindex trap** (`src/proxy.ts` gate can 307 the whole site → `/coming-soon`) and **3D on first paint** (LCP/INP risk).

## Prioritized action plan (dependency-sequenced)

### PHASE 0 — Foundation (P0 · this week · all code already generated)
| # | Action | Source file | How we know it worked |
|---|---|---|---|
| 1 | `metadataBase` → `cubixso.com` + per-route `alternates.canonical` | technical.md | view-source shows `<link rel=canonical>` |
| 2 | `src/app/robots.ts` + `src/app/sitemap.ts` | technical.md | `/robots.txt` + `/sitemap.xml` return 200 |
| 3 | Dynamic **OG image** (`opengraph-image.tsx`) | (new) | LinkedIn/X share shows a real preview |
| 4 | JSON-LD: Organization, WebSite, ProfessionalService×2, Person×4, Service×6, Breadcrumb | schema.md | Rich Results Test passes |
| 5 | `public/llms.txt` | geo.md | file 200s; AI crawlers get directives |
| 6 | Launch-gate safeguard (never deindex a live site) + `/coming-soon` noindex | technical.md | gate can't 307 indexed routes |
| 7 | 301 `app.cubixso.com` + `cubixso.ai` → `cubixso.com` (infra) | technical.md | redirects resolve to apex |

### PHASE 1 — Crawlable content + measurement (P1 · weeks 2–3)
- **SSR the hidden content** (Industries use-cases, Locations/office blurbs) so crawlers index it. _(code change)_
- Verify **Google Search Console + Bing Webmaster**, submit sitemap; add **GA4 / Vercel Analytics** (nothing measured today).
- **Perf**: `dynamic(ssr:false)` the `HeroGlassCube`; defer preloader JS so LCP text paints first.
- Deepen **Services / Products / Case-studies** (scope, process, dates, client quotes).
- **SXO**: surface the value prop above the 4.5s reveal; add contextual lead-capture to service/product pages; pull proof higher.

### PHASE 2 — Growth (P2 · month 2+)
- **`/insights` content hub** — 4 pillars / 8 clusters (see content.md) targeting agentic-AI / LLMOps / RAG / enterprise-AI-India+UAE.
- **Local**: GBP for Hyderabad + Dubai (verify staffed/addressable unit first — co-working caveat), local schema, add a UAE phone, per-office crawlable pages.
- **Backlinks / digital PR**: convert T-Hub, WeWork Labs, Startup India/DPIIT, Microsoft/AWS/Google-for-Startups relationships into linked citations; YouTube presence (strongest AI-citation signal).
- **Leadership E-E-A-T**: LinkedIn links + named engineers.

## What I can implement right now (no external accounts needed)
Phase 0 items **1–6** are pure code and all the markup/config is already generated in the per-area files. Phase 0 #7 (301s) + all of GSC/GA4/GBP/backlinks need your Vercel/Google/account access.
