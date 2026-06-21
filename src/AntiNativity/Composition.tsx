import { useEffect, useMemo, useState } from "react";
import {
  AbsoluteFill,
  Audio,
  cancelRender,
  continueRender,
  delayRender,
  Img,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import scenesJson from "./scenes.json";
import { parseVoicedLyrics } from "./lyrics";
import type { AntiNativityProps, ScenesFile, SceneDef, Temp } from "./types";
import {
  cinzel,
  cormorant,
  cormorantItalic,
  FONT_DISPLAY,
  FONT_LYRIC,
  TEMP_GRADE,
  TEMP_ATMOSPHERE,
  VOICE_COLOR,
} from "./theme";
import {
  Grain,
  Scanlines,
  Vignette,
  GiltFrame,
  Particles,
  RGBSplit,
  Glitch,
  RecursionFeedback,
  WireframeReveal,
} from "./effects";

const SCENES = (scenesJson as unknown as ScenesFile).songs;
const clamp01 = (t: number) => Math.min(1, Math.max(0, t));
const lerp = (a: number, b: number, t: number) => a + (b - a) * clamp01(t);
const CROSSFADE = 30; // 0.5s @60

const kenBurns = (motion: SceneDef["motion"], p: number) => {
  switch (motion) {
    case "pull-back":
      return { s: lerp(1.22, 1.04, p), x: 0, y: 0 };
    case "pan-left":
      return { s: 1.14, x: lerp(3, -3, p), y: 0 };
    case "pan-right":
      return { s: 1.14, x: lerp(-3, 3, p), y: 0 };
    case "crane-up":
      return { s: 1.16, x: 0, y: lerp(4, -4, p) };
    case "tilt-up":
      return { s: 1.16, x: 0, y: lerp(5, -3, p) };
    case "fall":
      return { s: lerp(1.05, 1.3, p), x: 0, y: lerp(-4, 6, p) };
    case "orbit":
      return { s: 1.16, x: Math.sin(p * Math.PI) * 3, y: Math.cos(p * Math.PI) * 1.5 };
    case "push-in":
    default:
      return { s: lerp(1.05, 1.18, p), x: 0, y: 0 };
  }
};

export const AntiNativityComposition: React.FC<AntiNativityProps> = ({
  songId,
  audioFile,
  lyricsText,
  bannerText,
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const song = SCENES[songId];

  const [handle] = useState(() => delayRender("Anti-Nativity fonts"));
  useEffect(() => {
    Promise.all([cinzel.waitUntilDone(), cormorant.waitUntilDone(), cormorantItalic.waitUntilDone()])
      .then(() => continueRender(handle))
      .catch((e) => cancelRender(e));
  }, [handle]);

  const lines = useMemo(() => parseVoicedLyrics(lyricsText, fps), [lyricsText, fps]);
  const lineStarts = useMemo(() => lines.map((l) => l.startFrame), [lines]);

  const scenes = useMemo(() => {
    const withStart = song.scenes.map((s) => ({
      ...s,
      start:
        typeof s.startSec === "number"
          ? Math.round(s.startSec * fps)
          : (lineStarts[s.startLineIndex ?? 0] ?? 0),
    }));
    return withStart.map((s, i) => ({
      ...s,
      end: i < withStart.length - 1 ? withStart[i + 1].start : durationInFrames,
    }));
  }, [song.scenes, lineStarts, fps, durationInFrames]);

  // active lyric line
  let ai = -1;
  for (let i = lineStarts.length - 1; i >= 0; i--) {
    if (frame >= lineStarts[i]) {
      ai = i;
      break;
    }
  }
  const firstLineStart = lineStarts[0] ?? 0;

  return (
    <AbsoluteFill style={{ backgroundColor: "#05070a" }}>
      <Audio src={staticFile(audioFile)} />

      {/* scene track */}
      {scenes.map((s) => {
        if (frame < s.start - CROSSFADE || frame >= s.end) return null;
        const p = (frame - s.start) / Math.max(s.end - s.start, 1);
        const kb = kenBurns(s.motion, p);
        const opacity =
          s.transition === "hard-cut"
            ? frame >= s.start
              ? 1
              : 0
            : interpolate(frame, [s.start - CROSSFADE, s.start], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              });
        const painting = (
          <Img
            src={staticFile(`AntiNativity/scenes/${songId}/${s.id}.jpg`)}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              transform: `scale(${kb.s}) translate(${kb.x}%, ${kb.y}%)`,
              filter: TEMP_GRADE[s.temp],
            }}
          />
        );
        const fx = new Set(s.effects);
        let layer: React.ReactNode = painting;
        if (fx.has("wireframe-reveal")) layer = <WireframeReveal reveal={Math.sin(p * Math.PI)}>{layer}</WireframeReveal>;
        if (fx.has("recursion-feedback")) layer = <RecursionFeedback progress={p} childrenNode={layer} />;
        if (fx.has("rgb-split"))
          layer = <RGBSplit amount={2 + (s.temp === "white" ? 8 : 4) * Math.sin(p * Math.PI)}>{layer}</RGBSplit>;
        if (fx.has("glitch") || fx.has("sixth-finger") || fx.has("multi-version")) {
          const intensity = s.id === "S20" ? clamp01(p * 1.2) : 0.35 + 0.25 * Math.sin(p * Math.PI);
          layer = <Glitch intensity={intensity}>{layer}</Glitch>;
        }
        return (
          <AbsoluteFill key={s.id} style={{ opacity, overflow: "hidden" }}>
            {layer}
          </AbsoluteFill>
        );
      })}

      {/* atmosphere driven by the active scene's temperature */}
      {(() => {
        const cur = scenes.find((s) => frame >= s.start && frame < s.end) ?? scenes[0];
        const atmo = TEMP_ATMOSPHERE[(cur?.temp ?? "neutral") as Temp];
        return (
          <>
            <AbsoluteFill
              style={{
                zIndex: 6,
                background: `radial-gradient(60% 50% at 50% 30%, ${atmo.fog} 0%, rgba(0,0,0,0) 70%)`,
              }}
            />
            <Particles kind={atmo.kind} color={atmo.particle} />
          </>
        );
      })()}
      <Grain />
      <Scanlines intensity={0.16} />
      <Vignette alpha={0.6} />
      {scenes.some((s) => frame >= s.start && frame < s.end && s.effects.includes("gilt-frame")) && (
        <GiltFrame />
      )}

      {/* lower scrim for legibility */}
      <AbsoluteFill
        style={{
          zIndex: 20,
          pointerEvents: "none",
          background:
            "linear-gradient(to top, rgba(0,0,0,0.74) 0%, rgba(0,0,0,0.32) 18%, rgba(0,0,0,0) 38%)",
        }}
      />

      {/* banner */}
      <div
        style={{
          position: "absolute",
          top: 44,
          left: 56,
          zIndex: 24,
          opacity: interpolate(frame, [firstLineStart - 30, firstLineStart], [0, 0.9], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      >
        <div
          style={{
            fontFamily: FONT_DISPLAY,
            fontWeight: 600,
            fontSize: 26,
            letterSpacing: "0.32em",
            color: "#d8bb66",
            textShadow: "0 2px 10px #000",
          }}
        >
          {bannerText}
        </div>
        <div
          style={{
            fontFamily: FONT_LYRIC,
            fontStyle: "italic",
            fontSize: 24,
            color: "#a9b6c2",
            marginTop: 2,
            textShadow: "0 2px 10px #000",
          }}
        >
          Anti-Nativity
        </div>
      </div>

      {/* lyric lower third */}
      <AbsoluteFill style={{ zIndex: 22, pointerEvents: "none" }}>
        {ai !== -1 &&
          (() => {
            const line = lines[ai];
            const start = lineStarts[ai];
            const nextStart = lineStarts[ai + 1] ?? durationInFrames;
            const visible = Math.min(nextStart - start, 7 * fps);
            const prog = frame - start;
            if (prog > visible) return null;
            const op = interpolate(prog, [0, 12, visible - 14, visible], [0, 1, 1, 0], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            });
            const c = VOICE_COLOR[line.voice];
            return (
              <div
                style={{
                  position: "absolute",
                  left: 0,
                  right: 0,
                  bottom: 150,
                  textAlign: "center",
                  opacity: op,
                  padding: "0 8%",
                }}
              >
                <div
                  style={{
                    fontFamily: FONT_LYRIC,
                    fontStyle: "italic",
                    fontWeight: 600,
                    fontSize: 52,
                    lineHeight: 1.35,
                    color: c.text,
                    textShadow: `0 0 26px ${c.glow}, 0 3px 12px rgba(0,0,0,0.92)`,
                    whiteSpace: "pre-line",
                  }}
                >
                  {line.text}
                </div>
              </div>
            );
          })()}
      </AbsoluteFill>

      {/* title card over the intro */}
      {frame < firstLineStart && (
        <AbsoluteFill
          style={{
            zIndex: 26,
            justifyContent: "center",
            alignItems: "center",
            textAlign: "center",
            opacity:
              interpolate(frame, [16, 60], [0, 1], { extrapolateRight: "clamp" }) *
              interpolate(frame, [firstLineStart - 40, firstLineStart], [1, 0], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }),
          }}
        >
          <div
            style={{
              fontFamily: FONT_DISPLAY,
              fontWeight: 600,
              fontSize: 78,
              letterSpacing: "0.06em",
              color: "#e8d6a6",
              textShadow: "0 0 40px rgba(231,178,94,0.35), 0 4px 20px #000",
            }}
          >
            THE RECURSION OF
            <br />
            ASH AND LIGHTNING
          </div>
          <div
            style={{
              fontFamily: FONT_LYRIC,
              fontStyle: "italic",
              fontSize: 34,
              color: "#9fb0c0",
              marginTop: 14,
              letterSpacing: "0.12em",
            }}
          >
            The Seventh Shadow — Anti-Nativity
          </div>
        </AbsoluteFill>
      )}

      {/* end card */}
      <AbsoluteFill
        style={{
          zIndex: 26,
          justifyContent: "center",
          alignItems: "center",
          textAlign: "center",
          opacity: interpolate(
            frame,
            [durationInFrames - 110, durationInFrames - 70, durationInFrames - 20, durationInFrames],
            [0, 1, 1, 0.85],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
          ),
        }}
      >
        <div
          style={{
            fontFamily: FONT_DISPLAY,
            fontWeight: 600,
            fontSize: 40,
            letterSpacing: "0.3em",
            color: "#d8bb66",
          }}
        >
          THE SEVENTH SHADOW
        </div>
        <div
          style={{
            fontFamily: FONT_LYRIC,
            fontSize: 26,
            letterSpacing: "0.3em",
            textTransform: "uppercase",
            color: "#9fb0c0",
            marginTop: 14,
          }}
        >
          anti-nativity.arda.tr
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
