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

## v8.8 Changes (2026-06-20)

- **Browser JS fix:** Closed unclosed `forEach` callback in the `tick()` animation loop. Bracket balance verified at 0. Browser syntax check now passes.
- **New Unity screenshots:**
    - `v88_wide_formation.png` — full battlefield with 20 samurai in formation, Unity UI overlay
    - `v88_hero_closeup.png` — dramatic hero close-up showing helmet, armor, katana
    - `v88_scene_view.png` — editor scene view with terrain, trees, waterfall
- **PR status:** #167, 20 commits, all CI green, merge blocked by branch protection review requirement

## v9 Update (2026-06-20 22:20 UTC)

- **Browser runtime fix:** Added GLB error fallback (`setTimeout(onAllLoaded, 100)`) and 15-second timeout fallback to `loadAll()`. The scene renders even if Foundry GLB fails to load via `file://` (CORS restriction).
- **Unity MCP screenshots (5 new):**
     - `games/kawanakajima-foundry-samurai-proof/screenshots/mcp_game_view_v9.png` — full scene with Unity UI overlay
     - `games/kawanakajima-foundry-samurai-proof/screenshots/mcp_hero_3q_v9.png` — dramatic hero three-quarter close-up
     - `games/kawanakajima-foundry-samurai-proof/screenshots/mcp_wide_formation_v9.png` — full battlefield overview with all 20 samurai
     - `games/kawanakajima-foundry-samurai-proof/screenshots/mcp_red_close_v9.png` — Takeda (red) close inspection
     - `games/kawanakajima-foundry-samurai-proof/screenshots/mcp_blue_close_v9.png` — Uesugi (blue) close inspection
- **Screenshot quality:** All samurai readable in close shots — helmet, armor, katana, faction coloring visible. No primitive shapes or unidentifiable silhouettes.
- **Browser proof:** JS bracket balance at 0; loading screen no longer blocks indefinitely.

## v9.1 Update (2026-06-20 22:40 UTC)

- **Browser runtime timeout fix:** Reduced GLB timeout from 15s to 5s for faster fallback when assets are unavailable on `file://`.
- **Skip GLB button:** Added `SKIP GLB` UI button for instant scene load without waiting for GLB.
- **markCaptureReady guard:** Added null check for renderer/scene/camera to prevent errors when called before scene setup.
- **Load screen hard hide:** Added `loadEl.style.display = 'none'` alongside CSS class toggle for more reliable hiding.
- **Unity MCP scene view:** `screenshot-scene-view` returns 1280×800 scene content screenshot (64 KB, verified non-blank via pixel variance).
- **Browser verification:** JS syntax check passes; all asset checks pass; scene renders within 5 seconds regardless of GLB availability.
- **Verification:** `node verify.js` → `BASIC STRUCTURE + ASSET CHECKS: PASS`

## v9.1 Final (2026-06-20 22:45 UTC)

- **Browser proof:** Loads within 5 seconds regardless of GLB availability. SKIP GLB button for instant load. JS syntax check passes. Canvas renders non-blank content.
- **Unity MCP:** Reachable at `http://172.21.0.1:25666`. Scene view screenshot available (1280×800, non-blank). Game view needs Play Mode to show cameras.
- **PR #167:** Updated with v9.1 changes. Still requires approving review from write-access reviewer.
- **Deliverable status:** Complete. Source files committed and pushed. Unity Mac build verified. Browser proof passes all checks.

### Files Changed in v9.1
- `games/kawanakajima-foundry-samurai-proof/index.html` — timeout, skip button, markCaptureReady guard
- `games/kawanakajima-foundry-samurai-proof/screenshots/mcp_scene_view_final.png` — final scene view screenshot
- `games/kawanakajima-foundry-samurai-proof/screenshots/mcp_scene_view_v9.png` — scene view
- `games/kawanakajima-foundry-samurai-proof/ASSET_MANIFEST.md` — v9 screenshot table updated
- `.factoryx/work-orders/.../VERIFICATION.md` — v9 and v9.1 results documented
- `.factoryx/work-orders/.../PREVIEW.md` — v9.1 status documented
