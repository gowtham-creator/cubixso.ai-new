# Cubixso.ai — Schema.org / Structured Data Audit & Implementation

Audit date: 2026-07-07
Canonical domain used throughout: `https://cubixso.com` (live app currently serves from `https://app.cubixso.com`; `metadataBase` in `src/app/layout.tsx` is presently set to `https://cubixso.ai` — **flag: reconcile all three domains to `cubixso.com` before shipping this schema**, otherwise `@id`/`url`/`sameAs` will disagree with canonical tags and OG metadata).

## 1. Detection results

Static scan of `src/app/**` (layout.tsx, page.tsx across all routes) and `src/components/**`: **zero** JSON-LD `<script type="application/ld+json">` blocks, zero Microdata (`itemscope`/`itemtype`), zero RDFa attributes anywhere in the codebase. No structured data ships today.

## 2. Schema score: **8 / 100**

Rationale: a real, well-built B2B site (working nav, real team/office/product data, clean metadata/OG/Twitter tags) but with **no machine-readable entity graph at all**. The 8 points are for having valid, complete `Metadata` (title/description/OG/Twitter) that schema can be layered on top of — everything else is a gap.

## 3. Missing opportunities (priority order)

| Priority | Schema type | Why |
|---|---|---|
| Critical | `Organization` | No canonical entity for Cubixso.ai anywhere — Knowledge Panel, brand disambiguation, sameAs social linking all blocked without it. |
| Critical | `ProfessionalService` × 2 (offices) | Zero local presence signal despite two active real-address offices (Hyderabad, Dubai) plus a `soon` Maryland site. |
| High | `WebSite` | Baseline site entity; needed for sitelinks and to anchor `Organization`/`publisher` references. |
| High | `Person` × 4 (leadership) | No entity-level authorship/leadership signal; supports Knowledge Panel "People" and E-E-A-T for `/leadership`. |
| High | `Service` × 6 (offerings) | Product/service catalog (LLMOps, agentic systems, RAG, etc.) has no structured representation. |
| Medium | `BreadcrumbList` | No breadcrumb trail markup on any inner route (`/services`, `/products`, `/industries`, `/case-studies`, `/about`, `/leadership`, `/locations`, `/collaborators`, `/contact`). |
| Info | `FAQPage` | Not present, not recommended to add — Cubixso is a commercial site and Google restricts FAQ rich results to gov/health (Aug 2023). Only relevant if the user wants AI/LLM-citation (GEO) upside, not Google rich results. |
| N/A | `HowTo` | Deprecated (Sept 2023) — do not add regardless of content fit. |
| N/A | `SpecialAnnouncement` | Deprecated July 2025 — not applicable to this site anyway. |

`Product` schema was considered for the six named products (Logic Gen, Aumic Flow AI, etc.) but these are **internal platforms/case studies, not purchasable SKUs with `Offer`/price** — so they are modeled as `Service` (with the parent company as `provider`), not `Product`, to avoid a Merchant/Product rich-result mismatch (missing price/availability would fail validation).

## 4. Validation checklist applied to every block below

All blocks generated in this file pass: `@context` = `https://schema.org` (https, not http) · valid non-deprecated `@type` · required properties present · absolute URLs only (no relative paths) · ISO 8601 dates · no placeholder text (all values pulled from `src/lib/team.ts`, `src/lib/offices.ts`, `src/lib/data.ts`, `src/components/layout/Footer.tsx`) · ready to embed as-is once the domain reconciliation above is resolved.

---

## 5. Generated JSON-LD

### 5.1 Organization — inject in root layout (site-wide)

```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": "https://cubixso.com/#organization",
  "name": "Cubixso.ai",
  "legalName": "Cubixso",
  "url": "https://cubixso.com",
  "logo": {
    "@type": "ImageObject",
    "url": "https://cubixso.com/logo.png"
  },
  "description": "Cubixso.ai builds intelligent AI systems, agentic products, and enterprise platforms — engineered for scale and impact.",
  "email": "contact@cubixso.com",
  "telephone": "+91-83745-63012",
  "foundingLocation": {
    "@type": "Place",
    "name": "T-Hub Phase 2, Hyderabad, Telangana, India"
  },
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "T-Hub Phase 2, Inorbit Mall Road, Madhapur",
    "addressLocality": "Hyderabad",
    "addressRegion": "Telangana",
    "postalCode": "500081",
    "addressCountry": "IN"
  },
  "contactPoint": [
    {
      "@type": "ContactPoint",
      "contactType": "customer support",
      "email": "contact@cubixso.com",
      "telephone": "+91-83745-63012",
      "areaServed": ["IN", "AE", "US"],
      "availableLanguage": ["English"]
    }
  ],
  "sameAs": [
    "https://www.linkedin.com/company/cubixso/",
    "https://www.instagram.com/cubixso.ai/"
  ]
}
```

### 5.2 WebSite — inject in root layout (site-wide)

No `SearchAction`/`potentialAction` — the site has no internal search feature (confirmed: no search route/component in `src/app/**` or `src/components/**`). Adding `SearchAction` without a working query endpoint would fail Google's SearchBox validation, so it is correctly omitted here.

```json
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": "https://cubixso.com/#website",
  "url": "https://cubixso.com",
  "name": "Cubixso.ai",
  "publisher": { "@id": "https://cubixso.com/#organization" },
  "inLanguage": "en"
}
```

### 5.3 ProfessionalService — Hyderabad HQ (T-Hub Phase 2) — inject on `/locations` and `/contact`

```json
{
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  "@id": "https://cubixso.com/locations#thub",
  "name": "Cubixso.ai — T-Hub Phase 2 (Headquarters)",
  "parentOrganization": { "@id": "https://cubixso.com/#organization" },
  "url": "https://cubixso.com/locations",
  "email": "contact@cubixso.com",
  "telephone": "+91-83745-63012",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "T-Hub Phase 2, Inorbit Mall Road, Madhapur",
    "addressLocality": "Hyderabad",
    "addressRegion": "Telangana",
    "postalCode": "500081",
    "addressCountry": "IN"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": 17.43398,
    "longitude": 78.37917
  },
  "description": "Anchor headquarters inside India's largest innovation campus, where Cubixso.ai designs, builds, and ships generative-AI systems."
}
```

### 5.4 ProfessionalService — Meydan, Dubai — inject on `/locations` and `/contact`

```json
{
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  "@id": "https://cubixso.com/locations#meydan-dubai",
  "name": "Cubixso.ai — Meydan, Dubai",
  "parentOrganization": { "@id": "https://cubixso.com/#organization" },
  "url": "https://cubixso.com/locations",
  "email": "contact@cubixso.com",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Meydan Grandstand, 6th Floor, Al Meydan Road, Nad Al Sheba",
    "addressLocality": "Dubai",
    "addressCountry": "AE"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": 25.15763,
    "longitude": 55.30319
  },
  "description": "Middle East base established on a Meydan Free Zone grant — the bridge to Gulf enterprise clients."
}
```

> Note: `WeWork RMZ Spire` (Hyderabad) and `Maryland` (`status: "soon"`) are in `src/lib/offices.ts` but were intentionally excluded from schema — WeWork is a co-located delivery floor of the same HQ entity (would create a duplicate/conflicting `LocalBusiness` for one org at the same city), and Maryland has no confirmed street address yet (`"Maryland, United States"` only) so a `PostalAddress` block would contain placeholder-grade data, which fails the validation checklist. Add Maryland once a real address lands.

### 5.5 Person — leadership (from `src/lib/team.ts`) — inject on `/leadership` (each Person also as `employee` back-reference on Organization, optional)

```json
[
  {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": "https://cubixso.com/leadership#nayini-gowtham-reddy",
    "name": "Nayini Gowtham Reddy",
    "jobTitle": "Founder & Managing Director",
    "worksFor": { "@id": "https://cubixso.com/#organization" },
    "url": "https://cubixso.com/leadership#nayini-gowtham-reddy",
    "image": "https://cubixso.com/team/nayini-gowtham-reddy.jpg"
  },
  {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": "https://cubixso.com/leadership#praveen-kumar-reddy-nayini",
    "name": "Praveen Kumar Reddy Nayini",
    "jobTitle": "CEO & Marketing President",
    "worksFor": { "@id": "https://cubixso.com/#organization" },
    "url": "https://cubixso.com/leadership#praveen-kumar-reddy-nayini",
    "image": "https://cubixso.com/team/praveen-kumar-reddy-nayini.jpg"
  },
  {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": "https://cubixso.com/leadership#parthunjay-kyama",
    "name": "Parthunjay Kyama",
    "jobTitle": "CBDO & Marketing Vice President",
    "worksFor": { "@id": "https://cubixso.com/#organization" },
    "url": "https://cubixso.com/leadership#parthunjay-kyama",
    "image": "https://cubixso.com/team/parthunjay-kyama.jpg"
  },
  {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": "https://cubixso.com/leadership#puchapalli-nagendra-prasad",
    "name": "Puchapalli Nagendra Prasad",
    "jobTitle": "Senior Business & Sales Consultant",
    "worksFor": { "@id": "https://cubixso.com/#organization" },
    "url": "https://cubixso.com/leadership#puchapalli-nagendra-prasad",
    "image": "https://cubixso.com/team/puchapalli-nagendra-prasad.jpg"
  }
]
```

### 5.6 Service — offerings (from `src/lib/data.ts` `SERVICES`) — inject on `/services`

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Service",
      "@id": "https://cubixso.com/services#llmops",
      "name": "LLM Operations (LLMOps)",
      "provider": { "@id": "https://cubixso.com/#organization" },
      "areaServed": ["IN", "AE", "US"],
      "description": "Enterprise LLM deployment with monitoring, versioning, cost controls."
    },
    {
      "@type": "Service",
      "@id": "https://cubixso.com/services#agentic-systems",
      "name": "Agentic Autonomous Systems",
      "provider": { "@id": "https://cubixso.com/#organization" },
      "areaServed": ["IN", "AE", "US"],
      "description": "Agents that plan and execute — beyond traditional RPA."
    },
    {
      "@type": "Service",
      "@id": "https://cubixso.com/services#ai-agents-automation",
      "name": "AI Agents & Automation",
      "provider": { "@id": "https://cubixso.com/#organization" },
      "areaServed": ["IN", "AE", "US"],
      "description": "Calling agents, support bots, workflow automation beyond RPA."
    },
    {
      "@type": "Service",
      "@id": "https://cubixso.com/services#full-scale-ai-applications",
      "name": "Full-Scale AI Applications",
      "provider": { "@id": "https://cubixso.com/#organization" },
      "areaServed": ["IN", "AE", "US"],
      "description": "End-to-end AI products — web, mobile, APIs, dashboards."
    },
    {
      "@type": "Service",
      "@id": "https://cubixso.com/services#ai-workflow-orchestration",
      "name": "AI Tools & Workflow Orchestration",
      "provider": { "@id": "https://cubixso.com/#organization" },
      "areaServed": ["IN", "AE", "US"],
      "description": "Advanced prompting, n8n, A2A and workflow automation."
    },
    {
      "@type": "Service",
      "@id": "https://cubixso.com/services#rag-cag-knowledge-systems",
      "name": "RAG, CAG & Knowledge Systems",
      "provider": { "@id": "https://cubixso.com/#organization" },
      "areaServed": ["IN", "AE", "US"],
      "description": "Enterprise knowledge powered by RAG and context engineering."
    }
  ]
}
```

### 5.7 BreadcrumbList — pattern for inner routes (per-route, dynamic segments filled per page)

Generic template — implement as a small helper (see `buildBreadcrumbJsonLd()` in section 6) that any route can call with its own trail. Example for `/services`:

```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://cubixso.com" },
    { "@type": "ListItem", "position": 2, "name": "Services", "item": "https://cubixso.com/services" }
  ]
}
```

Apply the same two-level (or deeper, for slugged routes like `/case-studies/[slug]`) pattern to: `/products`, `/industries`, `/case-studies`, `/about`, `/leadership`, `/locations`, `/collaborators`, `/contact`.

### 5.8 FAQPage — not generated

No FAQ content currently exists on the site, and none is recommended for Google rich results (commercial site, restricted since Aug 2023). If GEO/AI-citation visibility is a priority, a lightweight `FAQPage` block could be added later purely for LLM discoverability — flagged as **Info priority only**, not implemented here.

---

## 6. Injection guidance — Next.js App Router

**Component pattern** — create `src/components/seo/JsonLd.tsx`:

```tsx
export function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      // JSON-LD is not user input; safe to serialize directly here.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
```

| Schema | Where | How |
|---|---|---|
| Organization (5.1) + WebSite (5.2) | `src/app/layout.tsx` | Render once, site-wide, inside `<body>` (or `<head>` via a small server component) — these describe the whole site, not one page. Keep as a static `@graph` array to avoid duplicate `@context` blocks. |
| ProfessionalService × 2 (5.3, 5.4) | `src/app/locations/page.tsx` and `src/app/contact/page.tsx` | Per-page `<JsonLd data={...} />`, sourced directly from `OFFICES` in `src/lib/offices.ts` (filter `status === "active"`) so the schema never drifts from the map data. |
| Person × 4 (5.5) | `src/app/leadership/page.tsx` | Map over `TEAM` from `src/lib/team.ts` at render time — generate the array programmatically, not hand-copied, so new hires in `team.ts` auto-emit schema. |
| Service × 6 (5.6) | `src/app/services/page.tsx` | Map over `SERVICES` from `src/lib/data.ts` the same way. |
| BreadcrumbList (5.7) | Every inner route's `page.tsx` | Add a `buildBreadcrumbJsonLd(trail: {name, path}[])` helper in `src/lib/seo.ts`; call it per-page with that route's own trail. |

Root layout is the only place that should emit `Organization`/`WebSite` — do not repeat them per-page (duplicate `@id`s across pages are harmless but wasteful; Google dedupes by `@id` anyway, so centralizing in layout is simpler to maintain).

## 7. Pre-ship blockers

1. Resolve domain: `metadataBase` in `src/app/layout.tsx` is `https://cubixso.ai` — must become `https://cubixso.com` to match this schema, canonical tags, and `sameAs`/`@id` consistency.
2. `logo.png` at `https://cubixso.com/logo.png` must be reachable from the canonical domain (currently only verified at `/public/logo.png` on the app subdomain).
3. Maryland office: add real street address to `src/lib/offices.ts` before adding a third `ProfessionalService` block.
