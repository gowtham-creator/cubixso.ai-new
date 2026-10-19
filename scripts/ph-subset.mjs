// Writes src/components/icons/ph-subset.json — only the Phosphor icons the site
// renders, in every weight — for <Ph> to register offline.
//
// The full @iconify-json/ph collection is 4.4 MB of JS (953 KB over the wire)
// and went to every page, parsed before hydration. Add a name to NAMES and
// re-run `node scripts/ph-subset.mjs` whenever a new <Ph name> appears; a name
// missing from the subset still renders, but via a runtime fetch to the public
// Iconify API.
import { readFileSync, writeFileSync } from "node:fs";

const NAMES = [
  "arrow-bend-down-right", "arrow-down", "arrow-left", "arrow-right",
  "arrow-up-right", "bank", "buildings", "caret-down", "check", "envelope",
  "envelope-simple", "factory", "graduation-cap", "heartbeat", "map-pin",
  "package", "phone", "x",
];
// "regular" is the bare name; the other weights are suffixes (see Ph.tsx).
const WEIGHTS = ["", "-thin", "-light", "-bold", "-fill", "-duotone"];

const src = JSON.parse(
  readFileSync(new URL("../node_modules/@iconify-json/ph/icons.json", import.meta.url), "utf8"),
);
const icons = {};
for (const n of NAMES) {
  for (const w of WEIGHTS) {
    const icon = src.icons[n + w];
    if (!icon) throw new Error(`Unknown Phosphor icon: ${n + w}`);
    icons[n + w] = icon;
  }
}
const out = { prefix: src.prefix, width: src.width, height: src.height, icons };
writeFileSync(
  new URL("../src/components/icons/ph-subset.json", import.meta.url),
  JSON.stringify(out) + "\n",
);
console.log(`ph-subset.json: ${Object.keys(icons).length} icons`);
