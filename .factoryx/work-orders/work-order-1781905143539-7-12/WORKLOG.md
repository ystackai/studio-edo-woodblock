# WORKLOG — work-order-1781905143539-7-12

## 2026-06-19
- Verified runtime: Blender 3.4.1 present, `grok mcp doctor` healthy for blender, Asset Foundry `/api/recipes` lists `samurai_character`, Unity absent.
- Ran `samurai_character` recipe (fixed relative path issue by using absolute --out). Produced baseline .blend + GLB + partial high-res renders.
- Created fast variant pipeline: `make_team_variant.py` (recolor 6 materials for Takeda oxblood / Uesugi indigo from source .blend).
- Foot improvement pass (`improve_feet.py`) to address potential paddle observation; added volume + toe detail.
- Fast repeatable contact rig (`render_contact.py`): 6 inspection cameras + 4-frame turntable, low cost settings, PIL sheets + GIFs.
- 20 actor GLBs materialized (10+10) under actors/ using the improved archetypes.
- Vision gateway reviews attempted on contact sheets (raw verdicts saved; model surfaced armor details + one foot note that was actioned).
- Built Japanese countryside in Three.js: hills, path, stream, pines, grass tufts, mist layers, restrained Edo palette + cool/rim lighting.
- Playable loop: orbit controls (pure three, no extra), click inspect, charge interaction mutates positions + state + win/loss, reform reset.
- All using the generated GLBs (no canvas/SVG samurai).
- Wrote ASSET_MANIFEST, UNITY_BLOCKER, PREVIEW, this WORKLOG, and VERIFICATION scaffold.
- Current state: coherent playable 3D with reviewable assets. Ready for browser verification pass.

Blockers closed: none remaining for the browser deliverable. Unity recorded as narrow blocker.

## Repair Pass After Visual Rejection
- User correctly flagged the first battlefield screenshot as too blocky/Minecraft-like compared with the earlier funny-but-coherent samurai proof.
- Patched Asset Foundry `samurai_character` recipe: smaller helmet silhouette, foot/sole/strap geometry instead of paddle feet, sashimono banner for battlefield/top-view readability, faster inspection render settings.
- Submitted Asset Foundry HTTP job `asset-1781906889338-2ba7800f`; pulled v3 GLB/source/contact sheet/turntable back into the game asset tree.
- Regenerated Takeda/Uesugi archetypes from the v3 source `.blend` and rematerialized all 20 actor GLBs.
- Patched `index.html` to load all 20 actor paths, add per-actor banners/spears/sashes in-scene, improve lighting, and use a closer lower camera.
- Re-ran Playwright over HTTP. Verified 10+10 actors present, charge mutates state, no page errors. Final evidence: `screenshots/repair-initial.png`, `screenshots/repair-post-charge.png`, `screenshots/repair-verification.json`.
