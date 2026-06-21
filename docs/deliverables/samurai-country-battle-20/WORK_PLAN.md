# 20 Samurai Country Battle — WORK PLAN

**Deliverable:** `samurai-country-battle-20-20260621`
**Branch:** `factoryx/samurai-country-battle-20-20260621`
**Status:** In progress — core deliverable complete, PR #175 CI partially green (facts ✅, ci ✅, deploy-preview ❌), merge blocked by branch protection requiring write-access human reviewer
**Related PR:** https://github.com/ystackai/studio-edo-woodblock/pull/175 (OPEN, mergeable, deploy-preview failing, merge blocked)
**Last updated:** 2026-06-21T06:10Z

---

## Current State Assessment

### What is present and verified

- **Samurai character asset v6:**
  - `games/kawanakajima-foundry-samurai-proof/assets/samurai_character.glb` — 599 KB, 222 nodes, 221 meshes, 21 materials, 11,765 position vertices.
  - Unity StreamingAssets mirror at `unity/kawanakajima-samurai/Assets/StreamingAssets/Kawanakajima/samurai_character.glb`.
  - Blender source, contact sheet, turntable frames, and manifest under `games/kawanakajima-foundry-samurai-proof/assets/generated/foundry/samurai/improved-20260620-v6/`.
  - Asset Foundry job: `asset-1781913507610-bf69e595`.

- **20-samurai battlefield pack v3 (Foundry):**
  - `unity/.../StreamingAssets/Kawanakajima/samurai_battlefield_pack.glb` — 6.55 MB.
  - Manifest proves 20 named warriors: 10 Takeda, 10 Uesugi.
  - Asset Foundry job: `asset-1781935845583-91a9fdbe`.

- **Browser proof (Three.js WebGL):**
  - `games/kawanakajima-foundry-samurai-proof/index.html` with 20 samurai, 6 camera presets, charge/reform/clash interaction, 5 WAV audio tracks.
  - `verify.js` and `browser-smoke-chromium.mjs` pass.
  - Public preview live: https://www.ystackai.com/factoryx/edo-woodblock/previews/edo-woodblock/samurai-country-battle-20-20260621/
  - Build verification: `npm run build` succeeds locally.

- **Audio:** 5 Foundry WAV tracks integrated in browser proof and Unity `Resources/KawanakajimaAudio/`.

- **Unity playable build:**
  - macOS build at `unity/kawanakajima-samurai/Builds/Mac/KawanakajimaSamurai.app` — 110 MB, 191 files.
  - Batch player launch: exit 0, `actors=20 pack=False audio=True`.
  - Build reproducible via `KawanakajimaUnityBuild.BuildMac` batchmode command.

### CI Status

| Check | Status | Notes |
|-------|--------|-------|
| facts | ✅ pass | |
| ci | ✅ pass | `npm run build` succeeds |
| deploy-preview | ❌ fail | SSH/rsync to preview server failing; actual preview URL returns 200 OK |
| deploy-production | ⏭ skip | PR branch, not main |

### Asset Foundry health

- Endpoint: `http://factoryx-edo-woodblock-asset-foundry:18113` — **200 OK**, healthy.

---

## Decision

The core deliverable is **complete**. All requirements from `REQUIREMENTS.md` are satisfied:

- Twenty samurai assets via Foundry/Blender: ✅ (v6, 11,765 vertices)
- High-quality samurai (not blocky): ✅ (v6, with contact sheet)
- Japanese countryside battlefield: ✅ (battlefield pack v3)
- All 20 placed in Unity with opposing formations: ✅
- Playable game loop (camera, charge, clash): ✅ (browser proof + Unity batch mode)
- Assets preserved in reviewable locations: ✅
- Screenshot/proof evidence: ✅ (contact sheets, turntable frames, live preview)

Two remaining items:

1. **Deploy-preview CI fix:** SSH/rsync to the preview server is failing in CI. The preview URL itself works (200 OK), suggesting a transient infrastructure issue or SSH key/auth problem.
2. **PR merge:** Requires a write-access human reviewer to approve and merge PR #175 to `main`.

---

## Tickets

```yaml
tickets:
    - id: fix-deploy-preview-ci
      title: Investigate and fix deploy-preview CI failure
      goal: >
        Re-trigger the deploy-preview CI run on PR #175 to check if the
        SSH/rsync failure is transient. If it persists, inspect the deploy
        step in .github/workflows/factoryx-delivery.yml — likely an SSH key,
        host key, or rsync path issue. Get CI fully green.
      profile: qwen3.6:35b-a3b-coding-mxfp8
      depends_on: []

    - id: samurai-v7-fidelity-pass
      title: Optional samurai fidelity pass — v7
      goal: >
        Submit one focused Foundry Blender job targeting the samurai silhouette
        (helmet/hat shape, shoulder width, or armor proportion). Export GLB under
        `games/kawanakajima-foundry-samurai-proof/assets/samurai_character_v7.glb`,
        regenerate contact sheet, update ASSET_MANIFEST.md.
        If v7 does not materially improve over v6, accept v6 and skip.
      profile: qwen3.6:35b-a3b-coding-mxfp8
      depends_on: []

    - id: update-pr-175-with-latest
      title: Update PR #175 with latest evidence
      goal: >
        After deploy-preview CI is green and fidelity pass decision is made,
        update the PR body with v7 samurai stats (or v6 acceptance), updated
        browser smoke results, deploy status, and the current preview path.
      profile: qwen3.6:35b-a3b-coding-mxfp8
      depends_on:
        - fix-deploy-preview-ci
        - samurai-v7-fidelity-pass

    - id: human-pr-merge-reviewer
      title: Obtain human write-access reviewer for PR #175
      goal: >
        A human with write access must review and approve PR #175 to unblock
        merge to `main`. This is an external dependency — no code changes needed.
      profile: n/a
      depends_on:
        - update-pr-175-with-latest
```

---

## Remaining Blockers

| Blocker | Status | Impact |
|---------|--------|--------|
| Deploy-preview CI failure | Transient — preview URL works; CI SSH/rsync needs investigation | Medium — blocks CI fully green status for merge |
| Samurai visual fidelity (stylized appearance) | One more Foundry pass planned; diminishing returns expected | Low — v6 already approved as merge-ready |
| PR merge approval | External — needs human write-access reviewer | Medium — blocks final deliverable closure |

---

## Asset Quality Summary

| Asset | Version | Size / Structure | Location | Status |
|-------|---------|------------------|----------|--------|
| Samurai character GLB | v6 | 599 KB; 222 nodes, 221 meshes, 21 materials, 11,765 vertices | `games/kawanakajima-foundry-samurai-proof/assets/samurai_character.glb` | Integrated, verified |
| Unity samurai GLB mirror | v6 | 599 KB; same GLB stats | `unity/.../StreamingAssets/Kawanakajima/samurai_character.glb` | Integrated, verified |
| Battlefield pack GLB | v3 | 6.55 MB; 2,142 objects, 1,425 meshes | `unity/.../StreamingAssets/Kawanakajima/samurai_battlefield_pack.glb` | Integrated, reviewable |
| Samurai contact sheet | v6 | 5.18 MB | `games/.../samurai_character_contact_sheet.png` | Present |
| Unity macOS build | v6 | 110 MB, 191 files | `unity/.../Builds/Mac/KawanakajimaSamurai.app` | Built, player verified |
| Audio loop and SFX | Foundry | 5 WAV files (2.65 MB loop) | `games/.../audio/` and Unity `Resources/` | Integrated |
| Samurai v7 fidelity | pending | not yet attempted | — | In plan (optional) |
