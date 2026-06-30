# KOVAS studio — Remotion templates

Programmatic motion graphics for the studio: **cue title cards** and
**lower-thirds** rendered from JSON — the same cue/slate data Marlowe already
tracks. React in, broadcast-spec PNG/MP4 out. No After Effects.

## Compositions
- **`CueTitleCard`** — show/episode, cue number, title, composer. 1920×1080,
  24fps, transparent background (alpha) so it sits over picture.
- **`LowerThird`** — name + role chip with accent rule.
- **`CueReel`** — every cue in a `cue-list.json` as title cards back-to-back, in
  one render. Duration scales with the cue count.
- **`EndCredits`** — a scrolling end-credit crawl listing every cue.

## Brand kit (`src/brand.ts`)
Typography + palette live in one file. **Offline-first by design** — the
defaults are pure CSS font stacks (no network fetch at render time), so a local
NDA studio renders deterministically. Install/self-host the brand face (or use
`@remotion/google-fonts`, which needs network egress) to upgrade — see "Fonts".

### Fonts
Default = system stacks (`Archivo`/`Inter` first, clean fallbacks). To pin the
exact brand face while staying offline: drop the `.woff2` in `public/`, add an
`@font-face` in a `src/fonts.css`, import it from `src/index.ts`, and keep the
family name first in `brand.ts`'s stacks. Online alternative:
`import { loadFont } from "@remotion/google-fonts/Archivo"` (requires
`fonts.gstatic.com` egress; will fail behind a strict allowlist or offline).

Props are validated by a Zod schema (`src/CueTitleCard.tsx`,
`src/LowerThird.tsx`), so the Remotion Studio shows a live props editor and
`--props` is type-checked at render time.

## Use
```bash
npm install

# Interactive preview / props editor
npm run studio

# Still (alpha PNG) at a chosen frame, from a cue JSON
npx remotion still CueTitleCard out/title.png --frame=60 \
  --props=./src/props/example-cue.json

# Video (defaults to H.264; see remotion.config.ts for ProRes/alpha delivery)
npx remotion render CueTitleCard out/title.mp4 \
  --props=./src/props/example-cue.json

# Whole CUES.md → one reel, or an end-credit crawl
npx remotion render CueReel    out/reel.mp4    --props=./src/props/cue-list.json
npx remotion render EndCredits out/credits.mp4 --props=./src/props/cue-list.json

# Batch: one PNG per cue (output dir OUTSIDE the read-only studio)
node scripts/render-cue-cards.mjs src/props/cue-list.json ~/renders/cards
```

### Headless rendering (servers / CI / this cloud env)
Recent Chrome dropped old-headless; Remotion needs **chrome-headless-shell**.
Point at it with `--browser-executable`. In this environment that was:
```
--browser-executable=/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell
```
On the M1, `npx remotion browser ensure` installs the right shell automatically.

## How Marlowe drives it
Marlowe produces a cue JSON (from `CUES.md`) matching the schema and calls
`remotion render`/`still` to emit a title card or lower-third for a delivery or
a marketing cut. **Phase-1 note:** rendering writes *output* — keep render
targets OUTSIDE the read-only studio roots (e.g. a `~/renders` scratch dir)
until KOVAS promotes write access, and never push studio/NDA frames to a cloud
service.

## Status
Verified rendering here (stills + MP4). This is a **milestone-3 template** — the
motion-graphics layer of the studio, separate from the core agent bundle.
Fonts/brand colors are placeholders; wire `@remotion/google-fonts` or a brand
kit to match KOVAS's identity.
