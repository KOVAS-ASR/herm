import React from "react";
import { AbsoluteFill, Series } from "remotion";
import { z } from "zod";
import { CueTitleCard } from "./CueTitleCard";
import { palette } from "./brand";

// Whole CUES.md in one pass: each cue becomes a title card, played back-to-back
// as one render. Duration is derived from the cue count (see PER_CUE in Root).
export const cueReelSchema = z.object({
  show: z.string(),
  episode: z.string(),
  composer: z.string(),
  accent: z.string(),
  cues: z.array(
    z.object({ cueNumber: z.string(), cueTitle: z.string() })
  ),
});

export type CueReelProps = z.infer<typeof cueReelSchema>;

export const PER_CUE_FRAMES = 96; // keep in sync with Root's durationInFrames calc

export const CueReel: React.FC<CueReelProps> = ({
  show,
  episode,
  composer,
  accent,
  cues,
}) => {
  return (
    <AbsoluteFill style={{ backgroundColor: palette.bg }}>
      <Series>
        {cues.map((cue) => (
          <Series.Sequence
            key={cue.cueNumber}
            durationInFrames={PER_CUE_FRAMES}
          >
            <CueTitleCard
              show={show}
              episode={episode}
              cueNumber={cue.cueNumber}
              cueTitle={cue.cueTitle}
              composer={composer}
              accent={accent}
            />
          </Series.Sequence>
        ))}
      </Series>
    </AbsoluteFill>
  );
};
