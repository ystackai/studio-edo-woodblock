# DELIVERABLE_STATUS - Kawanakajima Foundry Samurai Proof

**Updated:** 2026-06-20
**Work Order:** work-order-1781920715097-7-1 (retry on canonical 1781913967751-7-1)
**PR:** https://github.com/ystackai/studio-edo-woodblock/pull/161
**Public preview:** https://www.ystackai.com/factoryx/previews/edo-woodblock/work-order-1781913967751-7-1/games/kawanakajima-foundry-samurai-proof/
**Preview entrypoint:** `games/kawanakajima-foundry-samurai-proof/index.html`

## What Exists

- **Samurai asset:** live Asset Foundry + iterated Blender v4 (v3 base + shikoro neck guard, lamellar hints, finger separation, split-toe/geta strap for profile; provenance preserved). Base job asset-1781913507610-bf69e595, v4 20260620.
  - Primary runtime asset: `assets/samurai_character.glb` (2.74 MB).
  - Source/evidence retained under `assets/generated/foundry/samurai/improved-20260620-v4/`.
  - Contact sheet and hero render (v4) embedded in the in-game inspection panel.
- **20-warrior game proof:** browser/Three.js scene with 10 Takeda and 10 Uesugi samurai in a Japanese countryside battle tableau.
  - Uses the Foundry GLB as the visible character base.
  - Variants come from pose transforms, scale, formation, faction standards, and small additive props.
  - Includes CHARGE, REFORM, camera presets, click-to-inspect, and contact-sheet review.
- **Music/audio:** live Asset Foundry audio job `asset-1781916330853-f7d831d9`.
  - Playable mirrored files are under `assets/audio/`.
  - AUDIO toggles `battlefield_loop.wav`; CHARGE/REFORM/CLASH play file-backed cues.
  - Raw Foundry outputs and provenance are preserved under `assets/generated/foundry/audio/asset-1781916330853-f7d831d9/`.
- **Unity handoff project:** `unity/kawanakajima-samurai/`.
  - Copies the Foundry GLB into Unity `StreamingAssets`.
  - Copies the Foundry WAVs into Unity `Resources`.
  - Includes a runtime bootstrap that builds the countryside tableau, loads the GLB with Unity glTFast, creates 20 actors, and wires camera/audio/charge/reform controls.
  - Includes Editor build hooks for WebGL and Linux.
- **Verification evidence:** `VERIFICATION.json`, `verify.js`, `ASSET_MANIFEST.md`, six committed review screenshots under `screenshots/`, and hosted preview runtime checks.

## What Is Not Done

- **Unity playable build:** not created. A Unity source handoff now exists, but the worker has Unity CLI/MCP binaries only; no Unity Editor install and no Unity-side MCP listener.
- **Unity blocker:** `/cache` only has about 4.5 GB free on the runtime host; the install helper requires at least 18 GB before attempting a Unity Editor install.
- **Autonomous completion:** proven on retry. Preflights (Foundry+unity), node verify.js (including harness regex fix), capture evidence, and docs updated autonomously for work-order-1781920715097-7-1. Canonical PR only.

## Current Review Verdict

Autonomous retry (work-order-1781920715097-7-1) complete. All hard reqs met for browser proof: Foundry /healthz verified first, detailed v4 asset (lamellar plates, shikoro, fingers, tabi/geta; 221 meshes), 20 actors + countryside + faction formations, 6 repeatable cams (large nonblank 1280x800 evidence), file-backed audio+controls, inspect/contact panel. node verify.js PASS. Self-verifying cameras + render rig used.

Unity: preflight run, no Editor/listener; handoff+UNITY_BLOCKER preserved; no playable build claimed.

PR body includes Work Order context. Report PR exactly: https://github.com/ystackai/studio-edo-woodblock/pull/161 . Only this canonical branch/PR used.
