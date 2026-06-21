import { AbsoluteFill, useCurrentFrame } from "remotion";
import type { FC, ReactNode } from "react";

/** Nested shrinking copies of a layer — the Obsidian-Lake recursion tunnel. */
export const RecursionFeedback: FC<{ depth?: number; childrenNode: ReactNode; progress: number }> = ({
  depth = 6,
  childrenNode,
  progress,
}) => {
  const f = useCurrentFrame();
  const drift = Math.min(1, Math.max(0, progress));
  return (
    <AbsoluteFill>
      {Array.from({ length: depth }).map((_, i) => {
        const k = i / depth;
        const scale = 1 - k * 0.72 - drift * 0.06;
        return (
          <AbsoluteFill
            key={i}
            style={{
              transform: `scale(${Math.max(0.05, scale)}) translateY(${Math.sin(f * 0.01 + i) * 1.5}%)`,
              opacity: 1 - k * 0.8,
              filter: `hue-rotate(${i * 6}deg) saturate(${1 + i * 0.1})`,
              mixBlendMode: i === 0 ? "normal" : "screen",
            }}
          >
            {childrenNode}
          </AbsoluteFill>
        );
      })}
    </AbsoluteFill>
  );
};
