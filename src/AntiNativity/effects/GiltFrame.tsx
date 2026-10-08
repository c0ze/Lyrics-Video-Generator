import { AbsoluteFill } from "remotion";
import type { FC } from "react";

/** A thin gilt altarpiece border — used only on the closing scenes (S23/S24), never baked into art. */
export const GiltFrame: FC<{ opacity?: number }> = ({ opacity = 0.8 }) => (
  <AbsoluteFill style={{ zIndex: 27, pointerEvents: "none", opacity }}>
    <svg viewBox="0 0 1920 1080" width="100%" height="100%" preserveAspectRatio="none">
      <rect x="22" y="22" width="1876" height="1036" fill="none" stroke="#c2a04e" strokeWidth="3" opacity="0.8" />
      <rect x="34" y="34" width="1852" height="1012" fill="none" stroke="#c2a04e" strokeWidth="1" opacity="0.45" />
      <path
        d="M22 92 Q22 22 92 22 M1898 92 Q1898 22 1828 22 M22 988 Q22 1058 92 1058 M1898 988 Q1898 1058 1828 1058"
        fill="none"
        stroke="#d8bb66"
        strokeWidth="4"
        opacity="0.85"
      />
    </svg>
  </AbsoluteFill>
);
