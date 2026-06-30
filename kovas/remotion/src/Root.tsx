import React from "react";
import { Composition } from "remotion";
import { CueTitleCard, cueTitleSchema } from "./CueTitleCard";
import { LowerThird, lowerThirdSchema } from "./LowerThird";
import exampleCue from "./props/example-cue.json";

// 1920x1080 @ 24fps to match common film/TV picture. Defaults come from the
// example cue JSON; override per render with:
//   npx remotion render CueTitleCard out.mp4 --props=./src/props/example-cue.json
export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="CueTitleCard"
        component={CueTitleCard}
        durationInFrames={96}
        fps={24}
        width={1920}
        height={1080}
        schema={cueTitleSchema}
        defaultProps={exampleCue}
      />
      <Composition
        id="LowerThird"
        component={LowerThird}
        durationInFrames={96}
        fps={24}
        width={1920}
        height={1080}
        schema={lowerThirdSchema}
        defaultProps={{
          name: "KOVAS",
          role: "Composer",
          accent: "#E5B567",
        }}
      />
    </>
  );
};
