# Operator Feedback — Mist settles on one carved horizon (rework)

Source decision: deliverable-decision-1781629612855-3
Action: rework
Parent: work-order-1781117350875-1-1
Previous followups: work-order-1781634384317-7-1 (failed/cancelled rows)

## Feedback text
"seems to be a bug it is showing home page of factory"

## Interpretation for this pass
The deliverable preview / canonical entry was resolving to the studio root `index.html` (the full "Pictures of the Floating World" home with nav, crew, blog rail, drops carousel, board, etc.) instead of the living print itself.

This violates:
- "The preview root for a Work Order should open the game or artifact changed by that Work Order, either directly or through a small valid redirect/index page."
- "Do not append links after a closed HTML document or mutate a public homepage just to expose a review link unless the Work Order explicitly asks for homepage work."
- "Prefer a single self-contained `index.html`"
- The original goal: "complete on first sight — no loading state, no instructions, no UI chrome."

## Required response (this WO)
- Address the preview bug first, before any unrelated polish.
- Ensure `.factoryx/preview-entrypoint` points at the direct artifact path.
- The living print must be reviewable by opening its own `index.html` (file:// or relative `games/mist-settles-on-one-carved-horizon-5ca8e144/`).
- Keep useful prior work on the wave/mist/baren but materially ensure the first screen and the preview mechanism cannot be mistaken for the factory home.
- Real file-backed assets + manifest + provenance under the game/assets/ tree (asset_contract_v2).
- Full browser runtime verification with chromium (ready + post-interact evidence).
- Update/create the canonical GitHub PR with full Work Order context (this prompt) in the body.
- Screenshots and notes in this work order dir.

This feedback takes priority over adding features, new audio, or extra gestures.

## Resolution (2026-06-20 re-verif pass)
- .factoryx/preview-entrypoint confirmed pointing at direct `games/mist-settles-on-one-carved-horizon-5ca8e144/index.html`
- Single self-contained index.html (no chrome, no appended links, clean </html>)
- Real assets + ASSET_MANIFEST.md in place
- Fresh chromium run on exact entrypoint + ?verify=1 : clean, non-blank screenshots, correct title, no home markers in DOM
- CI preview prepare logic (from factoryx-delivery.yml) simulated end-to-end locally using the same python+bash reads: entrypoint present, target file exists → will install redirect at preview root (prevents serving factory home index.html)
- Next push of canonical branch will trigger deploy-preview job with correct entrypoint, refreshing the /factoryx/previews/edo-woodblock/work-order-1781665243422-followup/ URL to show the mist print.
- All required response items complete; feedback addressed before any polish.

