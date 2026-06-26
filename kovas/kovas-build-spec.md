# KOVAS Local Hermes Agent — Build Spec (corrected, config-first)

This is the reviewed counterpart to Search's original 976-line spec. The
original is an excellent **map** of the codebase and its architecture
sections are accurate. This version corrects the **strategy** (config over
delete) and the **provider section** (your real model fleet, not Ollama-only),
based on reading the live Hermes source.

---

## 0. The core correction

Search's plan: fork the repo, delete ~200 files down to ~80, run the remainder.

The problem, verified against the code:

- **Tools self-discover and failures are swallowed.** `tools/registry.py:57`
  (`discover_builtin_tools`) imports every `tools/*.py` inside a `try/except`
  that logs a warning and continues (`registry.py:70-73`). A tool that never
  registers simply isn't offered to the model.
- **Provider adapters are lazy-imported.** `run_agent.py` imports
  `anthropic_adapter`, `codex_runtime`, etc. *inside functions* (e.g. line
  3941), so they cost nothing unless that path runs.
- **Platforms self-register through a registry** (`gateway/platform_registry.py`)
  — no hardcoded if/elif. Unconfigured messengers never load.

**Therefore unused code is already inert.** Deleting it:
- saves ~no runtime (it wasn't loading),
- breaks `hermes update` and cuts you off from upstream improvements to the
  self-improving skills loop — the one subsystem you most want to keep current,
- and creates a *silent* failure mode: if a file you keep imports a file you
  deleted, the registry catches the ImportError, logs a warning, and the
  capability quietly disappears with no crash to point you at it.

**So: configure what's on, don't delete what's off.** Same lean *running*
agent, none of the divergence tax. The rest of this spec follows that rule.

---

## 1. Provider fleet (the biggest factual correction)

Search's spec: "keep 1 provider (Ollama), strip 28." That predates your actual
hardware. Your fleet is **four tiers**:

| Tier | Endpoint | Use |
|---|---|---|
| Fast local | Ollama (`localhost:11434`) | quick turns, aux tasks |
| Smart local | LM Studio / Gemma (`localhost:1234`) | private interactive chat |
| Heavy local | DGX Spark (vLLM/Ollama/NIM endpoint) | big-model work + curator |
| Cloud | OpenRouter | deliberate frontier reasoning |

Keep:
- `plugins/model-providers/custom/` — handles `ollama` / `vllm` / `llamacpp`,
  so it covers Ollama, LM Studio, **and** the DGX Spark by `base_url` alone.
- `plugins/model-providers/openrouter/` — your cloud escape hatch.
- `agent/lmstudio_reasoning.py` — you use LM Studio; keep it.

Leave the other provider plugins on disk (inert). See `config.yaml`
`endpoints:` for the wired fleet and `/model <name>` switching.

**Route the curator at the DGX Spark.** The background-review fork inherits the
main model, but the curator can take its own `auxiliary.curator` endpoint —
point it at a strong Spark model so skill curation is high-quality and private.

---

## 2. Keep (the essentials Search identified — accurate)

Search's "essential ~80" list is correct as a *capability* list; you just
achieve it through the curated `toolsets:` block in `config.yaml` rather than
by pruning the tree. The crown jewel and its real dependencies:

- **Self-improvement loop:** `agent/background_review.py` (the fork),
  `agent/curator.py` (lifecycle), `tools/skill_manager_tool.py`,
  `tools/skills_tool.py`, `tools/skill_usage.py`, `tools/skill_provenance.py`,
  `tools/skills_sync.py`, `tools/skills_guard.py`, plus
  `agent/skill_commands.py` / `skill_utils.py` / `skill_preprocessing.py`.
- **Its tendrils (keep these too):** `tools/memory_tool.py`,
  `tools/session_search_tool.py` (FTS5 over `hermes_state.py`),
  `agent/memory_manager.py`, `agent/context_compressor.py`. The learning loop
  leans on memory + session search; they're not optional if you keep skills.

Architecture detail (verified, matches Search's §3): the background review
spawns a daemon-thread fork with a **tool whitelist of `memory` + `skill_manage`
only**, reviews the conversation, and writes class-level skills. The curator is
inactivity-triggered, only touches **agent-created** skills, and never deletes
(archives to `.archive/`). This is correct — keep it intact.

---

## 3. Keep that Search stripped (reconsider these)

| Item | Why keep |
|---|---|
| `cron/` | Scheduled automations (morning loglines, nightly backups) — lazy-loaded, cheap |
| `tools/transcription_tools.py`, `tools/voice_mode.py` | Voice input from Telegram/CLI |
| `tools/schema_sanitizer.py` | Used in tool-definition assembly; cheap; spec waffled |
| `tools/managed_tool_gateway.py` | Spec listed it in BOTH keep and strip — keep |
| `tools/delegate_tool.py`, `tools/mixture_of_agents_tool.py` | Multi-box/multi-model routing pays off later; off by default via toolsets |

These stay on disk; gate them with the `toolsets:` list when you want them.

---

## 4. Genuinely fine to leave unconfigured

Bedrock / Gemini / Azure / Copilot adapters, the Chinese-platform messengers
(WeChat/Feishu/DingTalk/QQ/Yuanbao), Discord/Slack/WhatsApp/Matrix/Signal,
image/video-gen tools, browser tools, MCP. None load unless configured. No
need to delete — just don't list them. (If you later want a disk-lean checkout
for its own sake, that's a separate, optional cleanup — not part of getting a
working agent.)

---

## 5. NDA-safe handling (Search's best original idea — built out)

Implemented as `kovas/nda_guard.py`. It flips the default from denylist to
**allowlist** and adds an audit trail. Integration is two delegations in
`agent/file_safety.py` at the existing read/write chokepoints
(`get_read_block_error`, `is_write_denied`) — both are already on the hot path
for the file tools, so no edits to `file_tools.py`. Config under `nda:` in
`config.yaml`. Honest limit: it guards the **file** tools, not the terminal —
keep command approval on and/or run under an OS user that can't reach the NDA
tree. Defense in depth.

Plus: `SOUL.md` (identity + guardrails) and the `kovas-nda` skill (user-authored
rules the curator won't touch).

---

## 6. Build order (M1)

1. **Stock install** (don't fork): `curl -fsSL https://hermes-agent.nousresearch.com/install.sh | bash`
2. **Drop in config:** copy `config.yaml` → `~/.hermes/`, `SOUL.md` → `~/.hermes/`,
   `skills/kovas-nda/` → `~/.hermes/skills/`. Fill `~/.hermes/.env` secrets.
3. **Wire the fleet:** edit `endpoints:` base_urls (LM Studio port, DGX host).
   `hermes model` / `/model <name>` to switch.
4. **NDA guard:** copy `nda_guard.py` → `agent/`, add the two delegations to
   `agent/file_safety.py` (see file header). Set `nda.allowed_paths`.
5. **Gateway:** `hermes gateway setup` for Telegram + BlueBubbles, then
   `hermes gateway start`.
6. **Verify self-improvement:** run a real task, confirm a skill appears under
   `~/.hermes/skills/` and survives a new session (`session_search`).
7. **(Later) Studio layer:** Ableton MCP + SoundFlow scripting — a separate
   buildout, not part of the core agent. Ask for that mini-spec when ready.

---

## 7. What this is NOT

This spec gets you a lean, private, self-improving local agent on the Mac Mini.
It does **not** yet include the creative-studio control layer (driving Ableton,
scripting Pro Tools/Logic delivery via SoundFlow, the Higgsfield/Splice/Canva
production pipeline). That's deliberately a second milestone so the foundation
is solid first.
