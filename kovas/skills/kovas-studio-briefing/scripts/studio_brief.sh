#!/usr/bin/env bash
# studio_brief.sh — read-only status briefing for the KOVAS studio.
#
# Prints a compact, human-readable snapshot of the current studio state so the
# agent can open a session with a real briefing instead of a cold "hello".
#
# DESIGN RULES
#   * READ-ONLY. Never writes, moves, or deletes anything.
#   * Stays inside the studio root (an NDA-allowed path). Never prints file
#     *contents* except small, explicitly-named NOTES/TODO/STATUS files.
#   * Output kept well under 4000 chars so it works as a SKILL.md inline-shell
#     snippet ( !`bash .../studio_brief.sh` ) as well as a normal tool call.
#   * Portable bash for macOS (BSD) — no GNU-only flags.
#
# CONFIG: set KOVAS_STUDIO_ROOT to override the default (~/Studio).

root="${KOVAS_STUDIO_ROOT:-$HOME/Studio}"
recent_n="${KOVAS_BRIEF_RECENT:-8}"

print_line() { printf '%s\n' "$1"; }

if [ ! -d "$root" ]; then
  print_line "STUDIO BRIEFING"
  print_line "No studio root found at: $root"
  print_line "Set KOVAS_STUDIO_ROOT or create the folder, then re-run."
  exit 0
fi

# Prefer a Projects/ subdir if it exists, else treat root as the project parent.
proj_parent="$root"
[ -d "$root/Projects" ] && proj_parent="$root/Projects"

# Active project = most-recently-modified immediate subdirectory.
active=""
if ls -d "$proj_parent"/*/ >/dev/null 2>&1; then
  active="$(ls -dt "$proj_parent"/*/ 2>/dev/null | head -1)"
fi

print_line "════════ STUDIO BRIEFING ════════"
print_line "When : $(date '+%a %Y-%m-%d %H:%M')"
print_line "Root : $root"
if [ -n "$active" ]; then
  print_line "Active project (most recent): $(basename "$active")"
else
  print_line "Active project: (none detected under $proj_parent)"
fi

# Project counts: how many projects, and how many touched in the last 7 days.
if [ -d "$proj_parent" ]; then
  total_proj="$(ls -d "$proj_parent"/*/ 2>/dev/null | wc -l | tr -d ' ')"
  recent_proj="$(find "$proj_parent" -mindepth 1 -maxdepth 1 -type d -mtime -7 2>/dev/null | wc -l | tr -d ' ')"
  print_line "Projects: ${total_proj} total, ~${recent_proj} touched in last 7 days"
fi

# Audio asset snapshot within the active project (or root if none).
scan="${active:-$root}"
audio_count="$(find "$scan" -type f \( -iname '*.wav' -o -iname '*.aif' -o -iname '*.aiff' -o -iname '*.flac' \) 2>/dev/null | wc -l | tr -d ' ')"
print_line "Audio files in scope: ${audio_count}"

print_line ""
print_line "── Recently touched files ──"
# ls -t sorts by mtime; portable across macOS/Linux. Hide dotfiles.
found_recent=0
while IFS= read -r f; do
  [ -z "$f" ] && continue
  print_line "  • ${f#"$root"/}"
  found_recent=1
done <<EOF
$(find "$scan" -type f -not -path '*/.*' -print0 2>/dev/null | xargs -0 ls -t 2>/dev/null | head -"$recent_n")
EOF
[ "$found_recent" -eq 0 ] && print_line "  (none)"

# Surface small status notes if the project keeps them (capped, read-only).
print_line ""
print_line "── Notes / TODO / delivery status ──"
found_notes=0
for name in STATUS.md STATUS.txt NOTES.md NOTES.txt TODO.md TODO.txt DELIVERY.md delivery.md; do
  nf="$scan/$name"
  if [ -f "$nf" ]; then
    print_line "  [$name]"
    # First 12 non-empty lines, hard-capped, never the whole file.
    sed -n '1,12p' "$nf" 2>/dev/null | sed 's/^/    /'
    found_notes=1
  fi
done
[ "$found_notes" -eq 0 ] && print_line "  (no STATUS/NOTES/TODO/DELIVERY file in the active project)"

print_line "═════════════════════════════════"
