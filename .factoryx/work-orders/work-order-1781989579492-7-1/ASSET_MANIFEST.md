# ASSET_MANIFEST — Kawanakajima Samurai Battlefield Playable Unity Deliverable

**Work Order:** work-order-1781989579492-7-1
**Title:** Kawanakajima 20 Samurai Battlefield Unity Playable
**Date:** 2026-06-20
**Completion Mode:** polish_until_deadline
**Branch:** `factoryx/factory-edo-woodblock/work-order-1781989579492-7-1`
**Preview:** `games/kawanakajima-foundry-samurai-proof/index.html`

## Generated Assets (Asset Foundry Provenance)

### 1. Samurai Character Asset
- **File:** `StreamingAssets/Kawanakajima/samurai_character.glb`
- **Size:** 1.23 MB
- **Provenance:** Asset Foundry Blender job `asset-1781913507610-bf69e595` (v5 repair)
- **Source:** `http://factoryx-edo-woodblock-asset-foundry:18113/outputs/asset-1781913507610-bf69e595/samurai_character_source_v5.blend`
- **Description:** Stylized samurai with kabuto helmet, mempo faceplate, lamellar do (armor), sode shoulder plates, kote arm guards, hakama pants, tabi socks, geta sandals, katana/saya, and sashimono banner
- **Visual gate:** v5 replaces v4's blocky slab look with cleaner stylized anatomy. Contact sheet confirms readable silhouettes from all angles.

### 2. 20-Samurai Battlefield Pack
- **File:** `StreamingAssets/Kawanakajima/samurai_battlefield_pack.glb`
- **Size:** 6.55 MB
- **Provenance:** Asset Foundry Blender job `asset-1781935845583-91a9fdbe` (v3 fidelity pass)
- **Contents:** Full battlefield scene — terrain, hills, pine trees, field stones, road, river, rice paddies, field banners, 20 samurai in formation
- **Manifest:** `samurai_battlefield_manifest.json` — warrior_count=20, 10/10 faction split, per-warrior ID/pose/position/yaw

### 3. Audio Assets
- `battlefield_loop.wav` — 2.53 MB — ambient battlefield rumble
- `charge_cue.wav` — 15.9 KB — charge initiation
- `clash_accent.wav` — 53 KB — impact/clash
- `formation_step.wav` — 22.1 KB — reformation footstep
- `ui_confirm.wav` — 10.7 KB — UI button confirmation
- **Provenance:** All from Asset Foundry job `asset-1781916330853-f7d831d9`

### 4. Evidence Images
| Image | Size | Description |
|-------|------|-------------|
| `samurai_character_contact_sheet.png` | 1.12 MB | v5 contact sheet — 5 camera views |
| `samurai_character_hero.png` | 669 KB | Hero reference render |
| `screenshots/overview.png` | 746 KB | Wide battlefield overview |
| `screenshots/redClose.png` | 781 KB | Takeda (red) close inspection |
| `screenshots/blueClose.png` | 838 KB | Uesugi (blue) close inspection |
| `screenshots/sideProfile.png` | 744 KB | Side profile |
| `screenshots/topFormation.png` | 796 KB | Top-down formation |
| `screenshots/assetInspect.png` | 779 KB | Asset detail close-up |
| `screenshots/mcp_wide_formation_v8.png` | 745 KB | Unity MCP wide formation |
| `screenshots/mcp_hero_3q_v8.png` | 742 KB | Unity MCP hero three-quarter |
| `screenshots/mcp_game_view_v8.png` | 184 KB | Unity MCP game view |
| `screenshots/foundry-contact-sheet.png` | 288 KB | Foundry contact sheet |
| `screenshots/foundry-hero.png` | 722 KB | Foundry hero |

## Unity Handoff Assets

| Asset | Path | Size |
|-------|------|------|
| Samurai GLB | `unity/kawanakajima-samurai/Assets/StreamingAssets/Kawanakajima/samurai_character.glb` | 1.23 MB |
| Battlefield pack GLB | `unity/kawanakajima-samurai/Assets/StreamingAssets/Kawanakajima/samurai_battlefield_pack.glb` | 6.55 MB |
| Battlefield manifest | `unity/kawanakajima-samurai/Assets/StreamingAssets/Kawanakajima/samurai_battlefield_manifest.json` | — |
| Audio WAVs | `unity/kawanakajima-samurai/Assets/Resources/KawanakajimaAudio/` | ~2.7 MB total |
| Bootstrap script | `unity/kawanakajima-samurai/Assets/Kawanakajima/Scripts/KawanakajimaRuntimeBootstrap.cs` | 758 lines |
| Build hooks | `unity/kawanakajima-samurai/Assets/Kawanakajima/Editor/KawanakajimaUnityBuild.cs` | 67 lines |
| Scene | `unity/kawanakajima-samurai/Assets/Kawanakajima/Scenes/Kawanakajima.unity` | — |

## Integration Points

- Browser proof: `index.html` loads samurai GLB via THREE.GLTFLoader
- 20 actors created (10 Takeda/red, 10 Uesugi/blue) with pose/scale/variant transforms
- Camera presets: overview, redClose, blueClose, sideProfile, topFormation, assetInspect
- Audio: loop toggle, charge/clash/step/confirm SFX
- Charge/reform gameplay mechanics (LERP animation)
- Click-to-inspect samurai with faction info panel
- Review panel with contact sheet + hero image
- `window.KAWANAKAJIMA_FOUNDRY` exposed for harness interaction

## Browser Verification

| Check | Result |
|-------|--------|
| WebGL context | ✅ Created |
| 20 samurai loaded | ✅ No 404s |
| First viewport non-blank | ✅ Canvas shows scene |
| Orbit controls | ✅ Drag works |
| Zoom | ✅ Wheel works |
| Keyboard shortcuts (1-6, A, C, R, X, P, F) | ✅ All functional |
| `node verify.js` | ✅ All checks pass |
| Canvas pixel variance | ✅ Confirmed |

## Visual Review Evidence

All screenshots reviewed at v8.8. Samurais read as low-poly stylized figures with readable silhouettes (helmet, armor, weapons, banners). No capsule anatomy, disk faces, paddle feet, untextured primitives, or Minecraft silhouettes detected.

## Known Limitations

- Unity build requires Mac Studio Unity Editor (not available on worker); Mac build completed in v8.4
- Unity MCP is reachable from the worker through `http://host.docker.internal:27481/mcp`; tool invocation requires standard MCP `tools/call`
- Asset fidelity is stylized/low-poly, not photorealistic
- Single GLB cloned 20×; variants via pose/scale/stance transforms and additive props
