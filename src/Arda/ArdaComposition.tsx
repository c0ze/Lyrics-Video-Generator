import { loadFont as loadTengwar } from "@remotion/fonts";
import { fontFamily as CINZEL, loadFont as loadCinzel } from "@remotion/google-fonts/Cinzel";
import {
  fontFamily as CORMORANT,
  loadFont as loadCormorant,
} from "@remotion/google-fonts/CormorantGaramond";
import { useEffect, useMemo, useState } from "react";
import {
  AbsoluteFill,
  cancelRender,
  continueRender,
  delayRender,
  Img,
  interpolate,
  random,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { ARDA_LYRICS, type ArdaLyricLine } from "./lyrics.data";
import scenesJson from "./scenes.json";
import { ARDA_THEMES, type ArdaTheme, type ParticleKind } from "./theme";

const TENGWAR = "Tengwar Annatar";
const tengwarReady = loadTengwar({
  family: TENGWAR,
  url: staticFile("fonts/tengwar-annatar-glaemunicode.ttf"),
  weight: "400",
});
const cinzel = loadCinzel("normal", {
  weights: ["500", "600"],
  subsets: ["latin"],
  ignoreTooManyRequestsWarning: true,
});
const cormorant = loadCormorant("normal", {
  weights: ["500"],
  subsets: ["latin"],
  ignoreTooManyRequestsWarning: true,
});
const cormorantItalic = loadCormorant("italic", {
  weights: ["500"],
  subsets: ["latin"],
  ignoreTooManyRequestsWarning: true,
});

const CROSSFADE = 36; // 0.6s @ 60fps
const MAX_LINE_HOLD = 8; // seconds a line stays before fading in a gap
const REVEAL = 72; // frames to ink-in the Tengwar, left to right (slow, calligraphic)
const ENGLISH_IN = 16; // english fades in after the Tengwar is fully revealed
const PREV_FADE = 12; // line fades out quickly at its end (old line gone before next)

type SceneDef = { startLineIndex: number; imageId: string; motion: string };
type SongScenes = {
  palette: string;
  images: { id: string; prompt: string }[];
  scenes: SceneDef[];
};
const SONG_SCENES = (scenesJson as { songs: Record<string, SongScenes> }).songs;

export interface ArdaCompositionProps {
  songId: string;
  hasScenes: boolean;
}

const clamp01 = (t: number) => Math.min(1, Math.max(0, t));
const lerp = (a: number, b: number, t: number) => a + (b - a) * clamp01(t);

const kenBurns = (motion: string, p: number) => {
  switch (motion) {
    case "zoom-out":
      return { scale: lerp(1.16, 1.06, p), x: 0, y: 0 };
    case "pan-left":
      return { scale: 1.12, x: lerp(2.5, -2.5, p), y: 0 };
    case "pan-right":
      return { scale: 1.12, x: lerp(-2.5, 2.5, p), y: 0 };
    case "pan-up":
      return { scale: 1.13, x: 0, y: lerp(2.5, -2.5, p) };
    case "zoom-in":
    default:
      return { scale: lerp(1.06, 1.17, p), x: 0, y: 0 };
  }
};

/* --- atmospheric particles (leaves / snow / embers) -------------------- */
const Particles = ({ kind, color }: { kind: ParticleKind; color: string }) => {
  const frame = useCurrentFrame();
  const count = kind === "snow" ? 60 : kind === "embers" ? 38 : 28;
  const rising = kind === "embers";
  const big = kind === "leaves";
  const particles = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        x: random(`px-${kind}-${i}`) * 100,
        y: random(`py-${kind}-${i}`) * 100,
        size: random(`ps-${kind}-${i}`) * (big ? 7 : 3) + (big ? 4 : 1),
        speed: random(`pp-${kind}-${i}`) * 0.22 + 0.05,
        drift: random(`pd-${kind}-${i}`) * 0.5 - 0.25,
        phase: random(`pf-${kind}-${i}`) * Math.PI * 2,
        opacity: random(`po-${kind}-${i}`) * 0.4 + 0.15,
      })),
    [count, big, kind],
  );

  return (
    <AbsoluteFill style={{ zIndex: 8, pointerEvents: "none" }}>
      {particles.map((p, i) => {
        const travel = frame * p.speed * (rising ? -1 : 1);
        const y = (((p.y + travel) % 120) + 120) % 120;
        const sway = Math.sin(frame * 0.02 + p.phase) * 3;
        const x = (((p.x + sway + frame * p.drift) % 100) + 100) % 100;
        const flicker = rising ? random(frame * 3 + i) * 0.5 + 0.5 : 1;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: `${x}%`,
              top: `${y}%`,
              width: p.size,
              height: big ? p.size * 0.7 : p.size,
              borderRadius: big ? "60% 40% 55% 45%" : "50%",
              background: color,
              opacity: p.opacity * flicker,
              transform: big ? `rotate(${frame * 0.6 + p.phase * 30}deg)` : undefined,
              boxShadow: rising ? `0 0 ${p.size * 2}px ${color}` : undefined,
              filter: kind === "snow" ? "blur(0.5px)" : undefined,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

/* --- film grain -------------------------------------------------------- */
const GRAIN_URI =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";
const Grain = () => {
  const frame = useCurrentFrame();
  const x = (frame * 7) % 160;
  const y = (frame * 11) % 160;
  return (
    <AbsoluteFill
      style={{
        zIndex: 11,
        pointerEvents: "none",
        opacity: 0.05,
        mixBlendMode: "overlay",
        backgroundImage: GRAIN_URI,
        backgroundPosition: `${x}px ${y}px`,
      }}
    />
  );
};

/* --- one lyric line: Tengwar over English ------------------------------ */
const LyricLine = ({
  line,
  progress,
  visible,
  theme,
}: {
  line: ArdaLyricLine;
  progress: number;
  visible: number;
  theme: ArdaTheme;
}) => {
  const isChorus = line.kind === "chorus";
  const glow = isChorus ? theme.glow.replace(/0\.\d+\)$/, "0.72)") : theme.glow;

  // No vertical motion. Tengwar inks in left-to-right; English fades in after it.
  // Reveal is capped to the line's window so short lines still finish + show English.
  const revealFrames = Math.min(REVEAL, Math.max(24, visible - ENGLISH_IN - 10));
  const reveal = clamp01(progress / revealFrames);
  const englishOpacity = clamp01((progress - revealFrames) / ENGLISH_IN);
  // Fade out quickly at the end of the line's window (no overlap with the next line).
  const containerOpacity = interpolate(progress, [visible - PREV_FADE, visible], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  if (containerOpacity <= 0) return null;

  const solid = reveal * 100;
  const mask =
    reveal < 1
      ? `linear-gradient(90deg, #000 ${solid}%, rgba(0,0,0,0) ${Math.min(solid + 10, 100)}%)`
      : "none";

  return (
    <div
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        textAlign: "center",
        opacity: containerOpacity,
      }}
    >
      <div
        aria-hidden
        style={{
          display: "inline-block",
          maxWidth: "86%",
          fontFamily: TENGWAR,
          fontSize: 96,
          lineHeight: 1.5,
          color: theme.accent,
          textShadow: `0 0 26px ${glow}, 0 0 10px rgba(0,0,0,0.9), 0 3px 10px rgba(0,0,0,0.85)`,
          WebkitTextStroke: "1px rgba(0,0,0,0.45)",
          WebkitMaskImage: mask,
          maskImage: mask,
        }}
      >
        {line.teng}
      </div>
      <div
        style={{
          fontFamily: CORMORANT,
          fontStyle: "italic",
          fontSize: 40,
          marginTop: 4,
          color: theme.english,
          opacity: englishOpacity,
          textShadow: "0 2px 10px rgba(0,0,0,0.92), 0 0 6px rgba(0,0,0,0.8)",
        }}
      >
        {line.en}
      </div>
    </div>
  );
};

export const ArdaComposition = ({ songId, hasScenes }: ArdaCompositionProps) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const song = ARDA_LYRICS[songId];
  const theme = ARDA_THEMES[songId];
  const sceneDefs = SONG_SCENES[songId].scenes;

  const [handle] = useState(() => delayRender("Arda fonts"));
  useEffect(() => {
    Promise.all([
      tengwarReady,
      cinzel.waitUntilDone(),
      cormorant.waitUntilDone(),
      cormorantItalic.waitUntilDone(),
    ])
      .then(() => continueRender(handle))
      .catch((err) => cancelRender(err));
  }, [handle]);

  const lines = song.lines;
  const lineStarts = useMemo(
    () => lines.map((l) => Math.round(l.timeSec * fps)),
    [lines, fps],
  );

  const scenes = useMemo(() => {
    const withStart = sceneDefs.map((s, i) => ({
      ...s,
      start: i === 0 ? 0 : Math.round(lines[s.startLineIndex].timeSec * fps),
    }));
    return withStart.map((s, i) => ({
      ...s,
      end: i < withStart.length - 1 ? withStart[i + 1].start : durationInFrames,
    }));
  }, [sceneDefs, lines, fps, durationInFrames]);

  // active + previous lyric line
  let activeIndex = -1;
  for (let i = lineStarts.length - 1; i >= 0; i--) {
    if (frame >= lineStarts[i]) {
      activeIndex = i;
      break;
    }
  }
  const maxHold = MAX_LINE_HOLD * fps;
  let active: { line: ArdaLyricLine; progress: number; visible: number } | null = null;
  if (activeIndex !== -1) {
    const start = lineStarts[activeIndex];
    const nextStart = lineStarts[activeIndex + 1] ?? durationInFrames;
    const visible = Math.min(nextStart - start, maxHold);
    const progress = frame - start;
    if (progress <= visible) {
      active = { line: lines[activeIndex], progress, visible };
    }
  }

  const firstLineStart = lineStarts[0] ?? 0;
  const hueShift = interpolate(
    frame,
    [0, durationInFrames / 2, durationInFrames],
    theme.hueShift,
    { extrapolateRight: "clamp" },
  );

  return (
    <AbsoluteFill style={{ backgroundColor: "#06080a" }}>
      {/* themed base (also the keyless placeholder) */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(130% 110% at 50% 32%, ${theme.glow} 0%, rgba(0,0,0,0) 56%), linear-gradient(180deg, #090c0e 0%, #050607 100%)`,
        }}
      />

      {/* scene track */}
      {hasScenes &&
        scenes.map((s, i) => {
          if (frame < s.start - CROSSFADE || frame >= s.end) return null;
          const p = (frame - s.start) / Math.max(s.end - s.start, 1);
          const kb = kenBurns(s.motion, p);
          const opacity = interpolate(frame, [s.start - CROSSFADE, s.start], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          return (
            <AbsoluteFill key={i} style={{ opacity, overflow: "hidden" }}>
              <Img
                src={staticFile(`Arda/scenes/${songId}/${s.imageId}.jpg`)}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  transform: `scale(${kb.scale}) translate(${kb.x}%, ${kb.y}%)`,
                  filter: `saturate(${theme.saturation}) brightness(${theme.brightness}) contrast(${theme.contrast}) hue-rotate(${hueShift}deg)`,
                }}
              />
            </AbsoluteFill>
          );
        })}

      {/* atmosphere */}
      <AbsoluteFill
        style={{
          zIndex: 6,
          background: `radial-gradient(60% 50% at 50% 18%, ${theme.mistColor} 0%, rgba(0,0,0,0) 70%)`,
          transform: `translateX(${Math.sin(frame * 0.006) * 3}%)`,
        }}
      />
      <Particles kind={theme.particle} color={theme.particleColor} />
      <Grain />
      <AbsoluteFill
        style={{
          zIndex: 7,
          background: `radial-gradient(circle, transparent 46%, rgba(0,0,0,${theme.vignetteAlpha}) 100%)`,
        }}
      />
      {/* lower scrim for lyric legibility over bright scenes */}
      <AbsoluteFill
        style={{
          zIndex: 20,
          pointerEvents: "none",
          background:
            "linear-gradient(to top, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.36) 20%, rgba(0,0,0,0) 40%)",
        }}
      />

      {/* corner banner */}
      <div
        style={{
          position: "absolute",
          top: 46,
          left: 56,
          zIndex: 25,
          opacity: interpolate(frame, [firstLineStart - 30, firstLineStart], [0, 0.92], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      >
        <div
          style={{
            fontFamily: CINZEL,
            fontWeight: 600,
            fontSize: 30,
            letterSpacing: "0.34em",
            color: theme.accent,
            textShadow: "0 2px 10px rgba(0,0,0,0.9), 0 0 6px rgba(0,0,0,0.85)",
          }}
        >
          ARDA
        </div>
        <div
          style={{
            fontFamily: CORMORANT,
            fontStyle: "italic",
            fontSize: 26,
            color: theme.english,
            marginTop: 2,
            textShadow: "0 2px 10px rgba(0,0,0,0.92), 0 0 6px rgba(0,0,0,0.85)",
          }}
        >
          {song.titleEn}
        </div>
      </div>

      {/* title card during the intro */}
      {frame < firstLineStart && (
        <AbsoluteFill
          style={{
            zIndex: 26,
            justifyContent: "center",
            alignItems: "center",
            textAlign: "center",
            opacity:
              interpolate(frame, [12, 54], [0, 1], { extrapolateRight: "clamp" }) *
              interpolate(frame, [firstLineStart - 36, firstLineStart], [1, 0], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }),
          }}
        >
          <div
            aria-hidden
            style={{
              fontFamily: TENGWAR,
              fontSize: 150,
              lineHeight: 1.5,
              color: theme.accent,
              textShadow: `0 0 40px ${theme.glow}, 0 4px 20px rgba(0,0,0,0.95), 0 0 10px rgba(0,0,0,0.85)`,
            }}
          >
            {song.titleTeng}
          </div>
          <div
            style={{
              fontFamily: CINZEL,
              fontSize: 56,
              letterSpacing: "0.18em",
              color: "#efe7d6",
              marginTop: 8,
              textShadow: "0 3px 18px rgba(0,0,0,0.95), 0 0 10px rgba(0,0,0,0.85)",
            }}
          >
            {song.title}
          </div>
          <div
            style={{
              fontFamily: CORMORANT,
              fontStyle: "italic",
              fontSize: 36,
              color: theme.english,
              marginTop: 10,
              textShadow: "0 2px 14px rgba(0,0,0,0.95), 0 0 8px rgba(0,0,0,0.85)",
            }}
          >
            {song.titleEn}
          </div>
        </AbsoluteFill>
      )}

      {/* lyrics lower third */}
      <AbsoluteFill style={{ zIndex: 22, pointerEvents: "none" }}>
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 150,
            height: 280,
          }}
        >
          {active && (
            <LyricLine
              key={lineStarts[activeIndex]}
              line={active.line}
              progress={active.progress}
              visible={active.visible}
              theme={theme}
            />
          )}
        </div>
      </AbsoluteFill>

      {/* end card */}
      <AbsoluteFill
        style={{
          zIndex: 27,
          justifyContent: "center",
          alignItems: "center",
          textAlign: "center",
          opacity: interpolate(
            frame,
            [durationInFrames - 90, durationInFrames - 40],
            [0, 1],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
          ),
        }}
      >
        <div
          style={{
            fontFamily: CINZEL,
            fontWeight: 600,
            fontSize: 64,
            letterSpacing: "0.34em",
            color: theme.accent,
          }}
        >
          ARDA
        </div>
        <div
          style={{
            fontFamily: CORMORANT,
            fontSize: 30,
            letterSpacing: "0.3em",
            textTransform: "uppercase",
            color: theme.english,
            marginTop: 14,
          }}
        >
          lind.arda.tr
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
