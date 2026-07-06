# Kawanakajima — 20 Samurai Countryside Unity Handoff

**Work Order:** work-order-1781967391303-7-1  
**Deliverable:** Kawanakajima 20 Samurai Countryside Unity Game  
**Status:** Fresh Unity Editor Mac build and built-player smoke pass with real GLBs and no fallbacks.
**Playables:** Browser proof at `games/kawanakajima-foundry-samurai-proof/`

## Overview

This project recreates the 1561 Battle of Kawanakajima with 20 samurai (10 Takeda, 10 Uesugi) in a Japanese countryside setting. The samurai characters are generated via Asset Foundry + Blender with provenance tracked per job. The scene features layered terrain, distant hills, pine trees, field banners, and atmospheric mist.

## Directory Structure

```
unity/kawanakajima-samurai/
├── Assets/
│   ├── StreamingAssets/
│   │   └── Kawanakajima/
│   │       ├── samurai_character.glb          (1.15 MB, v29 Blender anatomy pass)
│   │       ├── samurai_battlefield_pack.glb   (7.06 MB, review-gated Asset Foundry battlefield pack)
│   │       └── samurai_battlefield_manifest.json (20 warriors, 10/10 split)
│   ├── Resources/
│   │   └── KawanakajimaAudio/
│   │       ├── battlefield_loop.wav           (2.53 MB, ambient loop)
│   │       ├── charge_cue.wav                 (15.9 KB)
│   │       ├── clash_accent.wav               (53 KB)
│   │       ├── ui_confirm.wav                 (10.7 KB)
│   │       └── formation_step.wav             (22.1 KB)
│   ├── Kawanakajima/
│   │   ├── Scripts/
│   │   │   └── KawanakajimaRuntimeBootstrap.cs
│   │   ├── Editor/
│   │   │   └── KawanakajimaUnityBuild.cs
│   │   ├── Scenes/
│   │   │   └── Kawanakajima.unity
│   │   └── Review/
│   │       ├── samurai_character_contact_sheet.png
│   │       ├── samurai_character_hero.png
│   │       ├── samurai_battlefield_contact_sheet.png
│   │       └── samurai_battlefield_wide_clash.png
│   └── Plugins/NuGet/ (glTFast dependencies)
├── Packages/manifest.json (declares com.unity.cloud.gltfast)
├── ProjectSettings/ (Unity project version)
├── README.md (this file)
├── verify-unity-handoff.js (verification script)
├── UNITY_BUILD_VERIFICATION.md (historical/stale build record, not current completion)
└── UNITY_LOCAL_STATUS.md
```

## Foundry Asset Provenance

| Asset | Job ID | Size | Description |
|-------|--------|------|-------------|
| `samurai_character.glb` | `asset-1782104227755-0ef02798` | 1.15 MB | v29 Blender 5 anatomy pass — kabuto, mempo, lamellar, sode, kote, hakama, tabi/geta, katana, sashimono |
| `samurai_battlefield_pack.glb` | `asset-1782152407992-cc920f4b` | 7.06 MB | Fresh autonomous `--submit` Blender 5 API pack — 20 named warriors with terrain, banners, formation, and passed `review.json` |
| Audio stems | `asset-1781916330853-f7d831d9` | ~2.7 MB | Battlefield loop, charge/clash/confirm/step SFX |

All assets verified via `node verify-unity-handoff.js` → **PASS**

## Current Unity Build Status

As of 2026-06-22, the current source handoff verifies structurally, builds through Unity Editor batchmode, and the freshly built Mac player reaches:

```bash
./run-local-unity-build.sh
APP="$PWD/Builds/Mac/KawanakajimaSamurai.app/Contents/MacOS/kawanakajima-samurai" \
  ./smoke-built-player.sh
```

```text
Kawanakajima Mac Unity build: PASS
KAWANAKAJIMA_UNITY_READY actors=20 pack=True audio=True fallbackActors=False fallbackPack=False
```

That smoke proves the fresh Unity player can load the real samurai GLB and the real 20-samurai battlefield pack GLB without runtime actor or pack fallbacks.

Unity-MCP also reaches readiness from this project:

```bash
./check-unity-mcp.sh --open
```

```text
UNITY_MCP_READY url=http://localhost:27482
```

`UNITY_BUILD_VERIFICATION.md` records the fresh 2026-06-22 build, built-player smoke, and Unity-MCP readiness evidence.

## Quick Start

1. Open this folder in **Unity 2022.3+** or **Unity 6**.
2. Package Manager resolves `com.unity.cloud.gltfast` automatically.
3. Run `FactoryX > Kawanakajima > Create Or Refresh Scene` from the Unity menu.
4. Open `Assets/Kawanakajima/Scenes/Kawanakajima.unity`.
5. Press **Play**.

## Controls

| Input | Action |
|-------|--------|
| Mouse drag | Orbit camera around scene |
| Mouse wheel | Zoom in/out |
| Click samurai | Inspect individual (shows faction info panel) |
| `1` | Overview camera |
| `2` | Red close (Takeda) |
| `3` | Blue close (Uesugi) |
| `4` | Side profile |
| `5` | Top formation |
| `6` | Asset inspect (single samurai close-up) |
| `C` | Charge — both sides charge toward each other |
| `R` | Reform — return to formation |
| `A` | Toggle audio (battlefield loop) |
| `X` | Clash accent sound |
| `P` | Toggle Foundry battlefield pack view |
| `Space` / `F` | Reset to overview |

## Build Commands

From a worker with Unity Editor installed:

**WebGL:**
```bash
Unity -batchmode -quit -projectPath unity/kawanakajima-samurai \
  -executeMethod KawanakajimaUnityBuild.BuildWebGL \
  -logFile /tmp/kawanakajima-webgl.log
```

**Linux:**
```bash
Unity -batchmode -quit -projectPath unity/kawanakajima-samurai \
  -executeMethod KawanakajimaUnityBuild.BuildLinux \
  -logFile /tmp/kawanakajima-linux.log
```

**Mac:**
```bash
Unity -batchmode -quit -projectPath unity/kawanakajima-samurai \
  -executeMethod KawanakajimaUnityBuild.BuildMac \
  -logFile /tmp/kawanakajima-mac.log
```

**Expected outputs:**
- `Builds/WebGL/`
- `Builds/Linux/KawanakajimaSamurai`
- `Builds/Mac/KawanakajimaSamurai.app`

## Runtime Bootstrap Details

`KawanakajimaRuntimeBootstrap.cs`:
- Creates materials for terrain (paper earth), distant hills (ink tones), pine trees, stones, and faction standards
- Loads samurai GLB from StreamingAssets via glTFast
- Instantiates 20 actors (10 Takeda left, 10 Uesugi right) with pose variants
- Animation loop: idle breathing, charge animation, and reform
- Camera: orbit controls + 6 presets (overview, redClose, blueClose, sideProfile, topFormation, assetInspect)
- Audio: file-backed WAV files, toggle loop, SFX on charge/clash/confirm/step
- Optional Foundry battlefield pack view toggled with `P`

## Known Limitations

- **Remote worker Unity hosting:** The remote worker has Unity CLI/MCP only and does not host the Editor directly. Historical routes to the Mac listener exist, but current source completion still requires a ready local Editor/MCP session.
- **Disk space:** Remote worker `/cache` has limited free space; Unity Editor installation remains a poor fit there.
- **Asset fidelity:** Current assets are coherent and review-gated, but still stylized rather than final photoreal production art.

## Browser Proof

The parallel Three.js/browser proof at `games/kawanakajima-foundry-samurai-proof/` provides:
- Same 20 samurai actors, same Foundry assets
- 6 camera presets, charge/reform/audio controls
- Review panel with contact sheet and hero render
- All verification checks pass (node verify.js → PASS)
- Preview: `games/kawanakajima-foundry-samurai-proof/index.html`
