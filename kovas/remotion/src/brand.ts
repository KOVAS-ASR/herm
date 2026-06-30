// ── KOVAS studio brand kit ───────────────────────────────────────────────
// One place to match the studio's identity: typography + palette.
//
// OFFLINE-FIRST BY DESIGN. A local NDA studio must render deterministically
// without phoning home, so the defaults are pure CSS font stacks — no network
// fetch at render time. The first available family in each stack wins, so if
// you install/self-host the brand face (Archivo / Inter below), it's used
// automatically; otherwise it falls back cleanly.
//
// TO USE THE EXACT BRAND FONT, pick ONE:
//  (a) Self-host (recommended, stays offline): drop the .woff2 in `public/`,
//      add an @font-face in src/fonts.css importing it, and keep the family
//      name first in the stack below. See README "Fonts".
//  (b) Online only: `import { loadFont } from "@remotion/google-fonts/Archivo"`
//      and use its returned fontFamily — requires network egress to
//      fonts.gstatic.com at render time (won't work fully offline / behind a
//      strict egress allowlist).

export const displayFont =
  '"Archivo", "Arial Narrow", "Helvetica Neue", Helvetica, Arial, sans-serif';
export const bodyFont =
  '"Inter", "Helvetica Neue", Helvetica, Arial, sans-serif';

// Default palette — gold-on-charcoal. Override `accent` per render via props.
export const palette = {
  bg: "#0E0E10",
  text: "#FFFFFF",
  textMuted: "rgba(255,255,255,0.66)",
  accent: "#E5B567",
};
