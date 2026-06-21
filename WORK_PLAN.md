# WORK_PLAN — Kawanakajima Samurai Autonomous Validation v9

**Deliverable:** `kawanakajima-samurai-autonomous-validation-20260621-v9`
**Branch:** `factoryx/kawanakajima-samurai-autonomous-validation-20260621-v9`
**Created:** 2026-06-21
**Planner timestamp:** 2026-06-21T08:20Z

## Current State Assessment

- **Branch:** Fresh seed — only the `FACTORYX_DELIVERABLE_REQUIREMENTS.md` file committed. No implementation work yet.
- **Unity MCP:** Reachable at `http://host.docker.internal:27481/mcp`. The `Kawanakajima` scene is open in the Editor with one root GameObject (bootstrap). No Unity build artifacts produced yet.
- **Asset Foundry:** Healthy (`/healthz` returns ok). Blender provider configured.
- **Non-planner work orders attached to this deliverable:** Zero completed. All existing work-order folders on the branch are empty templates.
- **Inherited assets from main/previous iterations:** Reference-only — do not count as v9 completion evidence.

## Strategy

Per the v9 requirements, the first pass must produce **four materially distinct samurai** (2 Takeda + 2 Uesugi) under `games/kawanakajima-foundry-samurai-proof/assets/generated/foundry/samurai-v9/pilot-4/`, using Blender 3.x compatible APIs. An **independent visual-gate ticket** must inspect the pilot renders before any expansion proceeds.

Downstream tickets (full 20-samurai expansion, Unity integration, gameplay, audio, browser proof, PR) are **not ready** until the pilot passes visual review.

## Ready Batch (first to execute)

Both tickets below are independent in structure but serially dependent: the expansion tickets wait for pilot-visual-gate to pass.

## Pending Tickets

```yaml
tickets:
   - id: v9-pilot-asset-gen
    title: Blender pilot — 4 samurai (2 Takeda, 2 Uesugi)
    goal: >
      Use Asset Foundry / Blender MCP to generate four materially distinct samurai
      models (2 Takeda + 2 Uesugi) under
      `games/kawanakajima-foundry-samurai-proof/assets/generated/foundry/samurai-v9/pilot-4/`.
      Models must have believable anatomy, armor, cloth, weapons, face/head,
      neck/shoulders, hand/foot detail. Export GLB via `bpy.ops.export_scene.gltf`
      with `export_format='GLB'`. Render repeatable review views (front, side,
      rear, three-quarter, top, contact sheet). Preserve Blender source files.
      Use Blender 3.x compatible APIs only: `ShaderNodeBsdfPrincipled`,
      `poly.use_smooth`, `bpy.context.view_layer.update()`, `mathutils.Matrix`/`Vector`.
      Never print binary bytes into logs.
    profile: qwen3.6:35b-a3b-coding-mxfp8
    depends_on: []

   - id: v9-pilot-visual-gate
    title: Independent pilot visual-gate — inspect 4 samurai
    goal: >
      Separate from the asset-gen ticket. Inspect the saved pilot renders and
      contact sheets. Decide pass/fail on: believable silhouette, upright stance,
      no capsule/cylinder anatomy, no floating/detached feet, correct Z-up
      orientation, readable face/head/neck/shoulder/hand/foot, faction-distinguishable
      colors. Record observed flaws. Do NOT approve its own visual gate.
      Only after pass can expansion tickets proceed.
    profile: qwen3.6:35b-a3b-coding-mxfp8
    depends_on: [v9-pilot-asset-gen]

   - id: v9-full-20-expansion
    title: Blender full set — 20 samurai (10 Takeda, 10 Uesugi)
    goal: >
      After pilot-visual-gate passes, generate the full set of 20 samurai under
      `games/kawanakajima-foundry-samurai-proof/assets/generated/foundry/samurai-v9/full-20/`.
      Maintain material distinction between variants (no cloning). Follow same
      Blender 3.x conventions. Render contact sheets for the full set.
    profile: qwen3.6:35b-a3b-coding-mxfp8
    depends_on: [v9-pilot-visual-gate]

   - id: v9-full-visual-gate
    title: Independent full-set visual-gate — inspect 20 samurai
    goal: >
      Separate gate. Inspect full-set renders. Verify 20 materially distinct
      variants, no cloned models. Pass/fail before Unity integration begins.
    profile: qwen3.6:35b-a3b-coding-mxfp8
    depends_on: [v9-full-20-expansion]

   - id: v9-unity-integration
    title: Unity integration — load samurai assets into Kawanakajima scene
    goal: >
      Use Unity MCP to integrate the validated samurai GLB assets into the
      existing Kawanakajima scene. Create 20 samurai actors on a Japanese
      countryside battlefield tableau. Wire up the runtime bootstrap.
      Record console logs and screenshots as evidence.
    profile: qwen3.6:35b-a3b-coding-mxfp8
    depends_on: [v9-full-visual-gate]

   - id: v9-gameplay-loop
    title: Unity playable game loop — CHARGE/REFORM + camera controls
    goal: >
      Implement a small playable game loop in Unity: charge/reform mechanics,
      camera presets, basic interaction. Keep scope tight — one verb in one
      space. No save/load, inventory, or multiple levels.
    profile: qwen3.6:35b-a3b-coding-mxfp8
    depends_on: [v9-unity-integration]

   - id: v9-audio-integration
    title: Audio/music integration into Unity world
    goal: >
      Integrate original or generated audio/music into the Unity world:
      battlefield ambience loop, charge/clash/step/confirm cues. Audio must
      only play after user gesture.
    profile: qwen3.6:35b-a3b-coding-mxfp8
    depends_on: [v9-gameplay-loop]

   - id: v9-browser-proof
    title: Browser review surface — Three.js proof with all assets
    goal: >
      Build a self-contained browser proof (index.html + Three.js) that loads
      the samurai assets, displays the 20-samurai tableau, exposes camera
      presets, contact sheets, and verification checks. Ensure responsive
      controls, <100ms input response, no JS errors, 60fps target.
    profile: qwen3.6:35b-a3b-coding-mxfp8
    depends_on: [v9-gameplay-loop, v9-audio-integration]

   - id: v9-pr-merge
    title: Final PR — merge v9 to main
    goal: >
      Create/update a PR from the v9 branch to main with complete PR body
      (FactoryX Work Order Context section, scope, verification output, known issues).
      Only after fresh v9 evidence proves asset, Unity, game, audio, and review criteria.
    profile: qwen3.6:35b-a3b-coding-mxfp8
    depends_on: [v9-browser-proof]
```

## Execution Notes

- **Asset Foundry:** Available at `http://factoryx-edo-woodblock-asset-foundry:18113` (verified healthy). Use for Blender asset generation.
- **Unity MCP:** Available at `http://host.docker.internal:27481/mcp`. Kawanakajima scene is loaded. Use MCP tools for scene manipulation, not raw curl.
- **Blender 3.x compatibility:** All scripts must use `ShaderNodeBsdfPrincipled`, `poly.use_smooth`, `bpy.context.view_layer.update()`, `mathutils.Matrix`/`Vector`, `math.pi`/`math.radians`, `bpy.ops.export_scene.gltf(..., export_format='GLB')`.
- **Large scripts:** Write in chunks under 120 lines per command, not as single here-docs.
- **Binary hygiene:** Never print binary asset bytes into logs. Use sizes, checksums, saved paths.
- **Visual gate independence:** Asset generation tickets must not approve their own visual gates. A separate ticket inspects the renders.
