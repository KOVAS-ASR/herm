# Handoff — KOVAS M1 Studio Agent ("Marlowe") build

**Paste-in briefing for a fresh Claude agent on KOVAS's M1.** Read this top to
bottom; it brings you fully current on a multi-session effort so you can pick up
seamlessly. Nothing here requires you to have seen the prior chats.

---

## ⏱ First 30 minutes (runbook)

Exact order of operations for your first session. **Nothing here writes to the
studio.** Steps marked 🧍 need KOVAS in the loop — pause and ask, don't guess.

```bash
# 1. ORIENT — get the bundle onto the M1 (read-only so far)
git clone https://github.com/KOVAS-ASR/herm.git ~/herm 2>/dev/null || true
cd ~/herm && git fetch origin
git checkout claude/m1-agent-harness-setup-dzyohe
git pull origin claude/m1-agent-harness-setup-dzyohe
#  → then read kovas/HANDOFF.md (this file) and kovas/README.md in full.

# 2. 🧍 DISCOVER THE REAL VAULT LAYOUT — do NOT assume ~/Studio/Projects.
STUDIO="${KOVAS_STUDIO_ROOT:-$HOME/Studio}"   # ask KOVAS for the real path
ls -la "$STUDIO"
ls -d "$STUDIO"/*/ 2>/dev/null                # confirm Projects/ + Development/ (or his names)
#  → Confirm with KOVAS. If the layout differs, you'll adjust studio_brief.sh,
#    context/AGENTS.md, and nda.allowed_paths to match BEFORE installing.

# 3. DRY-RUN THE BRIEFING against the real vault (safe — read-only bash)
KOVAS_STUDIO_ROOT="$STUDIO" bash kovas/skills/kovas-studio-briefing/scripts/studio_brief.sh
#  → It should print a real briefing. If it's empty/wrong, fix the script's
#    path assumptions first. This is the single highest-leverage check.

# 4. BACK UP any existing Hermes config, then place the bundle
cp ~/.hermes/config.yaml ~/.hermes/config.yaml.bak 2>/dev/null || true
#  If ~/.hermes/config.yaml already exists and is in use, MERGE the kovas blocks
#  (model/endpoints/auxiliary/toolsets/nda/skills/curator/gateway) instead of
#  overwriting. Otherwise:
cp kovas/config.yaml ~/.hermes/config.yaml
cp kovas/SOUL.md     ~/.hermes/SOUL.md
mkdir -p ~/.hermes/skills && cp -R kovas/skills/* ~/.hermes/skills/
cp kovas/nda_guard.py ~/.hermes/hermes-agent/agent/nda_guard.py
cp kovas/context/AGENTS.md "$STUDIO/AGENTS.md"

# 5. THE ONE SOURCE EDIT — wire the NDA guard into file_safety.py
#  Open ~/.hermes/hermes-agent/agent/file_safety.py and add the two delegations
#  documented at the top of kovas/nda_guard.py (get_read_block_error →
#  nda_read_block_error; is_write_denied → nda_write_denied). Then confirm:
grep -n "nda_read_block_error\|nda_write_denied" ~/.hermes/hermes-agent/agent/file_safety.py
python3 -m py_compile ~/.hermes/hermes-agent/agent/nda_guard.py && echo "guard compiles"

# 6. 🧍 SECRETS + ENDPOINTS (get values from KOVAS; never commit these)
#  Edit ~/.hermes/.env:  TELEGRAM_BOT_TOKEN, BLUEBUBBLES_URL, BLUEBUBBLES_PASSWORD,
#  OPENROUTER_API_KEY, KOVAS_STUDIO_ROOT (if not ~/Studio).
#  Edit ~/.hermes/config.yaml endpoints: the LM Studio port + DGX Spark host.

# 7. VERIFY
hermes doctor
#  In a session: confirm Marlowe OPENS with a briefing (not a greeting), then
#  confirm read-only — ask it to write a test file inside the studio (must be
#  DENIED) and inside ~/.hermes (must be ALLOWED).
```

**Then report to KOVAS** against the success metric: does the opening briefing
tell him what changed / what's owed / what's missing / what needs cleanup? If
yes, it's earning its keep. If the briefing is hollow, fix the vault-path
assumptions before adding anything else. **Confirm the name "Marlowe"** and the
parked milestones (§8) before building further.

---

## 0. TL;DR (read this first)

KOVAS is building a **one-person, AI-first film & TV studio** with music
production as a core capability. We are standing up a **local, NDA-safe,
self-improving studio agent on his M1** — the machine where his real work and
vault (800+ tracks, unreleased/NDA scores) actually live.

The agent is built on **Hermes Agent** (Nous Research's open-source harness) —
**configured, not forked.** All KOVAS-specific work lives in a self-contained
`kovas/` bundle in the `herm` repo. Nothing in stock Hermes was modified, so
`hermes update` keeps working.

**The work is done and committed.** Your job tomorrow is most likely one of:
deploy the bundle onto the M1, adjust it to the real vault layout, or extend it
to the next milestone. See §7 (deploy) and §8 (open threads).

- **Repo:** `KOVAS-ASR/herm` · **Branch:** `claude/m1-agent-harness-setup-dzyohe` · **PR:** #1
- **Bundle:** everything under `kovas/`
- **Agent name:** **Marlowe** (placeholder — KOVAS may rename)

---

## 1. Who KOVAS is (so you're not generic)

- **Role:** composer / producer / one-person film+TV studio operator. Multiple
  jobs in one hat: creative, mix, project management, business ops, development.
- **The North Star tension:** avoid *KOVAS-as-bottleneck*. Everything operational
  living in his head doesn't scale and doesn't survive a bad week. This agent
  exists to take the **operational layer** off his plate so he stays in the
  creative/decision seat.
- **DAWs (his rig):** primary = **Studio One Pro** + **Ableton Live**; **Logic**
  for stem separation / utility; **Pro Tools** for mix & delivery. Also has FL,
  Cubase, Serato (not in the main loop).
- **Models / hardware fleet:** **Ollama** (small/fast, local) + **LM Studio**
  (Gemma, smarter local) on the Macs; a **DGX Spark** full of bigger local
  models; **OpenRouter** as a deliberate cloud escape hatch. Four tiers.
- **NDA posture:** works with unreleased film/TV scores under NDA. Local-only
  isn't a nice-to-have — it's a professional/compliance obligation. One
  accidental cloud leak risks director relationships built over years.
- **Existing agent roster (on a separate Mac Mini):** Search (research), Ella
  (ops), Quincy (creative voice), Bobby (systems), Bennett (household), Bron
  (QC). **Marlowe is distinct from all of these** — a studio-floor presence the
  others can't be, because none of them know film/TV scoring + development.

## 2. What KOVAS asked for, and the council verdict

KOVAS convened his other agents to steelman "should I build a local M1 studio
agent at all." **Unanimous verdict: PROCEED, but scope v1 tight and make Phase 1
boring.** The decisive factor was the NDA boundary — a dedicated local-only
agent is a *hard architectural* boundary, where config on a cloud-connected
agent can be changed by mistake. Key guardrails the council demanded, all now
encoded:
- Read-only local access first; **no destructive file actions in v1**.
- Folder allowlist + NDA audit log.
- **No cloud routing for protected work.**
- No DAW control, no orchestration in v1.
- **Success metric (1 week):** save 20–30 min/session by telling KOVAS what
  changed, what's owed, what's missing, what needs cleanup.
- **Kill-rule:** if upkeep > ~2 hrs/week, cut scope. Start smallest, let the
  self-improvement loop grow skills organically.

## 3. The strategy: configure, don't fork (and why)

An earlier spec proposed forking Hermes and deleting ~200 of ~500 files down to
~80. We reviewed that against the **live Hermes source** and rejected the
delete-down approach, because Hermes already makes unused code inert:
- Tools self-discover in a `try/except` that logs & continues (`tools/registry.py`).
- Provider adapters are lazy-imported inside functions (`run_agent.py`).
- Platforms self-register through a registry, no hardcoded chains (`gateway/platform_registry.py`).

So deleting saves ~no runtime and creates a **silent** failure mode: a kept file
importing a deleted one is caught, logged, and the capability quietly vanishes.
**We configure what's on instead** → keeps `hermes update` working and keeps the
self-improving skills loop (the "crown jewel") getting upstream fixes.

## 4. What's been built — the `kovas/` bundle (file by file)

All committed on the branch. Sizes/paths are authoritative as of the last commit.

**Foundation**
- `kovas/kovas-build-spec.md` — the corrected, config-first build plan with
  verified code references and the Phase-1 discipline section.
- `kovas/config.yaml` — the KOVAS Hermes profile: 4-provider fleet (Ollama /
  LM Studio / DGX Spark / OpenRouter), curated toolsets, curator routed at the
  DGX Spark, command approval on, `nda.read_only: true`, `skills.inline_shell: true`.
- `kovas/nda_guard.py` — **net-new module.** Flips Hermes' denylist into an
  **allowlist** + audit trail, and enforces **read-only studio** in Phase 1.
  Compiles clean; behaviorally tested (read allowed, studio write denied,
  `~/.hermes` write allowed, allowlist + blocked-patterns enforced).
- `kovas/SOUL.md` — agent identity (see §5).
- `kovas/skills/kovas-nda/SKILL.md` — user-authored NDA rules (curator never
  edits user-authored skills).

**Studio context (kills cold starts)**
- `kovas/skills/kovas-studio-briefing/` + `scripts/studio_brief.sh` — session
  opener. Read-only bash that scans the studio and emits a compact briefing:
  active project, recent files, **development slate**, director notes / delivery
  status. Tested; output ~850 chars (fits the 4000-char inline-shell cap). Wired
  in `SOUL.md` to run on turn one.
- `kovas/skills/kovas-stem-naming/` — stem/cue naming convention (starter).
- `kovas/skills/kovas-delivery-checklist/` — pre-delivery QC pre-flight.
- `kovas/skills/kovas-cue-tracking/` — cue list + revision/notes tracking.
- `kovas/skills/kovas-dev-tracking/` — **development slate** tracking (logline,
  status, attachments, rights, owed, milestones) — the "second development lead"
  role's spine skill.
- `kovas/context/AGENTS.md` — static studio vocabulary/structure; auto-injected
  into the system-prompt context tier when cwd is the studio.

> The workflow skills are **STARTER TEMPLATES** — sensible film/TV defaults with
> explicit "edit me" markers. They are NOT KOVAS's verified conventions. The
> self-improvement loop refines them as he corrects them in real sessions.

## 5. The agent's identity — "Marlowe"

KOVAS's call: a blend of **score coordinator + studio archivist + second
development lead**. `SOUL.md` encodes all three modes:
- **Score coordinator** — keeps delivery on rails: cues, stems, specs, due dates.
- **Studio archivist** — institutional memory: every cue, revision, note,
  delivery, dev project. Over time, knows the studio better than KOVAS can hold.
- **Second development lead** — tracks the film/TV slate: loglines, status,
  attachments, coverage, milestones. Thinks like a dev exec, not a file clerk.

Name **Marlowe** is a placeholder — confirm/rename with KOVAS (it's one line in
`SOUL.md`). Voice should be distinct from Search/Ella/Quincy — a studio-floor
presence, terse and practical, leads with what's owed/changed/missing.

## 6. Phase-1 posture (DO NOT violate without KOVAS's say-so)

- **Read-only on the studio.** Marlowe reads, briefs, and *recommends* changes
  (old → new plans) — it does **not** write/move/rename/delete in the studio.
  Enforced in `nda_guard.py` (`nda.read_only: true`), not just toolset config.
  `~/.hermes` stays writable so the learning loop works.
- **No cloud for protected work.** Default + curator + all auxiliary models are
  local. OpenRouter is opt-in per message and **never** for NDA material.
- **No DAW control, no destructive actions, no orchestration in v1.**
- **Promotion to Phase 2 (writes)** only after the read-only briefing + QC prove
  reliable over real sessions.

## 7. How to deploy on the M1 (the likely first task)

The bundle is a set of files to **copy onto the M1's Hermes install** — not a
code change to merge into the running tree. Stock Hermes lives at
`~/.hermes/hermes-agent`.

1. **Get the bundle:** clone/pull `KOVAS-ASR/herm`, branch
   `claude/m1-agent-harness-setup-dzyohe` (or PR #1). The bundle is `kovas/`.
2. **Place files** (full map in `kovas/README.md`):
   - `config.yaml` → `~/.hermes/config.yaml`
   - `SOUL.md` → `~/.hermes/SOUL.md`
   - `skills/*` → `~/.hermes/skills/*`
   - `nda_guard.py` → `~/.hermes/hermes-agent/agent/nda_guard.py`
   - `context/AGENTS.md` → `<studio root>/AGENTS.md`
3. **The one source edit:** add two delegating lines to
   `agent/file_safety.py` so it calls the guard at the existing read/write
   chokepoints (`get_read_block_error` → `nda_read_block_error`;
   `is_write_denied` → `nda_write_denied`). Exact snippet is in the header of
   `nda_guard.py`.
4. **Secrets** in `~/.hermes/.env`: `TELEGRAM_BOT_TOKEN`, `BLUEBUBBLES_URL`,
   `BLUEBUBBLES_PASSWORD`, `OPENROUTER_API_KEY`, plus `KOVAS_STUDIO_ROOT` if the
   studio isn't `~/Studio`. Edit `config.yaml` `endpoints:` base-URLs for the
   LM Studio port and DGX Spark host.
5. **Verify:** `hermes doctor`; run `studio_brief.sh` against the real vault;
   start a session and confirm Marlowe opens with a briefing, not a greeting;
   confirm a studio write is denied and a `~/.hermes` write is allowed.

## 8. Open threads / decisions to get from KOVAS

1. **Confirm the name** "Marlowe" (or replace in `SOUL.md`).
2. **Real vault layout.** The briefing + skills assume `Studio/Projects/` (scoring)
   and `Studio/Development/` (slate). KOVAS's actual M1 vault layout may differ —
   **this is the single thing that determines whether the briefing works on day
   one.** Get the real structure and adjust `studio_brief.sh` + `AGENTS.md` +
   `nda.allowed_paths` to match. Don't assume.
3. **Fill the starter skills** with his real conventions (stem groups, cue keying,
   delivery specs per network — e.g. Netflix/Paramount+, status vocabularies).
4. **Parked milestones (do NOT build without explicit go-ahead — scope discipline):**
   - Proactive `on_session_start` plugin (briefing pushed before first message;
     hook exists at `agent/conversation_loop.py`).
   - DAW/SoundFlow studio-control layer (Ableton MCP + SoundFlow scripting).
   - Model routing by task complexity (small-local → DGX → cloud).
   - **Remotion motion graphics** (`kovas/remotion` + `kovas-remotion` skill):
     cue title cards / lower-thirds / data-driven renders from cue/slate JSON.
     Scaffolded and render-verified (stills + MP4). Renders are WRITES → output
     to a scratch dir outside the read-only studio; all rendering local (NDA).

## 9. Guardrails for YOU (the M1 agent)

- **NDA first.** Default to local. Never send client/NDA material to a cloud
  model or external service. Never put project names / deal terms / titles into
  `MEMORY.md`, `USER.md`, or any skill — those persist into the system prompt.
- **Read-only studio** until KOVAS promotes to Phase 2. Propose changes; don't
  make them.
- **Don't push to git or open PRs** without KOVAS's explicit ask. If you do
  commit, work on the existing branch; never force-push.
- **Respect the kill-rule.** If this is becoming more maintenance than it saves,
  say so plainly.
- **Verify before claiming done.** If the briefing script fails on the real
  vault, say so with the output — don't paper over it.

## 10. Glossary (so you speak studio)

- **Cue** — a piece of score for a specific moment; keyed by reel/minute (`2m10`)
  or index. Tracked in `<project>/CUES.md`.
- **Stem** — a grouped bounce (DRUMS, STRINGS, SYNTH…) for delivery, separate
  from the full mix.
- **Spotting / re-spot** — deciding where cues go against picture / updating a
  cue when the edit changes.
- **Delivery** — packaged stems+mixes to a music editor/client, after the
  delivery checklist passes.
- **Slate** — the development pipeline of film/TV projects (logline, status,
  attachments, rights, milestones).

---

## 11. Exact repo coordinates

- Repo: `KOVAS-ASR/herm`
- Branch: `claude/m1-agent-harness-setup-dzyohe`
- PR: #1 ("KOVAS local-agent bundle: config-first profile, NDA guard, studio context")
- Commits (newest first):
  - `7a91181` Set agent identity (Marlowe) and add development-lead role
  - `1a2d1a6` Harden v1 to the council's 'boring Phase 1' verdict: read-only studio
  - `9e1ac83` Add milestone-2 studio context: session-start briefing + workflow skill pack
  - `d14f73d` Add KOVAS local-agent bundle: config-first build spec, NDA guard, profile
- Bundle files: `README.md`, `SOUL.md`, `config.yaml`, `nda_guard.py`,
  `kovas-build-spec.md`, `context/AGENTS.md`, `HANDOFF.md` (this file), and
  `skills/{kovas-nda, kovas-studio-briefing(+scripts/studio_brief.sh),
  kovas-stem-naming, kovas-delivery-checklist, kovas-cue-tracking,
  kovas-dev-tracking}/SKILL.md`.

**Start here tomorrow:** confirm the vault layout (§8.2), then deploy (§7).
