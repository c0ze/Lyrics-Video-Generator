import "./index.css";
import { getAudioDurationInSeconds } from "@remotion/media-utils";
import { Composition } from "remotion";
import { PaganIntro } from "./PaganIntro";
import { SeventhShadowComp } from "./7thShadow/Composition";
import {
  SEVENTH_SHADOW_FPS,
  SEVENTH_SHADOW_HEIGHT,
  SEVENTH_SHADOW_WIDTH,
  getCompositionDurationInFrames,
  loadLyricsText,
  parseLrc,
  type SeventhShadowProps,
} from "./7thShadow/lyrics";
import { seventhShadowTracks } from "./7thShadow/tracks";
import { staticFile } from "remotion";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="PaganIntro"
        component={PaganIntro}
        durationInFrames={150} // 5 seconds at 30fps
        fps={30}
        width={1920}
        height={1080}
      />
      {seventhShadowTracks.map((track) => (
        <Composition
          key={track.trackId}
          id={track.compositionId}
          component={SeventhShadowComp}
          defaultProps={
            {
              coverImageFile: track.coverImageFile,
              lyricsText: "",
            } satisfies SeventhShadowProps
          }
          fps={SEVENTH_SHADOW_FPS}
          width={SEVENTH_SHADOW_WIDTH}
          height={SEVENTH_SHADOW_HEIGHT}
          calculateMetadata={async ({ abortSignal }) => {
            const [lyricsText, audioDurationInSeconds] = await Promise.all([
              loadLyricsText(track.lyricsFile, abortSignal),
              getAudioDurationInSeconds(staticFile(track.audioFile)).catch(
                () => {
                  return undefined;
                },
              ),
            ]);
            const parsedLyrics = parseLrc(lyricsText, SEVENTH_SHADOW_FPS);

            return {
              durationInFrames: getCompositionDurationInFrames(
                parsedLyrics,
                SEVENTH_SHADOW_FPS,
                audioDurationInSeconds,
              ),
              props: {
                coverImageFile: track.coverImageFile,
                lyricsText,
              },
            };
          }}
        />
      ))}
    </>
  );
};
