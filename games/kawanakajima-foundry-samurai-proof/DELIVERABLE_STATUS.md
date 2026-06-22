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
- **20-samurai battlefield pack:** live Asset Foundry Blender/GLB job `asset-1782103724605-0d84b27a` (v26 Blender 5 API pass; supersedes earlier `asset-1781933644954-6853e6a2` pack while preserving it in history).
  - Preserved under `assets/generated/foundry/samurai-battlefield-pack/asset-1782103724605-0d84b27a/`.
  - Contains `samurai_battlefield_pack.glb`, source `.blend`, manifest, contact sheet, and five stable evidence camera renders.
  - Manifest proves 20 named warriors: 10 Takeda and 10 Uesugi, with pose/position/yaw metadata.
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
- **Unity managed-patched player smoke:** because the local Unity Editor batch build is currently license-blocked, the current managed source was compiled into the existing Mac player for smoke verification.
  - Repeatable helper: `unity/kawanakajima-samurai/patch-existing-mac-player-managed.sh`.
  - Smoke gate: `unity/kawanakajima-samurai/smoke-built-player.sh`.
  - Passing readiness marker: `KAWANAKAJIMA_UNITY_READY actors=20 pack=True audio=True fallbackActors=False fallbackPack=False`.
  - This proves the patched player can load the real samurai GLB and real 20-samurai battlefield pack GLB without runtime actor or pack fallbacks.
- **Verification evidence:** `VERIFICATION.json`, `verify.js`, `ASSET_MANIFEST.md`, six committed review screenshots under `screenshots/`, and hosted preview runtime checks.
  - `smoke-browser-pack.sh` starts a local server/headless Chrome and verifies the browser can load 20 actors, lazy-load `samurai_battlefield_pack.glb`, and mark the pack as visible.

## What Is Not Done

- **Fresh Unity build:** not produced from the current source because the local Unity Editor batch run fails license activation before import/build.
- **Unity remaining gap:** activate the Mac Unity Editor license, run `unity/kawanakajima-samurai/run-local-unity-build.sh`, and inspect a freshly built player. The managed-patched existing player smoke is strong runtime evidence, but it is not a substitute for a fresh licensed Unity build.
- **Autonomous completion:** not proven end-to-end. The retry loop produced useful artifacts, but the v5 repair and the later 20-samurai battlefield-pack handoff required manual intervention after earlier visuals still looked blocky/unusable.

## Current Review Verdict

This is a coherent browser-reviewable proof with file-backed assets from Foundry+Blender, file-backed audio, repeatable 6-camera evidence, in-game contact comparison, charge/reform interaction, a browser `PACK GLB` toggle for the Foundry-authored 20-samurai battlefield pack, Unity source handoff, and a managed-patched Mac player smoke that reaches `KAWANAKAJIMA_UNITY_READY` using the real GLBs with `fallbackActors=False fallbackPack=False`. v29 supersedes the bad v4/v5 single-character visual passes with a less spherical, more layered default samurai asset and refreshed Blender evidence; v26 of the battlefield pack adds denser plate armor, matte blackened iron, cloth sashimono, less flat terrain, 20 named warriors, and countryside evidence. Browser/Three.js proof verified (`node verify.js` PASS, `smoke-browser-pack.sh` PASS, nonblank screenshots). Final Unity completion is still not claimed: the fresh Unity Editor rebuild remains blocked by local license activation, and the current asset set remains stylized rather than final realistic game-world quality. PR: https://github.com/ystackai/studio-edo-woodblock/pull/161 (canonical asset proof), follow-up PR #165, and current Unity QA PR #180.
