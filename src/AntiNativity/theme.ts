import { fontFamily as CINZEL, loadFont as loadCinzel } from "@remotion/google-fonts/Cinzel";
import {
  fontFamily as CORMORANT,
  loadFont as loadCormorant,
} from "@remotion/google-fonts/CormorantGaramond";
import type { Temp, Voice } from "./types";

export const cinzel = loadCinzel("normal", {
  weights: ["500", "600"],
  subsets: ["latin"],
  ignoreTooManyRequestsWarning: true,
});
export const cormorant = loadCormorant("normal", {
  weights: ["500"],
  subsets: ["latin"],
  ignoreTooManyRequestsWarning: true,
});
export const cormorantItalic = loadCormorant("italic", {
  weights: ["500", "600"],
  subsets: ["latin"],
  ignoreTooManyRequestsWarning: true,
});
export const FONT_DISPLAY = CINZEL;
export const FONT_LYRIC = CORMORANT;

/** CSS filter grade per scene temperature, applied to the painting layer. */
export const TEMP_GRADE: Record<Temp, string> = {
  ash: "saturate(0.9) brightness(1.02) contrast(1.05) sepia(0.12) hue-rotate(-8deg)",
  lightning: "saturate(1.1) brightness(0.98) contrast(1.1) hue-rotate(8deg)",
  bleed: "saturate(1.05) brightness(1.0) contrast(1.08)",
  neutral: "saturate(0.85) brightness(1.0) contrast(1.04)",
  white: "saturate(1.2) brightness(1.18) contrast(1.0)",
  "ash-grey": "saturate(0.25) brightness(0.9) contrast(1.05)",
};

/** Lyric color + glow per singing voice. */
export const VOICE_COLOR: Record<Voice, { text: string; glow: string }> = {
  talciron: { text: "#f0cf93", glow: "rgba(231,178,94,0.55)" },
  ophelia: { text: "#bfeaff", glow: "rgba(80,210,255,0.55)" },
  duet: { text: "#ece0c6", glow: "rgba(190,200,210,0.5)" },
};

/** Atmosphere tint + particle kind per temperature for fog/particles. */
export const TEMP_ATMOSPHERE: Record<
  Temp,
  { fog: string; particle: string; kind: "ash" | "rain" | "embers" }
> = {
  ash: { fog: "rgba(231,178,94,0.10)", particle: "rgba(240,196,116,0.8)", kind: "embers" },
  lightning: { fog: "rgba(80,200,255,0.10)", particle: "rgba(150,230,255,0.7)", kind: "rain" },
  bleed: { fog: "rgba(150,160,180,0.10)", particle: "rgba(200,210,220,0.6)", kind: "rain" },
  neutral: { fog: "rgba(120,150,180,0.10)", particle: "rgba(170,200,220,0.5)", kind: "rain" },
  white: { fog: "rgba(255,255,255,0.16)", particle: "rgba(220,235,255,0.7)", kind: "embers" },
  "ash-grey": { fog: "rgba(150,150,150,0.10)", particle: "rgba(170,170,170,0.7)", kind: "ash" },
};
