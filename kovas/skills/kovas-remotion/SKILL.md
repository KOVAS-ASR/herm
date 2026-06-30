---
name: kovas-remotion
description: Render studio motion graphics (cue title cards, lower-thirds, marketing cuts) from cue/slate data using the Remotion project in kovas/remotion. Use when KOVAS wants a title card, lower-third, or data-driven video render.
version: 1.0.0
platforms: [macos]
metadata:
  hermes:
    tags: [kovas, remotion, motion-graphics, video, delivery, milestone-3]
    provenance: user
---

# KOVAS — Remotion motion graphics

> Milestone-3 capability. The Remotion project lives at `kovas/remotion`.
> Templates: `CueTitleCard`, `LowerThird`, `CueReel` (all cues → one reel),
> `EndCredits` (crawl). React in → alpha PNG / MP4 out. Brand kit (fonts +
> palette) is centralized in `src/brand.ts` and renders **offline** by default.

## When to use
KOVAS asks for a **title card**, **lower-third**, end-credit, or a small
**data-driven render** (e.g. a promo from a cue or slate entry).

## How to render
1. Build a props JSON matching the composition schema. For `CueTitleCard`:
   `{ show, episode, cueNumber, cueTitle, composer, accent }` — pull these from
   the project's `CUES.md` (cue tracking) or `SLATE.md` (dev tracking).
2. Render to a scratch output dir (see the Phase-1 rule below):
   ```bash
   cd kovas/remotion && npm install   # first run only
   npx remotion render CueTitleCard ~/renders/<show>_<cue>_title.mp4 \
     --props=/path/to/props.json
   # still frame:  npx remotion still CueTitleCard ~/renders/title.png --frame=60 --props=...
   ```
3. On a headless box add `--browser-executable=<chrome-headless-shell>`; on the
   M1 run `npx remotion browser ensure` once.

### Whole CUES.md in one pass
Export the cue list to JSON shaped like `src/props/cue-list.json`
(`{ show, episode, composer, accent, cues: [{cueNumber, cueTitle}] }`), then:
```bash
# one reel of all cue cards / an end-credit crawl
npx remotion render CueReel    ~/renders/reel.mp4    --props=/path/cue-list.json
npx remotion render EndCredits ~/renders/credits.mp4 --props=/path/cue-list.json
# or one card PNG per cue
node scripts/render-cue-cards.mjs /path/cue-list.json ~/renders/cards
```

## Guardrails (Phase 1)
- **Renders are WRITES.** The studio is read-only in Phase 1, so write outputs
  to a scratch dir OUTSIDE the studio roots (e.g. `~/renders/`), never into the
  studio, until KOVAS promotes write access.
- **NDA:** never upload studio/NDA frames or stems to a cloud render/preview
  service. All rendering is local. Don't put project names into a cloud call.
- Confirm the output path with KOVAS before a large/batch render.

## Extend
- New template? Add a composition in `kovas/remotion/src/`, register it in
  `Root.tsx`, give it a Zod schema so props validate.
- Brand: wire `@remotion/google-fonts` + KOVAS's accent palette to replace the
  placeholder Helvetica/gold.
