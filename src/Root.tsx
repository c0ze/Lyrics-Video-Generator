import "./index.css";
import type { ComponentType } from "react";
import { getAudioDurationInSeconds } from "@remotion/media-utils";
import { Composition } from "remotion";
import { staticFile } from "remotion";
import { PaganIntro } from "./PaganIntro";
import { resolveBackdropImageFile } from "./lyricVideo/backdrop";
import {
  getCompositionDurationInFrames,
  loadLyricsText,
  parseLrc,
} from "./lyricVideo/lyrics";
import type { LyricVideoProps } from "./lyricVideo/types";
import { lyricVideoProjects } from "./projects";
import { ArdaComposition } from "./Arda/ArdaComposition";
import { ardaTracks } from "./Arda/tracks";
import { ARDA_LYRICS } from "./Arda/lyrics.data";

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
                backdropImageFile: project.backdropImageCandidates[0],
                lyricsText: "",
              } satisfies LyricVideoProps
            }
            fps={project.video.fps}
            width={project.video.width}
            height={project.video.height}
            calculateMetadata={async ({ abortSignal }) => {
              const [lyricsText, audioDurationInSeconds, backdropImageFile] =
                await Promise.all([
                  loadLyricsText(track.lyricsFile, abortSignal),
                  getAudioDurationInSeconds(staticFile(track.audioFile)).catch(
                    () => {
                      return undefined;
                    },
                  ),
                  resolveBackdropImageFile(project.backdropImageCandidates),
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
                  backdropImageFile,
                  lyricsText,
                },
              };
            }}
          />
        )),
      )}
      {ardaTracks.map((track) => (
        <Composition
          key={track.compositionId}
          id={track.compositionId}
          component={
            ArdaComposition as unknown as ComponentType<Record<string, unknown>>
          }
          fps={60}
          width={1920}
          height={1080}
          defaultProps={{ songId: track.songId, hasScenes: false }}
          calculateMetadata={async () => {
            const audioDurationInSeconds = await getAudioDurationInSeconds(
              staticFile(track.audioFile),
            ).catch(() => undefined);
            const lines = ARDA_LYRICS[track.songId].lines;
            const fallbackSeconds = lines[lines.length - 1].timeSec + 8;
            const durationSeconds = audioDurationInSeconds ?? fallbackSeconds;
            const hasScenes = await fetch(
              staticFile(`Arda/scenes/${track.songId}/01.jpg`),
            )
              .then((response) => response.ok)
              .catch(() => false);
            return {
              durationInFrames: Math.ceil(durationSeconds * 60),
              props: { songId: track.songId, hasScenes },
            };
          }}
        />
      ))}
    </>
  );
};
