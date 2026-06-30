# KOVAS studio — Remotion templates

Programmatic motion graphics for the studio: **cue title cards** and
**lower-thirds** rendered from JSON — the same cue/slate data Marlowe already
tracks. React in, broadcast-spec PNG/MP4 out. No After Effects.

## Compositions
- **`CueTitleCard`** — show/episode, cue number, title, composer. 1920×1080,
  24fps, transparent background (alpha) so it sits over picture.
- **`LowerThird`** — name + role chip with accent rule.

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
