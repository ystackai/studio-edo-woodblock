# ASSET_MANIFEST — Kawanakajima 20 Samurai Proof (work-order-1781972094624-7-9)

**Work Order:** work-order-1781972094624-7-9
**Title:** Autonomous Kawanakajima 20 Samurai Unity proof after gateway fix
**Date:** 2026-06-22
**Completion mode:** polish_until_deadline
**Branch:** `factoryx/kawanakajima-autonomous-unity-proof-20260620-gatewayfix-1614`
**Preview:** `games/kawanakajima-foundry-samurai-proof/index.html`

## Status

Browser proof is reviewable with 20 samurai (10 Takeda vs 10 Uesugi), file-backed audio, repeatable 6-camera inspection rig, charge/reform gameplay, and review panels. Unity source handoff is present. A managed-code patch of the existing Mac player now smokes successfully with the current runtime source and real GLBs:

```text
KAWANAKAJIMA_UNITY_READY actors=20 pack=True audio=True fallbackActors=False fallbackPack=False
```

That proves the current Unity runtime can load the samurai GLB and 20-samurai battlefield pack GLB without runtime actor or pack fallback. Fresh Unity Editor rebuild is still not included because the local Unity Editor batch build is blocked by license activation.

## Generated Assets (Asset Foundry provenance)

### 1. Samurai Character Asset
- **File:** `assets/samurai_character.glb`
- **Size:** 1.15 MB
- **Provenance:** Asset Foundry local HTTP API + Blender 5 job `asset-1782104227755-0ef02798` (v29 anatomy pass; supersedes v5 while preserving v5 in history)
- **Source:** `assets/generated/foundry/samurai/improved-20260622-v29/samurai_character_source.blend`
- **Description:** Stylized samurai with kabuto helmet, mempo faceplate, lamellar do (armor), sode shoulder plates, kote arm guards, hakama pants, tabi socks, geta sandals, katana/saya, and sashimono banner. Current Unity managed-patched player smoke proves this GLB can load in the existing Mac player; a fresh Unity Editor rebuild is still pending license activation.
- **Visual gate:** v4 was blocky/slab-like; v5 replaced with cleaner stylized anatomy; v29 narrows the armor underframe so the default playable asset reads less like a red ball torso. Contact sheet and hero render provided for inspection.

### 2. 20-Samurai Battlefield Pack
- **File:** `assets/generated/foundry/samurai-battlefield-pack/asset-1782110424464-f9534d45/samurai_battlefield_pack.glb`
- **Size:** 7.11 MB
- **Provenance:** Asset Foundry Blender job `asset-1782110424464-f9534d45` (review-gated API handoff after Asset Foundry `review_contract` validation)
- **Contents:** One GLB scene with 20 named samurai, 10 Takeda + 10 Uesugi, on countryside battlefield with road, river, rice paddies, cedar hills, banners, weapons.
- **Manifest:** `samurai_battlefield_manifest.json` — warrior_count=20, 10/10 faction split, per-warrior ID/pose/position/yaw.
- **Evidence:** `samurai_battlefield_contact_sheet.png` — 5 stable camera views.
- **Meeting composition gate:** `center_gap=2.6`, below the Asset Foundry review maximum of `2.8`, so the opposing lines read as a meeting instead of separated edge groups.
- **Countryside environment gate:** `environment_feature_count=125` and `sky_backdrop_count=1`, proving the pack includes terrain, paddies/river, reeds, cedars, hills, and a dawn backdrop before Unity/browser handoff.
- **Review gate:** `review.json` — `state=passed`; validates required outputs, 20-warrior identity, 10/10 faction split, stable camera evidence, minimum geometry/detail floors, countryside environment evidence, and meeting composition before Unity/browser handoff.

### 3. Audio Assets
- **Loop:** `assets/audio/battlefield_loop.wav` — 2.53 MB, low-rumble battlefield ambience from Asset Foundry job `asset-1781916330853-f7d831d9`
- **Charge:** `assets/audio/charge_cue.wav` — 15.9 KB
- **Clash:** `assets/audio/clash_accent.wav` — 53 KB
- **Step:** `assets/audio/formation_step.wav` — 22 KB
- **Confirm:** `assets/audio/ui_confirm.wav` — 11 KB
- **Provenance:** All file-backed WAVs from Foundry, mirrored from `assets/generated/foundry/audio/asset-1781916330853-f7d831d9/`

### 4. Evidence Images
- `assets/samurai_character_contact_sheet.png` — 486 KB, v29 contact sheet
- `assets/samurai_character_hero.png` — 768 KB, v29 hero reference
- `screenshots/` — 6 repeatable camera PNGs:
  - `overview.png` — wide battlefield overview
  - `redClose.png` — Takeda (red) close inspection
  - `blueClose.png` — Uesugi (blue) close inspection
  - `sideProfile.png` — side profile of formation
  - `topFormation.png` — top-down formation layout
  - `assetInspect.png` — asset detail close-up

## Unity Handoff Assets

- `unity/kawanakajima-samurai/Assets/StreamingAssets/Kawanakajima/samurai_character.glb` — 1.15 MB
- `unity/kawanakajima-samurai/Assets/StreamingAssets/Kawanakajima/samurai_battlefield_pack.glb` — 6.27 MB
- `unity/kawanakajima-samurai/Assets/StreamingAssets/Kawanakajima/samurai_battlefield_manifest.json` — 20 warriors manifest
- `unity/kawanakajima-samurai/Assets/Resources/KawanakajimaAudio/` — all WAV files
- `unity/kawanakajima-samurai/Assets/Kawanakajima/Scripts/KawanakajimaRuntimeBootstrap.cs` — runtime bootstrap
- `unity/kawanakajima-samurai/Assets/Kawanakajima/Editor/KawanakajimaUnityBuild.cs` — build hooks
- `unity/kawanakajima-samurai/Assets/Kawanakajima/Scenes/Kawanakajima.unity` — scene file

## Unity Runtime Verification

- `unity/kawanakajima-samurai/verify-unity-handoff.js` — structure verifier for GLBs, audio, review images, runtime controls, shader-safe glTF material generation, and build hooks.
- `unity/kawanakajima-samurai/patch-existing-mac-player-managed.sh` — compiles current managed source into the existing Mac player when Unity Editor batch build is license-blocked.
- `unity/kawanakajima-samurai/smoke-built-player.sh` — repeatable built-player readiness gate.
- Passing managed-patched smoke:

```text
Built player smoke: PASS
KAWANAKAJIMA_UNITY_READY actors=20 pack=True audio=True fallbackActors=False fallbackPack=False
```

This is runtime evidence, not a fresh build artifact. The final Unity gate still requires a licensed Editor rebuild and visual/playable inspection of that fresh build.

## Integration Points

- `index.html` loads `assets/samurai_character.glb` via THREE.GLTFLoader
- 20 actors created (10 Takeda, 10 Uesugi) with pose/scale/variant transforms
- `PACK GLB` button and `P` key lazy-load `assets/generated/foundry/samurai-battlefield-pack/asset-1782110424464-f9534d45/samurai_battlefield_pack.glb` for direct browser review of the Foundry-authored 20-warrior scene pack
- Camera presets: overview, redClose, blueClose, sideProfile, topFormation, assetInspect
- Audio: loop toggle, charge/clash/step/confirm sound effects
- Charge/reform gameplay mechanics
- Click-to-inspect samurai with faction info panel
- Review panel with contact sheet + hero image
- `window.KAWANAKAJIMA_FOUNDRY` exposed for harness interaction

## Browser Verification

- WebGL context: created
- 20 samurai loaded, no 404s
- Foundry-authored 20-samurai battlefield pack is exposed through the browser `PACK GLB` review toggle
- First viewport shows non-blank 3D scene with camera framing subjects
- Orbit controls (drag), zoom (wheel), keyboard shortcuts (1-6, A, C, R, X, T, F)
- `node verify.js` passes all structure/asset/size checks
- `./smoke-browser-pack.sh` passes the direct browser pack runtime smoke:

```text
Browser battlefield pack smoke: PASS
{
  "actorCount": 20,
  "packLoaded": true,
  "packVisible": true,
  "bodyPackVisible": "true"
}
```

- Canvas pixel variance confirms rendered scene (not blank)

## Reviewed Foundry Handoff Loop

`run-reviewed-foundry-handoff.sh` can replay the production handoff:

```bash
games/kawanakajima-foundry-samurai-proof/run-reviewed-foundry-handoff.sh \
  --job-dir games/kawanakajima-foundry-samurai-proof/assets/generated/foundry/samurai-battlefield-pack/asset-1782110424464-f9534d45 \
  --browser-smoke \
  --managed-unity-smoke
```

Use `--submit` instead of `--job-dir` to create a fresh Asset Foundry `samurai_battlefield_pack` job through the HTTP API, wait for review, ingest only a passed job, and then run the same browser/Unity gates.

## Known Limitations

- **Fresh Unity playable build:** Not created yet. The Hetzner worker has Unity CLI (0.1.0-beta.7) but no installed Editor; the Mac host has Unity Editor 2023.2.20f1, but batch build currently fails with `No valid Unity Editor license found`. The managed-patched existing Mac player smoke passes with real GLBs, but the next pass still needs license activation and a fresh build/inspection.
- **Asset fidelity:** Stylized, not photoreal. v29 improves the default playable samurai over v5 by reducing the spherical torso read, but it is still not final realistic character art.
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
| Contact sheet | v29 contact | assets/samurai_character_contact_sheet.png | 486 KB |
| Hero reference | v29 hero | assets/samurai_character_hero.png | 768 KB |
