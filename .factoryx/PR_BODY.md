## FactoryX Work Order Context

- Work Order: work-order-1781984186486-7-1
- Factory: factory-edo-woodblock
- Project: ystackai/studio-edo-woodblock
- Branch: factoryx/kawanakajima-samurai-unity-autonomous-loop-20260620-v8
- Deliverable: Kawanakajima Samurai Unity playable proof

**Title:** Autonomous Kawanakajima Samurai Unity playable proof v8 source-first Mac MCP

**Goal (verbatim from payload):**
Create the Kawanakajima Samurai Unity playable proof using the foundry samurai assets and the Mac Unity MCP bridge. Treat the worker git branch as the only committable source of truth, and use the Mac Unity editor as a verifier after the branch is pushed and checked out there.

Requirements: 20 warring samurai, 10 Takeda/red and 10 Uesugi/blue, meeting in a Japanese countryside battlefield. Use existing foundry v5 samurai GLB and battlefield pack GLB as primary assets. Preserve materials, scale, provenance, and orientation. Produce a playable Unity world with camera controls, charge/reform/clash interaction, audio hooks, and reviewable build/handoff.

## What This PR Contains

### Browser Proof (`games/kawanakajima-foundry-samurai-proof/`)
- Three.js scene loading Foundry samurai GLBs
- 20 samurai (10 Takeda red, 10 Uesugi blue) with orbit camera
- 6 camera presets: overview, red close, blue close, side profile, top formation, asset inspect
- Charge/reform/clash interaction system
- Audio system (battlefield loop, charge SFX, clash SFX, step SFX)
- Breathing animation, body sway, banner wind flutter
- PCFSoft shadows, ACES Filmic tone mapping, fog, vignette
- v8.8: Fixed browser JS syntax (unclosed forEach in tick() loop)

### Unity Runtime (`unity/kawanakajima-samurai/`)
- `KawanakajimaRuntimeBootstrap.cs` — 758+ lines, builds entire world at Play Mode start
- GLTFast reflection bootstrap — discovers GLTFast types at runtime via System.Reflection
- 20 samurai instantiated from Foundry samurai GLB
- Battlefield pack GLB with terrain, hills, pine trees, field stones, waterfall
- Camera controls (WASD + mouse orbit), charge/reform/clash
- Audio system with loop toggle and SFX playback
- Mac build: `Builds/Mac/KawanakajimaSamurai.app` (112 MB)

### Unity MCP Verification
- MCP server at `http://172.21.0.1:25666` reachable and responding
- Scene probe: `Kawanakajima` scene, 73 root GameObjects, 20 samurai loaded
- Mesh retention: sampled actor has 241/241 non-null meshes, 72,927 vertices
- Mac build via MCP: `BuildMac()` succeeds with 0 console errors

### Documentation
- `VERIFICATION.md` — complete verification log across v8.3–v8.8
- `PREVIEW.md` — how to review browser and Unity proofs
- `DELIVERABLE_STATUS.md` — current status and quality gate results
- `ASSET_MANIFEST.md` — asset inventory with provenance
- `WORKLOG.md` — timeline of all autonomous iterations
- `UNITY_BLOCKER.md` — blocker/escalation notes (none blocking)

### Screenshots (24 total across v8.3–v8.8)
- Unity: wide formation, hero close-up, side, top, red close, blue close, rear view, hero three-quarter, mesh retention proof, build verify, scene view
- Browser: MCP game view, hero 3Q, wide formation

## v8.8 Summary (2026-06-20)
- Fixed browser JS syntax error (unclosed forEach callback in animation tick loop)
- Captured 3 new Unity MCP screenshots: wide formation, hero close-up, scene view
- Updated all documentation (VERIFICATION, PREVIEW, DELIVERABLE_STATUS, WORKLOG)
- All CI checks passing; PR blocked only by branch protection review requirement

## Verification

- **Browser runtime:** JS syntax check passes after v8.8 fix (bracket balance verified)
- **Unity MCP ping:** `pong` (HTTP 200)
- **Unity scene state:** 73 root GOs, 20 samurai (10T/10U), Play Mode
- **Mesh retention:** 241/241 non-null meshes, 72,927 vertices
- **Mac build:** `Builds/Mac/KawanakajimaSamurai.app` (112 MB), 0 errors
- **Quality gate:** All samurai read as detailed characters with readable silhouette, helmet, armor, weapons, faction coloring, proper scale and lighting

## Review Guidance

1. **Browser proof:** Open `games/kawanakajima-foundry-samurai-proof/index.html` — loads Foundry samurai GLBs, orbit camera, charge/reform/clash controls
2. **Unity source:** Open `unity/kawanakajima-samurai/` in Unity Editor — scene builds entire world at Play Mode start
3. **Unity build:** `Builds/Mac/KawanakajimaSamurai.app` (not committed; generated locally)
4. **Screenshots:** 24 review images in `.factoryx/work-orders/.../screenshots/`

## Checklist

- [x] Started from current origin/main
- [x] 20 samurai (10 Takeda red / 10 Uesugi blue) Foundry GLB assets
- [x] Foundry battlefield pack GLB with terrain, hills, trees, stones, waterfall
- [x] Unity scene with runtime bootstrap — builds world at Play Mode start
- [x] GLTFast reflection bootstrap for Unity 6 package compatibility
- [x] Camera controls (orbit + WASD) with 6 presets
- [x] Charge/reform/clash interaction system
- [x] Audio hooks (battlefield loop, charge, clash, step, confirm)
- [x] PCFSoft shadows, ACES Filmic tone mapping, fog, vignette
- [x] Breathing animation, body sway, banner wind flutter
- [x] Unity MCP verification (ping, scene probe, mesh retention, build)
- [x] Mac build artifact (112 MB)
- [x] 24 review screenshots across 6 camera angles
- [x] Browser JS syntax fix (v8.8)
- [x] All documentation updated (VERIFICATION, PREVIEW, DELIVERABLE_STATUS, ASSET_MANIFEST, WORKLOG)
- [x] PR body contains full Work Order context
