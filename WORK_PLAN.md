# Kawanakajima Samurai Game World — WORK_PLAN.md

**Deliverable:** kawanakajima-samurai-game-world
**Branch:** `factoryx/kawanakajima-samurai-unity-autonomous-loop-20260620-v8`
**PR:** [#167](https://github.com/ystackai/studio-edo-woodblock/pull/167)
**Updated:** 2026-06-21

## Current State

The Kawanakajima Samurai playable proof is **runtime-complete**: browser smoke, Unity MCP scene inspection, and Mac build all pass. The Unity scene loads 20 samurai (10 Takeda red, 10 Uesugi blue) with orbit camera, charge/reform/clash mechanics, and audio.

**The blocking issue is visual fidelity.** The Unity `StreamingAssets/samurai_character.glb` (2.7 MB) is the original Blender export — capsule-bodied, low-poly samurai with minimal armor detail. An improved v5 export exists (`improved-20260620-v5/samurai_character_v5.glb`, 1.3 MB) with lamellar armor, proper kabuto helmet with kuwagata horns, detailed sode shoulder armor, and a katana with tsuba. The v5 contact sheet shows a dramatically more believable figure.

**Unity MCP is live** (gamedev-mcp-server 8.0.0.0, 38 tools) and accessible via `http://host.docker.internal:27481/mcp`. The Asset Foundry is also healthy (`/healthz` returns 200) with Blender 3.4.1 configured.

**PR #167** is open, mergeable, with 13 commits and all CI checks green. It needs an approving review from a write-access reviewer and the visual quality bump before merging.

## Plan

The remaining work focuses on one big visual improvement (swap samurai GLB to v5 + verify) and one small browser polish (audio autoplay gate). Both are independent.

## Next Steps

```yaml
tickets:
  - id: swap-samurai-glb-to-v5
    title: Replace samurai GLB in Unity with v5 improved export
    goal: >
      Copy `games/kawanakajima-foundry-samurai-proof/assets/generated/foundry/samurai/improved-20260620-v5/samurai_character_v5.glb`
      into `unity/kawanakajima-samurai/Assets/StreamingAssets/Kawanakajima/samurai_character.glb`
      (replace in-place). Then use Unity MCP to: (a) verify the scene still loads,
      (b) take `screenshot-camera` shots of the new samurai from front/3Q/side/close,
      and (c) capture a wide formation screenshot. Compare against the old capsule figures
      and confirm the v5 lamellar armor, helmet, and katana are visually present.
      If the replacement breaks loading, restore the old GLB and document why.
    profile: qwen3.6:35b-a3b-coding-mxfp8
    depends_on: []

  - id: browser-audio-autoplay-gate
    title: Fix browser audio autoplay gate for Playtest
    goal: >
      The browser game has file-backed audio (battlefield loop, charge, clash, step, confirm)
      but may autoplay or fail to start audio after user gesture per the Game Feel Checklist.
      Ensure audio only plays after explicit user interaction (click/tap), and the play button
      properly initializes the audio context. Verify in the browser preview that audio works
      after user gesture and there are no console errors.
    profile: qwen3.6:35b-a3b-coding-mxfp8
    depends_on: []

  - id: update-pr-167-with-new-evidence
    title: Update PR #167 body with v5 visual evidence and new status
    goal: >
      Once the samurai GLB swap is verified, update DELIVERABLE_STATUS.md, PREVIEW.md,
      and VERIFICATION.md with the new screenshots and visual assessment. Then update
      PR #167 body to reflect the new scope (samurai visual upgrade) and re-request
      review. This includes a "Foundry v5 samurai provenance" section in the PR body.
    profile: qwen3.6:35b-a3b-coding-mxfp8
    depends_on:
      - swap-samurai-glb-to-v5
```

## What's Already Done (from previous passes)

- Browser proof with Three.js, orbit camera, 6 presets, charge/reform/clash mechanics
- File-backed audio with SFX and battle loop
- PCFSoft shadows, ACES Filmic tone mapping, fog, vignette
- Breathing animation, body sway, banner wind flutter
- Unity scene with 20 samurai, GLTFast reflection bootstrap
- Mac build (112 MB) with 0 errors
- Unity MCP verification: scene loaded, 73 root objects, 241 non-null meshes
- PR #167 with all CI checks green

## What Still Needs Work

| Area | Status | Notes |
|------|--------|-------|
| Browser smoke test | ✅ PASS | Captures `CAPTURE_READY:overview`, 20 actors, nonblank WebGL |
| Unity MCP scene | ✅ PASS | Scene loaded, 20 samurai present |
| Mac build | ✅ PASS | 112 MB, 0 errors |
| Samurai visual fidelity | ❌ BLOCKER | Capsule figures; v5 GLB ready but not in Unity |
| Terrain/battlefield polish | ⚠️ IDEAL | Simplified hills/trees; could use texture work or ukiyo-e ground shader |
| Browser audio autoplay | ⚠️ CHECK | Need to verify no autoplay and gesture-gated init |
| PR review | ⏳ PENDING | Needs write-access approval |
| Visual gate | ❌ FAIL | Wide formation reads stylized; needs v5 swap + rescreenshot |
