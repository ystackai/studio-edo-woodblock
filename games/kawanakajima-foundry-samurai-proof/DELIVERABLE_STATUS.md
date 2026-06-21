# DELIVERABLE STATUS — Kawanakajima Samurai Unity Playable Proof v9.3

**Work Order:** work-order-1781984186486-7-1  
**Branch:** `factoryx/kawanakajima-samurai-unity-autonomous-loop-20260620-v8`  
**PR:** [#167](https://github.com/ystackai/studio-edo-woodblock/pull/167)  
**Last Update:** 2026-06-20 23:14 UTC

## Status Summary

| Item | Status |
|------|--------|
| Browser proof (JS syntax) | ✅ PASS — stray brace removed, syntax check clean |
| Browser proof (asset load) | ✅ PASS — 1.23 MB GLB, 6.55 MB battlefield, 2.53 MB audio |
| Browser proof (live Chromium) | ✅ PASS — `node games/kawanakajima-foundry-samurai-proof/browser-smoke-chromium.mjs` verifies capture-ready, 20 actors, nonblank WebGL canvas |
| Browser proof (gameplay) | ✅ PASS — camera presets, charge/reform/clash, orbit controls |
| Unity MCP scene call | ✅ PASS — `tools/call` → `scene-list-opened` returns loaded `Kawanakajima` scene |
| Unity Play Mode | ✅ PASS — 20 samurai loaded, `KAWANAKAJIMA_UNITY_READY` |
| Unity mesh retention | ✅ PASS — 241/241 non-null meshes, 72,927 vertices |
| Unity Mac build | ✅ PASS — `KawanakajimaSamurai.app` (112 MB) |
| GLTFast reflection bootstrap | ✅ PASS — reflection-based, no hard-link dependency |
| Screenshot coverage | ✅ PASS — 21 Unity images, 8 browser images across v8.3–v8.7 |
| Realistic/high-quality visual gate | ❌ FAIL — wide formation still reads as stylized low-poly/capsule figures with simple block terrain; needs a Blender fidelity pass before calling the samurai production-realistic |
| PR #167 | ✅ OPEN, mergeable, 13 commits |

## Foundry Provenance

- Samurai character: Asset Foundry Blender job `asset-1781913507610-bf69e595`
- 20-samurai battlefield pack: Asset Foundry Blender job `asset-1781935845583-91a9fdbe`
- Audio loop and SFX: Asset Foundry job `asset-1781916330853-f7d831d9`

## v8.7 Changes

- **Browser JS fix:** Removed extra `}` after `applyPreset()` — fixed `Unexpected token 'function'` SyntaxError in browser runtime
- **New MCP screenshots:** 3 camera angles captured from Unity game view and camera tools
- **Documentation:** VERIFICATION.md, PREVIEW.md updated with v8.7 evidence

## Browser Proof

**Preview:** `games/kawanakajima-foundry-samurai-proof/index.html`
**Live smoke:** `node games/kawanakajima-foundry-samurai-proof/browser-smoke-chromium.mjs`

Features:
- 20 samurai (10 Takeda/red, 10 Uesugi/blue) on countryside battlefield
- Orbit camera + 6 presets (overview, red close, blue close, side profile, top formation, asset inspect)
- Charge/reform/clash gameplay mechanics
- File-backed audio (battlefield loop, charge, clash, step, confirm)
- PCFSoft shadows, ACES Filmic tone mapping, fog, vignette
- Breathing animation, body sway, banner wind flutter

## Unity Proof

**Source:** `unity/kawanakajima-samurai/`  
**Scene:** `Kawanakajima.unity`  
**Bootstrap:** `KawanakajimaRuntimeBootstrap.cs` (758 lines)

- GLTFast reflection bootstrap — discovers types at runtime via System.Reflection
- 20 samurai instantiated from Foundry samurai GLB
- Battlefield pack GLB with terrain, hills, pine trees, field stones
- Camera controls (WASD + mouse orbit), charge/reform/clash
- Audio system with loop toggle and SFX playback
- Mac build: `Builds/Mac/KawanakajimaSamurai.app` (112 MB)

## Quality Gate

Runtime quality gates pass: the browser page reaches `CAPTURE_READY:overview`, exposes 20 actors, renders a nonblank WebGL canvas, loads file-backed audio/GLB assets, and the Unity MCP scene is reachable.

The visual realism gate does **not** pass yet. Current wide-formation screenshots still read as stylized low-poly/capsule samurai, with simplified trees/terrain and block-like background geometry. This is reviewable as a funny stylized proof, but it should not be described as realistic or production-quality samurai art until a Blender/Foundry fidelity pass improves anatomy, clothing/armor, face/helmet detail, terrain, and close camera readability.


## v9 Update (2026-06-20 22:20 UTC)

- **Browser runtime fix applied:** Added GLB error fallback (`setTimeout(onAllLoaded, 100)`) and 15-second timeout fallback to the `loadAll()` function. This ensures the scene renders even if the Foundry GLB fails to load via `file://` protocol (CORS restriction). Loading screen will never block indefinitely.
- **Browser JS bracket balance:** Verified at 0 via Node.js syntax analysis.
- **Unity MCP screenshots (v9):** 5 new screenshots captured via Unity MCP `screenshot-game-view` and `screenshot-camera`:
  - `mcp_game_view_v9.png` — full scene with Unity UI overlay
  - `mcp_hero_3q_v9.png` — dramatic hero three-quarter close-up
  - `mcp_wide_formation_v9.png` — full battlefield overview
  - `mcp_red_close_v9.png` — Takeda (red) close inspection
  - `mcp_blue_close_v9.png` — Uesugi (blue) close inspection
- **Screenshot quality:** Runtime screenshots are useful evidence for scene loading and camera framing, but the wide formation still reads stylized and low-poly. Treat the visual gate as failed for realistic/high-quality production assets.
- **Unity MCP scene state:** 73 root GameObjects, Play Mode active, scene `Kawanakajima` loaded and not dirty.

## Remaining Items

- Visual fidelity is blocking for the original high-quality/realistic samurai goal. The proof is playable and wired to Unity, but the current assets should be treated as a baseline, not final game-world production art.
- Future worker probes should use `http://host.docker.internal:27481/mcp` with JSON-RPC `tools/call`, not legacy bridge/API contracts.
- Future browser probes should run `node games/kawanakajima-foundry-samurai-proof/browser-smoke-chromium.mjs`; an HTTP fetch of `index.html` is not a browser runtime smoke.
- **Autonomous completion:** not yet proven end-to-end. The latest autonomous run still required manual intervention to stop stale Unity-route probing and correct repository docs.

## v8.8 Update (2026-06-20)

- **Browser JS fix applied:** Closed unclosed `forEach` callback in `tick()` animation loop. Bracket balance verified at 0. Syntax check passes.
- **Unity MCP screenshots captured:** Wide formation, hero close-up, and scene view captured for runtime evidence; visual realism still needs a Blender fidelity pass.
- **PR #167 status:** Open, 20 commits, all CI checks passing (facts, ci, deploy-preview). Blocked only by GitHub branch protection requiring an approving review from a write-access reviewer.
- **Unity scene state:** 73 root GameObjects, Play Mode, 20 samurai loaded (10 Takeda red, 10 Uesugi blue).
- **Mesh retention:** All 241 mesh filters on sampled actor have non-null meshes.
- **Mac build:** `Builds/Mac/KawanakajimaSamurai.app` (112 MB), 0 errors.

### Final Assessment

The Kawanakajima Samurai Unity playable proof is **runtime-reviewable** with:
- ✅ Browser runtime proof (Three.js, Foundry GLB, orbit camera, charge/reform/clash)
- ✅ Dependency-free Chromium browser smoke (`browser-smoke-chromium.mjs`)
- ✅ Unity MCP verification (scene, samurai count, mesh retention, build)
- ✅ 21 Unity proof images across v8.3–v8.8
- ✅ 11 browser proof images
- ✅ Mac build (112 MB)
- ✅ GLTFast reflection bootstrap fix
- ✅ PR #167 with all CI checks green
- ❌ Realistic/high-quality visual gate: still failed due low-poly/capsule reads and simplified terrain in current screenshots

**Remaining:** improve the Blender/Foundry samurai and terrain fidelity, then get an approving review from a write-access GitHub reviewer to merge to `main`.
