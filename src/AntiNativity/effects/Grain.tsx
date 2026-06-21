import { AbsoluteFill, useCurrentFrame } from "remotion";
import type { FC } from "react";

const URI =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

/** Animated film grain. */
export const Grain: FC<{ opacity?: number }> = ({ opacity = 0.06 }) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill
      style={{
        zIndex: 30,
        pointerEvents: "none",
        opacity,
        mixBlendMode: "overlay",
        backgroundImage: URI,
        backgroundPosition: `${(f * 7) % 160}px ${(f * 11) % 160}px`,
      }}
    />
  );
};
