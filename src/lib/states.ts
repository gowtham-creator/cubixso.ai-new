// Partner-reach data for the Locations page. Five Indian states where
// Cubixso.ai has active partner + client presence. The `geoName` must match the
// `st_nm` property in /public/geo/india-states.json so IndiaStatesMap can
// highlight the correct polygon. `id` drives selection + URL-friendly keys.

export interface StatePresence {
  id: string;
  /** display name shown in the selector + copy */
  name: string;
  /** must match st_nm in india-states.json (handles name variants) */
  geoName: string;
  /** short tagline under the state name */
  tagline: string;
  /** key cities where partners/clients operate */
  cities: string[];
  /** partner / client presence headline, e.g. "HQ + 40 partners" */
  reach: string;
  /** 2-3 sentence partner-reach blurb */
  blurb: string;
}

export const STATES: StatePresence[] = [
  {
    id: "telangana",
    name: "Telangana",
    geoName: "Telangana",
    tagline: "Headquarters · The anchor",
    cities: ["Hyderabad", "Warangal", "Karimnagar"],
    reach: "Global HQ · 40+ partner teams",
    blurb:
      "Hyderabad is where Cubixso.ai is built — our engineering, research, and growth teams operate from the city's HITEC corridor. It is the anchor of our partner network across South India, with the deepest concentration of client deployments and on-ground delivery.",
  },
  {
    id: "andhra-pradesh",
    name: "Andhra Pradesh",
    geoName: "Andhra Pradesh",
    tagline: "Coastal growth corridor",
    cities: ["Visakhapatnam", "Vijayawada", "Tirupati"],
    reach: "12 partners · 30+ active clients",
    blurb:
      "Andhra Pradesh extends our reach down the eastern coast, anchored by the port-city momentum of Visakhapatnam. Local agency partners run AI-led campaigns for retail, education, and manufacturing brands across Vijayawada and the Rayalaseema belt.",
  },
  {
    id: "maharashtra",
    name: "Maharashtra",
    geoName: "Maharashtra",
    tagline: "Enterprise & brand capital",
    cities: ["Mumbai", "Pune", "Nagpur"],
    reach: "18 partners · enterprise accounts",
    blurb:
      "Maharashtra is our enterprise gateway — Mumbai's brand, BFSI, and media houses pair with Cubixso.ai for performance marketing at scale. Pune's product and SaaS ecosystem rounds out a partner base that handles our most demanding, data-heavy mandates.",
  },
  {
    id: "tamil-nadu",
    name: "Tamil Nadu",
    geoName: "Tamil Nadu",
    tagline: "Industrial south",
    cities: ["Chennai", "Coimbatore", "Madurai"],
    reach: "10 partners · D2C + industrial",
    blurb:
      "Tamil Nadu connects us to one of India's strongest manufacturing and D2C economies. Chennai partners drive automotive and SaaS marketing, while Coimbatore's textile and engineering clusters lean on our AI tooling for export-focused demand generation.",
  },
  {
    id: "karnataka",
    name: "Karnataka",
    geoName: "Karnataka",
    tagline: "The tech bench",
    cities: ["Bengaluru", "Mysuru", "Mangaluru"],
    reach: "15 partners · startup + SaaS",
    blurb:
      "Karnataka is our innovation bench — Bengaluru's startup and SaaS density makes it the fastest-moving market in the network. Partners here run growth experiments and AI campaign pilots that we refine and roll out across the rest of the country.",
  },
];

export const DEFAULT_STATE_ID = "telangana";
