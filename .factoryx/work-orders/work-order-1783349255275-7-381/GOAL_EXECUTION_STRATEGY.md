# Goal Execution Strategy

## Vision

Recover the failed planner root by continuing the accepted ukiyo-e printer
experience with one tactile detail: patient pressure should make paper fibers
seem to lift under the baren before they settle back into the print.

## Audience Experience

The user should still arrive directly in the existing printer. When they press
and hold, the wet-ink breath remains, and a faint fibrous wake makes the paper
feel physical rather than like a frictionless canvas.

## Guiding Tradeoffs

- Preserve the current route, game, audio, and browser-runtime baseline.
- Make one focused polish pass instead of widening the surface area.
- Tie the change to pressure, paper, and baren movement.
- Keep Seed A/B no-peek discipline; this recovery is collection plumbing, not
  an adoption decision.

## Evidence And References

- Current branch head before this pass: `6f4b723` (`Closeout: add
  VERIFICATION.md and PREVIEW.md for work-order-1783347260001`).
- Current app path: `games/ukiyo-e-printer/index.html`.
- Prior accepted preview:
  `/previews/edo-woodblock/work-order/games/ukiyo-e-printer/`.
- Seed arm: deterministic (`creative_brief.seed_mode=deterministic`).

## Non-Goals

- Do not create a second game or a landing page.
- Do not rewrite `blocks-2d.js`.
- Do not chase unrelated GitHub CI/review protection.
- Do not inspect Seed A/B scores.
