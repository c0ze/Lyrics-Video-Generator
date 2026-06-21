/* Generate Anti-Nativity scene paintings with Gemini flash-image, reference-conditioned
 * on the two character portraits. Hi-res 16:9, idempotent, records a manifest.
 *
 * Run (source the landing-page .env for GEMINI_API_KEY):
 *   set -a; . "$HOME/projects/anti-nativity.arda.tr/.env"; set +a; \
 *     node scripts/generate-antinativity.mjs                 # all missing
 *   ... node scripts/generate-antinativity.mjs --only S1,S3,S6   # subset
 *   ... node scripts/generate-antinativity.mjs --force           # regenerate
 * Env: GEMINI_API_KEY (required), IMAGE_MODEL (optional override).
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { GoogleGenAI } from "@google/genai";
import sharp from "sharp";
import { resolveImageModel } from "./resolve-image-model.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const KEY = process.env.GEMINI_API_KEY;
if (!KEY) {
  console.error('GEMINI_API_KEY not set. Run: set -a; . "$HOME/projects/anti-nativity.arda.tr/.env"; set +a; node scripts/generate-antinativity.mjs');
  process.exit(1);
}
const args = process.argv.slice(2);
const getArg = (n) => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : undefined; };
const only = getArg("--only")?.split(",").map((s) => s.trim());
const force = args.includes("--force");
const songId = getArg("--song") || "recursion";
const TARGET_W = 2304, TARGET_H = 1296; // 16:9, ~1.2x of 1080p for push-in headroom

const scenes = JSON.parse(fs.readFileSync(path.join(ROOT, "src/AntiNativity/scenes.json"), "utf8"));
const song = scenes.songs[songId];
const outDir = path.join(ROOT, "public/AntiNativity/scenes", songId);
fs.mkdirSync(outDir, { recursive: true });
const manifestPath = path.join(ROOT, "src/AntiNativity/scenes.manifest.json");
const manifest = fs.existsSync(manifestPath) ? JSON.parse(fs.readFileSync(manifestPath, "utf8")) : {};

const ai = new GoogleGenAI({ apiKey: KEY });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const refPart = (relPath) => ({
  inlineData: { mimeType: "image/jpeg", data: fs.readFileSync(path.join(ROOT, relPath)).toString("base64") },
});

function buildPrompt(scene) {
  const palette = song.palettes[scene.temp];
  const charDir = scene.who.map((w) => scenes.characterDirections[w]).join(" ");
  return [
    scenes.style,
    `Palette: ${palette}.`,
    `Scene: ${scene.prompt}`,
    charDir,
    "Composition: wide cinematic 16:9, generous negative space, single coherent image.",
    `Avoid: ${scenes.negative}.`,
  ].filter(Boolean).join(" ");
}

function imageFromResponse(res) {
  const parts = res?.candidates?.[0]?.content?.parts || [];
  const img = parts.find((p) => p.inlineData?.data);
  if (!img) {
    const txt = parts.find((p) => p.text);
    throw new Error("no image in response" + (txt ? "; text: " + txt.text.slice(0, 160) : ""));
  }
  return Buffer.from(img.inlineData.data, "base64");
}

async function generateOnce(model, scene) {
  const parts = [{ text: buildPrompt(scene) }, ...scene.who.map((w) => refPart(scenes.refs[w]))];
  const res = await ai.models.generateContent({
    model,
    contents: [{ parts }],
    generationConfig: { responseModalities: ["IMAGE", "TEXT"] },
  });
  return imageFromResponse(res);
}

async function generateWithRetry(model, scene) {
  for (let attempt = 1; attempt <= 4; attempt++) {
    try { return await generateOnce(model, scene); }
    catch (err) {
      if (attempt === 4) throw err;
      const wait = 2 ** attempt * 1500;
      console.warn(`  ! ${scene.id} attempt ${attempt} failed (${String(err.message).slice(0, 120)}); retry in ${wait}ms`);
      await sleep(wait);
    }
  }
}

async function run() {
  const todo = song.scenes.filter((s) => (!only || only.includes(s.id)) &&
    (force || !fs.existsSync(path.join(outDir, `${s.id}.jpg`))));
  if (todo.length === 0) { console.log("Nothing to generate."); return; }

  // Resolve the model by generating the first scene; cache that buffer so no image is made twice.
  const probe = todo[0];
  let probeBuffer = null;
  const model = await resolveImageModel(async (id) => { probeBuffer = await generateOnce(id, probe); return true; });
  console.log("Using image model:", model);

  let made = 0;
  for (const scene of todo) {
    const outFile = path.join(outDir, `${scene.id}.jpg`);
    process.stdout.write(`• ${scene.id} (${scene.temp}, who=[${scene.who.join(",")}]) … `);
    const raw = scene.id === probe.id && probeBuffer ? probeBuffer : await generateWithRetry(model, scene);
    probeBuffer = null;
    await sharp(raw).resize(TARGET_W, TARGET_H, { fit: "cover", position: "centre" }).jpeg({ quality: 92 }).toFile(outFile);
    const { size } = fs.statSync(outFile);
    manifest[`${songId}/${scene.id}`] = { model, prompt: buildPrompt(scene), refs: scene.who, bytes: size, at: new Date().toISOString() };
    made++;
    console.log(`ok (${(size / 1024).toFixed(0)} KB)`);
  }
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + "\n");
  console.log(`\nDone — ${made} generated. Model: ${model}.`);
}
run().catch((e) => { console.error("Fatal:", e.message); process.exit(1); });
