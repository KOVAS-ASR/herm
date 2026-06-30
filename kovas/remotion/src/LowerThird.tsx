import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { z } from "zod";

export const lowerThirdSchema = z.object({
  name: z.string(),
  role: z.string(),
  accent: z.string(),
});

export type LowerThirdProps = z.infer<typeof lowerThirdSchema>;

export const LowerThird: React.FC<LowerThirdProps> = ({
  name,
  role,
  accent,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame, fps, config: { damping: 200 } });
  const x = interpolate(enter, [0, 1], [-600, 0]);

  return (
    <AbsoluteFill
      style={{
        justifyContent: "flex-end",
        alignItems: "flex-start",
        padding: 140,
        fontFamily: "Helvetica, Arial, sans-serif",
      }}
    >
      <div style={{ transform: `translateX(${x}px)` }}>
        <div
          style={{
            display: "inline-block",
            backgroundColor: "rgba(0,0,0,0.72)",
            borderLeft: `6px solid ${accent}`,
            padding: "18px 28px",
          }}
        >
          <div style={{ color: "white", fontSize: 52, fontWeight: 700 }}>
            {name}
          </div>
          <div style={{ color: accent, fontSize: 28, marginTop: 6 }}>
            {role}
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
