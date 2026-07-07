# Cubixso.ai — Search Experience Optimization (SXO) Analysis

_Static codebase analysis, 2026-07-07. Routes reviewed: `/` (home), `/services`, `/products`, `/industries`, `/case-studies`, `/about`, `/contact`, plus section components (Hero, Contact, Metrics, FinalCTA). No live fetch/render — SSD too slow for dev/build; source inspected directly._

## SXO Gap Score: 54 / 100
(Separate from any SEO Health Score — this measures how well the search-arrival experience serves intent, not crawlability/indexation.)

## Page-Type vs. Intent Verdict
| Route | Likely intent | Actual page type | Verdict |
|---|---|---|---|
| `/` | Brand/navigational | 11-chapter cinematic narrative, single scroll | ALIGNED (brand queries) but poor landing page for *any* non-brand query — no single query maps to "everything" |
| `/services` | Commercial ("agentic AI development services") | Thin list + WhyUs + CTA, ~30 lines of copy, no pricing/process/FAQ | HIGH mismatch — commercial-intent searchers expect proof, scope, engagement model |
| `/products` | Commercial/transactional | Same shallow template, no per-product pages/demos | HIGH mismatch |
| `/industries` | Informational/commercial hybrid | Generic 1-line-per-sector list, no industry-specific case data | MEDIUM mismatch |
| `/case-studies` | Informational (proof-seeking, mid-funnel) | Real card grid + insights teasers, but articles route to `/newsletter` (no actual article pages) | MEDIUM — proof format is right, but no crawlable long-form content behind it |
| `/about` | Informational/trust | Logo walls + metrics, no leadership bios visible on page (found in nav only) | MEDIUM |
| `/contact` | Transactional | Real form (`/api/notify`), phone, email — correctly transactional | ALIGNED |

## Personas (search-arrival scoring, 1-5)
1. **Enterprise buyer (CTO/Head of AI)** — 2/5. Lands on `/services` or `/` from a commercial query, gets manifesto copy and a 3D cube before scope/pricing/engagement-model signals. Biggest gap: no case-study depth or named enterprise logos above the fold to de-risk a build vs. buy decision fast.
2. **Technical evaluator (ML/platform engineer)** — 2/5. No architecture diagrams, stack specifics, model/infra choices, or technical case-study detail anywhere in routed pages — only marketing copy and partner-logo walls (AWS/Microsoft/MongoDB etc., unexplained). Gap: zero technical proof surface.
3. **Partner/investor** — 3/5. `/about` surfaces Startup India recognition, partner/collaborator logo walls, global reach — closest fit to this persona's intent. Gap: no funding/traction narrative, no press/PR page.

## Top 5 Findings (priority order)

1. **[CRITICAL] No lead-capture path from top-of-funnel content.** `/services`, `/products`, `/industries` end in a single generic `FinalCTA`, not a contextual "Talk to us about [service]" — buyers must bounce to `/contact` cold. `src/components/sections/FinalCTA.tsx`, `src/app/services/page.tsx`.
2. **[CRITICAL] Proof/social-proof is buried.** `Metrics` (the only quantified proof section) sits at chapter 08 of 11 on the homepage (`src/app/page.tsx`), after Services/Work/Industries/WhyUs — most search-arrival sessions won't scroll that far. Move a condensed proof strip above `WhyUs`.
3. **[HIGH] Above-the-fold value prop is animation-first, not answer-first.** Hero's real `<h1>` is `sr-only` (`src/components/sections/Hero.tsx:94`); the *visible* headline is a decorative `aria-hidden` duplicate gated behind a 4.5s reveal timeout/preloader. For a search visitor scanning for "does this vendor do X," first meaningful paint of the actual value prop is delayed by animation choreography, not content.
4. **[HIGH] Commercial-intent pages (`/services`, `/products`) are too thin for the queries they'd need to rank for.** ~30-40 lines of JSX, no pricing signals, no process/engagement steps, no FAQ, no schema. Recommend `/seo page` audit + `/seo schema` for `Service`/`Product` structured data.
5. **[MEDIUM] Immersive/3D UX likely hurts task completion for utility-seeking search traffic.** R3F glass cube, scroll-pinned hero (`h-[125vh]` sticky stage), and animated reveals are on-brand but add friction for a buyer who searched a specific term and wants a fast yes/no answer. Good for brand dwell time, risky for bounce rate on non-brand landings.

## Limitations
- No live render/SERP fetch performed (env constraint) — findings are structural/architectural, not measured CWV/bounce/dwell data.
- No access to GA4/Search Console — persona friction is inferred from code, not real session data.
- Leadership bios, actual case-study/article body pages, and `/newsletter` content not inspected in depth.

Cross-reference: existing `docs/seo-audit-and-recommendations.md` covers the technical-SEO layer (sitemap, robots, schema, canonical) — this SXO report is complementary (search *experience*, not crawlability).

Generate a PDF report? Use `/seo google report`.
