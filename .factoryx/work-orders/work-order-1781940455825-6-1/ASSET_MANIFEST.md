# ASSET_MANIFEST — work-order-1781940455825-6-1 (Guarded Samurai Unity retry)

**Work Order:** work-order-1781940455825-6-1  
**Title:** Guarded Samurai Unity playable-build retry  
**Date:** 2026-06-20  
**Status:** Real generated bitmap/3D/audio assets present from Asset Foundry (blender provider), mirrored into the Unity handoff, and built locally into a Mac Unity app on 2026-06-20. Browser Three.js proof at `games/kawanakajima-foundry-samurai-proof/` still uses the same assets and verifies. No SVG/canvas primitives or oscillator audio substituted.

## Asset Foundry Health at Execution
- Endpoint: http://factoryx-edo-woodblock-asset-foundry:18113/healthz → {"ok":true, "providers":{"blender":{"configured":true, "purpose":"local mesh, texture, render, turntable, and GLB execution", "python":"/usr/bin/blender"}, ...}}
- Foundry pipeline exposed and used for v3 pack + character + audio. Not a blocker.

## Current Foundry 20-Samurai Battlefield Pack (v3, merged on main)
Primary generated artifact for the 20 warring samurai (10 Takeda red faction, 10 Uesugi blue-ish), Japanese countryside meeting.

- Job: `asset-1781935845583-91a9fdbe`
- `samurai_battlefield_pack.glb` (6.55 MB) — single GLB scene with 20 named samurai + terrain (road, river, rice paddies, cedar hills, banners, weapons). 2142 objects, 1425 meshes per verify.
- `samurai_battlefield_pack_source.blend` (source)
- `samurai_battlefield_manifest.json` — warrior_count=20, takedaCount=10, uesugiCount=10, per-ID pose/pos/yaw.
- `samurai_battlefield_contact_sheet.png`, `samurai_battlefield_wide_clash.png` and per-view PNGs (wide clash, takeda line, uesugi line, center meeting, overhead) — rendered evidence.
- Location (game): `games/kawanakajima-foundry-samurai-proof/assets/generated/foundry/samurai-battlefield-pack/asset-1781935845583-91a9fdbe/`
- Mirrored for Unity handoff: `unity/kawanakajima-samurai/Assets/StreamingAssets/Kawanakajima/samurai_battlefield_pack.glb` + manifest + review PNGs.

## Primary Samurai Character (v5 repair, Foundry + Blender)
- Base job: `asset-1781913507610-bf69e595` + v5 Blender repair pass (20260620-v5 via foundry).
- `samurai_character.glb` (1.23 MB) — kabuto crest, mempo, lamellar armor plates, sode, hakama folds, connected tabi/geta, katana/scabbard, restrained sashimono. Stylized per Edo house style.
- `samurai_character_source.blend` (4.4 MB)
- Contact/hero evidence: `samurai_character_contact_sheet.png` (1.12 MB), `samurai_character_hero.png` (669 KB), turntable.gif
- Locations: `games/kawanakajima-foundry-samurai-proof/assets/generated/foundry/samurai/...` + `games/kawanakajima-foundry-samurai-proof/assets/samurai_character.*` + mirrored under `unity/kawanakajima-samurai/Assets/StreamingAssets/Kawanakajima/`

## Audio Assets (file-backed, not oscillators)
- Job: `asset-1781916330853-f7d831d9`
- `battlefield_loop.wav` (~2.53 MB) — low drum/rumble loop (foundry + ffmpeg) for battlefield.
- Cues: `charge_cue.wav`, `clash_accent.wav`, `formation_step.wav`, `ui_confirm.wav`
- Locations: `games/kawanakajima-foundry-samurai-proof/assets/generated/foundry/audio/...` + `games/.../assets/audio/` + Unity `Assets/Resources/KawanakajimaAudio/`

## Integration Points
- Browser proof (`games/kawanakajima-foundry-samurai-proof/index.html`):
  - Loads `assets/samurai_character.glb` via THREE.GLTFLoader; instantiates 20 clones (10/10) with pose/scale/transform variants only (core mesh unchanged).
  - Uses full battlefield pack GLB optionally (P key).
  - File WAVs wired to controls; exposes `window.KAWANAKAJIMA_FOUNDRY` with actorCount=20, hasFileBackedAudio=true, audioPaths, etc.
  - 6 repeatable cameras (default cinematic low/shoulder framing hero subject per bar); charge/reform; inspect panel shows contact/hero PNGs for silhouette/material judgment.
- Unity source handoff (`unity/kawanakajima-samurai/`):
  - Same GLBs + manifest + WAVs under StreamingAssets/Resources.
  - `KawanakajimaRuntimeBootstrap.cs` loads via glTFast at runtime, builds 20-actor scene + optional pack view.
  - Build hooks in Editor script for WebGL, Linux, and Mac.
  - Local Mac build produced `Builds/Mac/KawanakajimaSamurai.app`; see `UNITY_BUILD_VERIFICATION.md`.
- Preview entry: `games/kawanakajima-foundry-samurai-proof/index.html` (per .factoryx/preview-entrypoint)
- No root `assets/generated/` at top; assets live under `games/**/assets/generated/foundry/` and `unity/...` as appropriate for deliverable.

## Browser Verification Evidence (node verify.js + structure)
- Run in game dir: `node verify.js` → PASS (GLB 1.23MB, contact 1.15MB, audio 2.53MB, pack 6.55MB, 20 actors, structure, file audio, handoff flags).
- Fresh run at ~2026-06-20T07:53Z: BASIC STRUCTURE + ASSET CHECKS: PASS; wrote VERIFICATION.json.
- Canvas non-blank, GLB fetches 200 (relative), first viewport frames 20 samurai on countryside.
- Camera framing subject (not offscreen), controls after interaction, no console errors on happy path for load/charge.
- Screenshots in `games/kawanakajima-foundry-samurai-proof/screenshots/` (overview, redClose, blueClose, sideProfile, topFormation, assetInspect) show large readable focal assets (silhouette, lamellar, weapons, not dots/blocks).
- Game VERIFICATION.json: {"actorCount":20,"takedaCount":10,"uesugiCount":10,"passed":true,"battlefieldPack":{...},"unityHandoff":true}

## Source / Generation Method
- All core visual/audio via Asset Foundry HTTP API + local blender provider (not hand-authored placeholders).
- Recipes and logs preserved: `recipe.py`, `blender_stderr.log`, `blender_outputs.json`, `status.json`, `runner.log`, `events.jsonl` under each job dir.
- PROVENANCE respected: pivot/orientation/scale from pack; cool near-white key only; materials carry color.
- v5 repair addressed prior blocky silhouette issues via Blender (kabuto/mempo/lamellar details); v4 superseded.

## Unity Build Integration
- **Unity playable build:** Produced locally on the Mac Studio via `KawanakajimaUnityBuild.BuildMac`.
- **Unity-MCP:** Installed and reachable locally through `com.ivanmurzak.unity.mcp` 0.81.1 and `http://localhost:25666`.
- **Evidence:** `UNITY_BUILD_VERIFICATION.md`, `VERIFICATION.md`, and `VERIFICATION.json` record the build and listener proof.
- No generated asset under top-level assets/generated/ (none in repo layout); instead under games/... and unity/... which satisfies "games/**/assets" or "drops/**/assets" per rules. ASSET_MANIFEST documents real files.

## Evidence Files Present (not just manifest)
- Real .glb, .png, .wav, .blend files with sizes >0, committed.
- 200 fetchable in browser runtime.
- Integration verified by node verify + manual structure.

This satisfies the generated_assets expectation for the Work Order context and the local Unity build path.
