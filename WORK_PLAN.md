# Kawanakajima Samurai Autonomous Validation v15 — Work Plan

## Status

**Deliverable:** `kawanakajima-samurai-autonomous-validation-20260621-v15`
**Branch:** `factoryx/kawanakajima-samurai-autonomous-validation-20260621-v15`
**Head:** `14c68c2` (seed commit)
**PR:** none yet
**Non-planner completion proof:** none — this is the first planner run for v15

## Assessment

v12 had toy-like contact sheets (capsule bodies, floating limbs).
v13 and v14 were rejected for YAML indentation issues in `WORK_PLAN.md`.
v15 starts fresh on a new branch. Existing samurai assets under `assets/generated/foundry/samurai/improved-20260620-*` and `assets/generated/foundry/samurai/` are from v12-v14 iterations and **do not count** as v15 completion proof.

Asset Foundry (Blender provider) is healthy. Unity MCP listener at `http://host.docker.internal:27481/mcp` is healthy and reachable.

Per the deliverable's required sequence, the next phase is to generate a pilot batch of four fresh samurai (2 Takeda/red, 2 Uesugi/blue) under the v15 path, then send them for independent visual-gate inspection. Only after the pilot passes should we expand to the full 20, then proceed to Unity/browser/audio/polish/finalization.

## Tickets (ready batch)

Only the first ready batch is listed below; dependent tickets become available once their prerequisites complete.

```yaml
tickets:
  - id: v15-pilot-takeda-a
    title: Pilot samurai - Takeda red variant A
    goal: >
      Use the Asset Foundry Blender provider to generate one Takeda (red faction) samurai
      as a fresh v15 asset: create the .blend source, export GLB, render repeatable
      inspection views (front, side, rear, three-quarter, top), and save a contact sheet
      to games/kawanakajima-foundry-samurai-proof/assets/generated/foundry/samurai-v15/pilot-4/.
    profile: qwen3.6:35b-a3b-coding-mxfp8
    depends_on: []
  - id: v15-pilot-takeda-b
    title: Pilot samurai - Takeda red variant B
    goal: >
      Generate a second Takeda samurai variant (distinct helmet crest, armor style,
      pose, and color palette) using the same Foundry Blender pipeline. Save .blend,
      GLB, renders, contact sheet, and a brief description of differences from variant A
      to the same pilot-4 directory.
    profile: qwen3.6:35b-a3b-coding-mxfp8
    depends_on: []
  - id: v15-pilot-uesugi-a
    title: Pilot samurai - Uesugi blue variant A
    goal: >
      Generate one Uesugi (blue faction) samurai with blue palette, nagabata crest,
      distinct armor styling, saved as .blend/GLB with inspection renders and contact sheet
      to the pilot-4 directory.
    profile: qwen3.6:35b-a3b-coding-mxfp8
    depends_on: []
  - id: v15-pilot-uesugi-b
    title: Pilot samurai - Uesugi blue variant B
    goal: >
      Generate a second Uesugi variant (different helmet, pose, armor) using the same
      pipeline. Save all evidence (blend, glb, renders, contact sheet) to pilot-4.
    profile: qwen3.6:35b-a3b-coding-mxfp8
    depends_on: []
  - id: v15-pilot-manifest
    title: Pilot 4 - manifest and preview
    goal: >
      Write ASSET_MANIFEST.md describing all four pilot assets (files, provenance,
      Foundry job IDs, sizes), update PREVIEW.md with the pilot preview path, and verify
      that each GLB is non-empty and each contact sheet is a valid PNG.
    profile: qwen3.6:35b-a3b-coding-mxfp8
    depends_on: [v15-pilot-takeda-a, v15-pilot-takeda-b, v15-pilot-uesugi-a, v15-pilot-uesugi-b]
  - id: v15-pilot-visual-gate
    title: Pilot visual gate - independent review
    goal: >
      Inspect all four pilot contact sheets and hero renders with vision. Record pass/fail
      per asset, noting any disqualifying flaws (floating limbs, capsule bodies, sideways
      orientation, cropped heads, untextured grey). Do not approve the same asset you generated.
    profile: qwen3.6:35b-a3b-coding-mxfp8
    depends_on: [v15-pilot-manifest]
```

## Upcoming (after pilot visual gate passes)

- **Full 20 samurai** - generate remaining 16 samurai (8 Takeda, 8 Uesugi) with distinct variants
- **Full 20 visual gate** - independent inspection of all 20
- **Unity integration** - verify MCP listener, load assets into Unity scene, verify playable loop
- **Browser proof** - integrate assets into Three.js proof, fix any runtime errors
- **Audio/music** - integrate Foundry audio, verify browser playback
- **PR/finalization** - open PR, update body, verify merge
