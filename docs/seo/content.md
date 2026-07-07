# Cubixso.ai — Content Quality, E-E-A-T & Keyword-Mapping Audit

_Static analysis of the Next.js App Router codebase at `/Volumes/WD Green SSD/cubixso` (no dev/build run). Canonical domain: `https://cubixso.com`, currently live at `https://app.cubixso.com`. Cross-refs the existing technical audit at `docs/seo-audit-and-recommendations.md` (sitemap/robots/schema/domain findings) — this document covers content depth, E-E-A-T, on-page structure, keyword mapping, and the proposed `/insights` hub, which that audit flags but does not detail._

---

## 1. Content Quality Score: **38 / 100**

The site has *real* E-E-A-T raw material for a young studio (named founders, precise office addresses, verifiable-sounding accelerator badges, concrete case-study metrics, 8 shipped products, several of which link to live external products). But nearly every route is thin relative to its page type, there is zero content-marketing surface, two of the highest-value pieces of copy on the site never reach the crawlable DOM, and no structured data exists anywhere in `src`. The score reflects strong *proof points* undermined by depth, structure, and indexability gaps.

---

## 2. E-E-A-T Breakdown

| Factor | Weight | Score /100 | Weighted | Evidence |
|---|---|---|---|---|
| **Experience** | 20% | 60 | 12.0 | 8 named products (`src/lib/data.ts` `PRODUCTS`, `Work.tsx` `MAIN_PRODUCTS`), several linking to live external apps (logic-gen-website.vercel.app, resumize.in, nxtschools.com) — genuine "we shipped this" signal. 6 case studies with specific outcome metrics (92% faster rule extraction, 8× content throughput, sub-2s retrieval, 60% less admin overhead, 31% fewer safety incidents, 100% on-prem residency). **Gap:** case studies are anonymized (no client names), undated, quote-free, and compressed to one sentence each — no methodology, no before/after detail, no screenshots (products get screenshots; case studies don't). |
| **Expertise** | 25% | 30 | 7.5 | 4 leadership bios in `src/lib/team.ts` with real names and titles. **Gap:** bios are generic marketing prose ("brings deep field experience," "pairs a builder's instinct with a sharp commercial sense") with zero verifiable specifics — no prior companies, degrees, certifications, publications, or external profile links (the `links` array only ever points to `/contact`, never LinkedIn/GitHub/personal site). `TEAM_GROUPS` declares "Engineering" and "Advisors" categories that have **zero populated members** — an unfinished team page reads as understaffed, not senior. No technical whitepapers, methodology pages, or documentation proving LLMOps/RAG depth beyond marketing copy. |
| **Authoritativeness** | 25% | 40 | 10.0 | Strong badge set: T-Hub, WeWork Labs, NASSCOM 10000 Start-ups, Microsoft for Startups, NVIDIA Inception, Google for Startups, AWS Activate, Startup India/DPIIT, MeitY AI Mission, Wadhwani Foundation (`src/lib/data.ts` `BACKERS`/`COLLABORATORS`, `Collaborators.tsx`). **Gap:** none of these are hyperlinked to a verifying source, there's no press/PR page, no third-party review platform presence (Clutch/G2/GoodFirms), and no backlink-worthy asset (no research, benchmark, or free tool). The `metadataBase` domain (`cubixso.ai`) doesn't match the canonical (`cubixso.com`) or the live host (`app.cubixso.com`) — see §6 — actively splitting whatever authority accrues across three properties. |
| **Trustworthiness** | 30% | 55 | 16.5 | Real, consistent NAP: email, two phone numbers, precise office addresses with coordinates (`src/lib/offices.ts`), legal/privacy/terms pages exist, explicit "replies within 24 hours" and "pricing on the call" transparency commitments (`Contact.tsx`, `/contact` metadata). **Gap:** Industries copy makes compliance claims ("HIPAA-aligned," "audit-ready," "every decision explainable") with **no certification, audit, or evidence backing them** — a credibility risk if a technical evaluator checks. No named client testimonials (generic `Testimonial.tsx` block, not attributed). No security/compliance page despite handling PHI/financial-data claims. |
| **Weighted Total** | 100% | — | **46.0** | |

The 46/100 E-E-A-T sub-score is blended with word-count and indexability penalties (§3, §6) to produce the overall 38/100 content-quality score.

---

## 3. On-Page Audit by Route

Word counts are estimated from visible, server-rendered prose only (labels/mono-chrome/logo alt-text excluded).

| Route | H1 (rendered) | Est. words | Page-type min | Thin-content risk | Heading / indexability notes |
|---|---|---|---|---|---|
| `/` (Home) | `Generative AI for the autonomous enterprise` (sr-only, `Hero.tsx:94`) | ~1,200 | 500 | **Low-Medium** | Passes on count but is list-driven (6×15-word service blurbs, 6×card industry bodies) rather than narrative depth. h1→h2 chapter headings clean. |
| `/services` | "Six ways we deploy intelligence." | ~330 | 800 | **High** | Fails minimum by >50%. `Services` renders `bare`, so page skips its own h2 and jumps h1→h3 per card (minor hierarchy skip). One page carries 6 distinct high-value keyword clusters (LLMOps, Agentic AI, RAG, etc.) — see cannibalization note in §6. |
| `/products` | "Six products in the wild." | ~290 | 300 (400+ complex) | **High** | Each of 8 products gets ~15–20 words on-site before the CTA sends visitors to an *external* domain (resumize.in, nxtschools.com, etc.) — all content depth and ranking equity for those product names lives off-domain. |
| `/industries` | "Built for six sectors." | ~720 visible / ~1,260 authored | 800 | **Medium** | Card bodies (~80 words × 6) are solid. **But** the richest content — 3 problem→solution use-cases per sector (~540 words total, the most specific long-tail keyword copy on the entire site) — is gated behind a client-side disclosure (`IndustryCard`, `Industries.tsx:203-235`, `useState` default `false`). It is not rendered to the DOM until a user clicks; Googlebot does not click UI disclosures, so this copy is effectively non-indexable. |
| `/about` | "An AI-first company." | ~470 | 500 | **Medium-High** | Should be the most E-E-A-T-dense page on the site; instead it's stat counters (numeric, not textual) + a 4-card "Why" grid + two logo walls. No founding story, timeline, or press-mention narrative. |
| `/case-studies` | "Proof, not promises." | ~340 | 800–1,500 (proof/case-study page) | **Very High** | 6 case cards at ~25 words each; anonymized clients, no dates, no quotes. A secondary "Insights" grid presents 4 article teasers (`ARTICLES` in `data.ts`) whose links all resolve to `/newsletter` — **these are not real articles**, they're bait for a signup form. This is the single biggest missed-trust moment on the site. |
| `/collaborators` | "The ecosystem behind us." | ~90 | n/a (trust asset) | **High** (as content) | Pure logo wall, near-zero prose. Fine as a trust badge strip; not a keyword asset as built. |
| `/leadership` | "The people behind the systems." | ~330 | 500+ | **High** | 4 generic bios (~70 words each), no external verification links. "Engineering"/"Advisors" groups declared empty — reads as an unstaffed team. |
| `/locations` | "From Hyderabad, global reach." | **~280 crawlable** / ~950 authored | 500–600 | **High (indexability)** | Client component (`"use client"`, `locations/page.tsx:1`). Only the **default** selections SSR into the DOM: Telangana's state blurb and the T-Hub office blurb. The other 4 of 5 state blurbs (Andhra Pradesh, Maharashtra, Tamil Nadu, Karnataka — `src/lib/states.ts`) and 3 of 4 office entries (WeWork RMZ Spire, Meydan Dubai, Maryland — `src/lib/offices.ts`) render only after a click (`AnimatePresence mode="wait"` keyed by selection) and **never enter the initial DOM**. This is the page purpose-built to rank for city/region queries ("AI company Dubai," "AI consulting Bengaluru") and ~70% of its authored copy is invisible to crawling. |
| `/contact` | "Start the conversation." | ~150 | n/a | **Low** (appropriate for type) | NAP consistent with `/locations` and `/leadership`. No `LocalBusiness`/`ContactPage` schema. |
| `/newsletter` | (not verified — signup-only) | ~60 | n/a | Low (appropriate) | Fine as a capture page; only valuable once `/insights` exists to feed it. |

---

## 4. Keyword Map (primary + secondary per route)

| Route | Primary target | Secondary targets | Search intent |
|---|---|---|---|
| `/` | enterprise generative AI company | agentic AI development company · AI consulting Hyderabad | Navigational / brand + broad commercial |
| `/services` | enterprise AI services | LLMOps consulting · agentic AI development services · RAG development services | Commercial investigation |
| `/products` | AI product development (portfolio) | vertical AI SaaS India · AI automation products | Commercial / branded — weak as a keyword page as built (see §6) |
| `/industries` | enterprise AI solutions by industry | healthcare AI solutions India · fintech AI fraud detection · manufacturing predictive maintenance AI | Informational → commercial (per-sector) |
| `/about` | AI-first company Hyderabad | generative AI studio India · T-Hub Hyderabad AI startup | Navigational / trust |
| `/case-studies` | enterprise AI case studies | production RAG case study · agentic AI case study · AI ROI examples | Commercial investigation (bottom-funnel) |
| `/collaborators` | Cubixso partners & accelerators | (trust asset, not keyword-targeted) | Navigational |
| `/leadership` | Cubixso leadership team | AI startup founder Hyderabad | Navigational / E-E-A-T support |
| `/locations` | AI consulting Hyderabad | generative AI consulting UAE / Dubai · AI development company Bengaluru/Chennai/Mumbai/Pune | Local commercial — **highest-value page once fixed** (§3) |
| `/contact` | contact AI development company | hire AI consultancy India | Transactional |

---

## 5. Biggest Content Gaps Blocking Non-Brand Rankings (priority order)

1. **No `/insights` or blog exists.** Zero non-brand topical surface. Worse, the 4 "article" teasers on `/case-studies` (`ARTICLES` in `data.ts`) link to `/newsletter`, not to real posts — this is a dead-end that damages trust the moment a visitor clicks.
2. **No structured data anywhere** (confirmed via repo-wide search — no `application/ld+json`, no `schema.org` reference). Blocks rich results, knowledge-panel eligibility, and AI-answer/Overview citation.
3. **Two of the richest, most specific pieces of copy on the site are invisible to crawlers**: the Industries "use cases" disclosures and 4 of 5 `/locations` state blurbs + 3 of 4 office blurbs (§3). Fix = server-render all variants (e.g., render all cards expanded in the DOM with CSS-only collapse, or pre-render all state/office panels and toggle visibility client-side rather than conditionally mounting them).
4. **Domain identity split** (`metadataBase: cubixso.ai` in `layout.tsx:49` vs. canonical `cubixso.com` vs. live `app.cubixso.com`) — dilutes authority and breaks OG images across whichever domain isn't primary. Already flagged in `docs/seo-audit-and-recommendations.md`; content strategy can't compound until this is resolved.
5. **Case studies are anonymized, undated, and one sentence long** — the format enterprise buyers trust most (named client, dated, quoted) exists only in outline form.
6. **No page can rank on its own long-tail term.** Every service, product, and industry is one card among six on a shared hub page — nothing specifically targets "RAG development services" or "agentic AI for fintech fraud detection" on its own URL.
7. **Leadership has no externally verifiable expertise signal** (no LinkedIn/GitHub, no named engineers) — weakens both Expertise and Authoritativeness simultaneously.

---

## 6. Proposed Content Hub: `/insights` (hub-and-spoke)

Rebuild the fake `/case-studies` "Insights" teasers (`ARTICLES` in `data.ts`) into a real hub. 4 pillar pages × 2 cluster articles each = 12 total, each internally linking to the relevant `/services`, `/industries`, or `/locations` card and to `/contact`.

### Pillar 1 — "Enterprise Generative AI: A Buyer's Guide" *(→ links to `/services`, `/about`)*
- Target: **enterprise generative AI** · Intent: informational → commercial investigation
- Cluster 1.1: *"Generative AI ROI: How Enterprises Measure Success Beyond the Pilot"* — commercial investigation
- Cluster 1.2: *"Build vs. Buy: Off-the-Shelf AI Tools vs. Custom Enterprise Platforms"* — commercial investigation (reinforces the `WHY` "Custom-built AI" pillar)

### Pillar 2 — "Agentic AI Development: From Autonomous Agents to Production" *(→ links to `/services#agentic`, `/products` Nox AI)*
- Target: **agentic AI development** · Intent: informational → commercial
- Cluster 2.1: *"Agentic AI vs. RPA: What Changes When Agents Can Plan"* — informational (reuses the exact positioning already in `Services.tsx` body copy — currently unexploited off-page)
- Cluster 2.2: *"Designing the Agent Control Loop: Planning, Memory, and Failure Recovery"* — technical informational (upgrades the existing `ARTICLES[1]` teaser into a real published piece)

### Pillar 3 — "LLMOps for the Enterprise: Deploying and Governing LLMs at Scale" *(→ links to `/services#llmops`, `/case-studies` DocMind AI)*
- Target: **LLMOps** · Intent: informational
- Cluster 3.1: *"Why Most Enterprise RAG Stalls at the Proof-of-Concept"* — informational, high-intent (upgrades existing `ARTICLES[0]` teaser)
- Cluster 3.2: *"Context Engineering 101: Retrieval as a First-Class Engineering Discipline"* — informational (upgrades existing `ARTICLES[2]` teaser)

### Pillar 4 — "AI Consulting in India & the Middle East: A Buyer's Guide" *(→ links to `/locations`, `/contact`)*
- Target: **AI consulting India / Hyderabad / UAE** · Intent: local commercial investigation
- Cluster 4.1: *"How to Choose an AI Development Partner in Hyderabad: Questions to Ask Before You Sign"* — commercial, local
- Cluster 4.2: *"Generative AI Adoption in the UAE: Regulatory Landscape and Enterprise Readiness"* — informational, local (leverages the Dubai/Meydan office)

**Sequencing note:** Clusters 2.1/2.2, 3.1, and 3.2 already exist as one-paragraph teasers in `src/lib/data.ts` (`ARTICLES`) — the fastest path to a non-fake `/insights` hub is expanding those four into real, published, dated, byline-attributed articles first, then building the remaining pillar and cluster pages around them.

---

## 7. AI Citation Readiness: **~20 / 100**

No schema, no `llms.txt`, no FAQ blocks, and the strongest raw material — concrete stats (92% faster, 8× throughput, sub-2s retrieval, 60% less admin overhead, 31% fewer incidents) — exists only as terse, undated, unsourced one-liners in case-study cards. An LLM has nothing to anchor a confident, attributable quote to (no client name, no date, no methodology). Fixing §5/§6 (real dated case studies + Article/FAQ/Organization schema) is the direct path to citation eligibility in AI Overviews/ChatGPT/Perplexity.

---

## Top Priority Fixes (summary)
1. **P0** — Server-render all Industries use-cases and all `/locations` state/office blurbs (currently invisible to crawlers).
2. **P0** — Resolve the domain split (`cubixso.ai` metadataBase vs. `cubixso.com` canonical vs. live `app.cubixso.com`).
3. **P1** — Replace the fake `/case-studies` "Insights" teasers with a real `/insights` hub, starting with the 4 already-drafted article concepts.
4. **P1** — Add named clients/dates/quotes to the 6 case studies; add Organization/Article/FAQ JSON-LD.
5. **P2** — Deepen `/services`, `/industries`, `/leadership` copy to clear page-type minimums and add verifiable expertise signals (external profile links, named engineers) to leadership bios.

**File written:** `/Volumes/WD Green SSD/cubixso/docs/seo/content.md`
