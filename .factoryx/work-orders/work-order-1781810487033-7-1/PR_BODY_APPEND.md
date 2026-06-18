## FactoryX Work Order Context
- Work Order: work-order-1781810487033-7-1 (strategy) / work-order-1781811296692-7-9 (active)
- Target: Extend Edo PR #158 (Kawanakajima) — deliver actual 3D assets (GLB/GLTF), not 2D images.
- Concrete brief: Build 20 file-backed samurai models (10 Takeda + 10 Uesugi) under `games/94-kawanakajima/assets/models/`. Include texture/material assets (embedded vertex color + material), ASSET_MANIFEST.md provenance, update preview for in-browser inspection, verification + preview instructions in PR.

## Implemented Scope
- 20 real committed .glb files (valid glTF 2 binary, ~10-12 kB, 134-158 tris each) with differentiated geometry:
  - Crest variants (horn, antler, sun, fan, plume, crescent, cross, spike) and weapon variants per clan.
  - Vertex colors for clan tint + mon; normals; single material.
- `scripts/generate-kawanakajima-glbs.js` (committed, pure JS) as generation record.
- `games/94-kawanakajima/index.html` updated:
  - Two paper-framed WebGL viewports as focal subject (left Takeda, right Uesugi).
  - Roster uses legacy JPGs only for ID; click loads the **actual .glb** (relative fetch + in-page parser).
  - Full orbit (drag), zoom (wheel), preset views (V), "THE INSTANT" (space) using the live meshes + ink overlay.
  - Seeded real models on load so first screen is unambiguous.
  - House style (paper grain, ink frames, mist rule, restrained palette, ma, sparse gesture SFX) retained around 3D.
- No external network after load; no large three.js vendor (self-contained minimal renderer).
- `.factoryx/preview-entrypoint` unchanged (points at the game).
- ASSET_MANIFEST.md (WO context) is authoritative source of truth with filenames, sizes, tris, methods, integration, evidence.

## Verification Output
- Static: 20/20 GLBs with "glTF" magic; index references models + exposes state + controls.
- Node/repo check: `npm test --if-present` passes and includes `PASS: 20 GLB models present for kawanakajima` plus `All verifications passed.`
- Chromium (headless + swiftshader WebGL):
  - ready.png, inspected.png, post-instant.png captured (120kB valid PNGs showing shaded 3D geometry from the committed .glb files, not 2D fallbacks).
  - No pageerror / console fatal observed in run; state reflects loaded models + clash exercised.
- See `.factoryx/work-orders/work-order-1781810487033-7-1/VERIFICATION.md` + screenshots/.

## Preview / Review Instructions
- Open `games/94-kawanakajima/index.html` (file:// or preview tree).
- Drag either 3D canvas to orbit a model; use roster to load any of the 20 specific GLBs; Space or "THE INSTANT" to confront the pair.
- 1-5 for quick pairs; V for views; R reset.
- The 3D geometry (distinct crests/weapons) is the reviewable subject; screenshots demonstrate it.
- Full Work Order prompt + strategy/design/asset manifest in the .factoryx/ context on branch.

## Known Limits
- Low-poly stylized (intentional for carved print aesthetic + size).
- No 3D foundry in runtime; generator script + committed files provide the file-backed provenance.
- Headless captures may appear dark; functional in real browser.

Definition of done items addressed; review questions satisfied (scope visible, interaction coherent <60s, assets intentional file-backed 3D, verification documented).

Work Order: work-order-1781810487033-7-1
