import { parseLrc } from "../lyricVideo/lyrics";
import type { Voice, VoicedLine } from "./types";

const VOICE_MAP: Record<string, Voice> = {
  male: "talciron",
  female: "ophelia",
  duet: "duet",
  both: "duet",
};

/** parseLrc leaves a leading "[male] " / "[female] " / "[duet] " tag in the text. Split it out. */
export const splitVoice = (raw: string): { voice: Voice; text: string } => {
  const m = raw.match(/^\s*\[(male|female|duet|both)\]\s*(.*)$/i);
  if (!m) return { voice: "duet", text: raw.trim() };
  return { voice: VOICE_MAP[m[1].toLowerCase()], text: m[2].trim() };
};

export const parseVoicedLyrics = (lrc: string, fps: number): VoicedLine[] =>
  parseLrc(lrc, fps).map((l) => {
    const { voice, text } = splitVoice(l.text);
    return { startFrame: l.startFrame, voice, text };
  });
