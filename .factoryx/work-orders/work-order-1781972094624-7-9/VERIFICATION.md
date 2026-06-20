# Verification — work-order-1781972094624-7-9

## Browser Runtime Verification

- **Preview entrypoint:** `games/kawanakajima-foundry-samurai-proof/index.html`
- **Canvas:** Non-blank WebGL context with 20 samurai, terrain, banners
- **Camera:** Default overview frames the formation; 6 repeatable presets available
- **Controls:** Drag orbit, wheel zoom, keyboard shortcuts (1-6/C/R/A/X/T/F)
- **Interaction:** Click samurai → inspect panel with faction info
- **Audio:** File-backed WAVs load; AUDIO toggle, CHARGE/CLASH/REFORM cues play
- **Verification script:** `node verify.js` → PASS (structure, paths, sizes, 20 actors, audio, GLB)

## Asset Verification

| Asset | Path | Size | Status |
|-------|------|------|--------|
| Samurai GLB | `assets/samurai_character.glb` | 1.23 MB | ✅ Loads in scene |
| Contact sheet | `assets/samurai_character_contact_sheet.png` | 1.12 MB | ✅ Displayed in review panel |
| Hero reference | `assets/samurai_character_hero.png` | 669 KB | ✅ Displayed in review panel |
| Battlefield pack GLB | `assets/generated/foundry/samurai-battlefield-pack/.../samurai_battlefield_pack.glb` | 6.55 MB | ✅ Handoff copied to Unity |
| Battlefield manifest | `.../samurai_battlefield_manifest.json` | — | ✅ 20 warriors, 10/10 split |
| Audio loop | `assets/audio/battlefield_loop.wav` | 2.53 MB | ✅ Plays on AUDIO toggle |
| Audio charge | `assets/audio/charge_cue.wav` | 15.9 KB | ✅ Plays on CHARGE |
| Audio clash | `assets/audio/clash_accent.wav` | 53 KB | ✅ Plays on CLASH |
| Audio step | `assets/audio/formation_step.wav` | 22 KB | ✅ Plays on REFORM |
| Audio confirm | `assets/audio/ui_confirm.wav` | 11 KB | ✅ Plays on UI actions |

## Evidence Screenshots

| View | File | Camera Preset |
|------|------|--------------|
| Wide overview | `screenshots/overview.png` (746 KB) | overview |
| Takeda close | `screenshots/redClose.png` (781 KB) | redClose |
| Uesugi close | `screenshots/blueClose.png` (838 KB) | blueClose |
| Side profile | `screenshots/sideProfile.png` (744 KB) | sideProfile |
| Top formation | `screenshots/topFormation.png` (796 KB) | topFormation |
| Asset inspect | `screenshots/assetInspect.png` (779 KB) | assetInspect |
| Contact sheet | `assets/samurai_character_contact_sheet.png` (1.12 MB) | v5 Blender renders |
| Hero reference | `assets/samurai_character_hero.png` (669 KB) | v5 Blender render |

## Unity Verification

- **MCP endpoint:** `http://172.21.0.1:25666` — returns 401 Unauthorized (no token available)
- **Unity CLI:** `0.1.0-beta.7` (wrapper only)
- **Unity Editor:** Not installed (`unity editors -i` shows no editors)
- **Disk space:** ~2.1 GB free on /cache (needs 18 GB minimum)
- **Handoff assets:** GLB, WAVs, manifest all present in `unity/kawanakajima-samurai/`
- **Runtime bootstrap:** `KawanakajimaRuntimeBootstrap.cs` loads GLB, creates 20 actors
- **Build hooks:** `KawanakajimaUnityBuild.cs` with WebGL/Linux build entrypoints
- **Result:** Unity playable build **not created** — see UNITY_BLOCKER.md

## Verification Result: PASS (browser) / BLOCKED (Unity)

Browser proof is functional and reviewable. Unity playable build cannot be produced on this worker.
