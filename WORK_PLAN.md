# Kawanakajima Samurai Autonomous Validation v6 — Plan

## Current State Assessment

- Branch `factoryx/kawanakajima-samurai-autonomous-validation-20260621-v6` is at its seed commit (`6526cab`) with only `FACTORYX_DELIVERABLE_REQUIREMENTS.md` — no implementation work committed.
- **Zero** non-planner work orders are attached to deliverable `kawanakajima-samurai-autonomous-validation-20260621-v6` after its registration timestamp (`1782023865093`).
- All asset, Unity, game-loop, audio, and PR criteria remain **PENDING** for this validation run. Inherited files from prior branches are reference-only.
- Asset Foundry (`http://factoryx-edo-woodblock-asset-foundry:18113`) is healthy; Blender 3.4.1 is available locally.
- No PR exists for this branch.

## Strategy

Per the hard gates: the first ready batch must contain a fresh Blender/foundry visual-gate ticket creating v6 samurai assets. Downstream Unity MCP, gameplay, audio integration, browser polish, and PR work wait on that evidence.

This batch is intentionally small (2 ready tickets + 1 dependent) so we can inspect the Blender output and adjust before committing further work.

## Tickets

```yaml
tickets:
  - id: blender-v6-samurai-fidelity
    title: Generate v6 samurai asset with Blender/foundry and render review views
    goal: >
      Use Blender (locally or via Asset Foundry) to model or improve a realistic samurai character asset
      with armor, cloth, weapon, and material detail. Render repeatable inspection views: front, side,
      rear, three-quarter, and top. Save review images and contact sheets under
      `games/kawanakajima-foundry-samurai-proof/assets/generated/foundry/samurai/improved-20260621-v6/`.
      Visual-gate criteria: upright, standing on feet, human-proportioned, non-capsule-like,
      non-Minecraft-like, non-flat-mask, non-paddle-feet. Save the Blender source (.blend), GLB export,
      and all render views.
    profile: qwen3.6:35b-a3b-coding-mxfp8
    depends_on: []

  - id: visual-gate-v6-review
    title: Visual gate review of v6 samurai renders
    goal: >
      Inspect the v6 contact sheet and individual view renders (front, side, rear, three-quarter, top)
      for realism, correct proportions, upright stance, and material quality. Record pass/fail per view
      and overall verdict in the work-order's VERIFICATION.md. If any view fails, loop back to
      `blender-v6-samurai-fidelity` with specific improvement notes. Only pass when the samurai reads
      as a believable human figure in all views.
    profile: qwen3.6:35b-a3b-coding-mxfp8
    depends_on:
      - blender-v6-samurai-fidelity

  - id: v6-asset-manifest-and-integration-notes
    title: Document v6 assets and plan Unity integration
    goal: >
      Create/update `ASSET_MANIFEST.md` under the work-order context directory describing the v6 samurai
      files, source (Blender/foundry), integration points, payload sizes, and browser/Unity verification
      status. Write `UNITY_BLOCKER.md` if Unity MCP is unavailable, otherwise note integration readiness.
      Do NOT proceed to Unity scene work or build tickets until the visual-gate ticket passes.
    profile: qwen3.6:35b-a3b-coding-mxfp8
    depends_on:
      - visual-gate-v6-review
```

## Blocked / Pending (will plan after v6 evidence)

- **Unity scene integration** — requires passing v6 asset evidence first
- **Playable game loop** — requires Unity integration
- **Audio/music integration** — requires Unity scene
- **Browser polish** — requires game loop
- **PR creation and merge** — requires full pipeline completion
