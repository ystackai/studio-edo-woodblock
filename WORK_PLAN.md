# WORK_PLAN — Kawanakajima Samurai Autonomous Validation v4

**Deliverable:** kawanakajima-samurai-autonomous-validation-20260621-v4
**Branch:** `factoryx/kawanakajima-samurai-autonomous-validation-20260621-v4`
**Date:** 2026-06-21
**Planner:** v4 assessment pass

## Current State Assessment

### What Exists (on this branch)

- **Samurai character asset:** `games/kawanakajima-foundry-samurai-proof/assets/samurai_character.glb` (1.23 MB) — stylized samurai with kabuto, mempo, lamellar armor, tabi, katana. Visual quality is acceptable: properly proportioned, upright Z-up, clean silhouette.
- **20-samurai battlefield pack:** Foundry GLB (6.55 MB) with 10 Takeda + 10 Uesugi warriors on countryside terrain with road, river, hills, banners, weapons.
- **Audio:** File-backed WAVs from Foundry — battlefield loop, charge cue, clash accent, formation step, UI confirm.
- **Browser proof:** Three.js game with 20 actors, orbit camera, charge/reform mechanics, click-to-inspect, 6 camera presets, review panel with contact sheet.
- **Unity handoff:** `unity/kawanakajima-samurai/` with StreamingAssets (GLB + manifest), Resources (WAVs), runtime bootstrap, editor build hooks, Kawanakajima.unity scene.
- **Unity Mac build:** Verified on local Mac Studio — `Builds/Mac/KawanakajimaSamurai.app` (112 MB), Unity 2023.2.20f1 batchmode build.
- **Verification evidence:** VERIFICATION.json, ASSET_MANIFEST.md, 6 review screenshots, verify.js, browser-smoke-chromium.mjs.

### What Is Missing / Blocked

1. **No PR for v4 branch** — PR #167 exists for v3, but v4 is a separate validation run that needs its own PR to main.
2. **Unity build artifact not committed** — `Builds/` is in `.gitignore`, so the Mac build (112 MB .app) cannot be committed. This must be documented as a known limitation with build verification logged.
3. **Visual fidelity notes** — Automated review (PR #167) flagged samurai as "low-poly/capsule" but manual inspection shows the asset is acceptable as stylized. No fidelity pass needed.

### Relationship to v3

v4 is a fresh validation branch forked from v3's seed commit. It inherits the same implementation artifacts (samurai GLB, battlefield pack, audio, Three.js game, Unity handoff). The key differences are updated v4 requirements and work order context. The implementation itself is identical; v4's purpose is to re-prove autonomous recovery after v3 required manual intervention.

## Remaining Work

The core implementation is complete. The remaining work is:

1. Create PR for v4 branch to main, documenting the Unity build as Mac-verified (not committed).
2. Update work order context files with v4-specific status.
3. (Optional, non-blocking) Ifsamurai fidelity needs improvement for production use, schedule a Blender fidelity pass as a follow-up ticket.

## Tickets

```yaml
done: false
tickets:
  - id: create-v4-pr
    title: Create PR for v4 branch and push to origin
    goal: >
      Open a PR from `factoryx/kawanakajima-samurai-autonomous-validation-20260621-v4` to `main`.
      PR body must include:
      - FactoryX Work Order context section
      - Summary of deliverables (samurai GLB, battlefield pack, audio, browser proof, Unity handoff)
      - Note that Unity Mac build is verified but not committed (.gitignore excludes Builds/)
      - Preview path: `games/kawanakajima-foundry-samurai-proof/`
      - Verification summary
    profile: qwen3.6:35b-a3b-coding-mxfp8
    depends_on: []

  - id: update-work-order-context
    title: Update v4 work order context files
    goal: >
      Update the four context files in `.factoryx/work-orders/work-order-1782022103920-7-9/`:
      - WORKLOG.md: summary of v4 progress
      - PREVIEW.md: preview path and access notes
      - VERIFICATION.md: verification results (browser smoke test, asset checks, Unity Mac build)
      - FEEDBACK.md: review feedback summary
    profile: qwen3.6:35b-a3b-coding-mxfp8
    depends_on:
      - create-v4-pr
```

## Completion Criteria

This deliverable will be considered complete when:
- [ ] PR for v4 is open with accurate body describing the deliverable
- [ ] All CI checks pass on the PR
- [ ] Unity Mac build verified (documented as Mac-only, not committed)
- [ ] Samuria asset visually reviewable and acceptable
- [ ] Browser game proof plays correctly with no runtime errors
- [ ] Work order context files updated with v4 status
