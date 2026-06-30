---
name: kovas-delivery-checklist
description: Pre-delivery checklist for KOVAS's film/TV music deliverables. Use before sending stems, mixes, or cues to a client/music editor to catch spec, naming, and completeness problems first.
version: 1.0.0
platforms: [macos]
metadata:
  hermes:
    tags: [kovas, delivery, qc, checklist, workflow]
    provenance: user
---

# KOVAS — delivery checklist

> ⚠️ STARTER TEMPLATE. Adjust specs to your real delivery requirements.

Run this as a pre-flight before any delivery. Produce a PASS/FAIL list; do not
declare "ready to deliver" until every item passes or KOVAS waives it.

## 1. Completeness
- [ ] Every spotted cue present (cross-check against the cue list / `kovas-cue-tracking`)
- [ ] Full mix + all stems for each cue
- [ ] No `vN` gaps where a referenced version is missing

## 2. Naming (delegate to `kovas-stem-naming`)
- [ ] All files match the cue/stem pattern
- [ ] Stem groups all in the canonical list
- [ ] No spaces / uppercase slugs / missing version suffix

## 3. Technical spec
- [ ] Sample rate / bit depth correct (default 48k/24-bit — confirm per show)
- [ ] Correct file format (WAV/AIF as specified)
- [ ] Stems are time-aligned (all start at the same frame; bounce from bar 1 / 00:00)
- [ ] No clipping; true-peak within spec (default ≤ -1 dBTP — confirm)
- [ ] Loudness in target range if specified (e.g. broadcast spec)

## 4. Hygiene
- [ ] No bleed between stems (mute-solo check or sum-to-mix null test)
- [ ] No stray count-ins, talkback, or pre-roll
- [ ] Tails not cut early (reverb/release fully captured)

## 5. Package & log
- [ ] Delivery folder structured per client convention
- [ ] DELIVERY.md updated: date, cues, versions, who it went to
- [ ] **NDA check:** confirm recipient + channel are authorized before sending
      anything externally (see `kovas-nda`). Material stays local until KOVAS
      names the specific recipient.

## Output
Give KOVAS the checklist with each item marked, the blocking failures at top,
and a one-line "deliverable / not deliverable" verdict. Never auto-send.
