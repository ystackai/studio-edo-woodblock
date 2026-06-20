# ASSET_MANIFEST — Kawanakajima 20 Samurai Proof (work-order-1781972094624-7-9)

**Work Order:** work-order-1781972094624-7-9
**Title:** Autonomous Kawanakajima 20 Samurai Unity proof after gateway fix
**Date:** 2026-06-20
**Completion mode:** polish_until_deadline
**Branch:** `factoryx/kawanakajima-autonomous-unity-proof-20260620-gatewayfix-1614`
**Preview:** `games/kawanakajima-foundry-samurai-proof/index.html`

## Status

Browser proof is reviewable with 20 samurai (10 Takeda vs 10 Uesugi), file-backed audio, repeatable 6-camera inspection rig, charge/reform gameplay, and review panels. Unity playable build is **blocked** — no Unity Editor/listener available on the worker (see UNITY_BLOCKER.md). This is a browser/Three.js review proof plus Unity source handoff.

## Generated Assets (Asset Foundry provenance)

### 1. Samurai Character Asset
- **File:** `assets/samurai_character.glb`
- **Size:** 1.23 MB
- **Provenance:** Asset Foundry Blender job `asset-1781913507610-bf69e595` + v5 repair pass (2026-06-20)
- **Source:** `http://factoryx-edo-woodblock-asset-foundry:18113/outputs/asset-1781913507610-bf69e595/samurai_character_source_v5.blend`
- **Description:** Stylized samurai with kabuto helmet, mempo faceplate, lamellar do (armor), sode shoulder plates, kote arm guards, hakama pants, tabi socks, geta sandals, katana/saya, and sashimono banner. No Unity Editor build was produced.
- **Visual gate:** v4 was blocky/slab-like; v5 replaced with cleaner stylized anatomy. Contact sheet and hero render provided for inspection.

### 2. 20-Samurai Battlefield Pack
- **File:** `assets/generated/foundry/samurai-battlefield-pack/asset-1781935845583-91a9fdbe/samurai_battlefield_pack.glb`
- **Size:** 6.55 MB
- **Provenance:** Asset Foundry Blender job `asset-1781935845583-91a9fdbe` (v3 fidelity pass)
- **Contents:** One GLB scene with 20 named samurai, 10 Takeda + 10 Uesugi, on countryside battlefield with road, river, rice paddies, cedar hills, banners, weapons.
- **Manifest:** `samurai_battlefield_manifest.json` — warrior_count=20, 10/10 faction split, per-warrior ID/pose/position/yaw.
- **Evidence:** `samurai_battlefield_contact_sheet.png` — 5 stable camera views.

### 3. Audio Assets
- **Loop:** `assets/audio/battlefield_loop.wav` — 2.53 MB, low-rumble battlefield ambience from Asset Foundry job `asset-1781916330853-f7d831d9`
- **Charge:** `assets/audio/charge_cue.wav` — 15.9 KB
- **Clash:** `assets/audio/clash_accent.wav` — 53 KB
- **Step:** `assets/audio/formation_step.wav` — 22 KB
- **Confirm:** `assets/audio/ui_confirm.wav` — 11 KB
- **Provenance:** All file-backed WAVs from Foundry, mirrored from `assets/generated/foundry/audio/asset-1781916330853-f7d831d9/`

### 4. Evidence Images
- `assets/samurai_character_contact_sheet.png` — 1.12 MB, v5 contact sheet
- `assets/samurai_character_hero.png` — 669 KB, hero reference
- `screenshots/` — 6 repeatable camera PNGs:
  - `overview.png` — wide battlefield overview
  - `redClose.png` — Takeda (red) close inspection
  - `blueClose.png` — Uesugi (blue) close inspection
  - `sideProfile.png` — side profile of formation
  - `topFormation.png` — top-down formation layout
  - `assetInspect.png` — asset detail close-up

## Unity Handoff Assets

- `unity/kawanakajima-samurai/Assets/StreamingAssets/Kawanakajima/samurai_character.glb` — 1.23 MB
- `unity/kawanakajima-samurai/Assets/StreamingAssets/Kawanakajima/samurai_battlefield_pack.glb` — 6.55 MB
- `unity/kawanakajima-samurai/Assets/StreamingAssets/Kawanakajima/samurai_battlefield_manifest.json` — 20 warriors manifest
- `unity/kawanakajima-samurai/Assets/Resources/KawanakajimaAudio/` — all WAV files
- `unity/kawanakajima-samurai/Assets/Kawanakajima/Scripts/KawanakajimaRuntimeBootstrap.cs` — runtime bootstrap
- `unity/kawanakajima-samurai/Assets/Kawanakajima/Editor/KawanakajimaUnityBuild.cs` — build hooks
- `unity/kawanakajima-samurai/Assets/Kawanakajima/Scenes/Kawanakajima.unity` — scene file

## Integration Points

- `index.html` loads `assets/samurai_character.glb` via THREE.GLTFLoader
- 20 actors created (10 Takeda, 10 Uesugi) with pose/scale/variant transforms
- Camera presets: overview, redClose, blueClose, sideProfile, topFormation, assetInspect
- Audio: loop toggle, charge/clash/step/confirm sound effects
- Charge/reform gameplay mechanics
- Click-to-inspect samurai with faction info panel
- Review panel with contact sheet + hero image
- `window.KAWANAKAJIMA_FOUNDRY` exposed for harness interaction

## Browser Verification

- WebGL context: created
- 20 samurai loaded, no 404s
- First viewport shows non-blank 3D scene with camera framing subjects
- Orbit controls (drag), zoom (wheel), keyboard shortcuts (1-6, A, C, R, X, T, F)
- `node verify.js` passes all structure/asset/size checks
- Canvas pixel variance confirms rendered scene (not blank)

## Known Limitations

- **Unity playable build:** Not created — no Unity Editor/listener available. Worker has Unity CLI (0.1.0-beta.7) but no installed Editor and no MCP listener. `/cache` has ~2.1 GB free vs 18 GB minimum needed.
- **Asset fidelity:** Stylized, not photoreal. v5 improved over v4 (no more slab/blocky reads).
- **Asset reuse:** Single GLB cloned 20x; variants come from pose/scale/stance transforms and additive props (spear on ~1/3 actors). No unique per-actor Blender models.
- **Audio:** File-backed WAVs from Foundry; no original composition.

## Visual Review Evidence

| View | Camera Preset | File | Size |
|------|--------------|------|------|
| Wide overview | overview | screenshots/overview.png | 746 KB |
| Takeda close | redClose | screenshots/redClose.png | 781 KB |
| Uesugi close | blueClose | screenshots/blueClose.png | 838 KB |
| Side profile | sideProfile | screenshots/sideProfile.png | 744 KB |
| Top formation | topFormation | screenshots/topFormation.png | 796 KB |
| Asset inspect | assetInspect | screenshots/assetInspect.png | 779 KB |
| Contact sheet | v5 contact | assets/samurai_character_contact_sheet.png | 1.12 MB |
| Hero reference | v5 hero | assets/samurai_character_hero.png | 669 KB |
