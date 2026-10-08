import { AbsoluteFill } from "remotion";
import type { FC } from "react";

/** Soft dark vignette for focus + legibility. */
export const Vignette: FC<{ alpha?: number }> = ({ alpha = 0.62 }) => (
  <AbsoluteFill
    style={{
      zIndex: 28,
      pointerEvents: "none",
      background: `radial-gradient(circle at 50% 46%, transparent 52%, rgba(0,0,0,${alpha}) 100%)`,
    }}
  />
);
