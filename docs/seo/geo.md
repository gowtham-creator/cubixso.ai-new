# Cubixso — Generative Engine Optimization (GEO / AI-Search) Audit

Audit date: 2026-07-07. Static analysis of the Next.js App Router codebase (`src/app/**`, `src/components/**`); no live fetch/build was run against `app.cubixso.com` for this pass. Complements `docs/seo-audit-and-recommendations.md` (technical/domain SEO) and `docs/seo/schema.md` (structured-data audit) — this doc is scoped to AI-crawler and LLM-citation readiness only.

**Canonical domain to use everywhere below:** `https://cubixso.com` (per task brief). Note the existing 3-domain split (`cubixso.com` splash → `www`, real app on `app.cubixso.com`, `metadataBase` pointing at `cubixso.ai`) is the #1 blocker for every recommendation here — an AI crawler/LLM cannot build one consistent entity if the brand answers from three hostnames.

## GEO Readiness Score: 22 / 100

| Dimension | Weight | Score | Why |
|---|---|---|---|
| Citability | 25% | 15/100 | Copy is hero/marketing-style (short punchy fragments — "Six ways we deploy intelligence.") not self-contained answer passages. No question-phrased headings. No 134–167-word extractable blocks found in Services/Products/Industries/About sections. |
| Structural Readability | 20% | 35/100 | SSR'd, real `<h1>`/`<h2>`/`<h3>` in HTML (good baseline) but hero H1 is `sr-only` and copy is fragment-based, animation-driven, not paragraph/answer structured. |
| Multi-Modal Content | 15% | 20/100 | Partner/collaborator logos, office map, 3D/video assets exist but no named case-study data tables, no downloadable spec sheets, no transcripted video content for citation. |
| Authority & Brand Signals | 20% | 10/100 | No `Organization`/`ProfessionalService` schema, no author/date metadata on pages, no visible Wikipedia/Reddit/YouTube footprint in the codebase or content, 3-domain identity split actively dilutes entity signal. |
| Technical Accessibility | 20% | 30/100 | Content is SSR (real win — no CSR shell to hide content from bots) but **no `robots.txt`**, so GPTBot/ClaudeBot/PerplexityBot/OAI-SearchBot/Google-Extended have zero explicit allow — default is "unknown/crawlable" but unstated, and **no `llms.txt`** exists at all. |

Platform-specific outlook (qualitative, given current state): **Google AI Overviews: low** (needs Organization schema + canonical domain to earn Overview inclusion); **ChatGPT: low** (no llms.txt, thin citable passages, near-zero brand mentions on Reddit/YouTube — the two strongest correlation signals); **Perplexity: low-medium** (SSR content is at least crawlable if PerplexityBot isn't blocked, but nothing to cite cleanly); **Bing Copilot: low** (same gaps, no IndexNow/Bing-specific signal).

## Top 5 Findings (priority order)

1. **P0 — No `robots.txt` at all.** Every AI crawler (GPTBot, OAI-SearchBot, ClaudeBot, PerplexityBot) is currently un-directed. Add `src/app/robots.ts` explicitly `Allow`-ing those four plus `Allow`/`Disallow` policy for `CCBot`/`anthropic-ai`/`cohere-ai` per company training-data preference, referencing the sitemap. Effort: XS (~30 min).
2. **P0 — No `llms.txt`.** Ships nowhere today. Draft below, ready to save as `public/llms.txt`. Effort: XS.
3. **P0 — Three-domain identity split** (`cubixso.com` / `app.cubixso.com` / `cubixso.ai` in `metadataBase`). LLMs and AI Overviews build one entity per canonical host; splitting citations, backlinks, and `sameAs` across three domains suppresses all downstream authority signals. Fix `metadataBase` to `https://cubixso.com`, 301 the others. Effort: M (infra + DNS, not just code).
4. **P1 — Zero structured data** (confirmed zero JSON-LD/Microdata/RDFa repo-wide). Add `Organization` + `ProfessionalService`×2 (Hyderabad T-Hub, Dubai Meydan) + `WebSite` schema — this is the single highest-leverage entity-clarity fix for Google AIO and Bing Copilot. Effort: S (see `docs/seo/schema.md` for full spec).
5. **P1 — No self-contained, quotable answer passages.** Current section copy (Services/Products/Industries/About) is headline-fragment style ("Six ways we deploy intelligence"), not 134–167-word direct-answer blocks with question-phrased H2/H3s (e.g. "What does Cubixso.ai build?"). Rewrite each of the 6 service/product/industry cards as a self-contained ~150-word passage: definition + specific stat + one-line differentiation, so it can be lifted verbatim into a ChatGPT/Perplexity answer without surrounding context. Effort: M (copywriting across ~18 cards, no code change).

Secondary (P2) items: broken `og:image` (`/og.png` referenced in `layout.tsx`, file does not exist in `public/`) hurts link-preview citation cards; `locations` and `coming-soon` pages ship with no `metadata` export; home page (`src/app/page.tsx`) has zero route-level metadata (inherits root layout only) — add page-specific title/description since AIOs increasingly snippet from route-level meta, not just the homepage.

## Brand Mention Analysis

No evidence in the codebase of Wikipedia, Reddit, YouTube, or LinkedIn presence being referenced, linked, or leveraged (no `sameAs` schema, no social-proof copy citing these platforms). Given YouTube mentions correlate ~0.737 with AI citation — the strongest known signal — and Cubixso currently has none surfaced anywhere on-site, this is a structural gap independent of code: publish product-demo/case-study video to YouTube, seed a Wikipedia entry once notability criteria are met (funding/press), and link all three from the `sameAs` array in `Organization` schema (item 4 above) plus the footer.

## `public/llms.txt` — Ready to Ship

Draft content below. Save verbatim to `/Volumes/WD Green SSD/cubixso/public/llms.txt` (Next.js serves anything in `public/` at the site root, so this resolves to `https://cubixso.com/llms.txt`). No RSL 1.0 licensing block included — Cubixso has not stated a training-data license position; add one only after a deliberate legal/marketing decision (see note at bottom of the draft).

```
# Cubixso.ai

> Cubixso.ai is a B2B enterprise Generative-AI studio: we build intelligent AI systems, agentic products, and enterprise platforms — architecture through deployment, observability, and support. Headquartered at T-Hub, Hyderabad (India), with an office in Meydan, Dubai (UAE), and a US presence launching soon.

Cubixso.ai designs and ships six categories of enterprise AI work: LLMOps, agentic systems, AI agents, full-scale application builds, workflow orchestration, and RAG/knowledge systems — plus six standalone AI products built to deploy without custom integration work. We serve six high-value sectors: healthcare, manufacturing, education, real estate, fintech, and supply chain, across India, the Middle East, and the Americas.

## Company
- About: https://cubixso.com/about
- Leadership: https://cubixso.com/leadership
- Locations (Hyderabad T-Hub, Dubai Meydan, US soon): https://cubixso.com/locations
- Collaborators & partners: https://cubixso.com/collaborators
- Case studies: https://cubixso.com/case-studies

## Offerings
- Services (LLMOps, agentic systems, AI agents, apps, orchestration, RAG): https://cubixso.com/services
- Products (six standalone AI products): https://cubixso.com/products
- Industries (healthcare, manufacturing, education, real estate, fintech, supply chain): https://cubixso.com/industries

## Contact
- Contact: https://cubixso.com/contact
- Newsletter: https://cubixso.com/newsletter

## Legal
- Privacy: https://cubixso.com/privacy
- Terms: https://cubixso.com/terms

<!-- Licensing note: no RSL 1.0 grant is declared here. If Cubixso wants to explicitly permit/restrict AI training use of this content, add an RSL 1.0 <license> block referencing /rsl.xml once that policy is decided — do not ship a license grant without sign-off. -->
```

## Files referenced
- Report: `/Volumes/WD Green SSD/cubixso/docs/seo/geo.md` (this file)
- Related: `/Volumes/WD Green SSD/cubixso/docs/seo-audit-and-recommendations.md`, `/Volumes/WD Green SSD/cubixso/docs/seo/schema.md`
- llms.txt target path (not yet created): `/Volumes/WD Green SSD/cubixso/public/llms.txt`
