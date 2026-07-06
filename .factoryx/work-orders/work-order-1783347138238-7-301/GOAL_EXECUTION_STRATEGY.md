# Goal Execution Strategy

## Vision

Continue the accepted `games/ukiyo-e-printer/` experience as a tactile
woodblock-printing toy. This pass should emphasize the phrase "breathing on
wet ink": patient pressure should make the print feel humid, responsive, and
alive without replacing the already accepted route, block renderer, or
interaction loop.

## Audience Experience

The first screen remains the existing ukiyo-e printer. A reviewer should feel
that pressing and holding creates a slower craft moment: ink blooms deepen,
paper remembers pressure, and the wet surface briefly exhales around the baren.

## Guiding Tradeoffs

- Preserve the current game, route shim, and preview entrypoint.
- Make one visible polish pass rather than broad structural edits.
- Keep the change centered on pressure, ink, paper, and sound feedback.
- Treat the accepted local browser-runtime path as the baseline to preserve.

## Evidence And References

- Current branch head before this pass: `14bd0e0` (`Deepen tactile baren pressure`).
- Current app path: `games/ukiyo-e-printer/index.html`.
- Prior accepted preview: `/previews/edo-woodblock/work-order/games/ukiyo-e-printer/`.
- Seed arm: deterministic (`creative_brief.seed_mode=deterministic`).

## Non-Goals

- Do not create a new game, landing page, or alternate branch.
- Do not rewrite `blocks-2d.js`.
- Do not chase unrelated GitHub CI failures before preserving local runtime
  reviewability.
- Do not inspect Seed A/B scores.

