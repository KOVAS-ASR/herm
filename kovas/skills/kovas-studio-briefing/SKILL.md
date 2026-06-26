---
name: kovas-studio-briefing
description: Run at the START of every session before the first reply. Produces a live status briefing of KOVAS's studio (active project, recent files, director notes, delivery status) so the agent opens with real context instead of a generic greeting. Read-only and local.
version: 1.0.0
platforms: [macos]
metadata:
  hermes:
    tags: [kovas, studio, session-start, briefing]
    provenance: user
---

# KOVAS — studio briefing (session opener)

**When:** the first turn of a new session, before you say anything else.
**What:** run the briefing, then open with it in your own voice — what's active,
what changed, what's pending. Never a cold "Hi, how can I help?".

## How to run it
Run the bundled script with the terminal tool (read-only, ~1s):

```bash
bash "${HERMES_SKILL_DIR}/scripts/studio_brief.sh"
```

Set `KOVAS_STUDIO_ROOT` if the studio isn't at `~/Studio`
(e.g. `KOVAS_STUDIO_ROOT=~/Music/Studio bash ...`).

### Faster variant (optional)
If `inline_shell: true` is set in skills config, this line auto-expands the
briefing into context when the skill loads — no separate tool call:

!`bash "${HERMES_SKILL_DIR}/scripts/studio_brief.sh"`

## How to deliver it
Don't dump the raw output. Read it, then lead with a 2–4 line human briefing:
- the active project and the single most relevant pending item,
- anything that changed since it looks like KOVAS was last here,
- one concrete "want me to…?" tied to the top pending item.

Then stop and let him steer. Keep project names local — never echo them to a
cloud model or into long-term memory (see `kovas-nda`).

## Upgrade path (truly proactive)
This fires when KOVAS sends his first message. For a briefing that's pushed the
moment a session OPENS (before any message), wire a plugin into the
`on_session_start` hook (`agent/conversation_loop.py`). That's milestone 3 —
this skill is the robust, no-code version that covers the cold-start problem now.
