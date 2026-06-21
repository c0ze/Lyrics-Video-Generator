import trackManifest from "./tracks.json";

export interface AntiNativityTrack {
  trackId: string;
  title: string;
  compositionId: string;
  songId: string;
  lyricsFile: string;
  audioFile: string;
  coverImageFile: string;
  audioBitrate?: string;
  audioSampleRate?: string;
}

export const antiNativityTracks = trackManifest as AntiNativityTrack[];
export const ANTI_NATIVITY_BANNER = "THE SEVENTH SHADOW";
export const ANTI_NATIVITY_VIDEO = { width: 1920, height: 1080, fps: 60 };
