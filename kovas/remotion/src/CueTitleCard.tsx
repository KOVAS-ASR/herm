import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { z } from "zod";
import { displayFont, bodyFont, palette } from "./brand";

// Schema = the contract Marlowe fills from cue data (CUES.md / a cue JSON).
// Keeping it as a Zod schema lets the Remotion Studio render a props editor and
// lets `--props` validate input at render time.
export const cueTitleSchema = z.object({
  show: z.string(),
  episode: z.string(),
  cueNumber: z.string(),
  cueTitle: z.string(),
  composer: z.string(),
  accent: z.string(),
});

export type CueTitleProps = z.infer<typeof cueTitleSchema>;

export const CueTitleCard: React.FC<CueTitleProps> = ({
  show,
  episode,
  cueNumber,
  cueTitle,
  composer,
  accent,
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Spring-in for the title block.
  const enter = spring({ frame, fps, config: { damping: 200 } });
  const translateY = interpolate(enter, [0, 1], [40, 0]);
  const opacity = interpolate(frame, [0, 15], [0, 1], {
    extrapolateRight: "clamp",
  });

  // Hairline rule grows from the accent.
  const ruleW = interpolate(enter, [0, 1], [0, 520]);

  // Gentle fade-out in the last 20 frames so the card can sit over picture.
  const outOpacity = interpolate(
    frame,
    [durationInFrames - 20, durationInFrames - 1],
    [1, 0],
    { extrapolateLeft: "clamp" }
  );

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "transparent",
        justifyContent: "center",
        paddingLeft: 160,
        fontFamily: bodyFont,
        opacity: outOpacity,
      }}
    >
      <div style={{ opacity, transform: `translateY(${translateY}px)` }}>
        <div
          style={{
            color: accent,
            fontSize: 28,
            letterSpacing: 8,
            fontWeight: 600,
          }}
        >
          {show} · {episode}
        </div>
        <div
          style={{
            height: 3,
            width: ruleW,
            backgroundColor: accent,
            margin: "24px 0",
          }}
        />
        <div
          style={{
            color: palette.text,
            fontSize: 96,
            fontWeight: 900,
            fontFamily: displayFont,
          }}
        >
          {cueTitle}
        </div>
        <div
          style={{
            color: palette.textMuted,
            fontSize: 34,
            marginTop: 18,
            letterSpacing: 2,
          }}
        >
          Cue {cueNumber} · Music by {composer}
        </div>
      </div>
    </AbsoluteFill>
  );
};
