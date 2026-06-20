/* Generate Arda scene images with the Gemini API (Imagen 4), 16:9.
 *
 * Reads src/Arda/scenes.json and writes public/Arda/scenes/<song>/<id>.jpg.
 * Idempotent (skips existing unless --force). Records prompts in a manifest.
 *
 *   set -a; . /Users/arda/projects/arda/arda/.env; set +a; \
 *     node scripts/generate-scenes.mjs                 # everything missing
 *   ... node scripts/generate-scenes.mjs --song gwannad-i-lu --only 01,02,03
 *   ... node scripts/generate-scenes.mjs --force       # regenerate all
 *
 * Env: GEMINI_API_KEY (required), IMAGEN_MODEL (default imagen-4.0-generate-001).
 */
import { GoogleGenAI } from "@google/genai";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const KEY = process.env.GEMINI_API_KEY;
if (!KEY) {
  console.error("GEMINI_API_KEY not set. Run with the site .env sourced:\n" +
    "  set -a; . /Users/arda/projects/arda/arda/.env; set +a; node scripts/generate-scenes.mjs");
  process.exit(1);
}
const MODEL = process.env.IMAGEN_MODEL || "imagen-4.0-generate-001";

const args = process.argv.slice(2);
const getArg = (name) => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : undefined; };
const onlySong = getArg("--song");
const onlyIds = getArg("--only")?.split(",").map((s) => s.trim());
const force = args.includes("--force");

const scenes = JSON.parse(fs.readFileSync(path.join(ROOT, "src/Arda/scenes.json"), "utf8"));
const NEGATIVE =
  "text, words, letters, runes, captions, watermark, signature, frame, border, UI, " +
  "modern objects, photograph, deformed faces, extra limbs, blurry, low quality, garish oversaturation";

const ai = new GoogleGenAI({ apiKey: KEY });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function generate(prompt) {
  for (let attempt = 1; attempt <= 4; attempt++) {
    try {
      const res = await ai.models.generateImages({
        model: MODEL,
        prompt,
        config: { numberOfImages: 1, aspectRatio: "16:9" },
      });
      const bytes = res.generatedImages?.[0]?.image?.imageBytes;
      if (!bytes) throw new Error("no image bytes in response: " + JSON.stringify(res).slice(0, 300));
      return Buffer.from(bytes, "base64");
    } catch (err) {
      const msg = String(err?.message || err);
      if (attempt === 4) throw err;
      const wait = 2 ** attempt * 1500;
      console.warn(`  ! attempt ${attempt} failed (${msg.slice(0, 120)}); retrying in ${wait}ms`);
      await sleep(wait);
    }
  }
}

const manifestPath = path.join(ROOT, "src/Arda/scenes.manifest.json");
const manifest = fs.existsSync(manifestPath) ? JSON.parse(fs.readFileSync(manifestPath, "utf8")) : {};
let made = 0, skipped = 0;

for (const [songId, song] of Object.entries(scenes.songs)) {
  if (onlySong && songId !== onlySong) continue;
  const outDir = path.join(ROOT, "public/Arda/scenes", songId);
  fs.mkdirSync(outDir, { recursive: true });
  for (const img of song.images) {
    if (onlyIds && !onlyIds.includes(img.id)) continue;
    const outFile = path.join(outDir, `${img.id}.jpg`);
    if (fs.existsSync(outFile) && !force) { skipped++; continue; }
    const prompt = `${scenes.style} Palette: ${song.palette}. Scene: ${img.prompt}. Avoid: ${NEGATIVE}.`;
    process.stdout.write(`• ${songId}/${img.id} … `);
    const buf = await generate(prompt);
    fs.writeFileSync(outFile, buf);
    manifest[`${songId}/${img.id}`] = { model: MODEL, prompt, bytes: buf.length, at: new Date().toISOString() };
    made++;
    console.log(`ok (${(buf.length / 1024).toFixed(0)} KB)`);
  }
}

fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + "\n");
console.log(`\nDone — ${made} generated, ${skipped} skipped. Model: ${MODEL}.`);
