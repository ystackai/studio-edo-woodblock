# ASSET_MANIFEST — work-order-1781905143539-7-12 (Kawanakajima: 20 samurai countryside battle)

**Date:** 2026-06-19  
**Status:** Repaired v3 stylized foundry samurai from `samurai_character` recipe baseline + team material variants + battlefield readability pass. 20 file-backed actors (10 Takeda oxblood, 10 Uesugi indigo). Browser Three.js playable world with countryside, orbit, inspect, and charge interaction that mutates state.

## Tooling Provenance
- Blender 3.4.1 (headless bpy) + local Asset Foundry recipe `/opt/asset-foundry/recipes/samurai_character.py`
- Asset Foundry HTTP job `asset-1781906889338-2ba7800f` produced v3 baseline GLB, source `.blend`, stable camera contact sheet, and turntable.
- Post-process: team recolor via `make_team_variant.py` from the v3 source blend.
- Recipe repair: smaller kabuto silhouette, non-paddle foot/sole/strap geometry, and sashimono back banner for top/field readability.
- Fast contact/turntable via `render_contact.py` (low-res EEVEE 512px, 8 samples for review speed).
- No Unity (see UNITY_BLOCKER.md).
- Vision review gateway attempted twice via `WORKER_RUNTIME_GATEWAY_BASE_URL` + `qwen3-vl:8b` on contact sheets (partial reasoning returned; no clean PASS/FAIL token but detailed armor elements visible in reasoning trace).

## Samurai Assets (foundry baseline + variants)
Location: `games/kawanakajima-samurai-world/assets/generated/samurai/`

### Archetypes (source of truth)
- `samurai_character_source.blend` + `samurai_character.glb` (baseline neutral from recipe)
- `takeda_samurai_source.blend`, `takeda_samurai_archetype.glb` (oxblood primary lacquer + indigo cloth)
- `uesugi_samurai_source.blend`, `uesugi_samurai_archetype.glb` (indigo primary + warm secondary)
- Each GLB ~1.2 MB, 12+ materials, kabuto/crest/mempo/lamellar/sode/kusazuri/katana/saya/waraji + toe/strap volume + sashimono banner.
- Baseline summary: `baseline/samurai_character_v3_summary.json`.

### 20 Battlefield Actors (file-backed by team + numbered in-scene)
- `actors/takeda-01.glb` … `takeda-10.glb` (copies of improved takeda archetype)
- `actors/uesugi-01.glb` … `uesugi-10.glb`
- Visible world loads all 20 actor paths, then adds per-actor scale/yaw plus readable banners/spears in the Three.js scene.

### Review Evidence (repeatable cameras)
- `baseline/baseline_contact_sheet.png`, `baseline_*.png` (hero/front/left/rear/top/three_quarter)
- `takeda/takeda_contact_sheet.png` + 6 views + `takeda_turntable_fast.gif`
- `uesugi/uesugi_contact_sheet.png` + views + gif
- Turntable frames (4) and full 16-frame capability existed in recipe; fast 4-frame used for iteration speed.
- Original high-res renders from first recipe pass also present in baseline/.

- `screenshots/repair-initial.png` and `screenshots/repair-post-charge.png` show the repaired browser view.

### Visual Gate
- Passed the immediate repair gate: no grey placeholder primitives, no distant Minecraft-like blocks, no single unreadable cloned blob field.
- Still stylized/toy-like rather than photorealistic. The v3 asset intentionally preserves the funny coherent samurai personality from the earlier proof while making it readable in-game.
- Detailed plates, lacing, rivets, helmet/mempo, banners, sandals, and team colors are visible in repeatable views and the browser screenshot.
- Vision calls saved:
  - `VISUAL_REVIEW_BASELINE.json`
  - `VISUAL_REVIEW_TAKEDA.json`
- Partial vision output noted armor elements and one "paddle" observation (addressed by improvement pass before final).

## World / Countryside (Three.js authored, ink-restrained)
- Ground plane with procedural low hills + path depression.
- Dark restrained river/stream + earth path.
- ~520 grass line tufts, multiple low-poly pines (cone + trunk, muted).
- 2 layered mist planes.
- Lighting: cool near-white key + subtle blue-tinted rim (saturated color stays in materials).
- Fog + paper-offwhite / charcoal / oxblood / indigo palette.

## Playable Integration
- `games/kawanakajima-samurai-world/index.html` loads the exact 20 actor GLB paths via GLTFLoader.
- 20 actors positioned with clear left (Takeda) / right (Uesugi) separation across path/stream.
- Controls: mouse drag orbit, wheel zoom (no external deps beyond CDN three + loader for preview).
- Interactions:
  - Click a warrior → inspect card (diegetic thin).
  - "Sound the charge" (button or C) → advances front elements, applies losses, mutates morale/state, may end encounter.
  - "Reform lines" resets to coherent pre-battle state.
- Objective loop: reduce opposing force below threshold → win/loss text; repeatable via Reform.
- Canvas non-blank on first frame, camera frames subject, state exposed at `window.__KAWANAKAJIMA_3D_STATE`.

## Sizes / Files
- 23 GLB files (archetypes + baseline + 20 actors)
- ~38 PNGs (views + 3 contact sheets)
- 3 fast GIF turntables
- All source .blend, scripts, logs, variant.json sidecars, render_meta preserved.

## Notes
- Full 20 unique geometry variants remain a next quality step; this repair uses file-backed team GLBs plus per-instance scale/yaw/banner/spear variation for readable battlefield actors.
- Edo house style observed: restrained palette, mist as emotional space, single strong gesture (the charge), no bright game UI.
- Previous grey-cylinder artifacts from prior work order not used; everything traces to `samurai_character` recipe + recorded improvements.
