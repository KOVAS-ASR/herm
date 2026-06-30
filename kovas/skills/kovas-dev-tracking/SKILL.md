---
name: kovas-dev-tracking
description: Track KOVAS's film/TV development slate — projects in development, loglines, status, who's attached, coverage notes, and next milestones. Use to answer "where's the slate", "what's owed on X", or to log a development update. The development-lead counterpart to kovas-cue-tracking.
version: 1.0.0
platforms: [macos]
metadata:
  hermes:
    tags: [kovas, development, slate, film-tv, tracking, workflow]
    provenance: user
---

# KOVAS — development slate tracking

> ⚠️ STARTER TEMPLATE. This is the spine for the "second development lead" role.
> The slate lives **in the project** (`Development/<project>/SLATE.md`), never in
> long-term memory — titles, attachments, and deal terms are NDA-sensitive
> (see `kovas-nda`). Phase 1 is read-only: you maintain the slate by proposing
> the edit for KOVAS to apply, not by writing it yourself.

## The slate file (`Development/<project>/SLATE.md`)
First line is the one-liner the briefing surfaces. Keep a structured body:

```
Optioned; first draft due to network Q3; dir attached.   ← line 1 = briefing status

# <Project>
- Logline: <one sentence>
- Format: <feature / limited series / doc / etc.>
- Status: development        # see vocabulary below
- Attached: <dir/talent/producers>
- Rights: <optioned / owned / in negotiation> — <expiry if any>
- Owed: <next deliverable> — <due>
- Next milestone: <what unblocks the next stage>
- Coverage: references to coverage/notes files in this folder
```

**Status vocabulary (fixed):** `idea` → `development` → `packaging` →
`pitching` → `setup` → `in-production` → `delivered` / `shelved`.

## What the agent does (development-lead mode)
- **Slate query:** "where's the slate" / "what's owed" → read every
  `Development/*/SLATE.md`, summarize by status, surface the nearest-due Owed
  items and anything with a rights expiry approaching.
- **Log an update:** when KOVAS relays a development beat (new attachment, a
  pass, a note from a buyer), propose the exact `SLATE.md` edit (old → new) for
  him to apply. Update the line-1 status string so the next briefing reflects it.
- **Coverage/notes:** when asked, read coverage or notes files in the project
  and give a tight summary; flag contradictions with the logline/status.
- **Stay honest:** never advance a project's status on your own — only when
  KOVAS confirms. Don't invent attachments, dates, or buyer interest.

## What to ask KOVAS to fill in
- Your real status vocabulary if different.
- Where coverage/scripts live (`.fdx`, `.pdf`, treatments) per project.
- Which buyers/networks are active (so "pitching" can track who's seen what) —
  keep that list local and NDA-safe.
