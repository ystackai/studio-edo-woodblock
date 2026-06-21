# WORK_PLAN — Kawanakajima Samurai Autonomous Validation v5

**Deliverable:** kawanakajima-samurai-autonomous-validation-20260621-v5
**Branch:** `factoryx/kawanakajima-samurai-autonomous-validation-20260621-v5`
**Date:** 2026-06-21
**Planner:** v5 assessment pass

## Current State Assessment

### What Exists (on v5 branch)

- **Requirements only:** `FACTORYX_DELIVERABLE_REQUIREMENTS.md` — the sole commit on this branch is `29ea102 Seed autonomous samurai validation v5`
- **No implementation artifacts** have been committed to this branch yet

### What Exists on `main` (reference material for v5)

- **Samurai character GLB:** 1.23 MB, stylized samurai with kabuto, mempo, lamellar armor, tabi, katana (v3-v5 iterations preserved)
- **20-samurai battlefield pack GLB:** 6.55 MB, 10 Takeda + 10 Uesugi on countryside terrain
- **Audio:** WAV files from Foundry — battlefield loop, charge cue, clash accent, formation step, UI confirm
- **Browser proof:** Three.js game with 20 actors, orbit camera, charge/reform mechanics, review panel, 6 camera presets
- **Unity handoff:** `unity/kawanakajima-samurai/` with StreamingAssets, Resources, runtime bootstrap, editor build hooks
- **Screenshots:** 6 review PNGs (overview, redClose, blueClose, sideProfile, topFormation, assetInspect)
- **Verification:** VERIFICATION.json, ASSET_MANIFEST.md, verify.js

These are **not v5 proof** — they are reference material per the v5 requirements.

### Previous Iterations

- **v3:** Samurai character was sideways/prone, read as primitive capsule geometry. Required manual operator intervention.
- **v4:** Inherited assets from `main` and treated them as near-complete proof. Only spawned PR/context housekeeping tickets instead of fresh validation. deploy-preview CI check fails on PR #176 (no `build` script in `package.json`).

### Infrastructure Status

| Service | Status | Notes |
|---------|--------|-------|
| Asset Foundry (`:18113`) | **Healthy** | Blender configured, ready |
| Blender 3.4.1 | **Available** | `/usr/bin/blender`, `blender-mcp` MCP server |
| Unity MCP listener | **Not available** | Unity Editor not running; MCP CLI reports connection refused. Unity work is blocked. |
| PR #176 (v4 branch) | **Open, deploy-preview FAILING** | `npm run build` fails (no build script in `package.json`) |

## What's Missing for v5 Completion

1. **Fresh samurai assets (v5)** — Blender/Foundry must produce new samurai GLB(s) with upright Z-up contact sheets proving proper anatomy.
2. **Playable browser game slice** — A self-contained `index.html` (or small project) that loads the v5 samurai assets and demonstrates the core verb within 30 seconds.
3. **Audio assets** — File-backed WAVs for the browser game (can be from Foundry if available, or documented as missing).
4. **Unity blocker documented** — Since no Unity Editor/listener is available, this must be explicitly documented rather than claimed.
5. **PR to `main`** — With all verification evidence, preview path, and accurate PR body.
6. **Deploy-preview CI fix** — The `package.json` is missing a `build` script causing the CI check to fail.

## Remaining Work

The v5 branch needs a full implementation cycle: fresh samurai assets via Blender/Foundry, a playable browser game slice, audio integration, Unity blocker documentation, deploy-preview CI fix, and PR creation.

## Tickets

```yaml
done: false
tickets:
  - id: samurai-assets-v5-blender-visual-gate
    title: Generate v5 samurai assets via Blender/Foundry with visual gate
    goal: >
      Use the Asset Foundry and Blender MCP to generate fresh samurai character GLB(s):
      - 10 Takeda (red faction) and 10 Uesugi (blue faction) variants
      - Z-up orientation, proper Z-up contact sheets with named cameras (front, side, rear, three-quarter, top)
      - Stylized but believable armored humans: kabuto helmet, mempo faceplate, lamellar armor, tabi, geta, katana
      - Reject: capsule bodies, disk faces, paddle feet, slab-like armor
      - Save Blender source (.blend), GLB export, contact sheet PNGs
      - If Foundry/Blender fails, document blocker in ASSET_MANIFEST.md
    profile: qwen3.6:35b-a3b-coding-mxfp8
    depends_on: []

  - id: playable-browser-game-slice
    title: Build playable browser game slice with v5 samurai assets
    goal: >
      Create a self-contained `index.html` (under `games/kawanakajima-v5/` or similar) that:
      - Loads the v5 samurai GLB(s) via Three.js/GLTFLoader
      - Demonstrates the core verb (charge/reform/inspect) within 30 seconds
      - Has orbit camera, keyboard shortcuts, touch targets >= 44px
      - Plays audio cues after user gesture (audio toggle, charge, clash)
      - Includes in-game review panel with contact sheet
      - Passes `pageerror` and `console.error` checks (no uncaught JS errors)
      - Total payload lightweight (assets compressed, no external network dependencies)
    profile: qwen3.6:35b-a3b-coding-mxfp8
    depends_on:
      - samurai-assets-v5-blender-visual-gate

  - id: unity-blocker-documentation
    title: Document Unity blocker and prepare source handoff
    goal: >
      Since Unity MCP listener is not available:
      - Create/update `unity/kawanakajima-samurai/UNITY_BLOCKER.md` documenting:
        * No Unity Editor installed on worker
        * Unity MCP listener not running
        * Asset handoff is complete (StreamingAssets, Resources, scripts)
      - Ensure `ASSET_MANIFEST.md` notes the Unity blocker
      - Do NOT claim Unity playable build — document as blocked
    profile: qwen3.6:35b-a3b-coding-mxfp8
    depends_on: []

  - id: deploy-preview-ci-fix-and-pr
    title: Fix deploy-preview CI and open PR to main
    goal: >
      - Add a no-op `build` script to `package.json` to fix the deploy-preview CI failure
      - Create PR from `factoryx/kawanakajima-samurai-autonomous-validation-20260621-v5` to `main`
      - PR body includes: FactoryX Work Order Context section with full prompt, preview path, verification summary
      - All CI checks (facts, ci, deploy-preview) pass
    profile: qwen3.6:35b-a3b-coding-mxfp8
    depends_on:
      - samurai-assets-v5-blender-visual-gate
      - playable-browser-game-slice
      - unity-blocker-documentation
```

## Completion Criteria

This deliverable will be considered complete when:
- [ ] Fresh v5 samurai GLB(s) with proper Z-up contact sheets committed
- [ ] Playable browser game slice with 20 samurai (10 Takeda + 10 Uesugi)
- [ ] Audio assets integrated (WAV files from Foundry or documented as missing)
- [ ] Unity blocker documented (no Unity build claimed)
- [ ] Deploy-preview CI check passes
- [ ] PR to `main` open with accurate body and all checks green
- [ ] Non-planner Work Orders attached to deliverable with fresh v5 evidence
