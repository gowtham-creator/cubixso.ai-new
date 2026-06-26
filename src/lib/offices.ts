// Physical offices / sites for the Locations page's GLOBAL map. Distinct from
// src/lib/states.ts (the India partner-reach choropleth): these are real
// buildings with precise [lng, lat], plotted as fly-to markers on a MapLibre
// point map (src/components/locations/OfficeMap.tsx). Add a site here with its
// coords + zoom and the map adjusts to it automatically — no map-code changes.

export type OfficeStatus = "active" | "soon";

export interface Office {
  id: string;
  /** display name, e.g. "T-Hub Phase 2" */
  name: string;
  /** role line, e.g. "Headquarters", "Office", "Free-zone grant", "Expansion" */
  type: string;
  city: string;
  country: string; // "India" | "UAE" | "USA"
  /** ISO-2 — groups the selector + drives the flag glyph */
  countryCode: string;
  address: string;
  /** [longitude, latitude] — the camera target the map flies to */
  coords: [number, number];
  /** zoom the map flies to when this site is selected (building ~15, city ~13, state ~6) */
  zoom: number;
  status: OfficeStatus;
  blurb: string;
}

export const OFFICES: Office[] = [
  {
    id: "thub",
    name: "T-Hub Phase 2",
    type: "Headquarters · Incubator",
    city: "Hyderabad",
    country: "India",
    countryCode: "IN",
    address: "T-Hub Phase 2, Inorbit Mall Road, Madhapur, Hyderabad, Telangana 500081",
    coords: [78.37917, 17.43398],
    zoom: 15.3,
    status: "active",
    blurb:
      "Our anchor — desks inside India's largest innovation campus, where the studio designs, builds, and ships.",
  },
  {
    id: "wework-rmz",
    name: "WeWork RMZ Spire",
    type: "Office",
    city: "Hyderabad",
    country: "India",
    countryCode: "IN",
    address: "5th Floor, RMZ Spire, 100, Silpa Gram Craft Village, HITEC City, Hyderabad, Telangana 500032",
    coords: [78.384547, 17.433162],
    zoom: 15.3,
    status: "active",
    blurb:
      "Our delivery floor in Raidurg — client engineering and operations, minutes from T-Hub.",
  },
  {
    id: "meydan-dubai",
    name: "Meydan, Dubai",
    type: "Free-zone grant · Middle East",
    city: "Dubai",
    country: "UAE",
    countryCode: "AE",
    address: "Meydan Grandstand, 6th Floor, Al Meydan Road, Nad Al Sheba, Dubai, UAE",
    coords: [55.30319, 25.15763],
    zoom: 14,
    status: "active",
    blurb:
      "Our Middle East base, established on a Meydan Free Zone grant — the bridge to Gulf enterprise clients.",
  },
  {
    id: "maryland-us",
    name: "Maryland",
    type: "Expansion",
    city: "Maryland",
    country: "USA",
    countryCode: "US",
    address: "Maryland, United States",
    coords: [-76.6413, 39.0458],
    zoom: 6.6,
    status: "soon",
    blurb:
      "Coming up — our first United States presence, opening the East Coast market.",
  },
];

export const DEFAULT_OFFICE_ID = OFFICES[0].id;

/** Country groups for the selector, in display order. */
export const OFFICE_COUNTRIES = ["India", "UAE", "USA"] as const;
