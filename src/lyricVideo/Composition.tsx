import { loadFont } from "@remotion/fonts";
import { useMemo } from "react";
import {
  AbsoluteFill,
  Easing,
  Img,
  interpolate,
  random,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import {
  getLineDurationInFrames,
  parseLrc,
  type LyricLine,
} from "./lyrics";
import type { LyricVideoProps, LyricVideoTheme } from "./types";

loadFont({
  family: "Amstrong",
  url: staticFile("fonts/Amstrong.otf"),
  weight: "400",
});
loadFont({
  family: "CinzelDecorative",
  url: staticFile("fonts/CinzelDecorative-Regular.ttf"),
  weight: "400",
});

const bannerFont = "Amstrong";
const lyricsFont = "CinzelDecorative";
const CURRENT_LINE_ENTRY_FRAMES = 10;
const PREVIOUS_LINE_FADE_FRAMES = 22;
const LYRIC_STAGE_HEIGHT = 320;
const LYRIC_BLOCK_WIDTH = "76%";
const LYRIC_STAGE_BOTTOM_OFFSET = 112;
const CURRENT_LINE_START_Y = 28;
const CURRENT_LINE_END_Y = -26;
const PREVIOUS_LINE_MAX_BLUR = 7;
const PARTICLE_COUNT = 40;

const DEFAULT_THEME: Required<LyricVideoTheme> = {
  accentKeywords: [],
  accentLyricColor: "#ffffff",
  backgroundBrightness: 0.82,
  backgroundContrast: 0.95,
  backgroundHueShift: [0, 0, 0],
  backgroundSaturation: 0.45,
  backgroundScaleRange: [1.1, 1.3],
  backgroundTranslateYRange: [0, -50],
  baseLyricColor: "#ffffff",
  chorusGlowColor: "rgba(255, 255, 255, 0.38)",
  chorusKeywords: [],
  neutralGlowColor: "rgba(255, 255, 255, 0.22)",
  scanlineBaseIntensity: 1,
  scanlineChorusIntensity: 1.8,
  vignetteAlpha: 0.82,
  vignetteBaseSize: 50,
  vignetteChorusSize: 42,
  warmthRange: [1, 1, 1],
};

const getLineExitEndY = (lineDuration: number) => {
  if (lineDuration <= 1) {
    return CURRENT_LINE_END_Y;
  }

  return (
    CURRENT_LINE_END_Y +
    ((CURRENT_LINE_END_Y - CURRENT_LINE_START_Y) / (lineDuration - 1)) *
      PREVIOUS_LINE_FADE_FRAMES
  );
};

const resolveTheme = (theme?: LyricVideoTheme): Required<LyricVideoTheme> => ({
  ...DEFAULT_THEME,
  ...theme,
  accentKeywords: theme?.accentKeywords ?? DEFAULT_THEME.accentKeywords,
  backgroundHueShift:
    theme?.backgroundHueShift ?? DEFAULT_THEME.backgroundHueShift,
  backgroundScaleRange:
    theme?.backgroundScaleRange ?? DEFAULT_THEME.backgroundScaleRange,
  backgroundTranslateYRange:
    theme?.backgroundTranslateYRange ?? DEFAULT_THEME.backgroundTranslateYRange,
  chorusKeywords: theme?.chorusKeywords ?? DEFAULT_THEME.chorusKeywords,
  warmthRange: theme?.warmthRange ?? DEFAULT_THEME.warmthRange,
});

const textIncludesKeyword = (text: string, keywords: string[]) => {
  const lowerText = text.toLowerCase();
  return keywords.some((keyword) => lowerText.includes(keyword.toLowerCase()));
};

const Scanlines = ({
  intensity,
}: {
  intensity: number;
}) => {
  const frame = useCurrentFrame();
  const offsetY = (frame * 2) % 100;
  const opacity = random(frame) * 0.06 * intensity + 0.02 * intensity;

  return (
    <AbsoluteFill
      style={{
        pointerEvents: "none",
        zIndex: 10,
        opacity,
        background:
          "linear-gradient(to bottom, transparent 50%, rgba(0, 0, 0, 0.32) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.05), rgba(0, 255, 0, 0.015), rgba(0, 0, 255, 0.05))",
        backgroundSize: "100% 4px, 6px 100%",
        transform: `translateY(${offsetY}px)`,
      }}
    />
  );
};

const DustParticles = () => {
  const frame = useCurrentFrame();
  const particles = useMemo(() => {
    return Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
      x: random(`dust-x-${i}`) * 100,
      y: random(`dust-y-${i}`) * 100,
      size: random(`dust-s-${i}`) * 3 + 1,
      speed: random(`dust-sp-${i}`) * 0.3 + 0.05,
      drift: random(`dust-d-${i}`) * 0.2 - 0.1,
      opacity: random(`dust-o-${i}`) * 0.3 + 0.1,
    }));
  }, []);

  return (
    <AbsoluteFill style={{ pointerEvents: "none", zIndex: 8 }}>
      {particles.map((particle, index) => {
        const y = (particle.y - frame * particle.speed) % 120;
        const x =
          particle.x + Math.sin(frame * 0.02 + index) * 3 + frame * particle.drift;
        const flicker = random(frame * 7 + index) * 0.4 + 0.6;

        return (
          <div
            key={index}
            style={{
              position: "absolute",
              left: `${((x % 100) + 100) % 100}%`,
              top: `${((y % 120) + 120) % 120}%`,
              width: particle.size,
              height: particle.size,
              borderRadius: "50%",
              backgroundColor: "rgba(255, 255, 255, 1)",
              opacity: particle.opacity * flicker,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

const getLyricAccent = (text: string, theme: Required<LyricVideoTheme>) => {
  const isChorus = textIncludesKeyword(text, theme.chorusKeywords);
  const isAccentLine = textIncludesKeyword(text, theme.accentKeywords);

  return {
    color: isAccentLine ? theme.accentLyricColor : theme.baseLyricColor,
    isChorus,
  };
};

const LyricText = ({
  duration,
  exitEndY,
  line,
  mode,
  progressFrame,
  theme,
}: {
  duration: number;
  exitEndY?: number;
  line: LyricLine;
  mode: "current" | "previous";
  progressFrame: number;
  theme: Required<LyricVideoTheme>;
}) => {
  const { color, isChorus } = getLyricAccent(line.text, theme);
  const visibleDuration = Math.max(duration - 1, 1);
  const activeProgress = interpolate(progressFrame, [0, visibleDuration], [0, 1], {
    extrapolateRight: "clamp",
  });
  const glowColor = isChorus ? theme.chorusGlowColor : theme.neutralGlowColor;
  const commonStyle = {
    bottom: 0,
    color,
    fontFamily: lyricsFont,
    fontSize: "3.25rem",
    fontWeight: 400,
    left: "50%",
    lineHeight: 1.22,
    margin: 0,
    position: "absolute" as const,
    textAlign: "center" as const,
    whiteSpace: "pre-wrap" as const,
    width: LYRIC_BLOCK_WIDTH,
  };

  if (mode === "current") {
    const opacity = interpolate(progressFrame, [0, CURRENT_LINE_ENTRY_FRAMES], [0, 1], {
      easing: Easing.out(Easing.cubic),
      extrapolateRight: "clamp",
    });
    const translateY = interpolate(activeProgress, [0, 1], [CURRENT_LINE_START_Y, CURRENT_LINE_END_Y], {
      extrapolateRight: "clamp",
    });

    return (
      <div
        style={{
          ...commonStyle,
          opacity,
          textShadow: `0 0 16px ${glowColor}`,
          transform: `translateX(-50%) translateY(${translateY}px)`,
          transformOrigin: "center bottom",
        }}
      >
        {line.text}
      </div>
    );
  }

  const opacity = interpolate(progressFrame, [0, PREVIOUS_LINE_FADE_FRAMES], [0.78, 0], {
    easing: Easing.in(Easing.cubic),
    extrapolateRight: "clamp",
  });

  if (opacity <= 0) {
    return null;
  }

  const translateY = interpolate(
    progressFrame,
    [0, PREVIOUS_LINE_FADE_FRAMES],
    [CURRENT_LINE_END_Y, exitEndY ?? CURRENT_LINE_END_Y],
    { extrapolateRight: "clamp" },
  );
  const blur = interpolate(progressFrame, [0, PREVIOUS_LINE_FADE_FRAMES], [0, PREVIOUS_LINE_MAX_BLUR], {
    easing: Easing.in(Easing.quad),
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        ...commonStyle,
        filter: `blur(${blur}px)`,
        opacity,
        textShadow: `0 0 14px ${glowColor}`,
        transform: `translateX(-50%) translateY(${translateY}px)`,
        transformOrigin: "center bottom",
      }}
    >
      {line.text}
    </div>
  );
};

export const LyricVideoComposition = ({
  bannerText,
  coverImageFile,
  lyricsText,
  theme,
}: LyricVideoProps) => {
  const frame = useCurrentFrame();
  const { durationInFrames, fps } = useVideoConfig();
  const resolvedTheme = resolveTheme(theme);

  const parsedLyrics = useMemo(() => parseLrc(lyricsText, fps), [lyricsText, fps]);
  const lineDurations = useMemo(
    () =>
      parsedLyrics.map((line, index) =>
        getLineDurationInFrames(
          line,
          parsedLyrics[index + 1] ?? null,
          durationInFrames,
          fps,
        ),
      ),
    [durationInFrames, fps, parsedLyrics],
  );

  let currentLineIndex = -1;
  for (let index = parsedLyrics.length - 1; index >= 0; index--) {
    const line = parsedLyrics[index];
    const lineDuration = lineDurations[index];

    if (frame >= line.startFrame && frame < line.startFrame + lineDuration) {
      currentLineIndex = index;
      break;
    }
  }

  const currentLine = currentLineIndex !== -1 ? parsedLyrics[currentLineIndex] : null;
  const currentLineDuration = currentLineIndex !== -1 ? lineDurations[currentLineIndex] : 0;
  const previousLine = currentLineIndex > 0 ? parsedLyrics[currentLineIndex - 1] : null;
  const previousLineDuration =
    currentLineIndex > 0 ? lineDurations[currentLineIndex - 1] : 0;
  const previousLineExitEndY = getLineExitEndY(previousLineDuration);
  const shouldRenderPreviousLine =
    previousLine !== null &&
    currentLine !== null &&
    previousLine.startFrame + previousLineDuration >= currentLine.startFrame;
  const currentLineProgressFrame =
    currentLine !== null ? frame - currentLine.startFrame : 0;
  let timedOutLineIndex = -1;

  if (currentLineIndex === -1) {
    for (let index = parsedLyrics.length - 1; index >= 0; index--) {
      const line = parsedLyrics[index];
      const lineDuration = lineDurations[index];
      const fadeStartFrame = line.startFrame + lineDuration;
      const fadeEndFrame = fadeStartFrame + PREVIOUS_LINE_FADE_FRAMES;
      const nextLineStartFrame = parsedLyrics[index + 1]?.startFrame ?? Infinity;

      if (fadeStartFrame >= nextLineStartFrame) {
        continue;
      }

      if (frame >= fadeStartFrame && frame < fadeEndFrame) {
        timedOutLineIndex = index;
        break;
      }
    }
  }

  const timedOutLine =
    timedOutLineIndex !== -1 ? parsedLyrics[timedOutLineIndex] : null;
  const timedOutLineDuration =
    timedOutLineIndex !== -1 ? lineDurations[timedOutLineIndex] : 0;
  const timedOutLineProgressFrame =
    timedOutLine !== null
      ? frame - (timedOutLine.startFrame + timedOutLineDuration)
      : 0;
  const timedOutLineExitEndY = getLineExitEndY(timedOutLineDuration);
  const isChorus =
    currentLine !== null &&
    textIncludesKeyword(currentLine.text, resolvedTheme.chorusKeywords);
  const scanlineIntensity = isChorus
    ? resolvedTheme.scanlineChorusIntensity
    : resolvedTheme.scanlineBaseIntensity;
  const backgroundScale = interpolate(
    frame,
    [0, durationInFrames],
    resolvedTheme.backgroundScaleRange,
    { extrapolateRight: "clamp" },
  );
  const translateBackground = interpolate(
    frame,
    [0, durationInFrames],
    resolvedTheme.backgroundTranslateYRange,
    { extrapolateRight: "clamp" },
  );
  const hueShift = interpolate(
    frame,
    [0, durationInFrames / 2, durationInFrames],
    resolvedTheme.backgroundHueShift,
    { extrapolateRight: "clamp" },
  );
  const warmth = interpolate(
    frame,
    [0, durationInFrames / 2, durationInFrames],
    resolvedTheme.warmthRange,
    { extrapolateRight: "clamp" },
  );
  const vignetteBase = isChorus
    ? resolvedTheme.vignetteChorusSize
    : resolvedTheme.vignetteBaseSize;
  const vignetteBreathe = Math.sin(frame * 0.03) * 2;
  const vignetteSize = vignetteBase + vignetteBreathe;
  const bannerOpacity = interpolate(frame, [0, 60], [0, 0.9], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <AbsoluteFill style={{ overflow: "hidden" }}>
        <Img
          src={staticFile(coverImageFile)}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transform: `scale(${backgroundScale}) translateY(${translateBackground}px)`,
            filter: `saturate(${resolvedTheme.backgroundSaturation * warmth}) brightness(${resolvedTheme.backgroundBrightness}) contrast(${resolvedTheme.backgroundContrast}) hue-rotate(${hueShift}deg)`,
          }}
        />
      </AbsoluteFill>

      <DustParticles />
      <Scanlines intensity={scanlineIntensity} />

      <AbsoluteFill
        style={{
          background: `radial-gradient(circle, transparent ${vignetteSize}%, rgba(0, 0, 0, ${resolvedTheme.vignetteAlpha}) 100%)`,
          zIndex: 5,
        }}
      />

      <AbsoluteFill
        style={{
          justifyContent: "flex-start",
          alignItems: "flex-start",
          paddingTop: "40px",
          paddingLeft: "40px",
          zIndex: 25,
        }}
      >
        <h1
          style={{
            fontFamily: bannerFont,
            color: "#ffffff",
            fontSize: "5rem",
            textShadow: "0 0 20px rgba(255, 255, 255, 0.5)",
            opacity: bannerOpacity,
            letterSpacing: "0.1em",
            margin: 0,
          }}
        >
          {bannerText}
        </h1>
      </AbsoluteFill>

      <AbsoluteFill
        style={{
          pointerEvents: "none",
          zIndex: 20,
        }}
      >
        <div
          style={{
            height: `${LYRIC_STAGE_HEIGHT}px`,
            bottom: `${LYRIC_STAGE_BOTTOM_OFFSET}px`,
            left: 0,
            overflow: "visible",
            position: "absolute",
            right: 0,
            width: "100%",
          }}
        >
          {shouldRenderPreviousLine && currentLine && previousLine && (
            <LyricText
              line={previousLine}
              mode="previous"
              progressFrame={currentLineProgressFrame}
              duration={PREVIOUS_LINE_FADE_FRAMES}
              exitEndY={previousLineExitEndY}
              theme={resolvedTheme}
            />
          )}
          {currentLine && (
            <LyricText
              key={`${currentLine.startFrame}-current`}
              line={currentLine}
              mode="current"
              progressFrame={currentLineProgressFrame}
              duration={currentLineDuration}
              theme={resolvedTheme}
            />
          )}
          {timedOutLine && (
            <LyricText
              key={`${timedOutLine.startFrame}-timeout`}
              line={timedOutLine}
              mode="previous"
              progressFrame={timedOutLineProgressFrame}
              duration={PREVIOUS_LINE_FADE_FRAMES}
              exitEndY={timedOutLineExitEndY}
              theme={resolvedTheme}
            />
          )}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
