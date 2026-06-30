import React from "react";
import { Composition } from "remotion";
import { CueTitleCard, cueTitleSchema } from "./CueTitleCard";
import { LowerThird, lowerThirdSchema } from "./LowerThird";
import { CueReel, cueReelSchema, PER_CUE_FRAMES } from "./CueReel";
import { EndCredits, endCreditsSchema } from "./EndCredits";
import exampleCue from "./props/example-cue.json";
import cueList from "./props/cue-list.json";

// 1920x1080 @ 24fps to match common film/TV picture. Defaults come from JSON in
// src/props; override per render with --props=/path/to/your.json
const FPS = 24;
const CREDITS_SECONDS = 12;

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="CueTitleCard"
        component={CueTitleCard}
        durationInFrames={96}
        fps={FPS}
        width={1920}
        height={1080}
        schema={cueTitleSchema}
        defaultProps={exampleCue}
      />
      <Composition
        id="LowerThird"
        component={LowerThird}
        durationInFrames={96}
        fps={FPS}
        width={1920}
        height={1080}
        schema={lowerThirdSchema}
        defaultProps={{ name: "KOVAS", role: "Composer", accent: "#E5B567" }}
      />
      {/* Whole CUES.md → one reel of title cards. Duration scales with cue count. */}
      <Composition
        id="CueReel"
        component={CueReel}
        durationInFrames={Math.max(1, cueList.cues.length) * PER_CUE_FRAMES}
        fps={FPS}
        width={1920}
        height={1080}
        schema={cueReelSchema}
        defaultProps={cueList}
      />
      {/* Scrolling end-credit crawl of every cue. */}
      <Composition
        id="EndCredits"
        component={EndCredits}
        durationInFrames={CREDITS_SECONDS * FPS}
        fps={FPS}
        width={1920}
        height={1080}
        schema={endCreditsSchema}
        defaultProps={cueList}
      />
    </>
  );
};
