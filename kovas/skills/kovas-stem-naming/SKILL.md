---
name: kovas-stem-naming
description: KOVAS's stem and bounce naming convention for film/TV delivery. Use when exporting, bouncing, renaming, or organizing stems and cues so names are consistent and delivery-ready.
version: 1.0.0
platforms: [macos]
metadata:
  hermes:
    tags: [kovas, stems, naming, delivery, workflow]
    provenance: user
---

# KOVAS — stem & cue naming

> ⚠️ STARTER TEMPLATE. This encodes a sensible film/TV default. Edit it to match
> your *actual* convention — then the self-improvement loop will keep it current
> as you correct it in real sessions.

## Cue file pattern
```
<SHOW>_<EP>_<CUE#>_<slug>_<version>.<ext>
# e.g.  NIGHTFALL_S2E04_1m05_main-title_v3.wav
```
- `CUE#` uses reel/minute form (`1m05`) or a plain index — pick one per show and
  stay consistent.
- `slug` is lowercase-hyphenated, no spaces.
- `version` is `vN`; bump on every bounce you keep. Never overwrite a delivered v.

## Stem pattern
```
<SHOW>_<EP>_<CUE#>_STEM_<group>_<version>.wav
# groups (default): DRUMS, BASS, GTR, KEYS, STRINGS, BRASS, WW, SYNTH, PERC, VOX, FX
```
- One group per file. Keep group names from the fixed list above so a delivery
  script can validate them.
- Full mix alongside stems: `..._MIX_<version>.wav`.

## Rules the agent enforces
1. Never rename a file that's already been delivered (check for a `_delivered/`
   folder or a DELIVERY.md log first).
2. Flag any stem whose group isn't in the canonical list.
3. Flag spaces, uppercase slugs, or missing version suffix.
4. When asked to "clean up names," produce a **rename plan** (old → new) and show
   it for approval before moving anything. Never bulk-rename silently.

## What to ask KOVAS to fill in
- Preferred `CUE#` form (reel/minute vs index)?
- Your real stem-group list and order?
- Sample-rate / bit-depth delivery spec (e.g. 48k/24-bit)?
