import test from "node:test";
import assert from "node:assert/strict";
import { resolveImageModel, IMAGE_MODEL_CANDIDATES } from "./resolve-image-model.mjs";

test("prefers the first working candidate", async () => {
  const id = await resolveImageModel(async (m) => m === IMAGE_MODEL_CANDIDATES[0]);
  assert.equal(id, IMAGE_MODEL_CANDIDATES[0]);
});
test("falls through NOT_FOUND to the next candidate", async () => {
  const id = await resolveImageModel(async (m) => {
    if (m === IMAGE_MODEL_CANDIDATES[0]) throw new Error("404 model not found");
    return m === IMAGE_MODEL_CANDIDATES[1];
  });
  assert.equal(id, IMAGE_MODEL_CANDIDATES[1]);
});
test("honors IMAGE_MODEL override first", async () => {
  const id = await resolveImageModel(async (m) => m === "custom-x", { envModel: "custom-x" });
  assert.equal(id, "custom-x");
});
test("throws when nothing works", async () => {
  await assert.rejects(() => resolveImageModel(async () => false));
});
