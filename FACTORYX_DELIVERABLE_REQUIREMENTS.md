# Kawanakajima Samurai Autonomous Validation v7

## Prompt

/goal Create the most realistic playable Kawanakajima samurai game-world proof you can using Asset Foundry, Blender, Blender MCP, Unity, Unity MCP, and FactoryX autonomous work orders. Use your vision capabilities to create a self-verifiable system, then enter a loop until you are satisfied that the deliverable is meaningfully better than the rejected baseline. Build repeatable camera systems to inspect every samurai and the playable world from the required angles. After each significant change, render those same views, identify what looks least realistic, improve it, and inspect again. Preserve the best version as you iterate, and stop only when the v7 evidence shows no visible issue worth fixing for this validation scope.

## Why v7 Exists

Previous validation attempts are not accepted evidence for this deliverable:

- v3 produced sideways, prone, or capsule-like samurai contact sheets. The assets looked primitive and failed the upright human-readability bar.
- v4 inherited old files from `main` and treated them as proof, then spawned downstream PR/context work before a fresh visual asset gate.
- v5 again counted inherited baseline assets as done and omitted a fresh visual-gate ticket.
- v6 found real Blender 3.4 compatibility failures and required human/Codex runtime intervention, so it cannot be counted as an autonomous proof.

FactoryX `main` now includes Blender 3.x compatibility hard gates in the worker prompt, and the Mac-local deployment has Blender MCP, Asset Foundry, Unity MCP, and the local model gateway wired into the worker runtime. v7 is the fresh post-fix validation run.

All files inherited from `main`, this seed branch, or previous validation branches are reference-only. They may be inspected to understand the repo, but they do not count as completion evidence for v7.

## Required Delivery

Build and validate a fresh v7 proof containing:

1. At least 20 samurai variants for the game world, ten per side.
2. Realistic, upright, human-readable samurai silhouettes with armor, cloth, weapon, face/head, hand/foot, and material detail.
3. A Unity world that imports the accepted v7 assets through Unity MCP and places them into a playable Kawanakajima scene.
4. A small playable game loop in Unity, not just static assets.
5. Original or generated audio/music integrated into the Unity world.
6. A browser or rendered review surface showing what was created, what succeeded, what failed, and what remains.
7. A final PR only after fresh v7 evidence proves the asset, Unity, game, audio, and review criteria.

## Hard Gates

Do not mark any criterion complete, do not open a PR, and do not spawn Unity/browser/finalization work until the first ready batch includes and completes a fresh Blender/foundry visual-gate ticket created after this deliverable is registered.

The first implementation ticket must do all of the following:

- Generate or materially improve a fresh v7 samurai asset using Asset Foundry plus Blender or Blender MCP.
- Use Blender 3.x compatible APIs before long generation scripts: `ShaderNodeBsdfPrincipled`, `poly.use_smooth`, `bpy.context.view_layer.update()`, `mathutils.Matrix`/`Vector`, `math.pi`/`math.radians`, and GLB export through `bpy.ops.export_scene.gltf(..., export_format='GLB')`.
- Render repeatable review views: front, side, rear, three-quarter, and top where useful.
- Save the review images/contact sheets in the repo under a v7-specific path.
- Include visual inspection notes explaining whether the asset is upright, standing on feet, human-proportioned, non-Minecraft-like, non-capsule-like, and not sideways/prone/floating/disassembled.
- Fail honestly if the asset does not pass the visual gate.

## Completion Evidence Rules

Completion can only be claimed from non-planner FactoryX work orders created after this deliverable is registered. Inherited files, old proof images, existing Unity scenes, old GLB files, old audio files, and historical PRs are not evidence for v7 completion.

The final report must include:

- Work order IDs for each accepted v7 evidence source.
- Paths to fresh v7 assets, renders, Unity scene changes, audio/music files, and builds or screenshots.
- A concise pass/fail table for asset realism, world integration, gameplay, audio, and reviewability.
- A note identifying any old inherited files that were used only as references.

## Planner Instructions

When writing `WORK_PLAN.md`, keep all inherited asset/build/game criteria pending until fresh v7 work orders complete. The initial ready batch must contain only the fresh Blender/foundry visual-gate work needed to create reviewable v7 evidence. Downstream Unity MCP, music/audio, gameplay, browser review, PR creation, and merge work must wait for that evidence.
