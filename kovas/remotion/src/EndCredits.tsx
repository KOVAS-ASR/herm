import React from "react";
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { z } from "zod";
import { displayFont, bodyFont, palette } from "./brand";

// A classic bottom-to-top music end-crawl listing every cue. Driven by the
// same cue-list JSON as CueReel.
export const endCreditsSchema = z.object({
  show: z.string(),
  episode: z.string(),
  composer: z.string(),
  accent: z.string(),
  cues: z.array(z.object({ cueNumber: z.string(), cueTitle: z.string() })),
});

export type EndCreditsProps = z.infer<typeof endCreditsSchema>;

export const EndCredits: React.FC<EndCreditsProps> = ({
  show,
  episode,
  composer,
  accent,
  cues,
}) => {
  const frame = useCurrentFrame();
  const { height, durationInFrames } = useVideoConfig();

  // Scroll the whole block from just below the frame to fully above it.
  const blockHeight = 320 + cues.length * 92 + 260;
  const y = interpolate(
    frame,
    [0, durationInFrames - 1],
    [height, -blockHeight],
    { extrapolateRight: "clamp" }
  );

  return (
    <AbsoluteFill
      style={{
        backgroundColor: palette.bg,
        fontFamily: bodyFont,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: y,
          width: "100%",
          textAlign: "center",
        }}
      >
        <div
          style={{
            color: palette.text,
            fontSize: 64,
            fontWeight: 900,
            fontFamily: displayFont,
            letterSpacing: 2,
          }}
        >
          {show}
        </div>
        <div
          style={{
            color: accent,
            fontSize: 30,
            letterSpacing: 10,
            marginTop: 10,
          }}
        >
          {episode} · ORIGINAL SCORE
        </div>
        <div
          style={{
            color: palette.textMuted,
            fontSize: 28,
            margin: "28px 0 64px",
          }}
        >
          Music by {composer}
        </div>

        {cues.map((cue) => (
          <div
            key={cue.cueNumber}
            style={{
              display: "flex",
              justifyContent: "center",
              gap: 24,
              padding: "16px 0",
              fontSize: 34,
            }}
          >
            <span
              style={{
                color: accent,
                width: 140,
                textAlign: "right",
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {cue.cueNumber}
            </span>
            <span style={{ color: palette.text, width: 560, textAlign: "left" }}>
              {cue.cueTitle}
            </span>
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};
