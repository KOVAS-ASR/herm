---
name: kovas-cue-tracking
description: Track cues, revisions, and director/editor notes across a film/TV scoring project for KOVAS. Use to maintain the cue list, log revision requests, and answer "what's the status of cue X" or "what's left".
version: 1.0.0
platforms: [macos]
metadata:
  hermes:
    tags: [kovas, cues, tracking, revisions, workflow]
    provenance: user
---

# KOVAS — cue tracking

> ⚠️ STARTER TEMPLATE. The cue log lives in the project, not in long-term memory
> (project/cue details may be NDA — see `kovas-nda`). Keep it in the project's
> `CUES.md` so it travels with the work and never enters MEMORY.md.

## The cue log (`<project>/CUES.md`)
One row per cue. Maintain it as a markdown table:

```
| Cue   | Title          | Status   | Ver | Spotted | Notes                         |
|-------|----------------|----------|-----|---------|-------------------------------|
| 1m05  | Main Title     | approved | v3  | yes     | warmer strings (dir) — done   |
| 2m10  | Chase          | revising | v2  | yes     | re-spot to new edit           |
| 3m02  | Resolution     | todo     | -   | no      | awaiting picture lock         |
```

**Status vocabulary (fixed):** `todo` → `writing` → `review` → `revising` →
`approved` → `delivered`.

## What the agent does
- **Log a note:** when KOVAS relays a director/editor note, append it to the cue
  row and set status to `revising`. Timestamp it.
- **Status query:** answer "what's left" / "status of 2m10" by reading `CUES.md`
  — counts by status, plus the next blocking item.
- **Pre-delivery:** cross-check `CUES.md` against actual bounced files (pair with
  `kovas-delivery-checklist`) and flag any `approved` cue with no delivered file,
  or any delivered file with no `approved` status.
- **Keep it honest:** never mark a cue `approved`/`delivered` on your own — only
  when KOVAS confirms.

## What to ask KOVAS to fill in
- Your real status vocabulary if different.
- Whether cues are keyed by reel/minute (`2m10`) or index.
- Where picture/edit versions are tracked (so re-spot notes link to an edit).
