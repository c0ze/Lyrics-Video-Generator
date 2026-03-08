import trackManifest from "./tracks.json";

export interface SeventhShadowTrack {
  audioFile: string;
  compositionId: string;
  coverImageFile: string;
  lyricsFile: string;
  title: string;
  trackId: string;
}

export const seventhShadowTracks = trackManifest as SeventhShadowTrack[];
