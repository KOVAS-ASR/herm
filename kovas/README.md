# KOVAS local-agent bundle

A **config-first** setup for a lean, local, NDA-safe Hermes agent on the
M1/Mac Mini — the corrected counterpart to Search's delete-down build spec.

## Why config-first (the one-paragraph version)
Hermes discovers tools dynamically (`tools/registry.py` imports each
`tools/*.py` in a try/except), lazy-imports provider adapters, and registers
messaging platforms through a registry with no hardcoded chains. So unused
code is **already inert** — deleting it saves no runtime and risks *silent*
breakage (a kept file importing a deleted one is caught, logged as a warning,
and the tool quietly vanishes). We select what's on via config instead, and
keep `hermes update` + upstream improvements to the self-improving skills loop.

## Files & where they go on the M1

| Bundle file | Destination on M1 | Notes |
|---|---|---|
| `config.yaml` | `~/.hermes/config.yaml` | KOVAS profile: 4-provider fleet, curated toolsets, NDA block, approval on |
| `SOUL.md` | `~/.hermes/SOUL.md` | Agent identity; loaded into the stable system-prompt tier |
| `nda_guard.py` | `~/.hermes/hermes-agent/agent/nda_guard.py` | New module; allowlist + audit for file access |
| `skills/kovas-nda/SKILL.md` | `~/.hermes/skills/kovas-nda/SKILL.md` | User-authored NDA rules (curator never edits it) |
| `kovas-build-spec.md` | (reference) | The corrected build plan |

### Milestone 2 — studio context (no cold starts)

| Bundle file | Destination on M1 | Notes |
|---|---|---|
| `skills/kovas-studio-briefing/` | `~/.hermes/skills/kovas-studio-briefing/` | Session opener: runs `scripts/studio_brief.sh`, agent leads with a live status briefing |
| `skills/kovas-stem-naming/` | `~/.hermes/skills/kovas-stem-naming/` | Stem/cue naming convention (starter — edit to your real spec) |
| `skills/kovas-delivery-checklist/` | `~/.hermes/skills/kovas-delivery-checklist/` | Pre-delivery QC pre-flight |
| `skills/kovas-cue-tracking/` | `~/.hermes/skills/kovas-cue-tracking/` | Cue list + revision/notes tracking |
| `context/AGENTS.md` | `~/Studio/AGENTS.md` | Static studio vocabulary/structure, auto-injected when cwd is the studio |

The briefing is wired in `SOUL.md` ("Start of every session — no cold starts").
Set `KOVAS_STUDIO_ROOT` in `~/.hermes/.env` if the studio isn't at `~/Studio`.
The workflow skills are **starter templates** — they encode sensible film/TV
defaults with "edit me" markers, and the self-improvement loop refines them as
you correct them in real sessions.

## Two-line code hook (the only source edit)
In `agent/file_safety.py`, delegate to the guard at the existing chokepoints
(full instructions in the header of `nda_guard.py`):

```python
from agent.nda_guard import nda_read_block_error, nda_write_denied
# in get_read_block_error(path): return nda_read_block_error(path) or <existing>
# in is_write_denied(path):      return nda_write_denied(path) or <existing>
```

Everything else is config. Set secrets in `~/.hermes/.env`
(`TELEGRAM_BOT_TOKEN`, `BLUEBUBBLES_URL`, `BLUEBUBBLES_PASSWORD`,
`OPENROUTER_API_KEY`, DGX endpoint host/token), then:

```bash
hermes doctor        # sanity check
hermes               # interactive
hermes gateway start # Telegram + iMessage
```

## What this corrects from the original spec
1. **Providers:** original kept Ollama only. Your real fleet is four tiers —
   Ollama + LM Studio + DGX Spark + OpenRouter. Keep `custom` and `openrouter`
   plugins and `agent/lmstudio_reasoning.py`.
2. **Curator model:** point `auxiliary.curator` at the DGX Spark — the
   self-improvement loop writes better skills with a strong model, and the
   Spark keeps that private.
3. **Strategy:** config selection over file deletion (see above).
4. **Keep, don't strip:** `cron/` (scheduled automations), voice tools,
   `schema_sanitizer.py`, `managed_tool_gateway.py` — all cheap and useful.

See `kovas-build-spec.md` for the full corrected plan.
