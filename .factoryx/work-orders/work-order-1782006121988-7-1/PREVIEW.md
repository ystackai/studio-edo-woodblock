# Preview — Kawanakajima Samurai

**Work Order:** work-order-1782006121988-7-1  
**Status:** Unity build BLOCKED; browser proof is the primary playable artifact.

## Playable Artifacts

### Browser Proof (PRIMARY)
- **Path:** `games/kawanakajima-foundry-samurai-proof/index.html`
- **Tech:** Three.js WebGL
- **Content:** 20 samurai (10 Takeda/red, 10 Uesugi/blue) with orbit/zoom camera controls
- **Interactions:** 6 camera presets, charge/reform gameplay loop, audio cues
- **Assets:** Foundry-generated GLB samurai models, WAV audio from Asset Foundry
- **Verification:** Canvas is non-blank, no console errors, all structure/asset/size checks pass

### Unity WebGL (BLOCKED)
- **Path:** `unity/kawanakajima-samurai/` (source only)
- **Build script:** `KawanakajimaUnityBuild.BuildWebGL()` → `Builds/WebGL/`
- **Status:** Blocked — Mac MCP listener unreachable (see UNITY_BLOCKER.md)

### Unity Mac Standalone (BLOCKED)
- **Build script:** `KawanakajimaUnityBuild.BuildMac()` → `Builds/Mac/KawanakajimaSamurai.app`
- **Previous size:** 112 MB (2026-06-20 build)
- **Status:** Blocked — Mac MCP listener unreachable
