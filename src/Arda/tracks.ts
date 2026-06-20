import ardaTrackManifest from "./tracks.json";

export interface ArdaTrack {
  trackId: string;
  title: string;
  compositionId: string;
  songId: string;
  lyricsFile: string;
  audioFile: string;
}

export const ardaTracks = ardaTrackManifest as ArdaTrack[];
