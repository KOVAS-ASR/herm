import { Config } from "@remotion/cli/config";

// PNG stills with alpha so title cards / lower-thirds can be composited over
// picture in the DAW/NLE. Video renders default to H.264; switch to ProRes
// (Config.setCodec("prores")) for delivery with an alpha channel if needed.
Config.setVideoImageFormat("png");
Config.setOverwriteOutput(true);
