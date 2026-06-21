import { AbsoluteFill } from "remotion";
import type { FC, ReactNode } from "react";

/** Bleeds a procedural cyan edge/"wireframe" pass over the painting, swept by `reveal` 0..1. */
export const WireframeReveal: FC<{ reveal: number; children: ReactNode }> = ({ reveal, children }) => {
  const cut = Math.round(reveal * 100);
  const mask = `linear-gradient(105deg, #000 ${cut}%, transparent ${Math.min(cut + 8, 100)}%)`;
  return (
    <AbsoluteFill>
      <AbsoluteFill>{children}</AbsoluteFill>
      <AbsoluteFill
        style={{ WebkitMaskImage: mask, maskImage: mask, filter: "url(#anWire)", mixBlendMode: "screen", opacity: 0.9 }}
      >
        {children}
      </AbsoluteFill>
      <svg width="0" height="0">
        <defs>
          <filter id="anWire">
            <feColorMatrix type="saturate" values="0" />
            <feConvolveMatrix order="3" kernelMatrix="1 1 1 1 -8 1 1 1 1" preserveAlpha="true" result="edges" />
            <feComponentTransfer>
              <feFuncR type="linear" slope="0" />
              <feFuncG type="linear" slope="3" intercept="0.1" />
              <feFuncB type="linear" slope="4" intercept="0.2" />
            </feComponentTransfer>
          </filter>
        </defs>
      </svg>
    </AbsoluteFill>
  );
};
