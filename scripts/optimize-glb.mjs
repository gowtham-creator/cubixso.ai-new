// Usage: node scripts/optimize-glb.mjs <input.glb> [output.glb]
//
// Reads a .glb, runs the gltf-transform optimization pipeline
// (dedup → prune → weld → resample → Draco), and writes the result.
// Defaults output to <input>.optimized.glb when no second arg is given.

import path from "node:path";
import { Document, NodeIO } from "@gltf-transform/core";
import { ALL_EXTENSIONS, KHRDracoMeshCompression } from "@gltf-transform/extensions";
import { dedup, prune, weld, resample, draco } from "@gltf-transform/functions";
import draco3d from "draco3dgltf";

const [, , inPath, outPathArg] = process.argv;
if (!inPath) {
  console.error("usage: node scripts/optimize-glb.mjs <input.glb> [output.glb]");
  process.exit(1);
}
const outPath = outPathArg
  ?? inPath.replace(/\.glb$/i, "") + ".optimized.glb";

const io = new NodeIO()
  .registerExtensions(ALL_EXTENSIONS)
  .registerDependencies({
    "draco3d.decoder": await draco3d.createDecoderModule(),
    "draco3d.encoder": await draco3d.createEncoderModule(),
  });

console.log(`[optimize] reading ${path.resolve(inPath)}`);
const doc = await io.read(inPath);

await doc.transform(
  dedup(),
  prune({ keepLeaves: false, keepAttributes: false }),
  weld({ tolerance: 0.0001 }),
  resample(),
  draco({ method: "edgebreaker" }),
);

console.log(`[optimize] writing ${path.resolve(outPath)}`);
await io.write(outPath, doc);
console.log("[optimize] done");
