// Central SEO config — single source of truth for the canonical domain, site
// identity, and the route list that drives the sitemap. Everything SEO-facing
// (metadataBase, canonicals, robots, sitemap, OpenGraph, JSON-LD @id/url)
// resolves through SITE_URL so a domain change is a one-line edit.
//
// DEFAULT = app.cubixso.com — this is where the real, indexable site actually
// lives today. The apex cubixso.com / www is a separate marketing splash with a
// "Launch" button, so we must NOT canonicalize content to it (that would point
// Google at the splash). When the full site is moved onto the apex (splash
// retired), flip this default to https://cubixso.com or set NEXT_PUBLIC_SITE_URL.

export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://app.cubixso.com"
).replace(/\/$/, "");

export const SITE_NAME = "Cubixso.ai";
export const SITE_TAGLINE = "Generative AI for the autonomous enterprise.";
export const SITE_DESCRIPTION =
  "Cubixso.ai is an AI-first studio building intelligent systems, agentic products, and enterprise platforms — agentic AI, LLMOps and RAG, engineered end-to-end for scale and impact.";

export const CONTACT_EMAIL = "contact@cubixso.com";

// Real, verified social profiles (used for Organization sameAs).
export const SAME_AS = [
  "https://www.linkedin.com/company/cubixso/",
  "https://www.instagram.com/cubixso.ai/",
];

export const SEO_KEYWORDS = [
  "generative AI",
  "agentic AI",
  "enterprise AI",
  "LLMOps",
  "RAG",
  "AI studio",
  "AI consulting",
  "Cubixso",
  "AI company Hyderabad",
  "AI company Dubai",
];

/** Absolute URL for a path, resolved against the canonical domain. */
export const absoluteUrl = (path = "/") =>
  `${SITE_URL}${path === "/" ? "" : path.startsWith("/") ? path : `/${path}`}`;

export type SitemapRoute = {
  path: string;
  priority: number;
  changeFrequency:
    | "always"
    | "hourly"
    | "daily"
    | "weekly"
    | "monthly"
    | "yearly"
    | "never";
};

// Public, indexable routes (drives sitemap.ts). Excludes /coming-soon and /api.
export const ROUTES: SitemapRoute[] = [
  { path: "/", priority: 1.0, changeFrequency: "weekly" },
  { path: "/services", priority: 0.9, changeFrequency: "monthly" },
  { path: "/products", priority: 0.9, changeFrequency: "monthly" },
  { path: "/industries", priority: 0.8, changeFrequency: "monthly" },
  { path: "/case-studies", priority: 0.8, changeFrequency: "monthly" },
  { path: "/contact", priority: 0.8, changeFrequency: "monthly" },
  { path: "/about", priority: 0.7, changeFrequency: "monthly" },
  { path: "/leadership", priority: 0.6, changeFrequency: "monthly" },
  { path: "/locations", priority: 0.6, changeFrequency: "monthly" },
  { path: "/collaborators", priority: 0.6, changeFrequency: "monthly" },
  { path: "/newsletter", priority: 0.5, changeFrequency: "monthly" },
  { path: "/legal", priority: 0.3, changeFrequency: "yearly" },
  { path: "/privacy", priority: 0.3, changeFrequency: "yearly" },
  { path: "/terms", priority: 0.3, changeFrequency: "yearly" },
];
