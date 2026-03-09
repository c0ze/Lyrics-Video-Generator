import type { LyricVideoProps } from "../lyricVideo/types";

export const SEVENTH_SHADOW_FPS = 30;
export const SEVENTH_SHADOW_WIDTH = 1920;
export const SEVENTH_SHADOW_HEIGHT = 1080;

export type SeventhShadowProps = LyricVideoProps;

export {
  getCompositionDurationInFrames,
  getLineDurationInFrames,
  loadLyricsText,
  parseLrc,
  type LyricLine,
} from "../lyricVideo/lyrics";
