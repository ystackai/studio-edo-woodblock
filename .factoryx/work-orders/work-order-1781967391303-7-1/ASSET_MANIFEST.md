# ASSET_MANIFEST — Kawanakajima 20-Samurai Countryside Unity Game

**Work Order:** work-order-1781967391303-7-1  
**Deliverable:** Kawanakajima 20 Samurai Countryside Unity Game  
**Date:** 2026-06-20  
**Status:** Browser proof complete, Unity source handoff complete, Unity playable build blocked

---

## 1. Foundry Samurai Character Asset (Primary Runtime GLB)

| Field | Value |
|-------|-------|
| Job ID | `asset-1781913507610-bf69e595` |
| Source | Asset Foundry (http://factoryx-edo-woodblock-asset-foundry:18113) — verified healthy |
| Blender pass | v5 repair pass (20260620) — supersedes v4 block/slab failure |
| File | `samurai_character.glb` |
| Size | 1.23 MB (1,285,892 bytes) |
| Content | Stylized samurai: kabuto helmet, mempo face mask, lamellar do armor, sode shoulder plates, kote forearm guards, hakama, tabi/geta, katana/scabbard, sashimono banner |
| Source blend | `samurai_character_source_v5.blend` (4.4 MB) |
| Mesh count | ~202 meshes in source |
| Provenance URL | `http://factoryx-edo-woodblock-asset-foundry:18113/outputs/asset-1781913507610-bf69e595/samurai_character_source.blend` |
| Contact sheet | `samurai_character_contact_sheet.png` (1.12 MB) |
| Hero render | `samurai_character_hero.png` (669 KB) |

**Preserved under:**
- `games/kawanakajima-foundry-samurai-proof/assets/samurai_character.glb`
- `games/kawanakajima-foundry-samurai-proof/assets/generated/foundry/samurai/improved-20260620-v5/`
- `unity/kawanakajima-samurai/Assets/StreamingAssets/Kawanakajima/samurai_character.glb`

**Integration points:**
- Browser: loaded via THREE.GLTFLoader as single source, cloned 20× for actors
- Unity: loaded via glTFast GltfImport at runtime from StreamingAssets

---

## 2. Foundry 20-Samurai Battlefield Pack (Scene Pack)

| Field | Value |
|-------|-------|
| Job ID | `asset-1781935845583-91a9fdbe` |
| Source | Asset Foundry — Blender v3 pass (denser lamellar, matte charcoal iron, cloth sashimono, rolling terrain, dust patches, stones, grass tufts) |
| File | `samurai_battlefield_pack.glb` |
| Size | 6.55 MB (6,873,392 bytes) |
| Source blend | `samurai_battlefield_pack_source.blend` (21 MB) |
| Manifest | `samurai_battlefield_manifest.json` — 20 named warriors, 10 Takeda, 10 Uesugi |
| Evidence | `samurai_battlefield_contact_sheet.png`, `samurai_battlefield_wide_clash.png` |
| Provenance | Blender procedural + foundry pipeline |

**Preserved under:**
- `games/kawanakajima-foundry-samurai-proof/assets/generated/foundry/samurai-battlefield-pack/asset-1781935845583-91a9fdbe/`
- `unity/kawanakajima-samurai/Assets/StreamingAssets/Kawanakajima/samurai_battlefield_pack.glb`
- `unity/kawanakajima-samurai/Assets/StreamingAssets/Kawanakajima/samurai_battlefield_manifest.json`

---

## 3. Foundry Audio Assets

| Field | Value |
|-------|-------|
| Job ID | `asset-1781916330853-f7d831d9` |
| Source | Asset Foundry |

| File | Size | Usage |
|------|------|-------|
| `battlefield_loop.wav` | 2.53 MB | Ambient battlefield loop (AUDIO toggle) |
| `charge_cue.wav` | 15.9 KB | Charge command SFX |
| `clash_accent.wav` | 53.0 KB | Clash SFX (X key, auto-played 0.72s after charge) |
| `ui_confirm.wav` | 10.7 KB | UI confirmation feedback |
| `formation_step.wav` | 22.1 KB | Formation reformation SFX |

**Preserved under:**
- `games/kawanakajima-foundry-samurai-proof/assets/audio/`
- `games/kawanakajima-foundry-samurai-proof/assets/generated/foundry/audio/asset-1781916330853-f7d831d9/`
- `unity/kawanakajima-samurai/Assets/Resources/KawanakajimaAudio/`

---

## 4. Browser Game Assets

| File | Size | Description |
|------|------|-------------|
| `index.html` | ~28 KB | Main game entry point (745 lines) |
| `three.min.js` | ~640 KB | Three.js r152 |
| `GLTFLoader.js` | ~52 KB | Three.js GLTF/GLB loader |
| `screenshots/overview.png` | 746 KB | Default camera — wide view of 20 samurai |
| `screenshots/redClose.png` | 781 KB | Red (Takeda) close-up inspection |
| `screenshots/blueClose.png` | 838 KB | Blue (Uesugi) close-up inspection |
| `screenshots/sideProfile.png` | 744 KB | Side profile view |
| `screenshots/topFormation.png` | 796 KB | Top-down formation view |
| `screenshots/assetInspect.png` | 779 KB | Asset inspection (zoomed on single samurai) |
| `screenshots/foundry-contact-sheet.png` | 288 KB | Foundry-generated contact sheet |
| `screenshots/foundry-hero.png` | 722 KB | Foundry hero render |

**Preview path:** `games/kawanakajima-foundry-samurai-proof/index.html`

---

## 5. Unity Source Handoff

| File | Description |
|------|-------------|
| `unity/kawanakajima-samurai/README.md` | Handoff documentation with setup instructions |
| `unity/kawanakajima-samurai/Assets/Kawanakajima/Scripts/KawanakajimaRuntimeBootstrap.cs` | Runtime scene builder, 20-actor management, camera/audio/controls |
| `unity/kawanakajima-samurai/Assets/Kawanakajima/Editor/KawanakajimaUnityBuild.cs` | Editor build hooks for WebGL, Linux, Mac |
| `unity/kawanakajima-samurai/Assets/Kawanakajima/Scenes/Kawanakajima.unity` | Unity scene file |
| `unity/kawanakajima-samurai/Packages/manifest.json` | glTFast package declaration |
| `unity/kawanakajima-samurai/verify-unity-handoff.js` | Handoff verification script (all checks PASS) |
| `unity/kawanakajima-samurai/UNITY_BUILD_VERIFICATION.md` | Build verification notes |
| `unity/kawanakajima-samurai/UNITY_LOCAL_STATUS.md` | Local Mac status |

**Unity Editor:** Available on local Mac (2023.2.20f1) with MCP listener at `http://localhost:25666`. Remote worker lacks Editor.

---

## 6. Integration Verification

| Check | Status |
|-------|--------|
| Browser loads GLB | ✅ 200 response, 1.23 MB loads, 20 actors created |
| All 6 camera views work | ✅ overview, redClose, blueClose, sideProfile, topFormation, assetInspect |
| CHARGE/REFORM interaction | ✅ actors animate to charge positions, then reform |
| Audio system | ✅ 5 file-backed WAV files, toggle works, SFX on charge/clash/confirm |
| Unity handoff structure | ✅ verify-unity-handoff.js: PASS |
| Foundry asset provenance | ✅ GLB from asset-1781913507610-bf69e595 + v5 Blender repair |
| Battlefield pack | ✅ 6.55 MB GLB, manifest, contact sheet, evidence images |
| Canvas non-blank | ✅ All screenshots show non-blank 3D scene with visible samurai |
| No oscillator/procedural blips | ✅ All audio from Foundry WAV files |
| Preview entrypoint | ✅ `.factoryx/preview-entrypoint` → `games/kawanakajima-foundry-samurai-proof/index.html` |

---

## 7. Known Blockers

1. **Unity playable build** — no Unity Editor available on remote worker (only CLI/MCP binaries). Local Mac Studio has Unity 2023.2.20f1 with MCP listener, so a Mac build is possible locally.
2. **Visual review** — the v5 repair pass addresses the v4 block/slab read but remains stylized (not photoreal). Human visual review recommended via committed screenshots.

---

## 8. Branch & PR

- **Branch:** `factoryx/edo-samurai-20-unity-game`
- **Target:** `main`
- **PR:** To be opened after this polish pass
