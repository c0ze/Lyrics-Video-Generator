import trackManifest from "./tracks.json";
import { createPaganProject } from "../shared";
import type { LyricVideoTrack } from "../../lyricVideo/types";

export const paganAcolytesTracks = trackManifest as LyricVideoTrack[];

export const paganAcolytesProject = createPaganProject({
  projectId: "Pagan/Acolytes",
  displayName: "Pagan - Acolytes",
  tracks: paganAcolytesTracks,
});
