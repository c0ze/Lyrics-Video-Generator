import { AbsoluteFill } from "remotion";
import type { FC, ReactNode } from "react";

/** Chromatic aberration — splits the children into red/cyan copies offset by `amount` px. */
export const RGBSplit: FC<{ amount: number; children: ReactNode }> = ({ amount, children }) => (
  <AbsoluteFill>
    <AbsoluteFill
      style={{ transform: `translateX(${-amount}px)`, mixBlendMode: "screen", filter: "url(#anRed)" }}
    >
      {children}
    </AbsoluteFill>
    <AbsoluteFill
      style={{ transform: `translateX(${amount}px)`, mixBlendMode: "screen", filter: "url(#anCyan)" }}
    >
      {children}
    </AbsoluteFill>
    <svg width="0" height="0">
      <defs>
        <filter id="anRed">
          <feColorMatrix type="matrix" values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" />
        </filter>
        <filter id="anCyan">
          <feColorMatrix type="matrix" values="0 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 1 0" />
        </filter>
      </defs>
    </svg>
  </AbsoluteFill>
);
