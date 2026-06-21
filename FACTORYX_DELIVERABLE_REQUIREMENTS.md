# Kawanakajima Samurai Autonomous Validation v15

## Prompt

/goal Create the most realistic playable Kawanakajima samurai game-world proof you can using Asset Foundry, Blender, Blender MCP, Unity, Unity MCP, and FactoryX autonomous work orders. Use vision or rendered evidence to make the system self-verifiable, then enter a loop until the deliverable is meaningfully better than the rejected baselines. Build repeatable camera systems to inspect every samurai and the playable world from the required angles. After each significant change, render those same views, identify what looks least realistic, improve it, and inspect again. Preserve the best version as you iterate, and stop only when the v15 evidence shows no visible issue worth fixing for this validation scope.

## Goal

Use FactoryX on the Mac-local Edo stack to autonomously produce a coherent samurai game deliverable:

- 20 warring samurai in total.
- 10 Takeda/red-side samurai and 10 Uesugi/blue-side samurai.
- The factions meet on a Japanese countryside battlefield.
- High-quality samurai assets are generated with Asset Foundry, Blender, and Blender MCP evidence.
- Assets are independently visually gated before expansion and before Unity/browser promotion.
- A Unity world is created or updated through the reachable Mac-local Unity MCP listener and verified as playable when possible.
- A browser/Three.js proof remains playable and reviewable.
- Music/audio evidence is created or freshly verified.
- PR/merge/finalization happens only after the required evidence exists.

## Why v15 Exists

v12 was not autonomous proof. Its pilot samurai contact sheets were toy-like: capsule bodies, detached or floating limbs/feet, fragmented top views, and blocky/Minecraft-like proportions.

v13 was not valid proof because the planner got stuck in an ambiguous YAML validation loop, installed `js-yaml`, modified package files, wrote custom validators, and never committed a valid root `WORK_PLAN.md`.

v14 was not valid proof because, even after package installs were forbidden, the planner still entered a self-invented indentation-check loop and required operator cancellation.

FactoryX `main` now includes the relevant fixes and is deployed on this Mac-local stack:

- `9736296` allows evidence-only deliverable tickets to succeed without PRs while still requiring PRs for finalization/promotion.
- `b5a0129` selects the fast deploy target from the Docker host architecture.
- `f83ffd4` installs the selected Rust target for fast Mac-local deploys.
- `985f642` enables the deliverable loop in the Mac Edo deploy.
- `821d221` preserves planner YAML indentation in the admin prompt.
- `7a54836` forbids planner dependency installs and custom validators.
- `7a059af` removes planner self-validation commands and relies on FactoryX server-side plan validation.

The Mac-local Edo deployment is running image `ghcr.io/tallhamn/factoryx:20260621-planner-no-self-validate-arm64` with Blender, `blender-mcp`, Asset Foundry `/healthz`, Unity MCP reachable from workers at `http://host.docker.internal:27481/mcp`, and two healthy Mac-local workers. This run should use this machine as the execution environment rather than remote Hetzner capacity for Unity work.

## Autonomy Rule

This run is a clean validation attempt after v12, v13, and v14 required source/deploy intervention. Do not count inherited files, older PRs, old screenshots, old Unity notes, old generated assets, or v12/v13/v14 assets as completion proof unless a fresh non-planner work order attached to v15 verifies them after this deliverable was created.

If a human/Codex operator manually rescues assets, Unity state, database state, or worker state after this validation starts, do not mark the deliverable done. Record the root cause, fix FactoryX, and repeat from a new validation branch.

## Required Sequence

1. Planner writes and commits a parseable root `WORK_PLAN.md`.
2. First ready implementation work must create a pilot batch of exactly four fresh v15 samurai assets:
   - 2 Takeda/red faction variants.
   - 2 Uesugi/blue faction variants.
   - Save source `.blend`, exported `.glb`, repeatable camera renders, and contact sheets under `games/kawanakajima-foundry-samurai-proof/assets/generated/foundry/samurai-v15/pilot-4/`.
3. A separate visual-gate work order must inspect the pilot contact sheets. Asset generation must not approve itself.
4. Only after pilot visual gate passes, generate the full 20-samurai set under `games/kawanakajima-foundry-samurai-proof/assets/generated/foundry/samurai-v15/full-20/`.
5. A separate final visual-gate work order must inspect all 20 samurai.
6. Only after final visual gate passes, proceed to Unity MCP world integration, browser proof integration, audio/music work, PR/finalization, and merge verification.

## Asset Quality Gates

Each samurai must read as an upright human figure in front, side, rear, three-quarter, and top inspection views. The review must fail if any focal character has:

- detached or floating limbs, hands, feet, weapons, armor, or props;
- sideways/prone orientation;
- capsule/cylinder primitive anatomy;
- paddle feet or tiny unreadable feet;
- blocky Minecraft-like proportions;
- cropped head or unreadable face/helmet;
- one cloned model claimed as many variants;
- grey untextured placeholder materials;
- props that hide the body instead of improving the silhouette.

The v12 pilot outputs are explicit negative examples. Do not promote anything that resembles those contact sheets. A slightly stylized or funny samurai can pass only if it is coherent, upright, anatomically readable, dressed like a samurai, and materially better than the v12 block/capsule failures.

Every asset-generation ticket must:

- Call the Asset Foundry API where useful, and use Blender plus Blender MCP for generation, rendering, or inspection where useful.
- Use Blender 3.x compatible APIs before long generation scripts: `ShaderNodeBsdfPrincipled`, `poly.use_smooth`, `bpy.context.view_layer.update()`, `mathutils.Matrix`/`Vector`, `math.pi`/`math.radians`, and GLB export through `bpy.ops.export_scene.gltf(..., export_format='GLB')`.
- Use patch edits or small chunks for long Blender scripts; do not emit a full generation script in one giant shell command or here-doc.
- Never print binary PNG, GLB, BLEND, audio, ZIP, or archive bytes into logs.
- Render repeatable review views: front, side, rear, three-quarter, top, and a contact sheet.
- Record visual inspection notes, but never approve its own visual gate or claim production readiness.

## Unity MCP Gate

Unity work must verify the live MCP listener at `http://host.docker.internal:27481/mcp` using the standard streamable HTTP JSON-RPC flow or Codex MCP tools. Do not use stale `/api/...` bridge routes. If the Unity Editor/listener is unavailable, write a source-controlled Unity handoff and `UNITY_BLOCKER.md`; do not claim a playable Unity build.

Unity integration should place the two sides in a Japanese countryside Kawanakajima battlefield, verify 20 samurai are loaded or represented from the approved v15 asset set, and create a small playable loop rather than only a static scene.

## Planner YAML Gate

The planner must write `WORK_PLAN.md` at the repository root, not inside `.factoryx/work-orders/`. The worker-runtime will reject a planner run that accepts without a readable, parseable, git-tracked, committed root plan.

Ticket lists must use standard YAML indentation:

```yaml
tickets:
  - id: v15-pilot-asset-gen
    title: Blender pilot asset generation
    goal: >
      Generate exactly four v15 samurai and save GLB, Blender source, renders, and manifest evidence.
    profile: qwen3.6:35b-a3b-coding-mxfp8
    depends_on: []
```

Do not install packages, run npm/pip/cargo, write custom validators, or edit `package.json`/`package-lock.json` for plan validation. Do not run plan-validation commands. FactoryX validates the committed `WORK_PLAN.md` after the planner finishes and rejects malformed plans automatically.

## Done Criteria

The deliverable is complete only when current v15-attached work orders prove:

- pilot assets were created and independently inspected;
- full 20 assets were created and independently inspected;
- Unity world work was performed and verified or a precise Unity blocker was committed;
- browser proof opens and runs with current verified assets;
- music/audio is present and verified;
- PR/finalization records evidence and no required work remains.

Finalization must include work order IDs, paths to v15 assets/renders/Unity/audio/build or screenshots, a concise pass/fail table, and a note identifying any inherited files used only as references.
