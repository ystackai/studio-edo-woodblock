# Kawanakajima Samurai Autonomous Validation v11

## Prompt

/goal Create the most realistic playable Kawanakajima samurai game-world proof you can using Asset Foundry, Blender, Blender MCP, Unity, Unity MCP, and FactoryX autonomous work orders. Use vision or rendered evidence to make the system self-verifiable, then enter a loop until the deliverable is meaningfully better than the rejected baselines. Build repeatable camera systems to inspect every samurai and the playable world from the required angles. After each significant change, render those same views, identify what looks least realistic, improve it, and inspect again. Preserve the best version as you iterate, and stop only when the v11 evidence shows no visible issue worth fixing for this validation scope.

## Why v11 Exists

Previous validation attempts are not accepted evidence for this deliverable:

- v3 produced sideways, prone, or capsule-like samurai contact sheets.
- v4 inherited old files from `main` and treated them as proof.
- v5 counted inherited baseline assets as done and omitted a fresh visual gate.
- v6 exposed Blender 3.4 compatibility failures that required intervention.
- v7 produced fresh but visibly toy-like/capsule/block samurai assets and self-approved the asset visual gate.
- v8 was superseded after intervention because the asset worker tried to author the Blender generation script as one giant tool payload, dumped binary image bytes into the run log, then stalled before producing v8 artifacts.
- v9 was superseded after intervention because the planner committed malformed `WORK_PLAN.md` YAML indentation, so the deliverable loop could not parse the plan or spawn the pilot asset ticket.
- v10 was superseded after intervention because planner and pilot work started before worker-runtime enforced that planner runs must leave a committed, parseable root `WORK_PLAN.md`.

FactoryX `main` now includes:

- `3889a28` preventing asset-generation tickets from approving their own visual gates or opening PRs unless explicitly asked.
- `ac7dc7d` preventing asset workers from writing giant scripts in one command and from printing binary assets into work-order logs.
- `4d2bd18` requiring planner prompts to use parseable `WORK_PLAN.md` YAML and to validate indentation without relying on grep counts.
- `618a46b` failing accepted planner runs unless the root deliverable plan file exists, parses with the deliverable loop parser, and is tracked/committed in git.

The Mac-local Edo deployment is running image `ghcr.io/tallhamn/factoryx:20260621-mac-planner-commit-guard` with Blender 3.4.1, `blender-mcp`, Asset Foundry `/healthz`, Unity MCP reachable from workers at `http://host.docker.internal:27481/mcp`, and two healthy Mac-local workers. Remote Edo containers on Hetzner have been stopped so this Mac-local stack owns the active work and Discord interaction route.

All files inherited from `main`, this seed branch, or previous validation branches are reference-only. They may be inspected to understand the repo, but they do not count as completion evidence for v11.

## Required Delivery

Build and validate a fresh v11 proof containing:

1. At least 20 materially distinct samurai variants for the game world, ten per side.
2. Realistic, upright, human-readable samurai silhouettes with armor, cloth, weapons, face/head, neck/shoulders, hand/foot, and material detail.
3. A Japanese countryside Kawanakajima world in Unity where the two sides meet in the scene.
4. A small playable game loop in Unity, not just static assets.
5. Original or generated audio/music integrated into the Unity world.
6. A browser or rendered review surface showing assets, world, gameplay, audio, what succeeded, what failed, and what remains.
7. A final PR only after fresh v11 evidence proves the asset, Unity, game, audio, and review criteria.

## Hard Gates

Do not mark any criterion complete, do not open a PR, and do not spawn Unity/browser/finalization work until the first asset stages include and complete:

- a fresh Blender/foundry pilot asset-generation ticket created after this deliverable is registered,
- a separate independent pilot visual-gate ticket that inspects the saved v11 pilot renders/contact sheets,
- a fresh Blender/foundry expansion ticket that creates the full 20-samurai set only after the pilot visual gate passes, and
- a separate independent final visual-gate ticket that inspects the complete 20-samurai set before downstream Unity work begins.

The pilot asset ticket must produce exactly four materially distinct samurai models, two Takeda and two Uesugi, under `games/kawanakajima-foundry-samurai-proof/assets/generated/foundry/samurai-v11/pilot-4/`.

The expansion ticket must produce the full set under `games/kawanakajima-foundry-samurai-proof/assets/generated/foundry/samurai-v11/full-20/`.

Every asset-generation ticket must:

- Use Blender 3.x compatible APIs before long generation scripts: `ShaderNodeBsdfPrincipled`, `poly.use_smooth`, `bpy.context.view_layer.update()`, `mathutils.Matrix`/`Vector`, `math.pi`/`math.radians`, and GLB export through `bpy.ops.export_scene.gltf(..., export_format='GLB')`.
- Keep large Blender scripts compact and incremental: use `apply_patch` or small append chunks, not a single giant shell command or here-doc.
- Never print binary PNG, GLB, BLEND, audio, or archive bytes into logs; use sizes, checksums, metadata, saved render paths, and manifests.
- Render repeatable review views: front, side, rear, three-quarter, top, and a contact sheet.
- Record visual inspection notes, but never approve its own visual gate or claim production readiness.
- Fail honestly if the evidence shows detached or floating feet, separated body parts, capsule/cylinder/cube anatomy, toy or puppet proportions, tiny/paddle feet, poor face/head/neck/shoulder/hand/foot readability, oversized props that hide the body, cropped heads, or one cloned model claimed as many distinct variants.

The independent visual gates must inspect saved renders/contact sheets and decide pass/fail before downstream work begins. A single model cloned for each side is not enough; variants must be materially distinct or the variant-count criterion remains incomplete.

## Planner YAML Gate

The planner must write `WORK_PLAN.md` at the repository root, not inside `.factoryx/work-orders/`. The worker-runtime will reject a planner run that accepts without a readable, parseable, git-tracked, committed root plan.

Ticket lists must use standard YAML indentation:

```yaml
tickets:
  - id: v11-pilot-asset-gen
    title: Blender pilot asset generation
    goal: >
      Generate exactly four v11 samurai and save GLB, Blender source, renders, and manifest evidence.
    profile: qwen3.6:35b-a3b-coding-mxfp8
    depends_on: []
```

Before committing `WORK_PLAN.md`, validate the fenced YAML with a parser when available or run a no-dependency indentation check that fails malformed `   - id:` ticket lists. If `WORK_PLAN.md` does not parse, the planner work is failed and the validation attempt is not autonomous proof.

## Completion Evidence Rules

Completion can only be claimed from non-planner FactoryX work orders created after this deliverable is registered. Inherited files, old proof images, existing Unity scenes, old GLB files, old audio files, and historical PRs are not evidence for v11 completion.

The final report must include:

- Work order IDs for each accepted v11 evidence source.
- Paths to fresh v11 assets, renders, Unity scene changes, audio/music files, and builds or screenshots.
- A concise pass/fail table for asset realism, world integration, gameplay, audio, and reviewability.
- A note identifying any old inherited files that were used only as references.

## Planner Instructions

When writing `WORK_PLAN.md`, keep all inherited asset/build/game criteria pending until fresh v11 work orders complete. The initial ready batch must contain only the pilot Blender/foundry asset-generation work and the independent pilot visual-gate work. Downstream full-20 expansion, Unity MCP, music/audio, gameplay, browser review, PR creation, and merge work must wait for accepted evidence from the previous stage.
