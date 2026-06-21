# Kawanakajima Samurai Autonomous Validation v8 — Working Plan

**Deliverable:** `kawanakajima-samurai-autonomous-validation-20260621-v8`
**Branch:** `factoryx/kawanakajima-samurai-autonomous-validation-20260621-v8`
**Created:** 2026-06-21
**Runtime:** `qwen3.6:35b-a3b-coding-mxfp8`

## State Assessment

This is a **fresh validation branch** — the `factoryx/kawanakajima-samurai-autonomous-validation-20260621-v8` branch was seeded with only the requirements document (`FACTORYX_DELIVERABLE_REQUIREMENTS.md`). No non-planner work orders are attached to this deliverable, and no implementation has occurred on this branch.

**Previous validations (v3–v7) all failed for distinct reasons:**

- v3: Sideways/prone/capsule-like samurai silhouettes
- v4: Inherited old files from `main` treated as proof
- v5: Counted inherited assets as done without fresh visual gate
- v6: Blender 3.4 compatibility failures requiring human intervention
- v7: Toy-like, procedural assets with self-approved visual gate

**Current infrastructure status:**

- Asset Foundry: healthy (`/healthz` returns 200)
- Unity MCP listener: available at `http://host.docker.internal:27481/mcp`
- Blender 3.4.1 available on the Mac host
- 2026-06-21 image includes `blender-mcp`, foundry access, and Unity MCP

**Baseline:** All inherited files from `main` and prior branches are reference-only. No assets, builds, or game code from previous versions count as v8 completion evidence.

## Strategy

The v8 requirements mandate a strict staged gate sequence before any downstream work:

1. **Fresh pilot asset generation** — produce a small, high-quality set of new samurai models via Asset Foundry + Blender with realistic anatomy
2. **Independent pilot visual gate** — a separate ticket inspects the pilot renders and decides pass/fail before scale-up
3. **Fresh expansion asset generation** — expand the accepted pilot approach to 20 materially distinct samurai models
4. **Independent final visual gate** — inspect the complete 20-samurai render set before downstream Unity/game/audio work

Only after the final 20-samurai visual gate passes do we proceed to Unity integration, gameplay, audio, and PR.

## Intervention Note

The original `kawanakajima-v8-asset-gen` ticket attempted to generate all 20 characters in one pass. On the local Mac worker it reached the large Blender-script-writing step and then hit a Codex tool-call formatting error before producing any v8 files. That ticket is superseded by the staged tickets below; do not reuse its output as completion evidence.

## Ready Tickets (Batch 1)

These are the only tickets ready now. All downstream work waits for their completion.

```yaml
tickets:
    - id: kawanakajima-v8-asset-pilot-4
      title: Generate v8 pilot samurai assets via Foundry + Blender
      goal: Produce exactly 4 materially distinct pilot samurai GLB models (2 Takeda / 2 Uesugi) with realistic upright human silhouettes — proper head/neck/shoulder/hand/foot structure, armor detail, cloth, and weapons. Keep the Blender generation script compact and reviewable; if it needs to be large, write it incrementally with normal file edits rather than a single huge shell/tool payload. Use Blender 3.4-compatible APIs (`ShaderNodeBsdfPrincipled`, `poly.use_smooth`, `bpy.context.view_layer.update()`, `mathutils`). Render repeatable review views (front, side, rear, three-quarter, top) and save source, GLB, manifest, individual views, and contact sheets under `games/kawanakajima-foundry-samurai-proof/assets/generated/foundry/samurai-v8/pilot-4/`. Do NOT approve the visual gate or claim production readiness.
      profile: qwen3.6:35b-a3b-coding-mxfp8
      depends_on: []

    - id: kawanakajima-v8-pilot-visual-gate
      title: Independent visual gate — inspect v8 pilot samurai renders
      goal: Review the contact sheets and render images produced by `kawanakajima-v8-asset-pilot-4`. Check for upright human-readable silhouettes, no detached/floating feet, no separated body parts, no capsule/cylinder/cube anatomy, no toy/puppet proportions, no paddle feet, readable heads/necks/hands/feet, and four materially distinct designs. Record a pass/fail verdict with observed flaws. If visual gate fails, report blockers for the pilot asset ticket to fix.
      profile: qwen3.6:35b-a3b-coding-mxfp8
      depends_on:
        - kawanakajima-v8-asset-pilot-4

    - id: kawanakajima-v8-asset-expand-20
      title: Expand accepted v8 samurai assets to 20 variants
      goal: Using only the accepted pilot approach from `kawanakajima-v8-pilot-visual-gate`, produce the full 20 materially distinct samurai GLB set (10 Takeda / 10 Uesugi). Each character must vary in at least armor silhouette, helmet/crest, weapon or pose, banner/mon details, proportions, and faction-specific materials; cloning one model per side with transforms is not enough. Render repeatable review views (front, side, rear, three-quarter, top), a full contact sheet, and a manifest under `games/kawanakajima-foundry-samurai-proof/assets/generated/foundry/samurai-v8/full-20/`. Do NOT approve the final visual gate or claim production readiness.
      profile: qwen3.6:35b-a3b-coding-mxfp8
      depends_on:
        - kawanakajima-v8-pilot-visual-gate

    - id: kawanakajima-v8-final-visual-gate
      title: Independent visual gate — inspect full v8 20-samurai set
      goal: Review the complete 20-samurai contact sheet, individual render views, GLB/source manifest, and variant manifest produced by `kawanakajima-v8-asset-expand-20`. Check for upright human-readable silhouettes, no detached/floating feet, no separated body parts, no capsule/cylinder/cube anatomy, no toy/puppet proportions, no paddle feet, readable heads/necks/hands/feet, and at least 10 materially distinct variants per side. Record pass/fail with exact visible flaws and do not approve downstream Unity work unless the evidence passes.
      profile: qwen3.6:35b-a3b-coding-mxfp8
      depends_on:
        - kawanakajima-v8-asset-expand-20
```

## Pending Tickets (not yet ready)

| Ticket | Title | Blocks |
|--------|-------|--------|
| `kawanakajima-v8-unity-integration` | Integrate accepted v8 assets into Unity playable scene | Full v8 visual gate, Unity MCP, scene, build |
| `kawanakajima-v8-gameplay-loop` | Build small playable game loop in Unity | Unity integration complete |
| `kawanakajima-v8-audio` | Integrate audio/music into Unity scene | Unity integration complete |
| `kawanakajima-v8-browser-review` | Build browser review surface showing v8 evidence | All upstream tickets |
| `kawanakajima-v8-pr-merge` | Open/update PR with v8 evidence, merge to main | All upstream tickets |

## Notes

- If the visual gate reports failures (detached feet, blocky anatomy, insufficient variant diversity, etc.), the asset-gen ticket should be re-opened to address those specific issues.
- The Unity MCP listener at `http://host.docker.internal:27481/mcp` must be verified reachable before the Unity integration ticket begins.
- Audio assets from prior runs may inform v8 but must not be counted as v8 evidence without fresh generation or explicit reuse justification in the manifest.
