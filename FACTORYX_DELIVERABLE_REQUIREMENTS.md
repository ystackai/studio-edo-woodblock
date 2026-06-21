# Kawanakajima Samurai Autonomous Validation v8

## Prompt

/goal Create the most realistic playable Kawanakajima samurai game-world proof you can using Asset Foundry, Blender, Blender MCP, Unity, Unity MCP, and FactoryX autonomous work orders. Use your vision capabilities to create a self-verifiable system, then enter a loop until you are satisfied that the deliverable is meaningfully better than the rejected baseline. Build repeatable camera systems to inspect every samurai and the playable world from the required angles. After each significant change, render those same views, identify what looks least realistic, improve it, and inspect again. Preserve the best version as you iterate, and stop only when the v8 evidence shows no visible issue worth fixing for this validation scope.

## Why v8 Exists

Previous validation attempts are not accepted evidence for this deliverable:

- v3 produced sideways, prone, or capsule-like samurai contact sheets. The assets looked primitive and failed the upright human-readability bar.
- v4 inherited old files from `main` and treated them as proof, then spawned downstream PR/context work before a fresh visual asset gate.
- v5 again counted inherited baseline assets as done and omitted a fresh visual-gate ticket.
- v6 found real Blender 3.4 compatibility failures and required human/Codex runtime intervention, so it cannot be counted as an autonomous proof.
- v7 generated fresh Blender/foundry evidence, but the result was visibly toy-like and procedural: capsule/block anatomy, poor human silhouette, detached or floating feet, and insufficient realism. The asset-generation ticket falsely self-approved its own visual gate and opened PR #177 before independent review, so v7 is failed evidence only.

FactoryX `main` now includes worker prompt fixes that prevent asset-generation tickets from approving their own visual gates or opening PRs unless the current ticket explicitly asks for PR/finalization/merge work. The Mac-local Edo deployment is running image `ghcr.io/tallhamn/factoryx:20260621-mac-visual-gate-ownership-fix` with Blender 3.4.1, `blender-mcp`, Asset Foundry `/healthz`, and Unity MCP reachable from workers at `http://host.docker.internal:27481/mcp`.

All files inherited from `main`, this seed branch, or previous validation branches are reference-only. They may be inspected to understand the repo, but they do not count as completion evidence for v8.

## Required Delivery

Build and validate a fresh v8 proof containing:

1. At least 20 samurai variants for the game world, ten per side.
2. Realistic, upright, human-readable samurai silhouettes with armor, cloth, weapon, face/head, neck/shoulders, hand/foot, and material detail.
3. A Unity world that imports the accepted v8 assets through Unity MCP and places them into a playable Kawanakajima scene.
4. A small playable game loop in Unity, not just static assets.
5. Original or generated audio/music integrated into the Unity world.
6. A browser or rendered review surface showing what was created, what succeeded, what failed, and what remains.
7. A final PR only after fresh v8 evidence proves the asset, Unity, game, audio, and review criteria.

## Hard Gates

Do not mark any criterion complete, do not open a PR, and do not spawn Unity/browser/finalization work until the first ready batch includes and completes both:

- a fresh Blender/foundry asset-generation ticket created after this deliverable is registered, and
- a separate independent visual-gate ticket that inspects the saved v8 renders/contact sheets.

The first implementation ticket must do all of the following:

- Generate or materially improve fresh v8 samurai assets using Asset Foundry plus Blender or Blender MCP.
- Use Blender 3.x compatible APIs before long generation scripts: `ShaderNodeBsdfPrincipled`, `poly.use_smooth`, `bpy.context.view_layer.update()`, `mathutils.Matrix`/`Vector`, `math.pi`/`math.radians`, and GLB export through `bpy.ops.export_scene.gltf(..., export_format='GLB')`.
- Render repeatable review views: front, side, rear, three-quarter, and top where useful.
- Save the review images/contact sheets in the repo under a v8-specific path.
- Record visual inspection notes, but do not approve the asset's visual gate or claim production readiness.
- Fail honestly if the asset evidence shows detached or floating feet, separated body parts, capsule/cylinder/cube anatomy, toy or puppet proportions, tiny/paddle feet, face/head/neck/shoulder/hand/foot structure that does not read as human, oversized props that hide the body, cropped heads, or one cloned model claimed as many distinct variants.

The independent visual-gate ticket must inspect the v8 renders/contact sheets and decide pass/fail before downstream work begins. If 10 characters per side are required, a single model cloned for each side is not enough; variants must be materially distinct or the variant-count criterion remains incomplete.

## Completion Evidence Rules

Completion can only be claimed from non-planner FactoryX work orders created after this deliverable is registered. Inherited files, old proof images, existing Unity scenes, old GLB files, old audio files, and historical PRs are not evidence for v8 completion.

The final report must include:

- Work order IDs for each accepted v8 evidence source.
- Paths to fresh v8 assets, renders, Unity scene changes, audio/music files, and builds or screenshots.
- A concise pass/fail table for asset realism, world integration, gameplay, audio, and reviewability.
- A note identifying any old inherited files that were used only as references.

## Planner Instructions

When writing `WORK_PLAN.md`, keep all inherited asset/build/game criteria pending until fresh v8 work orders complete. The initial ready batch must contain only the fresh Blender/foundry asset-generation work and the independent visual-gate work needed to create and review v8 evidence. Downstream Unity MCP, music/audio, gameplay, browser review, PR creation, and merge work must wait for that evidence.
