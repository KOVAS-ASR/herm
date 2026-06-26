"""NDA-aware file access policy for the KOVAS local agent.

This module turns Hermes' default *denylist* posture (block a handful of
sensitive files) into an *allowlist* posture (the agent may only touch
directories you explicitly bless), plus a tamper-evident audit trail.

WHY A SEPARATE MODULE
---------------------
The stock guards in ``agent/file_safety.py`` answer "is this one path
obviously dangerous?" (``.ssh``, ``.env``, ``/etc/sudoers`` ...). That is the
wrong shape for NDA work: the danger is not a known-bad list, it's *anything
outside the project you're allowed to be in*. So this module inverts the
default — everything is denied unless it resolves inside an allowed root.

INTEGRATION (two-line hooks, applied on the M1 — see kovas/README.md)
---------------------------------------------------------------------
``tools/file_tools.py`` already funnels every read AND write through
``agent/file_safety.get_read_block_error()`` (via ``_check_sensitive_path``),
and every write additionally through ``is_write_denied()``. So you do NOT
touch ``file_tools.py`` at all. You add two short delegations in
``agent/file_safety.py``:

    # near the top of agent/file_safety.py
    from agent.nda_guard import nda_read_block_error, nda_write_denied

    # inside get_read_block_error(path), BEFORE the existing checks:
    _nda = nda_read_block_error(path)
    if _nda:
        return _nda

    # inside is_write_denied(path), BEFORE returning the existing result:
    if nda_write_denied(path):
        return True

Because both stock functions are already on the hot path for reads and
writes, the allowlist + audit covers file_tools, the patch tool, and
search_files with no further wiring. (Terminal commands are a separate
surface — see "LIMITS" below.)

CONFIG (config.yaml)
--------------------
    nda:
      enabled: true
      allowed_paths:
        - "~/Studio"
        - "~/projects/kovas"
        - "~/.hermes"          # the agent's own home, so it can self-improve
      blocked_patterns:        # denied even *inside* an allowed root
        - "*.nda"
        - "*/confidential/*"
        - "*/clients/*/contracts/*"
      audit_log: true          # ~/.hermes/nda_audit.log
      audit_reads: true        # log allowed reads too, not just denials

If ``nda.enabled`` is false or absent, every function here is a no-op and the
stock Hermes behavior is unchanged — safe to ship dormant.

LIMITS (read these honestly)
----------------------------
* This guards the FILE tools. It does NOT sandbox the terminal tool — a
  shell command like ``cat ~/secret`` bypasses it. Keep terminal approval on
  (``approval.py``), and/or run the agent as a user whose OS permissions
  can't reach the NDA tree. Defense in depth, not a single wall.
* ``resolve()`` follows symlinks, so a symlink pointing out of an allowed
  root is correctly rejected. A *hardlink* is not detectable this way.
* The audit log is append-only at the app layer, not immutable. For true
  tamper-evidence, ship it to a write-only sink.
"""

from __future__ import annotations

import fnmatch
import logging
import os
from pathlib import Path
from typing import Optional

logger = logging.getLogger(__name__)

# Lazily-resolved config so importing this module never forces config load.
_CFG_CACHE: Optional[dict] = None


def _cfg() -> dict:
    global _CFG_CACHE
    if _CFG_CACHE is not None:
        return _CFG_CACHE
    try:
        # load_config_readonly() has no side effects — correct for a hot-path
        # read/write guard. cfg_get takes the config dict as its first arg.
        from hermes_cli.config import cfg_get, load_config_readonly

        _CFG_CACHE = cfg_get(load_config_readonly(), "nda", default={}) or {}
    except Exception as exc:  # never let config failure break file I/O
        logger.debug("nda_guard: config unavailable (%s); guard disabled", exc)
        _CFG_CACHE = {}
    return _CFG_CACHE


def _enabled() -> bool:
    return bool(_cfg().get("enabled"))


def _read_only() -> bool:
    """Phase-1 'boring' posture: the agent may READ the studio but never WRITE
    to it. Enforced here in the guard (architecture), not via toolset selection
    (configuration) — a config slip can't silently grant write access to the
    studio. Writes to the agent's own ~/.hermes home are still allowed so the
    self-improvement loop (skills/memory) keeps working."""
    return bool(_cfg().get("read_only"))


def _hermes_home() -> Path:
    try:
        from hermes_constants import get_hermes_home

        return Path(get_hermes_home()).resolve()
    except Exception:
        return Path(os.path.expanduser("~/.hermes")).resolve()


def _allowed_roots() -> list[Path]:
    roots: list[Path] = []
    for raw in _cfg().get("allowed_paths", []) or []:
        try:
            roots.append(Path(os.path.expanduser(str(raw))).resolve())
        except OSError:
            logger.warning("nda_guard: cannot resolve allowed_path %r", raw)
    return roots


def _blocked_patterns() -> list[str]:
    return [str(p) for p in (_cfg().get("blocked_patterns") or [])]


def _audit_path() -> Path:
    try:
        from hermes_constants import get_hermes_home

        home = Path(get_hermes_home())
    except Exception:
        home = Path(os.path.expanduser("~/.hermes"))
    return home / "nda_audit.log"


def _audit(path: str, mode: str, allowed: bool) -> None:
    """Best-effort append to the NDA audit trail. Never raises."""
    cfg = _cfg()
    if not cfg.get("audit_log"):
        return
    if allowed and mode == "read" and not cfg.get("audit_reads", True):
        return
    try:
        # Timestamp via the codebase's own time helper when available so the
        # format matches the rest of Hermes' logs.
        try:
            from hermes_time import now  # tz-aware datetime, matches Hermes

            ts = now().isoformat(timespec="seconds")
        except Exception:
            import datetime

            ts = datetime.datetime.now().astimezone().isoformat(timespec="seconds")
        verdict = "ALLOW" if allowed else "DENY"
        line = f"{ts}\t{verdict}\t{mode}\t{path}\n"
        ap = _audit_path()
        ap.parent.mkdir(parents=True, exist_ok=True)
        with open(ap, "a", encoding="utf-8") as fh:
            fh.write(line)
    except Exception as exc:  # auditing must never break a tool call
        logger.debug("nda_guard: audit write failed: %s", exc)


def _within_allowed(resolved: Path) -> bool:
    roots = _allowed_roots()
    if not roots:
        # Allowlist with no roots = lock everything. That's a config error, so
        # fail OPEN to stock behavior rather than bricking the agent, but warn
        # loudly — an empty allowlist almost certainly means misconfiguration.
        logger.warning(
            "nda_guard: nda.enabled is true but allowed_paths is empty; "
            "deferring to stock guards (NDA allowlist inactive)."
        )
        return True
    for root in roots:
        try:
            resolved.relative_to(root)
            return True
        except ValueError:
            continue
    return False


def _matches_blocked(resolved: Path) -> bool:
    s = str(resolved)
    for pat in _blocked_patterns():
        # Match against the full path and the basename so "*.nda" and
        # "*/confidential/*" both behave intuitively.
        if fnmatch.fnmatch(s, pat) or fnmatch.fnmatch(resolved.name, pat):
            return True
    return False


def _verdict(path: str, mode: str) -> Optional[str]:
    """Return an error string if access is denied, else None."""
    if not _enabled():
        return None
    try:
        resolved = Path(os.path.expanduser(path)).resolve()
    except OSError as exc:
        return f"NDA guard: cannot resolve path {path!r}: {exc}"

    if _matches_blocked(resolved):
        _audit(str(resolved), mode, allowed=False)
        return (
            f"NDA guard: '{path}' matches a blocked pattern and cannot be "
            f"{'read' if mode == 'read' else 'written'}."
        )
    if not _within_allowed(resolved):
        _audit(str(resolved), mode, allowed=False)
        return (
            f"NDA guard: '{path}' is outside the allowed project directories. "
            f"Add its root to nda.allowed_paths if this access is intended."
        )
    # Phase-1 read-only: deny writes to the studio, but always permit the agent
    # to write inside its own ~/.hermes home (skills, memory, audit log).
    if mode == "write" and _read_only():
        home = _hermes_home()
        within_home = False
        try:
            resolved.relative_to(home)
            within_home = True
        except ValueError:
            within_home = False
        if not within_home:
            _audit(str(resolved), mode, allowed=False)
            return (
                f"NDA guard: read-only mode is on (Phase 1). '{path}' is inside "
                f"the studio and cannot be written. Read, brief, and recommend "
                f"the change for KOVAS to make — or set nda.read_only: false to "
                f"enable writes once you trust the agent."
            )
    _audit(str(resolved), mode, allowed=True)
    return None


# ---- Public API: the two functions agent/file_safety.py delegates to ----

def nda_read_block_error(path: str) -> Optional[str]:
    """Return a denial message if reading *path* violates NDA policy."""
    return _verdict(path, "read")


def nda_write_denied(path: str) -> bool:
    """Return True if writing *path* violates NDA policy."""
    return _verdict(path, "write") is not None


def reset_cache_for_tests() -> None:
    """Test hook — drop the cached config so a new config is picked up."""
    global _CFG_CACHE
    _CFG_CACHE = None
