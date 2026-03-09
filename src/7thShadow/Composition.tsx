import {
  AbsoluteFill,
  Easing,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  random,
  Img,
  staticFile,
} from "remotion";
import { loadFont } from "@remotion/fonts";
import { useMemo } from "react";
import {
  type LyricLine,
  type SeventhShadowProps,
  getLineDurationInFrames,
  parseLrc,
} from "./lyrics";

// Load the local fonts
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
const BACKGROUND_SATURATION = 0.38;
const BACKGROUND_BRIGHTNESS = 0.78;
const BACKGROUND_CONTRAST = 0.92;
const VIGNETTE_ALPHA = 0.82;
const CURRENT_LINE_ENTRY_FRAMES = 10;
const PREVIOUS_LINE_FADE_FRAMES = 22;
const LYRIC_STAGE_HEIGHT = 320;
const LYRIC_BLOCK_WIDTH = "76%";
const LYRIC_STAGE_BOTTOM_OFFSET = 112;
const CURRENT_LINE_START_Y = 28;
const CURRENT_LINE_END_Y = -26;
const PREVIOUS_LINE_MAX_BLUR = 7;

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

// --- Sub-components ---

const Scanlines = ({ intensity }: { intensity: number }) => {
  const frame = useCurrentFrame();

  const offsetY = (frame * 2) % 100; // Moving scanline
  const opacity = random(frame) * 0.06 * intensity + 0.02 * intensity;

  return (
    <AbsoluteFill
      style={{
        pointerEvents: "none",
        zIndex: 10,
        opacity: opacity,
        background: `linear-gradient(to bottom, transparent 50%, rgba(0, 0, 0, 0.32) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.05), rgba(0, 255, 0, 0.015), rgba(0, 0, 255, 0.05))`,
        backgroundSize: "100% 4px, 6px 100%",
        transform: `translateY(${offsetY}px)`,
      }}
    />
  );
};

const PARTICLE_COUNT = 40;

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
      {particles.map((p, i) => {
        const y = (p.y - frame * p.speed) % 120;
        const x = p.x + Math.sin(frame * 0.02 + i) * 3 + frame * p.drift;
        // Flicker: vary opacity per frame deterministically
        const flicker = random(frame * 7 + i) * 0.4 + 0.6;

        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: `${((x % 100) + 100) % 100}%`,
              top: `${((y % 120) + 120) % 120}%`,
              width: p.size,
              height: p.size,
              borderRadius: "50%",
              backgroundColor: "rgba(255, 255, 255, 1)",
              opacity: p.opacity * flicker,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

const getLyricAccent = (text: string) => {
  const lowerText = text.toLowerCase();
  const isChorus = lowerText.includes("yearn");
  const isDecayKeyword =
    lowerText.includes("rust") ||
    lowerText.includes("decay") ||
    lowerText.includes("fade") ||
    lowerText.includes("dust");

  return {
    color: isDecayKeyword ? "#d7b166" : "#ffffff",
    isChorus,
  };
};

const LyricText = ({
  line,
  mode,
  progressFrame,
  duration,
  exitEndY,
}: {
  line: LyricLine;
  mode: "current" | "previous";
  progressFrame: number;
  duration: number;
  exitEndY?: number;
}) => {
  const { color, isChorus } = getLyricAccent(line.text);
  const visibleDuration = Math.max(duration - 1, 1);
  const activeProgress = interpolate(
    progressFrame,
    [0, visibleDuration],
    [0, 1],
    { extrapolateRight: "clamp" },
  );
  const chorusGlow = isChorus
    ? "rgba(80, 255, 170, 0.5)"
    : "rgba(180, 240, 210, 0.24)";
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
    const opacity = interpolate(
      progressFrame,
      [0, CURRENT_LINE_ENTRY_FRAMES],
      [0, 1],
      {
        easing: Easing.out(Easing.cubic),
        extrapolateRight: "clamp",
      },
    );
    const translateY = interpolate(
      activeProgress,
      [0, 1],
      [CURRENT_LINE_START_Y, CURRENT_LINE_END_Y],
      { extrapolateRight: "clamp" },
    );

    return (
      <div
        style={{
          ...commonStyle,
          opacity,
          textShadow: `0 0 16px ${chorusGlow}`,
          transform: `translateX(-50%) translateY(${translateY}px)`,
          transformOrigin: "center bottom",
        }}
      >
        {line.text}
      </div>
    );
  }

  const opacity = interpolate(
    progressFrame,
    [0, PREVIOUS_LINE_FADE_FRAMES],
    [0.78, 0],
    {
      easing: Easing.in(Easing.cubic),
      extrapolateRight: "clamp",
    },
  );

  if (opacity <= 0) {
    return null;
  }

  const translateY = interpolate(
    progressFrame,
    [0, PREVIOUS_LINE_FADE_FRAMES],
    [CURRENT_LINE_END_Y, exitEndY ?? CURRENT_LINE_END_Y],
    { extrapolateRight: "clamp" },
  );
  const blur = interpolate(
    progressFrame,
    [0, PREVIOUS_LINE_FADE_FRAMES],
    [0, PREVIOUS_LINE_MAX_BLUR],
    {
      easing: Easing.in(Easing.quad),
      extrapolateRight: "clamp",
    },
  );

  return (
    <div
      style={{
        ...commonStyle,
        filter: `blur(${blur}px)`,
        opacity,
        textShadow: `0 0 14px ${chorusGlow}`,
        transform: `translateX(-50%) translateY(${translateY}px)`,
        transformOrigin: "center bottom",
      }}
    >
      {line.text}
    </div>
  );
};

export const SeventhShadowComp = ({
  coverImageFile,
  lyricsText,
}: SeventhShadowProps) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const parsedLyrics = useMemo(
    () => parseLrc(lyricsText, fps),
    [lyricsText, fps],
  );
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
    [parsedLyrics, durationInFrames, fps],
  );

  let currentLineIndex = -1;
  for (let i = parsedLyrics.length - 1; i >= 0; i--) {
    const line = parsedLyrics[i];
    const lineDuration = lineDurations[i];

    if (
      frame >= line.startFrame &&
      frame < line.startFrame + lineDuration
    ) {
      currentLineIndex = i;
      break;
    }
  }

  const currentLine =
    currentLineIndex !== -1 ? parsedLyrics[currentLineIndex] : null;
  const currentLineDuration =
    currentLineIndex !== -1 ? lineDurations[currentLineIndex] : 0;
  const previousLine =
    currentLineIndex > 0 ? parsedLyrics[currentLineIndex - 1] : null;
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
    for (let i = parsedLyrics.length - 1; i >= 0; i--) {
      const line = parsedLyrics[i];
      const lineDuration = lineDurations[i];
      const fadeStartFrame = line.startFrame + lineDuration;
      const fadeEndFrame = fadeStartFrame + PREVIOUS_LINE_FADE_FRAMES;
      const nextLineStartFrame = parsedLyrics[i + 1]?.startFrame ?? Infinity;

      if (fadeStartFrame >= nextLineStartFrame) {
        continue;
      }

      if (frame >= fadeStartFrame && frame < fadeEndFrame) {
        timedOutLineIndex = i;
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

  // Determine if we are in a chorus (simple check for repeated phrase or high intensity sections)
  // "I yearn to be free" marks the chorus start usually
  const isChorus = currentLine?.text.toLowerCase().includes("yearn") || false;

  // Scanline intensity
  const scanlineIntensity = isChorus ? 2.5 : 1.0;

  // Ken Burns effect on background
  const scale = interpolate(frame, [0, durationInFrames], [1.1, 1.3], {
    extrapolateRight: "clamp",
  });
  const translateBackground = interpolate(
    frame,
    [0, durationInFrames],
    [0, -50],
    { extrapolateRight: "clamp" },
  );

  // Color temperature shift: cold blue → neutral → warm over the song
  const hueShift = interpolate(
    frame,
    [0, durationInFrames / 2, durationInFrames],
    [-10, 0, 15],
    { extrapolateRight: "clamp" },
  );
  const warmth = interpolate(
    frame,
    [0, durationInFrames / 2, durationInFrames],
    [1.1, 1.0, 0.9],
    { extrapolateRight: "clamp" },
  ); // saturation multiplier

  // Breathing vignette: tighter during chorus
  const vignetteBase = isChorus ? 42 : 50;
  const vignetteBreathe = Math.sin(frame * 0.03) * 2;
  const vignetteSize = vignetteBase + vignetteBreathe;

  // Banner fade-in over first 2 seconds
  const bannerOpacity = interpolate(frame, [0, 60], [0, 0.9], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      {/* Background Layer */}
      <AbsoluteFill style={{ overflow: "hidden" }}>
        <Img
          src={staticFile(coverImageFile)}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transform: `scale(${scale}) translateY(${translateBackground}px)`,
            filter: `saturate(${BACKGROUND_SATURATION * warmth}) brightness(${BACKGROUND_BRIGHTNESS}) contrast(${BACKGROUND_CONTRAST}) hue-rotate(${hueShift}deg)`,
          }}
        />
      </AbsoluteFill>

      {/* Dust Particles */}
      <DustParticles />

      {/* Effects Layer */}
      <Scanlines intensity={scanlineIntensity} />

      {/* Breathing Vignette */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle, transparent ${vignetteSize}%, rgba(0, 0, 0, ${VIGNETTE_ALPHA}) 100%)`,
          zIndex: 5,
        }}
      />

      {/* Band Banner */}
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
          The Seventh Shadow
        </h1>
      </AbsoluteFill>

      {/* Lyrics Layer */}
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
            />
          )}
          {currentLine && (
            <LyricText
              key={`${currentLine.startFrame}-current`}
              line={currentLine}
              mode="current"
              progressFrame={currentLineProgressFrame}
              duration={currentLineDuration}
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
            />
          )}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
