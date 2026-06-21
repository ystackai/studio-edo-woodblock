# Kawanakajima Samurai Game World — WORK_PLAN.md

**Deliverable:** kawanakajima-samurai-game-world
**Branch:** `factoryx/kawanakajima-samurai-unity-autonomous-loop-20260620-v8`
**PR:** [#167](https://github.com/ystackai/studio-edo-woodblock/pull/167)
**Updated:** 2026-06-21

## Current State

The Kawanakajima Samurai playable proof is **functionally complete** and **visually improved**.

- **Browser proof:** Three.js scene with 20 samurai (10 Takeda red, 10 Uesugi blue), orbit camera, 6 camera presets, charge/reform/clash interaction system, breathing animations, body sway, banner wind flutter, PCFSoft shadows, ACES Filmic tone mapping, fog, vignette. Audio gated behind user gesture (AUDIO button) — no autoplay.
- **Audio assets:** All file-backed WAV files from Foundry (Lavf59.27.100) — battlefield loop (2.6 MB), charge cue (159 KB), clash accent (53 KB), step (22 KB), confirm (11 KB). No oscillator bleeps.
- **Unity runtime:** `KawanakajimaRuntimeBootstrap.cs` (758+ lines) builds world at Play Mode start. GLTFast reflection bootstrap. Mac build (112 MB) with 0 console errors.
- **Samurai GLB:** Swapped to v5 improved export (1.3 MB, down from 2.7 MB). Lamellar armor, kabuto helmet with kuwagata horns, sode shoulder armor, katana with tsuba — all visible in browser smoke screenshot.
- **Browser smoke test:** CAPTURE_READY with 20 actors, nonblank WebGL canvas, no console errors, no failed asset requests.
- **CI checks:** All passing (facts, ci, deploy-preview). deploy-production skipped (expected for non-main).

## Remaining Items

| Area | Status | Notes |
|------|--------|-------|
| Browser proof | ✅ COMPLETE | All interactions, audio, animations working |
| Unity proof | ✅ COMPLETE | v5 GLB integrated, Mac build passes |
| Audio autoplay gate | ✅ COMPLETE | Properly gated behind user gesture |
| Samurai visual fidelity | ✅ IMPROVED | v5 GLB swap in; figures show armor/helmet detail |
| PR merge | ⏳ PENDING | Blocked by branch protection (needs 1 approving review from write-access reviewer) |

## Assessment

The deliverable meets its core requirements:
- ✅ 20 warring samurai (10 Takeda red, 10 Uesugi blue)
- ✅ Foundry samurai GLB with improved v5 fidelity
- ✅ Foundry battlefield pack with terrain, hills, trees, stones, waterfall
- ✅ Unity scene with runtime bootstrap
- ✅ Camera controls (orbit + WASD) with 6 presets
- ✅ Charge/reform/clash interaction system
- ✅ Audio system with proper autoplay gating
- ✅ Browser proof with smoke test passing
- ✅ Mac build (112 MB, 0 errors)
- ✅ All CI checks green

The only remaining blocker is GitHub branch protection, which requires a write-access reviewer to approve the PR. This cannot be resolved autonomously.

```yaml
done: true
tickets: []
```

## What's Already Done (from previous passes)

- Browser proof with Three.js, orbit camera, 6 presets, charge/reform/clash mechanics
- File-backed audio with Foundry WAV files (no oscillator bleeps)
- PCFSoft shadows, ACES Filmic tone mapping, fog, vignette
- Breathing animation, body sway, banner wind flutter
- Unity scene with runtime bootstrap — builds world at Play Mode start
- GLTFast reflection bootstrap for Unity 6 package compatibility
- samurai_character.glb swapped from capsule v4 (2.7 MB) to v5 improved export (1.3 MB)
- Mac build (112 MB) with 0 errors
- Unity MCP verification: scene loaded, 20 samurai present, 241 non-null meshes
- All documentation: VERIFICATION.md, PREVIEW.md, DELIVERABLE_STATUS.md, ASSET_MANIFEST.md, WORKLOG.md
- Browser smoke test harness (dependency-free Chromium/CDP)
- PR #167 with full Work Order context in body
