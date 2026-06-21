import { AbsoluteFill, random, useCurrentFrame } from "remotion";
import type { FC, ReactNode } from "react";

/** Datamosh approximation: horizontal slice-displacement + turbulence smear. intensity 0..1. */
export const Glitch: FC<{ intensity: number; children: ReactNode }> = ({ intensity, children }) => {
  const f = useCurrentFrame();
  const slices = Math.round(2 + intensity * 10);
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ filter: intensity > 0.5 ? "url(#anMosh)" : undefined }}>{children}</AbsoluteFill>
      {Array.from({ length: slices }).map((_, i) => {
        const seed = `${Math.floor(f / 2)}-${i}`;
        const top = random(`t${seed}`) * 100;
        const h = random(`h${seed}`) * 6 + 1;
        const dx = (random(`d${seed}`) - 0.5) * intensity * 120;
        return (
          <AbsoluteFill
            key={i}
            style={{ top: `${top}%`, height: `${h}%`, overflow: "hidden", transform: `translateX(${dx}px)`, opacity: 0.9 }}
          >
            <div style={{ position: "absolute", top: `${-top}vh`, left: 0, width: "100%", height: "100vh" }}>
              {children}
            </div>
          </AbsoluteFill>
        );
      })}
      <svg width="0" height="0">
        <defs>
          <filter id="anMosh">
            <feTurbulence
              type="turbulence"
              baseFrequency={`0.0${Math.max(1, Math.round(intensity * 9))} 0.0${Math.max(1, Math.round(intensity * 4))}`}
              numOctaves="2"
              seed={Math.floor(f / 2)}
              result="t"
            />
            <feDisplacementMap in="SourceGraphic" in2="t" scale={intensity * 60} />
          </filter>
        </defs>
      </svg>
    </AbsoluteFill>
  );
};
