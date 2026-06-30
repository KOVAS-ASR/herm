// Batch-render one title-card PNG per cue from a cue-list JSON, in one pass.
//
// Usage:
//   node scripts/render-cue-cards.mjs <cue-list.json> <out-dir> [--frame=60] [--browser=<chrome-headless-shell>]
//
// Marlowe calls this to turn a whole CUES.md (exported to JSON) into a folder of
// alpha title cards. Output goes to <out-dir> — keep that OUTSIDE the read-only
// studio (Phase 1) and never upload NDA frames to a cloud service.
import { bundle } from "@remotion/bundler";
import { selectComposition, renderStill } from "@remotion/renderer";
import path from "node:path";
import fs from "node:fs";

const [, , cueListPath, outDir, ...rest] = process.argv;
if (!cueListPath || !outDir) {
  console.error(
    "usage: node scripts/render-cue-cards.mjs <cue-list.json> <out-dir> [--frame=60] [--browser=<path>]"
  );
  process.exit(1);
}

const frameArg = rest.find((a) => a.startsWith("--frame="));
const browserArg = rest.find((a) => a.startsWith("--browser="));
const frame = frameArg ? Number(frameArg.split("=")[1]) : 60;
const browserExecutable = browserArg ? browserArg.split("=")[1] : null;

const data = JSON.parse(fs.readFileSync(cueListPath, "utf8"));
fs.mkdirSync(outDir, { recursive: true });

const slug = (s) =>
  String(s).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

console.log("Bundling…");
const serveUrl = await bundle({
  entryPoint: path.join(process.cwd(), "src", "index.ts"),
});

let n = 0;
for (const cue of data.cues) {
  const inputProps = {
    show: data.show,
    episode: data.episode,
    cueNumber: cue.cueNumber,
    cueTitle: cue.cueTitle,
    composer: data.composer,
    accent: data.accent,
  };
  const composition = await selectComposition({
    serveUrl,
    id: "CueTitleCard",
    inputProps,
    ...(browserExecutable ? { browserExecutable } : {}),
  });
  const output = path.join(
    outDir,
    `${slug(data.show)}_${slug(data.episode)}_${slug(cue.cueNumber)}_${slug(
      cue.cueTitle
    )}.png`
  );
  await renderStill({
    composition,
    serveUrl,
    output,
    frame,
    inputProps,
    ...(browserExecutable ? { browserExecutable } : {}),
  });
  n += 1;
  console.log(`  ✓ ${path.basename(output)}`);
}
console.log(`Done — ${n} card(s) → ${outDir}`);
