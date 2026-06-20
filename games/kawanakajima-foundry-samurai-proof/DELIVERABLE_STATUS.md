# DELIVERABLE_STATUS - Kawanakajima Foundry Samurai Proof

**Updated:** 2026-06-20
**Work Order:** work-order-1781913967751-7-1
**PR:** https://github.com/ystackai/studio-edo-woodblock/pull/161
**Public preview:** https://www.ystackai.com/factoryx/previews/edo-woodblock/work-order-1781913967751-7-1/games/kawanakajima-foundry-samurai-proof/
**Preview entrypoint:** `games/kawanakajima-foundry-samurai-proof/index.html`

## What Exists

- **Samurai asset:** live Asset Foundry Blender/GLB job `asset-1781913507610-bf69e595`.
  - Primary runtime asset: `assets/samurai_character.glb`.
  - Source/evidence retained under `assets/generated/foundry/samurai/`.
  - Contact sheet and hero render are embedded in the in-game inspection panel.
- **20-warrior game proof:** browser/Three.js scene with 10 Takeda and 10 Uesugi samurai in a Japanese countryside battle tableau.
  - Uses the Foundry GLB as the visible character base.
  - Variants come from pose transforms, scale, formation, faction standards, and small additive props.
  - Includes CHARGE, REFORM, camera presets, click-to-inspect, and contact-sheet review.
- **Music/audio:** live Asset Foundry audio job `asset-1781916330853-f7d831d9`.
  - Playable mirrored files are under `assets/audio/`.
  - AUDIO toggles `battlefield_loop.wav`; CHARGE/REFORM/CLASH play file-backed cues.
  - Raw Foundry outputs and provenance are preserved under `assets/generated/foundry/audio/asset-1781916330853-f7d831d9/`.
- **Verification evidence:** `VERIFICATION.json`, `verify.js`, `ASSET_MANIFEST.md`, six committed review screenshots under `screenshots/`, and hosted preview runtime checks.

## What Is Not Done

- **Unity playable world:** not created. The worker has Unity CLI/MCP binaries, but no Unity Editor install and no Unity-side MCP listener.
- **Unity blocker:** `/cache` only has about 4.5 GB free on the runtime host; the install helper requires at least 18 GB before attempting a Unity Editor install.
- **Autonomous completion:** not proven. Human intervention was required to correct stale audio status, capture readiness, and review evidence.

## Current Review Verdict

This is a coherent browser-reviewable proof with file-backed assets, file-backed audio, and repeatable camera evidence. It is not yet the requested final Unity game. The next required infrastructure step is a worker with a Unity Editor installed and a running Unity MCP listener, then a new autonomous work order should port/import this proof into Unity and produce a playable Unity build.
