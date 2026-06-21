/* Veo image-to-video for selected Anti-Nativity scenes (experimental hero motion).
 * Seeds from the existing still so it stays on-look, then animates it.
 *
 * Run (source the landing-page .env for GEMINI_API_KEY):
 *   set -a; . "$HOME/projects/anti-nativity.arda.tr/.env"; set +a; \
 *     node scripts/generate-antinativity-video.mjs S18 [S3 S6 ...]
 * Env: GEMINI_API_KEY (required), VEO_MODEL (optional id override).
 * Output: public/AntiNativity/scenes/recursion/<id>.mp4 (+ video manifest).
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { GoogleGenAI } from "@google/genai";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const KEY = process.env.GEMINI_API_KEY;
if (!KEY) { console.error("GEMINI_API_KEY not set."); process.exit(1); }
const ids = process.argv.slice(2);
if (ids.length === 0) { console.error("usage: node scripts/generate-antinativity-video.mjs S18 [S3 ...]"); process.exit(1); }
const songId = "recursion";

const VEO_CANDIDATES = (process.env.VEO_MODEL ? [process.env.VEO_MODEL] : []).concat([
  "veo-3.1-fast-generate-preview",
  "veo-3.1-generate-preview",
  "veo-3.0-fast-generate-001",
  "veo-3.0-generate-001",
]);

// Per-scene motion direction (seeded from the still; keep it subtle + on-look).
const MOTION = {
  S18: "Slow subtle motion: a single luminous tear wells and slides down her cheek; she blinks slowly; faint cyan flicker; otherwise almost still; melancholic, cinematic.",
  S3: "She walks slowly forward down the cathedral nave toward the camera; her gown and long hair drift; cold neon rain falls through the nave; slow cinematic dolly.",
  S6: "Her hand presses slowly against the inside of the screen; where her fingertips meet the glass the image breaks into drifting sparks and pixels; eerie, slow.",
  S10: "The two translucent spectres slowly turn and circle each other in a ghostly, dreamlike dance, their semi-transparent forms drifting and trailing ethereal light; they never touch; slow, mournful, floating.",
  S0: "Cold neon rain falls through the empty cathedral; the camera pushes slowly toward the distant dark mirror; candle flames flicker; volumetric light drifts.",
  S16: "Neon rain sheets down the chrome as she slowly lifts her face into it; droplets run down; slow and cinematic.",
};

const scenes = JSON.parse(fs.readFileSync(path.join(ROOT, "src/AntiNativity/scenes.json"), "utf8"));
const song = scenes.songs[songId];
const outDir = path.join(ROOT, "public/AntiNativity/scenes", songId);
const manifestPath = path.join(ROOT, "src/AntiNativity/video.manifest.json");
const manifest = fs.existsSync(manifestPath) ? JSON.parse(fs.readFileSync(manifestPath, "utf8")) : {};
const ai = new GoogleGenAI({ apiKey: KEY });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function buildPrompt(s) {
  return `${scenes.style} ${s.prompt} ${MOTION[s.id] || "Subtle slow cinematic motion; keep the painterly oil look."} Maintain the exact painterly oil look, palette and composition of the source image.`;
}

async function generateWith(model, s, imgB64) {
  let op = await ai.models.generateVideos({
    model,
    prompt: buildPrompt(s),
    image: { imageBytes: imgB64, mimeType: "image/jpeg" },
    config: { numberOfVideos: 1, aspectRatio: "16:9", personGeneration: "allow_adult" },
  });
  console.log(`  [${model}] operation started; polling…`);
  let waited = 0;
  while (!op.done) {
    await sleep(10000); waited += 10;
    process.stdout.write(`  …${waited}s`);
    op = await ai.operations.getVideosOperation({ operation: op });
  }
  process.stdout.write("\n");
  const gen = op.response?.generatedVideos?.[0];
  if (!gen?.video) throw new Error("operation done but no video in response: " + JSON.stringify(op.response || op).slice(0, 300));
  return gen.video;
}

async function resolveAndGenerate(s, imgB64) {
  let lastErr;
  for (const model of VEO_CANDIDATES) {
    try {
      return { model, video: await generateWith(model, s, imgB64) };
    } catch (err) {
      const msg = String(err?.message || err);
      lastErr = err;
      console.warn(`  model ${model} failed: ${msg.slice(0, 240)}`);
      // only fall through on "model not found/unsupported"; stop on access/quota/safety errors
      if (!/not.?found|unsupported|invalid.*model|no such model|deprecat/i.test(msg)) throw err;
    }
  }
  throw lastErr;
}

async function downloadVideo(video, outPath) {
  if (video.videoBytes) {
    fs.writeFileSync(outPath, Buffer.from(video.videoBytes, "base64"));
    return;
  }
  if (typeof ai.files?.download === "function") {
    try { await ai.files.download({ file: video, downloadPath: outPath }); if (fs.existsSync(outPath)) return; } catch { /* fall through */ }
  }
  if (video.uri) {
    const url = video.uri.includes("key=") ? video.uri : `${video.uri}${video.uri.includes("?") ? "&" : "?"}key=${KEY}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("fetch video failed: HTTP " + res.status);
    fs.writeFileSync(outPath, Buffer.from(await res.arrayBuffer()));
    return;
  }
  throw new Error("no way to download video; shape=" + JSON.stringify(video).slice(0, 300));
}

async function run() {
  for (const id of ids) {
    const s = song.scenes.find((x) => x.id === id);
    if (!s) throw new Error("no scene " + id);
    const imgB64 = fs.readFileSync(path.join(outDir, `${id}.jpg`)).toString("base64");
    console.log(`• ${id}: requesting Veo clip…`);
    const { model, video } = await resolveAndGenerate(s, imgB64);
    const outPath = path.join(outDir, `${id}.mp4`);
    await downloadVideo(video, outPath);
    const { size } = fs.statSync(outPath);
    manifest[`${songId}/${id}`] = { model, at: new Date().toISOString(), bytes: size };
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + "\n");
    console.log(`  ok ${id}.mp4 via ${model} (${(size / 1024 / 1024).toFixed(1)} MB)`);
  }
  console.log("done");
}
run().catch((e) => { console.error("Fatal:", e?.message || e); process.exit(1); });
