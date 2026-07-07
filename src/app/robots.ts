// robots.txt (generated) — the site had none (404). Allow everything for all
// crawlers incl. AI engines (GPTBot, ClaudeBot, PerplexityBot, Google-Extended),
// keep /api and the pre-launch /coming-soon gate out of the index, and point to
// the sitemap on the canonical domain.

import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/coming-soon"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
