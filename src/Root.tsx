import "./index.css";
import { getAudioDurationInSeconds } from "@remotion/media-utils";
import { Composition } from "remotion";
import { staticFile } from "remotion";
import { PaganIntro } from "./PaganIntro";
import {
  getCompositionDurationInFrames,
  loadLyricsText,
  parseLrc,
} from "./lyricVideo/lyrics";
import type { LyricVideoProps } from "./lyricVideo/types";
import { lyricVideoProjects } from "./projects";
import { AntiNativityComposition } from "./AntiNativity/Composition";
import {
  antiNativityTracks,
  ANTI_NATIVITY_BANNER,
  ANTI_NATIVITY_VIDEO,
} from "./AntiNativity/tracks";
import type { AntiNativityProps } from "./AntiNativity/types";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="PaganIntro"
        component={PaganIntro}
        durationInFrames={300} // 5 seconds at 60fps
        fps={60}
        width={1920}
        height={1080}
      />
      {lyricVideoProjects.flatMap((project) =>
        project.tracks.map((track) => (
          <Composition
            key={`${project.projectId}-${track.trackId}`}
            id={track.compositionId}
            component={project.component}
            defaultProps={
              {
                ...project.baseProps,
                coverImageFile: track.coverImageFile,
                lyricsText: "",
              } satisfies LyricVideoProps
            }
            fps={project.video.fps}
            width={project.video.width}
            height={project.video.height}
            calculateMetadata={async ({ abortSignal }) => {
              const [lyricsText, audioDurationInSeconds] = await Promise.all([
                loadLyricsText(track.lyricsFile, abortSignal),
                getAudioDurationInSeconds(staticFile(track.audioFile)).catch(
                  () => {
                    return undefined;
                  },
                ),
              ]);
              const parsedLyrics = parseLrc(lyricsText, project.video.fps);

              return {
                durationInFrames: getCompositionDurationInFrames(
                  parsedLyrics,
                  project.video.fps,
                  audioDurationInSeconds,
                ),
                props: {
                  ...project.baseProps,
                  coverImageFile: track.coverImageFile,
                  lyricsText,
                },
              };
            }}
          />
        )),
      )}
      {antiNativityTracks.map((track) => (
        <Composition
          key={track.compositionId}
          id={track.compositionId}
          component={
            AntiNativityComposition as unknown as React.ComponentType<
              Record<string, unknown>
            >
          }
          durationInFrames={ANTI_NATIVITY_VIDEO.fps * 348}
          fps={ANTI_NATIVITY_VIDEO.fps}
          width={ANTI_NATIVITY_VIDEO.width}
          height={ANTI_NATIVITY_VIDEO.height}
          defaultProps={
            {
              songId: track.songId,
              audioFile: track.audioFile,
              lyricsText: "",
              coverImageFile: track.coverImageFile,
              bannerText: ANTI_NATIVITY_BANNER,
            } satisfies AntiNativityProps
          }
          calculateMetadata={async ({ abortSignal }) => {
            const [lyricsText, audioDuration] = await Promise.all([
              loadLyricsText(track.lyricsFile, abortSignal),
              getAudioDurationInSeconds(staticFile(track.audioFile)).catch(
                () => undefined,
              ),
            ]);
            const parsed = parseLrc(lyricsText, ANTI_NATIVITY_VIDEO.fps);
            return {
              durationInFrames: getCompositionDurationInFrames(
                parsed,
                ANTI_NATIVITY_VIDEO.fps,
                audioDuration,
              ),
              props: {
                songId: track.songId,
                audioFile: track.audioFile,
                lyricsText,
                coverImageFile: track.coverImageFile,
                bannerText: ANTI_NATIVITY_BANNER,
              } satisfies AntiNativityProps,
            };
          }}
        />
      ))}
    </>
  );
};
