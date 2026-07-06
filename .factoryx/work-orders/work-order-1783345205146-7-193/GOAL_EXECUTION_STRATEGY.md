# Goal Execution Strategy

## Vision

Continue the accepted `games/ukiyo-e-printer/` experience as a tactile
woodblock-printing toy: the user should feel that each press carries weight,
that ink arrives slowly, and that patience makes the print richer. The prior
PR already established the current route, block library, audio path, and
runtime-verified preview; this Work Order should polish that artifact instead
of replacing it.

## Audience Experience

The first screen should invite immediate play without extra explanation. The
main interaction should reward repeated gentle baren pressure, visible ink
bloom, and small changes in the print surface. A user should understand that
rushing or swiping through the scene is less effective than deliberate craft.

## Guiding Tradeoffs

- Preserve the existing `ukiyo-e-printer` game, route, and preview entrypoint.
- Prefer targeted changes to pressure feel, ink buildup, sound response, and
  legible feedback over broad rewrites.
- Keep all visuals inspectable in the current browser preview.
- Treat the existing local browser-runtime acceptance as the baseline to keep
  green.

## Evidence And References

- Current canonical branch head: `d434602` (`Fix ukiyo-e lake block width scope`).
- Current app path: `games/ukiyo-e-printer/index.html`.
- Public route shim: `drops/ukiyo-e-printer/index.html`.
- Prior accepted preview: `/previews/edo-woodblock/work-order/games/ukiyo-e-printer/`.
- Seed arm: deterministic (`creative_brief.seed_mode=deterministic`).

## Non-Goals

- Do not create a new game, landing page, or alternate PR branch.
- Do not replace the working `blocks-2d.js` rendering system.
- Do not make GitHub-only PR body edits the primary deliverable.
- Do not chase unrelated CI failures before preserving the local runtime path.

## Public Progress Updates

Worth sharing publicly: a visible improvement to baren pressure, a stronger
ink/texture moment, a sound interaction that responds to pressure, or a saved
verification screenshot showing the print becoming more beautiful through
patient input.
