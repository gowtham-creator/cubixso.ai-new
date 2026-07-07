# Local SEO Audit — Cubixso.ai Physical Offices

Scope: local-signals angle only (GBP, NAP, citations, page/content quality). Schema JSON-LD templates are already spec'd in `docs/seo/schema.md` §5.3/5.4 (ProfessionalService for T-Hub HQ + Meydan Dubai) — not duplicated here, only validated.

Method: static codebase analysis only (per instruction — slow SSD). Live fetch of https://app.cubixso.com/locations was attempted but blocked in this environment (WebFetch intercepted, no fallback fetch tool available); findings below are code-derived and should be spot-checked against the live render before acting.

## Local SEO Score: 18 / 100

| Dimension | Weight | Score | Notes |
|---|---|---|---|
| GBP Signals | 25% | 10 | No Maps embed/iframe, no "Get Directions" link, no place_id, no review widget anywhere in `src`. `/locations` uses a custom MapLibre/mapcn point map (`OfficeMap.tsx`), not a Google Maps embed. No evidence any GBP listing has been claimed. |
| Reviews & Reputation | 20% | 5 | Zero `aggregateRating`/review data on-site (matches schema.md finding of no schema at all). Expected at this stage for a young B2B studio, but nothing to build on yet. |
| Local On-Page SEO | 20% | 35 | Real addresses + city/country render from `src/lib/offices.ts` (single source of truth — good). But `/locations` is one client-rendered SPA route (`"use client"`, no per-office `metadata` export) with no dedicated crawlable URL per office, no local-keyword copy ("AI studio in HITEC City", "generative AI Dubai"), no embedded live map. |
| NAP Consistency & Citations | 15% | 30 | Internal NAP is consistent: `CONTACT` (`src/lib/data.ts`) and `OFFICES` (`src/lib/offices.ts`) both feed Footer/Contact/Locations, so no on-site drift. Zero external citations found/verifiable (no GBP, no directory listings evidenced). Minor nit: Footer's decorative coordinate ("17.385°N · 78.486°E — HYDERABAD · IN" in `Footer.tsx:177`) is generic Hyderabad-center, not either real office's actual coords (17.43398/78.37917 or 17.43316/78.38455) — cosmetic, but could confuse scrapers if ever machine-read. |
| Local Schema Markup | 10% | 10 | Confirmed zero `LocalBusiness`/`ProfessionalService`/JSON-LD anywhere in `src` (grep for `schema.org`, `application/ld+json`, `LocalBusiness`, `ProfessionalService` returned nothing outside schema.md's proposal). Templates already exist in schema.md §5.3/5.4 — implementation pending. |
| Local Link & Authority Signals | 10% | 25 | Real trust signals exist (T-Hub, WeWork Labs "Incubated at" strip; NASSCOM 10000 Startups, Startup India, Microsoft for Startups, NVIDIA Inception, Meydan free-zone grant) but none are yet leveraged as claimed profiles/backlinks/citations — latent, not activated. |

## Business Type & Vertical
- **Type: Hybrid, B2B enterprise context.** Real street addresses for 3 active sites (T-Hub HQ, WeWork RMZ Spire, Meydan Dubai) plus Maryland ("soon", no street address — correctly excluded from schema per schema.md). Not a classic walk-in local-pack business; local intent here is secondary and mostly about trust/E-E-A-T signals (real offices, real address) for enterprise buyers researching the vendor, not "near me" search volume.
- **Vertical: none of the standard local verticals apply** (not restaurant/healthcare/legal/home-services/real-estate/automotive) — treat as generic **ProfessionalService/Corporate office**, which is what schema.md already selected.

## GBP Setup — Critical Caveat: Co-working Address Eligibility
Both India addresses are **shared/co-working spaces** (T-Hub Phase 2 incubator floor; WeWork RMZ Spire). Google's guidelines for shared workspaces require each listed business to have:
- a permanent, staffed, distinguishable presence (own desk/suite, not a hot-desk),
- ability to receive mail/visitors at that exact suite,
- ideally distinct signage/directory entry.

Multiple unrelated tenants at one street address is one of the most common GBP suspension triggers. Recommendation:
1. **Before creating a GBP listing for T-Hub or WeWork**, confirm Cubixso has a fixed, addressable unit number (not just "T-Hub Phase 2" campus-level) and that T-Hub/WeWork's own front-desk/mail policies support third-party verification (postcard/video verification will ask for this).
2. Given Cubixso is enterprise B2B and not chasing local-pack "near me" traffic, consider running the Hyderabad GBP as a **Service-Area Business (hide the exact street address, publish city/region: Hyderabad, Telangana)** rather than a pin at a shared building — this sidesteps the co-working eligibility risk entirely while still supporting Knowledge Panel / Maps presence and reviews.
3. If a precise-address listing is still desired (e.g., for driving-directions credibility with enterprise clients visiting), list **only one** of the two Hyderabad addresses as the primary GBP (T-Hub HQ, the flagship), and treat WeWork as an internal-only /locations detail — do not create a second India GBP at a second shared address; it will read as duplicate/spam signals for one entity in one city.
4. **Dubai (Meydan)**: Meydan Free Zone is a flexi-desk/virtual-license arrangement in many cases — same eligibility question applies. Verify whether Cubixso's Meydan grant includes a physically staffed desk before attempting Google verification; if it's licence-only (no staffed desk), use SAB mode for UAE too (service area: Dubai / UAE) rather than risking suspension.
5. **Maryland**: do not create a GBP until a real staffed address exists (matches schema.md's exclusion logic).

## NAP Consistency Audit
| Field | `src/lib/data.ts` (Footer/Contact) | `src/lib/offices.ts` (Locations) | GBP / Citations | Consistent? |
|---|---|---|---|---|
| Name | (implicit "Cubixso.ai") | "T-Hub Phase 2" / "WeWork RMZ Spire" / "Meydan, Dubai" | none created | N/A — no external NAP to compare yet |
| Address | not shown in footer (only decorative coords) | Full addresses per office | none | Internally consistent, externally unverifiable |
| Phone | +91 83745 63012, +91 92469 01689 | not shown | none | No Dubai phone number captured anywhere on-site — gap for a Dubai GBP/citation, which will require a local or forwarding UAE number |
| Email | contact@cubixso.com | not shown | none | Consistent |

**Gap to fix before any citation push:** no UAE phone number exists in the codebase at all. A Dubai GBP/citation will need either a UAE landline/mobile or a documented call-forwarding number — decide and add to `CONTACT`/`OFFICES` before publishing anywhere.

## Citation Recommendations (B2B-appropriate, not classic Yelp/BBB)
Tier-1 generic (Yelp, BBB) are **low priority** — irrelevant for a B2B enterprise AI studio in India/UAE. Prioritize instead:
- **India:** Google Business Profile (per caveats above), LinkedIn Company Page (with address per location), Crunchbase, Clutch, GoodFirms, AmbitionBox, JustDial/Sulekha (low-value but cheap/fast), NASSCOM 10000 Startups directory profile (already a stated affiliation — claim/complete it), Startup India profile (same), IndiaMART (optional, low fit for enterprise AI).
- **UAE:** Dubai Chamber of Commerce & Industry directory, Meydan Free Zone company directory (leverage existing relationship), Clutch/GoodFirms UAE filters, LinkedIn, Bayut/PF not applicable (real estate only, skip).
- **Global (both):** Crunchbase, Clutch, G2 (if productized), AngelList/Wellfound, LinkedIn — these double as AI-citation sources per the "3 of top 5 AI visibility factors are citation-related" signal, arguably more valuable here than classic local directories given the enterprise/GEO angle.

## Location Page Quality (multi-location, single-route)
- Single dynamic `/locations` route (`src/app/locations/page.tsx`, `"use client"`) renders all offices via client-side state (`activeOfficeId`) — no distinct crawlable URL, title, or meta description per office. This directly undercuts the Whitespark "dedicated service/location pages = #1 local organic factor, #2 AI visibility factor" signal: Google/LLMs cannot independently rank or cite "Cubixso HITEC City office" vs "Cubixso Dubai office" because they are the same URL/document.
- No unique long-form content per office (only a 1-2 sentence blurb) — insufficient for a genuine location-page content bar even if split into separate routes.
- No embedded live Google Map / directions link — pure custom WebGL visualization, which is a design win but a local-SEO/UX loss (no verifiable-by-Google map signal, no one-click directions for enterprise visitors).
- Internal linking: `/locations` is presumably linked from primary nav/footer (not verified in this pass) — check depth from homepage; should be ≤1 click.

**Recommendation:** keep the current interactive `/locations` page as the visual/marketing hub, but add thin **static** sub-pages (e.g. `/locations/hyderabad`, `/locations/dubai`) each with: own `<title>`/meta, 150-300 words of unique local copy ("Cubixso's Hyderabad AI engineering hub at T-Hub, Madhapur — HITEC City" / "Cubixso Dubai — Meydan Free Zone, Nad Al Sheba"), embedded Google Map iframe, NAP in plain text, and the ProfessionalService JSON-LD from schema.md §5.3/5.4. Cross-link these from the main `/locations` selector and from `/contact`.

## Top 10 Prioritized Actions

1. **Critical** — Resolve GBP address-eligibility for T-Hub/WeWork (co-working) and Meydan (free-zone/flexi-desk) *before* creating any listing; default to Service-Area mode if a staffed, addressable unit can't be confirmed.
2. **Critical** — Implement the already-spec'd `ProfessionalService` JSON-LD (schema.md §5.3/5.4) on `/locations` and `/contact` — currently zero local schema exists.
3. **High** — Add a UAE contact number (or documented forwarding line) to `CONTACT`/`OFFICES` — no Dubai phone exists anywhere on-site today, blocking any UAE GBP/citation submission.
4. **High** — Split `/locations` into static, individually-titled sub-pages per active office (own metadata + unique copy + embedded map) to satisfy the "dedicated location page" ranking/AI-visibility factor.
5. **High** — Claim/complete already-implied profiles: NASSCOM 10000 Startups, Startup India, T-Hub, WeWork Labs, Meydan Free Zone directory — cheapest, highest-authority citations since the relationships already exist.
6. **Medium** — Once GBP is live (or SAB-mode), establish a review-generation cadence targeting the 18-day velocity rule (Sterling Sky) — post-project client review asks.
7. **Medium** — Add Crunchbase, Clutch, GoodFirms, LinkedIn Company Page (with per-location address) as B2B-appropriate citation sources; skip Yelp/BBB (irrelevant vertical fit).
8. **Medium** — Embed a real Google Maps iframe (or "Get Directions" deep link) per office alongside the custom MapLibre visualization for verifiable map signal + enterprise-visitor UX.
9. **Low** — Fix Footer's decorative coordinate (`Footer.tsx:177`, "17.385°N · 78.486°E") to match a real office's actual coordinates, or relabel it clearly as illustrative, to avoid any future NAP-scraping confusion.
10. **Low** — Once Maryland has a confirmed staffed address, add it to `offices.ts` schema-eligible set and repeat the GBP-eligibility check (do not pre-create a US GBP on placeholder data).

## Limitations Disclaimer
- Live rendering of `https://app.cubixso.com/locations` (post-JS DOM, actual meta tags, whether a Maps embed is injected client-side) was **not** verified — WebFetch was blocked in this environment with no working fallback fetch tool, so this audit is code-only. Recommend a manual live check (view-source + rendered DOM) before executing on findings #4 and #8.
- No access to live GBP/Search Console/Maps API data — GBP claim status, category selection, review counts/velocity, and local-pack positions are all **unverified assumptions based on absence of on-site evidence**, not confirmed via DataForSEO or direct GBP lookup (not available in this session).
- Proximity (55.2% of ranking variance per Search Atlas) is outside anyone's control and not scored here.
- Citation presence (Yelp/BBB/Justdial/etc.) was assessed by absence-of-evidence in the codebase only, not by live directory search — a manual `site:` search or directory lookup is needed to confirm zero presence rather than just unlinked-from-site.
