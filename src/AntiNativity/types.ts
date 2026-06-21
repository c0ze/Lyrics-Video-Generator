export type Voice = "talciron" | "ophelia" | "duet";
export type Temp = "ash" | "lightning" | "bleed" | "neutral" | "white" | "ash-grey";

export interface VoicedLine {
  startFrame: number;
  voice: Voice;
  text: string;
}

export interface SceneDef {
  id: string;
  /** Anchor: either an absolute second, or a 0-based parsed-lyric line index. */
  startSec?: number;
  startLineIndex?: number;
  temp: Temp;
  who: Array<"talciron" | "ophelia">;
  motion:
    | "push-in"
    | "pull-back"
    | "pan-left"
    | "pan-right"
    | "crane-up"
    | "fall"
    | "orbit"
    | "tilt-up";
  transition: "crossfade" | "glitch-cut" | "blowout" | "hard-cut" | "none";
  effects: string[];
  title: string;
  prompt: string;
}

export interface SongScenes {
  palettes: Record<Temp, string>;
  scenes: SceneDef[];
}

export interface ScenesFile {
  style: string;
  negative: string;
  refs: Record<"talciron" | "ophelia", string>;
  characterDirections: Record<"talciron" | "ophelia", string>;
  songs: Record<string, SongScenes>;
}

export interface AntiNativityProps {
  songId: string;
  audioFile: string;
  lyricsText: string;
  coverImageFile: string;
  bannerText: string;
}
