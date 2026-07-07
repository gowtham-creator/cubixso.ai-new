// Schema.org JSON-LD builders — the site had zero structured data. These emit
// valid graph nodes wired by stable @ids so Google/AI engines resolve one
// Cubixso entity. Data is pulled from the real sources (team.ts, offices.ts)
// and all URLs resolve through SITE_URL (the canonical domain).

import {
  SITE_URL,
  SITE_NAME,
  SITE_DESCRIPTION,
  CONTACT_EMAIL,
  SAME_AS,
  absoluteUrl,
} from "@/lib/seo";
import { TEAM } from "@/lib/team";
import { OFFICES } from "@/lib/offices";

const ORG_ID = absoluteUrl("/#organization");

export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": ORG_ID,
    name: SITE_NAME,
    alternateName: "Cubixso",
    url: SITE_URL,
    logo: absoluteUrl("/logo.png"),
    image: absoluteUrl("/logo.png"),
    description: SITE_DESCRIPTION,
    email: CONTACT_EMAIL,
    sameAs: SAME_AS,
    foundingLocation: {
      "@type": "Place",
      name: "T-Hub, Hyderabad, India",
    },
    address: {
      "@type": "PostalAddress",
      streetAddress:
        "T-Hub Phase 2, Inorbit Mall Road, Madhapur",
      addressLocality: "Hyderabad",
      addressRegion: "Telangana",
      postalCode: "500081",
      addressCountry: "IN",
    },
    contactPoint: {
      "@type": "ContactPoint",
      email: CONTACT_EMAIL,
      contactType: "sales",
      areaServed: ["IN", "AE", "US"],
      availableLanguage: ["en"],
    },
    areaServed: ["India", "United Arab Emirates", "United States"],
    knowsAbout: [
      "Generative AI",
      "Agentic AI",
      "LLMOps",
      "Retrieval-Augmented Generation",
      "Enterprise AI platforms",
      "Model Context Protocol",
    ],
  };
}

export function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": absoluteUrl("/#website"),
    url: SITE_URL,
    name: SITE_NAME,
    description: SITE_DESCRIPTION,
    inLanguage: "en",
    publisher: { "@id": ORG_ID },
  };
}

/** ProfessionalService node per active, addressable office (for /locations). */
export function officeSchemas() {
  return OFFICES.filter((o) => o.status === "active").map((o) => ({
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    "@id": absoluteUrl(`/locations#${o.id}`),
    name: `${SITE_NAME} — ${o.name}`,
    parentOrganization: { "@id": ORG_ID },
    url: absoluteUrl("/locations"),
    image: absoluteUrl("/logo.png"),
    email: CONTACT_EMAIL,
    address: {
      "@type": "PostalAddress",
      streetAddress: o.address,
      addressLocality: o.city,
      addressCountry: o.countryCode,
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: o.coords[1],
      longitude: o.coords[0],
    },
    areaServed: o.country,
  }));
}

/** Person node per leadership member (for /leadership). */
export function personSchemas() {
  return TEAM.map((m) => ({
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": absoluteUrl(`/leadership#${m.slug}`),
    name: m.name,
    jobTitle: m.role,
    worksFor: { "@id": ORG_ID },
    url: absoluteUrl("/leadership"),
    ...(m.photo ? { image: absoluteUrl(m.photo) } : {}),
  }));
}

/** BreadcrumbList for an inner route. `trail` = [{name, path}] from Home. */
export function breadcrumbSchema(trail: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [{ name: "Home", path: "/" }, ...trail].map(
      (item, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: item.name,
        item: absoluteUrl(item.path),
      }),
    ),
  };
}
