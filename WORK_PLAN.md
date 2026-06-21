# WORK_PLAN — Kawanakajima Samurai Autonomous Validation v12

## Current State Assessment

The branch `factoryx/kawanakajima-samurai-autonomous-validation-20260621-v12` carries inherited content from prior validation runs (v3–v11): 20 samurai assets (10 Takeda, 10 Uesugi), a 3D browser proof with Three.js, audio assets, and a Unity project with bootstrap scripts. Browser verification (`node verify.js`) passes. Visual inspection of the existing assets shows stylized but readable samurai silhouettes with proper proportions, helmets, and armor.

However, no fresh non-planner Work Orders have been created or completed for v12 after its `created_at_ms` (1782033517856). Per the deliverable rules, every inherited criterion is **PENDING** for this validation run. A fresh pilot batch of samurai assets must be generated, visually gated, and only then can Unity/browser/finalization tickets proceed.

No Unity MCP listener has been verified for this v12 run. That will be checked in parallel with asset work.

## Plan

The strict sequence from requirements is followed: pilot assets → visual gate → full set → integration → PR. The ready batch below contains the first three tickets.

```yaml
tickets:
    - id: pilot-asset-gen-v12
      title: Generate 4 fresh samurai pilot assets (2 Takeda, 2 Uesugi)
      goal: >
        Generate 4 new samurai models (2 Takeda/red, 2 Uesugi/blue) using Blender via Asset Foundry or locally.
        Produce source .blend files, GLB exports, contact sheets (front/side/rear/3-quarter/top), and hero renders.
        Save to games/kawanakajima-foundry-samurai-proof/assets/generated/foundry/samurai-v12/pilot-4/.
        Record file paths, sizes, provenance, and any observed flaws in an internal notes file.
        Do not self-approve the visual gate.
      profile: qwen3.6:35b-a3b-coding-mxfp8
      depends_on: []
    - id: visual-gate-pilot-v12
      title: Independent visual-gate inspection of pilot assets
      goal: >
        Inspect the contact sheets and hero renders from pilot-asset-gen-v12 for each of the 4 samurai.
        Check for: upright stance, correct proportions (no capsule/cylinder/primitive anatomy),
        readable helmets and armor, feet planted below head in side/rear views, no floating limbs,
        no cropped heads, faction-appropriate color schemes (red for Takeda, blue for Uesugi).
        Record pass/fail with specific observations per variant. Do not approve self-generated assets.
      profile: qwen3.6:35b-a3b-coding-mxfp8
      depends_on: [pilot-asset-gen-v12]
    - id: unity-verify-v12
      title: Verify Unity MCP listener and inspect scene
      goal: >
        Probe the Unity MCP listener at http://host.docker.internal:27481/mcp via standard streamable HTTP JSON-RPC.
        If reachable, call tools/list to enumerate available tools, then inspect the Kawanakajima scene
          (scene-list-opened, script-execute with clean JSON). Attempt a build or scene inspection.
        If unreachable, write UNITY_BLOCKER.md documenting the exact failure and next steps.
      profile: qwen3.6:35b-a3b-coding-mxfp8
      depends_on: []
```





## Pending Tickets (after ready batch completes)

- **full-asset-gen-v12** — Generate the full 20-samurai set (10 Takeda + 10 Uesugi) if pilot passes visual gate
- **visual-gate-full-v12** — Independent visual inspection of all 20 samurai
- **browser-proof-v12** — Integrate fresh assets into browser proof, verify no errors, capture verification evidence
- **audio-verify-v12** — Verify audio assets are file-backed and play correctly in browser
- **pr-finalize-v12** — Create/update PR from this branch to main with complete body, evidence links, and merge verification
