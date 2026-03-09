import type { ComponentType } from "react";
import { LyricVideoComposition } from "../../lyricVideo/Composition";
import type { LyricVideoProject, LyricVideoTrack } from "../../lyricVideo/types";
import trackManifest from "./tracks.json";

export const paganAcolytesTracks = trackManifest as LyricVideoTrack[];

export const paganAcolytesProject: LyricVideoProject = {
  projectId: "Pagan/Acolytes",
  displayName: "Pagan - Acolytes",
  tracks: paganAcolytesTracks,
  component:
    LyricVideoComposition as unknown as ComponentType<Record<string, unknown>>,
  video: {
    fps: 30,
    width: 1920,
    height: 1080,
  },
  baseProps: {
    bannerText: "PAGAN",
    theme: {
      accentKeywords: ["cult", "heathen", "minions", "acolytes", "altar", "blood"],
      accentLyricColor: "#cf7b39",
      backgroundBrightness: 0.7,
      backgroundContrast: 1,
      backgroundHueShift: [4, 12, 22],
      backgroundSaturation: 0.5,
      baseLyricColor: "#f5e8d0",
      chorusGlowColor: "rgba(255, 119, 34, 0.5)",
      chorusKeywords: ["acolytes", "heathen"],
      neutralGlowColor: "rgba(255, 188, 117, 0.24)",
      scanlineBaseIntensity: 1.2,
      scanlineChorusIntensity: 2.2,
      vignetteAlpha: 0.88,
      warmthRange: [1.18, 1.08, 0.98],
    },
  },
};
