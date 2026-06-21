import trackManifest from "./tracks.json";
import { createPaganProject } from "../shared";
import type { LyricVideoTrack } from "../../lyricVideo/types";

export const paganHeathenUpheavalTracks = trackManifest as LyricVideoTrack[];

export const paganHeathenUpheavalProject = createPaganProject({
  projectId: "Pagan/HeathenUpheaval",
  displayName: "Pagan - Heathen Upheaval",
  tracks: paganHeathenUpheavalTracks,
});
