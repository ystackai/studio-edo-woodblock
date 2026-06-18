# WORKLOG — work-order-1781810487033-7-1

**Work Order:** Discord Deliverable Kickoff: Pictures of the Floating World (3D assets extension)
**Branch:** factoryx/factory-edo-woodblock/work-order (canonical only)
**PR:** existing (update; do not open new)
**Archetype:** creative_game
**Current phase:** Implementation + verification (after technical design gate)

## 2026-06-18 — Technical design gate (prior run)
- Read prior kawanakajima 2D delivery + all planning artifacts.
- Produced GOAL_EXECUTION_STRATEGY.md, TECHNICAL_SYSTEM_DESIGN.md, PREVIEW/VERIFICATION/ASSET_MANIFEST skeletons, WORKLOG.
- Confirmed: 3D GLB requirement is non-negotiable; JPGs + procedural + in-code geo do not count.
- No game changes at gate.

## 2026-06-18 — Implementation pass (this run)
- Re-read FEEDBACK (prior lantern + kawanakajima 2D), GOAL, TECHNICAL, current payload before edits.
- Inspected workspace: only 2D JPGs present under assets/, no models/ dir, index was 2D canvas + reveal verb.
- Preserved: house style (paper, ink, vermilion/indigo, mist, ma, "the instant"), preview entrypoint, existing game dir structure, other games untouched.
- Created `games/94-kawanakajima/assets/models/` + 20 real file-backed GLB files via committed generator:
  - `scripts/generate-kawanakajima-glbs.js` (pure JS, no deps) emits valid glTF2 binary with POSITION/NORMAL/COLOR_0 + indices.
  - 10 Takeda + 10 Uesugi, differentiated crests (horn/antler/sun/fan/plume/crescent/cross/spike), weapons (yari/tachi/kanabo/naginata), vertex colors, chest mons.
  - ~10–12 kB each, 134–158 tris — real geometry, not placeholders.
- Updated `games/94-kawanakajima/index.html` to make 3D the central subject:
  - Two live WebGL viewports embedded in paper frames (left Takeda, right Uesugi).
  - Self-contained minimal GLB parser + WebGL renderer (vertex color + simple shading; no three.js, no CDN).
  - Roster (using legacy JPGs only for visual ID) — click loads the actual .glb into its 3D viewport.
  - Orbit (drag), zoom (wheel), preset views (V), "THE INSTANT" (space/button) with camera nudge + ink overlay on real meshes.
  - Seeded t1 + u1 on boot so first screen unmistakably shows the 3D deliverable.
  - Kept sparse SFX, paper grain/ink framing, margin notes, restraint.
  - Exposed `__KAWANAKAJIMA_3D_STATE` for verification.
- Created/updated durable notes under this WO context:
  - Full ASSET_MANIFEST.md (filenames, bytes, tris, method, integration, evidence).
  - PREVIEW.md with 3D-first instructions + controls.
  - VERIFICATION.md with chromium + WebGL steps + guards.
  - This WORKLOG.
- `.factoryx/preview-entrypoint` already correct; no change.
- Addressed playtest/asset feedback (central heroes must be file-backed 3D; in-code or 2D alone do not satisfy) before polish.

## Next / polish remaining
- Run real chromium verification (WebGL flags, capture non-blank 3D screenshots showing geometry from the committed .glb files).
- Fix any runtime errors (shader, load, pointer on overlaid canvases, state).
- Capture `screenshots/ready.png`, `inspected.png`, `post-instant.png` from the harness.
- Re-affirm 9/9 game feel + house style in browser.
- Update PR body (canonical branch only) with full Work Order Context + implemented scope (20 GLBs + manifest + in-browser inspector) + verification output + preview instructions + known limits.
- Use remaining budget for interaction quality, copy, small visual polish around the 3D (e.g. better framing, slight idle breathe on models, touch target size) — no scope expansion.

## Evidence checkpoints
- 20 GLB files committed and listed in manifest with provenance.
- Live preview opens the 3D models directly (no "go to assets" tab).
- Browser verification passes with actual shaded geometry from the .glb binaries (chromium swiftshader captures + static checks + node verify snippet).
- A reviewer can select any of the 20, orbit, stage the instant, and see intentional differentiated 3D forms.
- Verification run: `npm test --if-present` passes after installing declared Playwright browser cache in the worker container; output includes `PASS: 20 GLB models present for kawanakajima` and `All verifications passed.`

## Push
- GLB delivery commit: `788e46e`.
- Follow-up verification commit moves `verify.js` result handling after the Kawanakajima 3D checks so the asset checks actually execute before `process.exit`.
- `git push origin HEAD:factoryx/factory-edo-woodblock/work-order` executed through a short-lived GitHub App installation token minted inside the trusted daemon.
- No parallel branches created.

All durable artifacts live only under `.factoryx/work-orders/work-order-1781810487033-7-1/`.

Work Order: work-order-1781810487033-7-1


## 2026-06-18 preview render failure repair
- Investigated why Kawanakajima published with blank review panes despite 20 GLB files existing. Root cause was verification weakness plus three runtime bugs: side-based model lookup (`MODELS.l/r`) instead of clan-key lookup (`MODELS.t/u`), shared WebGL program cache across two contexts, and row-major matrix multiplication feeding column-major WebGL uniforms.
- Replaced the invalid file:// claim with an HTTP-served Playwright regression (`test-kawanakajima-3d.js`). The test now loads the same relative asset path shape as the public preview, waits for seeded `t1/u1`, swaps to `t4/u4`, and asserts both WebGL canvases contain nonblank model pixels.
- Ran `npm test --if-present` in the FactoryX runtime container; it passes with the new Kawanakajima browser gate.
- Republished the corrected `games/94-kawanakajima` preview tree for work-order-1781811296692-7-9 and confirmed the public URL renders visible 3D samurai models.
