import { AbsoluteFill, random, useCurrentFrame } from "remotion";
import { useMemo, type FC } from "react";

/** Atmospheric particles: drifting ash, falling neon rain, or rising embers. */
export const Particles: FC<{ kind: "ash" | "rain" | "embers"; color: string }> = ({
  kind,
  color,
}) => {
  const frame = useCurrentFrame();
  const count = kind === "rain" ? 90 : kind === "embers" ? 44 : 70;
  const rising = kind === "embers";
  const p = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        x: random(`x${kind}${i}`) * 100,
        y: random(`y${kind}${i}`) * 100,
        len: kind === "rain" ? random(`l${i}`) * 12 + 8 : random(`s${kind}${i}`) * 3 + 1,
        speed: (kind === "rain" ? 1.4 : 0.25) * (random(`v${kind}${i}`) * 0.6 + 0.7),
        drift: random(`d${kind}${i}`) * 0.4 - 0.2,
        op: random(`o${kind}${i}`) * 0.4 + 0.15,
      })),
    [count, kind],
  );
  return (
    <AbsoluteFill style={{ zIndex: 8, pointerEvents: "none" }}>
      {p.map((q, i) => {
        const travel = frame * q.speed * (rising ? -1 : 1);
        const y = (((q.y + travel) % 120) + 120) % 120;
        const x = (((q.x + Math.sin(frame * 0.02 + i) * 2 + frame * q.drift) % 100) + 100) % 100;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: `${x}%`,
              top: `${y}%`,
              width: kind === "rain" ? 1.4 : q.len,
              height: q.len,
              borderRadius: kind === "rain" ? 0 : "50%",
              background: color,
              opacity: q.op,
              transform: kind === "rain" ? "rotate(12deg)" : undefined,
              boxShadow: rising ? `0 0 ${q.len * 2}px ${color}` : undefined,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};
