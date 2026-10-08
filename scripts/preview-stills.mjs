/* Render a handful of composited preview frames for AntiNativity-06.
 * Bundles once (one public-dir copy), then renders each frame fast.
 *   node scripts/preview-stills.mjs [comma,separated,frames]
 */
import { bundle } from "@remotion/bundler";
import { selectComposition, renderStill } from "@remotion/renderer";
import { enableTailwind } from "@remotion/tailwind-v4";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const frames = (process.argv[2] || "90,1700,3700,6500,10400,15400,17600,19300,20780")
  .split(",")
  .map((s) => Number(s.trim()));
const outDir = "/tmp/an-preview";
fs.mkdirSync(outDir, { recursive: true });

console.log("Bundling…");
const serveUrl = await bundle({
  entryPoint: path.join(ROOT, "src/index.ts"),
  webpackOverride: enableTailwind,
  onProgress: () => {},
});
const composition = await selectComposition({ serveUrl, id: "AntiNativity-06" });
console.log(`Composition ${composition.durationInFrames} frames @ ${composition.fps}fps`);

for (const frame of frames) {
  const output = path.join(outDir, `f${String(frame).padStart(5, "0")}.png`);
  await renderStill({ composition, serveUrl, output, frame, overwrite: true });
  console.log("rendered", output);
}
console.log("done");
