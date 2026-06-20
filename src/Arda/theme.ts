export type ParticleKind = "leaves" | "snow" | "embers";

export interface ArdaTheme {
  accent: string; // Tengwar + ignite glow color
  english: string; // translation line color
  glow: string; // rgba glow behind the active Tengwar line
  particle: ParticleKind;
  particleColor: string;
  brightness: number;
  contrast: number;
  saturation: number;
  hueShift: [number, number, number];
  vignetteAlpha: number;
  mistColor: string;
}

export const ARDA_THEMES: Record<string, ArdaTheme> = {
  "gwannad-i-lu": {
    accent: "#e7c97e",
    english: "#cdb37a",
    glow: "rgba(216, 180, 106, 0.5)",
    particle: "leaves",
    particleColor: "rgba(216, 180, 106, 0.75)",
    brightness: 0.92,
    contrast: 1.1,
    saturation: 0.92,
    hueShift: [-4, 0, 6],
    vignetteAlpha: 0.8,
    mistColor: "rgba(216, 180, 106, 0.05)",
  },
  "i-dhae-odog": {
    accent: "#d6e6f1",
    english: "#9db6c4",
    glow: "rgba(172, 198, 216, 0.55)",
    particle: "snow",
    particleColor: "rgba(210, 228, 240, 0.7)",
    brightness: 0.9,
    contrast: 1.12,
    saturation: 0.82,
    hueShift: [4, 0, -6],
    vignetteAlpha: 0.82,
    mistColor: "rgba(172, 198, 216, 0.06)",
  },
  "i-dann-haer": {
    accent: "#d98a64",
    english: "#bfa78f",
    glow: "rgba(180, 88, 62, 0.5)",
    particle: "embers",
    particleColor: "rgba(208, 122, 92, 0.8)",
    brightness: 0.86,
    contrast: 1.15,
    saturation: 0.78,
    hueShift: [6, 0, 10],
    vignetteAlpha: 0.85,
    mistColor: "rgba(150, 96, 80, 0.05)",
  },
};
