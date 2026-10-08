import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import type { FC } from "react";

/** Subtle CRT scanlines with a slow vertical roll. */
export const Scanlines: FC<{ intensity?: number }> = ({ intensity = 0.22 }) => {
  const f = useCurrentFrame();
  const roll = interpolate(f % 240, [0, 240], [0, 4]);
  return (
    <AbsoluteFill
      style={{
        zIndex: 29,
        pointerEvents: "none",
        opacity: intensity,
        backgroundImage:
          "repeating-linear-gradient(0deg, rgba(0,0,0,0.55) 0px, rgba(0,0,0,0.55) 1px, transparent 2px, transparent 3px)",
        backgroundPosition: `0 ${roll}px`,
      }}
    />
  );
};
