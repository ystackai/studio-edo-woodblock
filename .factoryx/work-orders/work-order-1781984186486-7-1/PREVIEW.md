# Preview — Kawanakajima Samurai Unity Playable Proof v8.7

## Preview URL

- **Browser proof:** `games/kawanakajima-foundry-samurai-proof/index.html`
- **Unity Mac build:** `unity/kawanakajima-samurai/Builds/Mac/KawanakajimaSamurai.app`

## How to Review

1. **Browser proof:** Open `games/kawanakajima-foundry-samurai-proof/index.html` in a browser. The scene loads Foundry samurai GLBs, displays 20 samurai (10 red Takeda / 10 blue Uesugi), with orbit camera, 6 camera presets, charge/reform/clash/audio controls.

2. **Unity Mac build:** Open `unity/kawanakajima-samurai/` in the Unity Editor. The scene `Kawanakajima.unity` has one root GameObject `KawanakajimaRuntimeBootstrap` that builds the entire world at Play Mode start: terrain, hills, pine trees, field stones, samurai GLB instantiation, camera, lights, audio.

3. **Unity MCP verification:** The Mac Unity MCP listener at `http://172.21.0.1:25666` can be queried via `POST /api/system-tools/ping` and `POST /api/tools/<tool-name>` with the `UNITY_MCP_TOKEN` bearer token.

## What's Included

- **Browser proof** (v8.7): Three.js + GLTFLoader, Foundry samurai GLB, orbit camera, 6 presets, charge/reform/clash, audio hooks, shadows, tone mapping, vignette, fog, breathing animation. **JS syntax fix applied** — removed stray closing brace that caused `Unexpected token 'function'` in browser runtime checks.
- **Unity runtime** (v8): KawanakajimaRuntimeBootstrap.cs (758 lines) with GLTFast reflection bootstrap, 20 samurai, terrain, hills, trees, stones, 6 camera presets, audio hooks
- **Unity build:** Mac .app (112 MB) via KawanakajimaUnityBuild.BuildMac()
- **Screenshots:** 21 Unity proof images across 5 versions (v8.3–v8.7), 8 browser proof images
- **Assets:** Foundry samurai GLB (1.23 MB), battlefield pack GLB (6.55 MB), 5 audio WAVs (2.53 MB)

## v8.7 Changes

- **Browser JS fix:** Removed extra closing brace `}` after `applyPreset()` function. Bracket balance verified. Browser syntax check now passes.
- **New MCP screenshots:** 3 additional camera angles from Unity MCP:
   - `mcp_game_view_v8.png` — full scene with ready UI
   - `mcp_hero_3q_v8.png` — dramatic hero three-quarter close-up
   - `mcp_wide_formation_v8.png` — full battlefield overview

## PR

- **PR #167:** `factoryx/kawanakajima-samurai-unity-autonomous-loop-20260620-v8` → `main`
- Status: Open, mergeable, 13 commits, 23 files changed
- Latest commit: `565ccb5` (v8.7: update VERIFICATION.md)
- Second latest: `70825b1` (v8.7: fix browser JS syntax + add MCP screenshots)
