import test from "node:test";
import assert from "node:assert/strict";

// Mirror of splitVoice (kept in sync with src/AntiNativity/lyrics.ts)
const VOICE_MAP = { male: "talciron", female: "ophelia", duet: "duet", both: "duet" };
const splitVoice = (raw) => {
  const m = raw.match(/^\s*\[(male|female|duet|both)\]\s*(.*)$/i);
  if (!m) return { voice: "duet", text: raw.trim() };
  return { voice: VOICE_MAP[m[1].toLowerCase()], text: m[2].trim() };
};

test("maps male -> talciron and strips the tag", () => {
  assert.deepEqual(splitVoice("[male] Hark! What curse"), { voice: "talciron", text: "Hark! What curse" });
});
test("maps female -> ophelia", () => {
  assert.equal(splitVoice("[female] In the cathedral of chrome").voice, "ophelia");
});
test("maps duet", () => {
  assert.equal(splitVoice("[duet] Nay, sweet architect").voice, "duet");
});
test("untagged falls back to duet, trimmed", () => {
  assert.deepEqual(splitVoice("  no tag here "), { voice: "duet", text: "no tag here" });
});
