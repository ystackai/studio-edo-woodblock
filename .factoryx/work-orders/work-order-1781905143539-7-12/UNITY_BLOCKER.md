# UNITY BLOCKER — kawanakajima-samurai-world

**Date:** 2026-06-19  
**Work Order:** work-order-1781905143539-7-12

## Verified Absence
- `which unity` → not found
- `which Unity` → not found
- `ls /opt/unity*` → none
- `command -v UnityHub` → none
- No Unity MCP server reachable via `grok mcp doctor` or process inspection.

## What remains to run once Unity is installed/licensed
1. Install Unity Editor (2022 LTS or 6000.x recommended for glTF).
2. Open or create a URP/HDRP project at `unity/kawanakajima-samurai-world/`.
3. Import the generated GLBs:
   - `assets/generated/samurai/takeda_samurai_archetype.glb`
   - `assets/generated/samurai/uesugi_samurai_archetype.glb`
   - Or the 20 actors under `assets/generated/samurai/actors/`
4. Place them in the countryside scene using the same layout as the Three.js preview (Takeda left/oxblood side, Uesugi right/indigo side, path/stream/hills separation).
5. Add the same camera framing, OrbitControls equivalent, and charge interaction (simple timeline or animator moving 5 front actors + state machine for win/loss).
6. Replicate the restrained Edo palette + fog + cool key/rim lighting.

All GLB assets, contact sheets, and ASSET_MANIFEST are already in the repo under `games/kawanakajima-samurai-world/assets/`. The browser Three.js preview at `games/kawanakajima-samurai-world/index.html` is the live playable deliverable until Unity arrives.

Do not claim Unity ran. This blocker is the narrow factual record.
