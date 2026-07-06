# Preview — Kawanakajima Samurai v11

**Status:** Planner v11 — ready tickets queued, awaiting spawn.

## Preview Path

`games/kawanakajima-foundry-samurai-proof/index.html`

This is the Three.js/ WebGL browser proof for the Kawanakajima samurai game world. It loads the samurai GLB asset via GLTFLoader and creates a battlefield tableau with 20 samurai (10 Takeda + 10 Uesugi) with orbit controls, camera presets, and audio cues.

## Current State

- The v10 branch (`ecaaa8e`) includes a Three.js browser proof with foundry assets, but it's reference-only for v11 — not completion evidence.
- v11 requires a fresh pilot asset generation pass (4 samurai) before any further work.
- Unity MCP listener at `http://host.docker.internal:27481/mcp` needs verification before any Unity build work.
