# WORK_PLAN — Kawanakajima Samurai Game World

**Last updated:** 2026-06-21
**Base branch:** `factoryx/kawanakajima-samurai-unity-autonomous-loop-20260620-v8`
**Work Order branch:** `factoryx/factory-edo-woodblock/work-order-1782000538419-7-1`

## Current State Assessment

| Area | Status | Notes |
|------|--------|-------|
| Browser game (Three.js) | ✅ Playable | 20 samurai, charge/reform/clash, orbit camera, 6 presets, audio loop+SFX, click-to-inspect |
| Foundry assets | ✅ Integrated | Samurai v5 GLB (1.3 MB), battlefield pack v3 GLB (6.6 MB), audio WAVs (2.6 MB loop + 3 SFX) |
| Unity source handoff | ✅ Present | Bootstrap script, build hooks, scene file in `unity/kawanakajima-samurai/` |
| Unity build | ✅ Mac-verified | 112 MB .app built on Mac; not committed to git |
| Visual quality gate | ❌ BLOCKED | Samurai read as low-poly/capsule in wide formation; terrain is blocky/simplified |
| Asset Foundry | ✅ Available | Blender provider configured at `http://factoryx-edo-woodblock-asset-foundry:18113` |
| Unity MCP from worker | ❌ Unreachable | Returns "Not Acceptable" — needs proper SSE headers; Mac-local MCP is the route |

## Verdict

**Deliverable is NOT complete.** The browser game is a coherent, playable proof-of-concept with all core systems wired. However, the visual fidelity gate — the primary quality blocker identified since v8 — remains unresolved. The samurai characters read as stylized low-poly figures rather than believable samurai in battle. This is the #1 priority.

## Plan

```yaml
tickets:
  - id: ticket-1-blender-fidelity-samurai
    title: Blender fidelity pass on samurai character
    goal: >
      Improve samurai visual quality from "stylized low-poly/capsule" toward believable warrior silhouette.
      Add anatomically plausible torso (not sphere), distinct kabuto helmet with realistic kuwagata crest,
      proper mempo faceplate with facial features, layered lamellar armor plates (not flat boxes),
      articulated limbs with shoulder/arm structure, and recognizable hand/foot detail.
      Use the Asset Foundry Blender provider (or local Blender 3.4.1) to regenerate the samurai GLB.
      Preserve the existing palette (red Takeda, blue Uesugi). Output: new samurai_character.glb + contact sheet.
    profile: qwen3.6:35b-a3b-coding-mxfp8
    depends_on: []

  - id: ticket-2-blender-fidelity-battlefield
    title: Blender fidelity pass on battlefield terrain
    goal: >
      Replace blocky terrain, flat hills, and generic props with more convincing Japanese countryside.
      Improve river/road materials, add varied cedar/pine trees, add rice paddy textures, increase ground detail.
      Regenerate the battlefield pack GLB through Asset Foundry Blender with explicit terrain detail.
      Output: new samurai_battlefield_pack.glb + contact sheet.
    profile: qwen3.6:35b-a3b-coding-mxfp8
    depends_on: [ticket-1-blender-fidelity-samurai]

  - id: ticket-3-unity-webgl-build
    title: Unity WebGL build from foundry assets
    goal: >
      Build a Unity WebGL build of the Kawanakajima scene using the improved Foundry assets.
      Copy new GLB/WAV assets to StreamingAssets, run BuildWebGL() from KawanakajimaUnityBuild.cs on Mac.
      Output: WebGL build artifacts; verify the browser game loads them.
    profile: qwen3.6:35b-a3b-coding-mxfp8
    depends_on: [ticket-1-blender-fidelity-samurai, ticket-2-blender-fidelity-battlefield]

  - id: ticket-4-open-pr-and-polish
    title: Open PR and polish browser proof
    goal: >
      Push the Work Order branch to remote, open PR to main with full work order context in body.
      Polish browser game: verify touch targets >= 44px, 60fps profiling, additional visual polish.
      Output: Open PR with live preview and accurate PR body.
    profile: qwen3.6:35b-a3b-coding-mxfp8
    depends_on: [ticket-3-unity-webgl-build]
```

## Blockers
1. Unity MCP from worker is unreachable — requires proper SSE headers. Unity build must happen on Mac.
2. Visual quality gate is the primary blocker preventing deliverable completion.

## Notes
- All Foundry assets have documented provenance in `ASSET_MANIFEST.md`.
- The browser game is already a coherent 30+ second playable experience.
- The visual fidelity pass (Ticket 1) should be the first concrete implementation step.
