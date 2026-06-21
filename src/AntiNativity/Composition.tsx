import { useEffect, useMemo, useState } from "react";
import {
  AbsoluteFill,
  Audio,
  cancelRender,
  continueRender,
  delayRender,
  Img,
  interpolate,
  OffthreadVideo,
  random,
  Sequence,
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
const VIDEO_SCENES = new Set(["S3", "S6", "S10", "S18"]); // scenes backed by a Veo image-to-video clip
const VEO_USABLE_SEC = 6.8; // play only the first ~6.8s of each 8s clip (drop the drifting tail)

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
    case "recede":
      // zoom out + slight downward drift — she is pulled away, falling into the distance
      return { s: lerp(1.4, 1.1, p), x: 0, y: lerp(-3, 4, p) };
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
        const cf = s.id === "S21" ? 90 : CROSSFADE; // long morph from the S20 crash into the cathedral
        if (frame < s.start - cf || frame >= s.end) return null;
        const p = (frame - s.start) / Math.max(s.end - s.start, 1);
        const isVideo = VIDEO_SCENES.has(s.id);
        // video clips carry their own motion, so hold the camera nearly static over them
        const kb = isVideo ? { s: 1.04, x: 0, y: 0 } : kenBurns(s.motion, p);
        const opacity =
          s.transition === "hard-cut"
            ? frame >= s.start
              ? 1
              : 0
            : interpolate(frame, [s.start - cf, s.start], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              });
        const mediaStyle: React.CSSProperties = {
          width: "100%",
          height: "100%",
          objectFit: "cover",
          transform: `scale(${kb.s}) translate(${kb.x}%, ${kb.y}%)`,
          filter: TEMP_GRADE[s.temp],
        };
        const seqFrom = Math.max(0, s.start - cf);
        const painting = isVideo ? (
          <Sequence from={seqFrom} durationInFrames={Math.max(1, s.end - seqFrom)} name={`${s.id}-video`}>
            <OffthreadVideo
              src={staticFile(`AntiNativity/scenes/${songId}/${s.id}.mp4`)}
              muted
              playbackRate={Math.max(0.1, VEO_USABLE_SEC / Math.max(0.5, (s.end - seqFrom) / fps))}
              style={mediaStyle}
            />
          </Sequence>
        ) : (
          <Img src={staticFile(`AntiNativity/scenes/${songId}/${s.id}.jpg`)} style={mediaStyle} />
        );
        const fx = new Set(s.effects);
        // S20 (the crash) holds clear, then every corruption ramps in together after ~30%
        const crash = clamp01((p - 0.3) * 1.7);
        let layer: React.ReactNode = painting;
        if (fx.has("wireframe-reveal")) layer = <WireframeReveal reveal={Math.sin(p * Math.PI)}>{layer}</WireframeReveal>;
        if (fx.has("recursion-feedback") && (s.id !== "S20" || crash > 0.02)) {
          const depth = s.id === "S20" ? Math.max(1, Math.round(1 + crash * 5)) : 6;
          layer = (
            <RecursionFeedback progress={s.id === "S20" ? crash : p} depth={depth} childrenNode={layer} />
          );
        }
        if (fx.has("rgb-split")) {
          const amount = s.id === "S20" ? crash * 12 : 2 + (s.temp === "white" ? 8 : 4) * Math.sin(p * Math.PI);
          layer = <RGBSplit amount={amount}>{layer}</RGBSplit>;
        }
        if (fx.has("glitch") || fx.has("sixth-finger") || fx.has("multi-version")) {
          const intensity = s.id === "S20" ? crash : 0.35 + 0.25 * Math.sin(p * Math.PI);
          layer = <Glitch intensity={intensity}>{layer}</Glitch>;
        }
        // failing-render flicker (e.g. the weeping Ophelia) — occasional dropouts + subtle pulse
        const flick = fx.has("flicker")
          ? (random(`flk${s.id}${Math.floor(frame / 3)}`) < 0.12 ? 0.5 : 1) *
            (0.9 + 0.1 * Math.sin(frame * 1.3))
          : 1;
        return (
          <AbsoluteFill key={s.id} style={{ opacity: opacity * flick, overflow: "hidden" }}>
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
            // ink-in left-to-right, as if written by hand — slow, calligraphic (~60% of prior speed)
            const revealFrames = Math.min(110, Math.max(30, visible - 18));
            const reveal = clamp01(prog / revealFrames);
            const solid = reveal * 100;
            const mask =
              reveal < 1
                ? `linear-gradient(90deg, #000 ${solid}%, rgba(0,0,0,0) ${Math.min(solid + 8, 100)}%)`
                : "none";
            const op = interpolate(prog, [0, 8, visible - 14, visible], [0, 1, 1, 0], {
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
                  bottom: 140,
                  textAlign: "center",
                  opacity: op,
                  padding: "0 8%",
                }}
              >
                <div
                  style={{
                    display: "inline-block",
                    maxWidth: "84%",
                    fontFamily: FONT_LYRIC,
                    fontStyle: "italic",
                    fontWeight: 600,
                    fontSize: 52,
                    lineHeight: 1.35,
                    color: c.text,
                    textShadow: `0 1px 2px rgba(0,0,0,1), 0 2px 12px rgba(0,0,0,0.95), 0 0 24px ${c.glow}`,
                    WebkitTextStroke: "0.6px rgba(0,0,0,0.55)",
                    WebkitMaskImage: mask,
                    maskImage: mask,
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
              color: "#cdd6df",
              marginTop: 14,
              letterSpacing: "0.12em",
              textShadow: "0 2px 16px rgba(0,0,0,0.98), 0 0 10px rgba(0,0,0,0.9)",
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
