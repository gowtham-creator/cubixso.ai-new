// sitemap.xml (generated) — the site had none (404). Enumerates every public,
// indexable route from src/lib/seo.ts so a route added there appears here
// automatically. URLs resolve on the canonical domain.

import type { MetadataRoute } from "next";
import { ROUTES, absoluteUrl } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return ROUTES.map((r) => ({
    url: absoluteUrl(r.path),
    lastModified: now,
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }));
}
