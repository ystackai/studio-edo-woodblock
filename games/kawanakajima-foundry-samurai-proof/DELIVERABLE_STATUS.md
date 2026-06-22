# DELIVERABLE_STATUS - Kawanakajima Foundry Samurai Proof

**Updated:** 2026-06-22
**Work Order:** work-order-1781920715097-7-1 (retry on canonical 1781913967751-7-1)
**PR:** https://github.com/ystackai/studio-edo-woodblock/pull/161; current Unity QA follow-up: https://github.com/ystackai/studio-edo-woodblock/pull/180
**Public preview:** https://www.ystackai.com/factoryx/previews/edo-woodblock/work-order-1781913967751-7-1/games/kawanakajima-foundry-samurai-proof/
**Preview entrypoint:** `games/kawanakajima-foundry-samurai-proof/index.html`

## What Exists

- **Samurai asset:** live Asset Foundry local HTTP API + Blender 5 v29 anatomy pass after earlier v4/v5 block/slab and ball-torso visual failures. Current job asset-1782104227755-0ef02798.
  - Primary runtime asset: `assets/samurai_character.glb` (1.15 MB).
  - Source/evidence retained under `assets/generated/foundry/samurai/improved-20260622-v29/`; older v5 evidence remains preserved in history.
  - Contact sheet and hero render (v29) embedded in the in-game inspection panel.
- **20-samurai battlefield pack:** live Asset Foundry Blender/GLB job `asset-1782152407992-cc920f4b` (fresh autonomous `--submit` run, review-gated API handoff; supersedes earlier `asset-1782110424464-f9534d45` / `asset-1782103724605-0d84b27a` / `asset-1781933644954-6853e6a2` packs while preserving them in history).
  - Preserved under `assets/generated/foundry/samurai-battlefield-pack/asset-1782152407992-cc920f4b/`.
  - Contains `samurai_battlefield_pack.glb`, source `.blend`, manifest, contact sheet, and five stable evidence camera renders.
  - `review.json` is `state=passed`, proving the Asset Foundry review contract accepted required outputs, stable camera renders, 20-warrior 10/10 identity metadata, minimum geometry/detail gates, `center_gap=2.6` meeting-composition gate, and `environment_feature_count=125` / `sky_backdrop_count=1` countryside gate before handoff.
- **20-warrior game proof:** browser/Three.js scene with 10 Takeda and 10 Uesugi samurai in a Japanese countryside battle tableau.
  - Uses the Foundry GLB as the visible character base.
  - Variants come from pose transforms, scale, formation, faction standards, and small additive props.
  - Includes CHARGE, REFORM, camera presets, click-to-inspect, and contact-sheet review.
  - Includes a `PACK GLB`/`P` review toggle that lazy-loads the Foundry-authored `samurai_battlefield_pack.glb` scene directly into the browser proof, so reviewers can compare the cloned runtime formation against the real 20-samurai pack artifact.
- **Music/audio:** live Asset Foundry audio job `asset-1781916330853-f7d831d9`.
  - Playable mirrored files are under `assets/audio/`.
  - AUDIO toggles `battlefield_loop.wav`; CHARGE/REFORM/CLASH play file-backed cues.
  - Raw Foundry outputs and provenance are preserved under `assets/generated/foundry/audio/asset-1781916330853-f7d831d9/`.
- **Unity handoff project:** `unity/kawanakajima-samurai/`.
  - Copies the Foundry GLB into Unity `StreamingAssets`.
  - Copies the Foundry 20-samurai battlefield pack GLB and manifest into Unity `StreamingAssets`.
  - Copies the Foundry WAVs into Unity `Resources`.
  - Includes a runtime bootstrap that builds the countryside tableau, loads the GLB with Unity glTFast, creates 20 actors, and wires camera/audio/charge/reform controls.
  - Includes a `P`/PACK toggle for loading and inspecting the Foundry-authored 20-samurai battlefield scene pack when Unity is available.
  - Includes Editor build hooks for Mac, WebGL, and Linux.
- **Fresh Unity Mac build and player smoke:** the local Unity Editor batch build now succeeds from the current source.
  - Build gate: `unity/kawanakajima-samurai/run-local-unity-build.sh`.
  - Smoke gate: `unity/kawanakajima-samurai/smoke-built-player.sh`.
  - Passing readiness marker: `KAWANAKAJIMA_UNITY_READY actors=20 pack=True audio=True fallbackActors=False fallbackPack=False`.
  - This proves the freshly built Mac player can load the real samurai GLB and real 20-samurai battlefield pack GLB without runtime actor or pack fallbacks.
- **Unity-MCP readiness:** `unity/kawanakajima-samurai/check-unity-mcp.sh --open` reaches `UNITY_MCP_READY url=http://localhost:27482`.
- **Verification evidence:** `VERIFICATION.json`, `verify.js`, `ASSET_MANIFEST.md`, six committed review screenshots under `screenshots/`, and hosted preview runtime checks.
  - `smoke-browser-pack.sh` starts a local server/headless Chrome and verifies the browser can load 20 actors, lazy-load `samurai_battlefield_pack.glb`, and mark the pack as visible.
  - `run-reviewed-foundry-handoff.sh` is the repeatable Asset Foundry handoff loop: it can submit a fresh `samurai_battlefield_pack` job, wait for a passed review contract, ingest reviewed outputs into browser/Unity paths, and run the structure, browser, fresh Unity build, and built-player smoke gates.

## What Is Not Done

- **Art quality:** autonomous generation is now functionally proven end-to-end, but the current visuals remain stylized rather than final realistic production art. The next gap is raising the Blender recipe fidelity, not Unity activation or handoff plumbing.

## Current Review Verdict

This is a coherent browser-reviewable and Unity-buildable proof with file-backed assets from Foundry+Blender, file-backed audio, repeatable 6-camera evidence, in-game contact comparison, charge/reform interaction, a browser `PACK GLB` toggle for the Foundry-authored 20-samurai battlefield pack, Unity source handoff, a fresh Mac Unity build, and a fresh built-player smoke that reaches `KAWANAKAJIMA_UNITY_READY` using the real GLBs with `fallbackActors=False fallbackPack=False`. v29 supersedes the bad v4/v5 single-character visual passes with a less spherical, more layered default samurai asset and refreshed Blender evidence; the current battlefield pack was created by a fresh `--submit` Asset Foundry run as `asset-1782152407992-cc920f4b`, ingested only after `review.state=passed` validated required files, five stable cameras, and 20 named warriors with a 10/10 faction split, then passed browser smoke plus fresh Unity build/player smoke. Browser/Three.js proof verified (`node verify.js` PASS, `smoke-browser-pack.sh` PASS, nonblank screenshots). The current asset set remains stylized rather than final realistic game-world quality. PR: https://github.com/ystackai/studio-edo-woodblock/pull/161 (canonical asset proof), follow-up PR #165, Unity QA PR #180, and fresh Unity proof PR #181 merged to main.
