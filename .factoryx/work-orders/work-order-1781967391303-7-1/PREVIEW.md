# Preview — Kawanakajima 20 Samurai Countryside Unity Game

## Work Order
`work-order-1781967391303-7-1`

## Preview Entrypoint

**Relative path:** `games/kawanakajima-foundry-samurai-proof/index.html`

**Preview URL (if deployed):**
`https://www.ystackai.com/factoryx/edo-woodblock/previews/factoryx/factory-edo-woodblock/work-order-1781967391303-7-1/games/kawanakajima-foundry-samurai-proof/`

## What the Preview Shows

- **3D scene:** Rolling Japanese countryside terrain with 8 hill layers, 10 pine trees, 14 stones, central field path
- **20 samurai:** 10 Takeda (red) in left formation, 10 Uesugi (blue) in right formation
- **Foundry assets:** Live GLB from Blender Asset Foundry (samurai_character.glb, v5)
- **Controls:**
  - Mouse drag: orbit camera
  - Mouse wheel: zoom in/out
  - Click samurai: inspect with side panel
  - 1-6 keys: camera presets (overview, red close, blue close, side, top, inspect)
  - C: CHARGE — samurai charge forward with lean animation
  - R: REFORM — return to formation
  - A: toggle ambient audio (battlefield loop)
  - X: play clash accent
  - T: toggle review/contact sheet panel
  - F/Space: reset to overview

## Camera Presets

| # | Preset | Purpose |
|---|--------|---------|
| 1 | overview | Wide tactical view of full formation |
| 2 | redClose | Close-up on Takeda samurai |
| 3 | blueClose | Close-up on Uesugi samurai |
| 4 | sideProfile | Side profile of battle line |
| 5 | topFormation | Top-down tactical view |
| 6 | assetInspect | Close hero inspection with review panel |

## Screenshots

Located in `games/kawanakajima-foundry-samurai-proof/screenshots/`:
- `overview.png` — Wide tactical formation
- `redClose.png` — Takeda close view
- `blueClose.png` — Uesugi close view
- `sideProfile.png` — Side profile
- `topFormation.png` — Top-down view
- `assetInspect.png` — Close inspection with review panel
- `foundry-contact-sheet.png` — Source contact sheet for comparison
- `foundry-hero.png` — Source hero render

## Unity Handoff Preview

Located in `unity/kawanakajima-samurai/`:
- Full Unity project with glTFast package
- `KawanakajimaRuntimeBootstrap.cs` — 20 samurai, terrain, particles, controls
- 5 WAV audio files from Foundry
- `README.md` — Quick start guide
- Build hooks in `Assets/Kawanakajima/Editor/KawanakajimaUnityBuild.cs`

**Note:** Unity build is BLOCKED due to missing Editor installation. See `UNITY_BLOCKER.md`.
