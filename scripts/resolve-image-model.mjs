// Resolve the newest available Gemini flash-image model id.
// Honors IMAGE_MODEL if set; otherwise tries candidates in order until one returns an image.
export const IMAGE_MODEL_CANDIDATES = [
  "gemini-3.5-flash-image",
  "gemini-3-flash-image",
  "gemini-3-pro-image-preview",
  "gemini-2.5-flash-image",
];

/** Returns the first candidate that produces an image, or throws. `tryModel(id)` => boolean. */
export async function resolveImageModel(tryModel, { envModel = process.env.IMAGE_MODEL } = {}) {
  const order = envModel ? [envModel, ...IMAGE_MODEL_CANDIDATES] : IMAGE_MODEL_CANDIDATES;
  const seen = new Set();
  for (const id of order) {
    if (seen.has(id)) continue;
    seen.add(id);
    try {
      if (await tryModel(id)) return id;
    } catch (err) {
      const msg = String(err?.message || err);
      if (!/not.?found|unsupported|invalid|permission|model/i.test(msg)) throw err;
    }
  }
  throw new Error("No usable image model. Tried: " + order.join(", "));
}
