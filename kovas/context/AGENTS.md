# Studio context  (goes at the studio root, e.g. ~/Studio/AGENTS.md)

> Hermes auto-injects this file into the system prompt's context tier when the
> agent's working directory is the studio (`build_context_files_prompt`,
> ~20K-char cap). It's the static "what is this place" layer; the live status
> comes from the `kovas-studio-briefing` skill. Edit freely.

## What this directory is
KOVAS's working studio. Active scoring/production projects live under
`Projects/<SHOW>_<EP>/`. This is an NDA-allowed root — the agent may read and
write here, but treat project names and client material as confidential
(see the `kovas-nda` skill).

## Vocabulary (so the agent isn't generic)
- **Cue** — a piece of score for a specific moment, keyed by reel/minute (e.g.
  `2m10`) or index. Tracked in each project's `CUES.md` (`kovas-cue-tracking`).
- **Stem** — a grouped bounce (DRUMS, STRINGS, SYNTH, …) for delivery, separate
  from the full mix. Naming: `kovas-stem-naming`.
- **Spotting** — deciding where cues go against picture.
- **Re-spot** — updating a cue because the edit changed.
- **Delivery** — packaged stems + mixes sent to a music editor/client, after the
  `kovas-delivery-checklist` passes.

## Per-project convention
```
Projects/<SHOW>_<EP>/
  STATUS.md      # short current-state notes (the briefing surfaces this)
  CUES.md        # the cue log
  DELIVERY.md    # what was delivered, when, to whom
  <session files, bounces, stems>
```

## Tooling reality (set expectations)
The agent's lane is *around* the DAW: prepping stems/MIDI/scaffolds, organizing
sessions, tracking cues, running delivery QC. It does **not** make creative
mixing decisions — KOVAS mixes in Studio One Pro / Ableton Live and delivers
from Pro Tools. Direct DAW control (Ableton) and delivery scripting (SoundFlow)
are a later milestone, deliberately not enabled yet.
