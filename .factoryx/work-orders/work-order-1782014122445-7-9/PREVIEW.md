# Preview — Kawanakajima Samurai Autonomous Validation

**Work Order:** work-order-1782014122445-7-9
**Date:** 2026-06-21

## Browser Proof
- **URL:** `games/kawanakajima-foundry-samurai-proof/index.html`
- **Preview entrypoint:** `games/kawanakajima-foundry-samurai-proof/index.html`
- **Content:** 20 samurai (10 Takeda/red, 10 Uesugi/blue), 6 camera presets, charge/reform/clash mechanics, file-backed audio, review panel with contact sheet and hero reference
- **Verification:** `node verify.js` passes all checks

## Unity Proof
- **Project:** `unity/kawanakajima-samurai/`
- **Build:** Mac build succeeded — `Builds/Mac/KawanakajimaSamurai.app` (112 MB)
- **Bootstrap:** `KawanakajimaRuntimeBootstrap.cs` — loads Foundry GLB, creates countryside scene, 20 actors, charge/reform/audio

## PR
- **PR #167:** https://github.com/ystackai/studio-edo-woodblock/pull/167
- **Status:** OPEN, APPROVED, MERGEABLE, blocked by branch protection
