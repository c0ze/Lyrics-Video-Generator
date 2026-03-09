import type { ComponentType } from "react";

export interface LyricVideoTrack {
  audioFile: string;
  compositionId: string;
  coverImageFile: string;
  lyricsFile: string;
  title: string;
  trackId: string;
}

export interface LyricVideoTheme {
  accentKeywords?: string[];
  accentLyricColor?: string;
  backgroundBrightness?: number;
  backgroundContrast?: number;
  backgroundHueShift?: [number, number, number];
  backgroundSaturation?: number;
  backgroundScaleRange?: [number, number];
  backgroundTranslateYRange?: [number, number];
  baseLyricColor?: string;
  chorusGlowColor?: string;
  chorusKeywords?: string[];
  neutralGlowColor?: string;
  scanlineBaseIntensity?: number;
  scanlineChorusIntensity?: number;
  vignetteAlpha?: number;
  vignetteBaseSize?: number;
  vignetteChorusSize?: number;
  warmthRange?: [number, number, number];
}

export interface LyricVideoProps {
  bannerText: string;
  coverImageFile: string;
  lyricsText: string;
  theme?: LyricVideoTheme;
}

export interface LyricVideoProject {
  baseProps: Omit<LyricVideoProps, "coverImageFile" | "lyricsText">;
  component: ComponentType<Record<string, unknown>>;
  displayName: string;
  projectId: string;
  tracks: LyricVideoTrack[];
  video: {
    fps: number;
    height: number;
    width: number;
  };
}
