/* Render short composited segments of AntiNativity-06 for review (video + grade + lyrics + audio).
 * Bundles once, then renders each frame range to an mp4.
 *   node scripts/render-segments.mjs 15280-15580,3500-3800
 */
import { bundle } from "@remotion/bundler";
import { selectComposition, renderMedia } from "@remotion/renderer";
import { enableTailwind } from "@remotion/tailwind-v4";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const ranges = (process.argv[2] || "")
  .split(",")
  .filter(Boolean)
  .map((r) => r.split("-").map((n) => Number(n.trim())));
if (ranges.length === 0) {
  console.error("usage: node scripts/render-segments.mjs <start-end>[,<start-end>...]");
  process.exit(1);
}
const outDir = "/tmp/an-preview";
fs.mkdirSync(outDir, { recursive: true });

console.log("Bundling…");
const serveUrl = await bundle({
  entryPoint: path.join(ROOT, "src/index.ts"),
  webpackOverride: enableTailwind,
  onProgress: () => {},
});
const composition = await selectComposition({ serveUrl, id: "AntiNativity-06" });
for (const [a, b] of ranges) {
  const out = path.join(outDir, `seg-${a}-${b}.mp4`);
  console.log(`rendering ${a}-${b}…`);
  await renderMedia({ composition, serveUrl, codec: "h264", outputLocation: out, frameRange: [a, b] });
  console.log("  ->", out);
}
console.log("done");
