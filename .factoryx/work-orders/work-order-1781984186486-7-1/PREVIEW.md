# Preview — Kawanakajima Samurai Unity Playable Proof v9.2

## Preview URL

- **Browser proof:** `games/kawanakajima-foundry-samurai-proof/index.html`
- **Unity Mac build:** `unity/kawanakajima-samurai/Builds/Mac/KawanakajimaSamurai.app`

## How to Review

1. **Browser proof:** Open `games/kawanakajima-foundry-samurai-proof/index.html` in a browser. The scene loads Foundry samurai GLBs, displays 20 samurai (10 red Takeda / 10 blue Uesugi), with orbit camera, 6 camera presets, charge/reform/clash/audio controls.

2. **Unity Mac build:** Open `unity/kawanakajima-samurai/` in the Unity Editor. The scene `Kawanakajima.unity` has one root GameObject `KawanakajimaRuntimeBootstrap` that builds the entire world at Play Mode start: terrain, hills, pine trees, field stones, samurai GLB instantiation, camera, lights, audio.

3. **Unity MCP verification:** The Mac Unity MCP listener at `http://172.21.0.1:25666` can be queried via `POST /api/system-tools/ping` and `POST /api/tools/<tool-name>` with the `UNITY_MCP_TOKEN` bearer token.

## What's Included

- **Browser proof** (v9.2): Three.js + GLTFLoader, Foundry samurai GLB, orbit camera, 6 presets, charge/reform/clash, audio hooks, shadows, tone mapping, vignette, fog, breathing animation, dust particles, screen shake, UI fade.
- **Unity runtime** (v9.2): KawanakajimaRuntimeBootstrap.cs (985 lines) with GLTFast reflection bootstrap, 20 samurai, terrain, hills, trees, stones, 6 camera presets, dust atmosphere, screen shake, UI fade, idle sway, cinematic camera settings.
- **Unity build:** Mac .app (112 MB) via KawanakajimaUnityBuild.BuildMac()
- **Screenshots:** 30+ Unity proof images across 7 versions (v8.3–v9), 8 browser proof images
- **Assets:** Foundry samurai GLB (1.23 MB), battlefield pack GLB (6.55 MB), 5 audio WAVs (2.53 MB)

## v9.2 Changes (2026-06-20 ~23:00 UTC)

- **Bootstrap polish:** Added dust particle atmosphere with wind animation, screen shake on charge/clash, UI auto-hide with fade and H key toggle, per-actor idle sway for breathing feel, grass and water materials, cinematic camera (skybox, forward rendering).
- **Documentation updated:** VERIFICATION.md, PREVIEW.md
- **MCP screenshots:** 6 new screenshots captured before MCP became unavailable: wide formation, hero three-quarter, red close, blue close, scene view, game view.

## v9.1 Changes

- **Browser JS fix:** Added GLB error fallback and 15-second timeout
- **MCP scene view screenshot** captured

## v8.8 Changes

- **Browser JS fix:** Closed unclosed forEach callback in tick() animation loop
- **New Unity screenshots:** wide formation, hero close-up, scene view

## v8.7 Changes

- **Browser JS fix:** Removed extra closing brace after applyPreset()
- **New MCP screenshots:** 3 additional camera angles

## PR

- **PR #167:** `factoryx/kawanakajima-samurai-unity-autonomous-loop-20260620-v8` → `main`
- Status: Open, mergeable, 21+ commits, 24+ files changed
- Latest commit: `7e3d91a` (v9.2: bootstrap polish)
- Second latest: `be99418` (v9.2: bootstrap polish)
- Merge blocked by branch protection requiring one approving review from a write-access reviewer
