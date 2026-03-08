import { staticFile } from "remotion";

export const SEVENTH_SHADOW_FPS = 30;
export const SEVENTH_SHADOW_WIDTH = 1920;
export const SEVENTH_SHADOW_HEIGHT = 1080;

const FINAL_LINE_DURATION_IN_FRAMES = 150;

export type SeventhShadowProps = {
  coverImageFile: string;
  lyricsText: string;
};

export interface LyricLine {
  startFrame: number;
  text: string;
}

export const loadLyricsText = async (
  lyricsFile: string,
  abortSignal?: AbortSignal,
) => {
  const response = await fetch(staticFile(lyricsFile), { signal: abortSignal });

  if (!response.ok) {
    throw new Error(`Failed to load lyrics from ${lyricsFile}.`);
  }

  return response.text();
};

export const parseLrc = (lrc: string, fps: number): LyricLine[] => {
  const lines = lrc.split("\n");
  const regex = /\[(\d+):(\d+)\.(\d+)\](.*)/;
  const parsed: LyricLine[] = [];

  for (const line of lines) {
    const match = line.trim().match(regex);
    if (!match) {
      continue;
    }

    const minutes = Number.parseInt(match[1], 10);
    const seconds = Number.parseInt(match[2], 10);
    const fraction = match[3];
    const text = match[4].trim();
    const totalSeconds =
      minutes * 60 +
      seconds +
      Number.parseInt(fraction, 10) / Math.pow(10, fraction.length);

    parsed.push({
      startFrame: Math.round(totalSeconds * fps),
      text,
    });
  }

  parsed.sort((a, b) => a.startFrame - b.startFrame);

  return parsed.reduce<LyricLine[]>((grouped, line) => {
    const lastLine = grouped[grouped.length - 1];

    if (lastLine && lastLine.startFrame === line.startFrame) {
      lastLine.text += `\n${line.text}`;
      return grouped;
    }

    grouped.push(line);
    return grouped;
  }, []);
};

export const getLineDurationInFrames = (
  currentLine: LyricLine | null,
  nextLine: LyricLine | null,
  compositionDurationInFrames: number,
) => {
  if (!currentLine) {
    return 0;
  }

  if (!nextLine) {
    return Math.max(compositionDurationInFrames - currentLine.startFrame, 1);
  }

  return Math.max(nextLine.startFrame - currentLine.startFrame, 1);
};

export const getCompositionDurationInFrames = (
  lyrics: LyricLine[],
  fps: number,
  audioDurationInSeconds?: number,
) => {
  const lastLine = lyrics[lyrics.length - 1];
  const lyricDurationInFrames = lastLine
    ? lastLine.startFrame + FINAL_LINE_DURATION_IN_FRAMES
    : FINAL_LINE_DURATION_IN_FRAMES;

  if (
    typeof audioDurationInSeconds !== "number" ||
    !Number.isFinite(audioDurationInSeconds)
  ) {
    return lyricDurationInFrames;
  }

  return Math.max(
    Math.ceil(audioDurationInSeconds * fps),
    lyricDurationInFrames,
  );
};
