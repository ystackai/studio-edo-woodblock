# Kawanakajima Samurai Autonomous Validation Requirements

This branch exists to prove the FactoryX Samurai pipeline can produce a coherent deliverable without manual rescue after the local FactoryX, Asset Foundry, Blender MCP, and Unity MCP fixes.

## Goal

Create a playable Kawanakajima Samurai game-world proof:

- 20 warring samurai total.
- 10 Takeda/red and 10 Uesugi/blue.
- The armies meet on a Japanese countryside battlefield.
- High-quality samurai assets must be generated or improved through Blender/Asset Foundry, with source `.blend`, exported GLB/GLTF, contact sheet, and repeatable inspection renders.
- The world must be integrated into Unity and be playable or reviewable in Play Mode/build, not merely documented.
- A browser proof or preview may be used as supporting evidence, but Unity world creation is required.

## Hard Gates

- Do not call capsule/cylinder/block figures production-quality samurai.
- Do not treat file size, mesh count, or a self-written manifest as visual proof.
- Use repeatable visual inspection views for the focal samurai asset: front, side, three-quarter, top, and close hero view.
- Use the Mac Unity MCP endpoint at `http://host.docker.internal:27481/mcp` via standard JSON-RPC MCP calls; do not use legacy `/api/tools/...` routes.
- Verify Asset Foundry/Blender health before relying on generated assets.
- Verify a live browser or Unity runtime, not just static syntax.
- Audio, if present, must be file-backed and user-gesture gated.
- Document provenance and remaining visual caveats honestly.

## Completion Criteria

The deliverable is complete only when all of the following are true:

- The repository contains the generated or improved samurai asset sources and exported runtime assets.
- Unity contains a playable/reviewable scene or runtime bootstrap using the assets.
- The 20-samurai battlefield is visible and inspectable from repeatable camera views.
- Automated verification passes for the browser proof, Unity handoff/runtime, and asset presence.
- The final `WORK_PLAN.md` contains parseable YAML with `done: true` and `tickets: []`.
- The PR or branch status clearly states whether the result is stylized proof quality or truly realistic production quality.

## Validation Rule

This run is not considered a proof of autonomous recovery if a human or Codex operator has to manually edit work-order branches, patch generated assets, patch Unity source, or repair database state after the planner starts. If that happens, fix the root FactoryX bug, verify it, and start a new validation branch.
