# WORKLOG: work-order-1781907951905-7-16

**Title:** Autonomous proof: Kawanakajima 20 samurai foundry world

**Branch:** factoryx/factory-edo-woodblock/work-order-1781907951905-7-16

**Started:** 2026-06-19 ~22:25 UTC

**Original Foundry baseline job:** asset-1781907989449-2310d4ab
**Replacement Foundry baseline job:** asset-1781910294741-3c2a83a8

## 2026-06-19 Timeline

- Verified /healthz and /api/recipes on http://127.0.0.1:18113. samurai_character recipe confirmed (matches goal exactly: kabuto, mempo, lamellar, katana, sashimono, etc).
- Unity not present anywhere in PATH or common install locations → will emit UNITY_BLOCKER.md + clean scaffold under unity/.
- Submitted fresh baseline job using exact /goal prompt. Recorded job_id.
- Submitted 5 additional fresh variant jobs (will use for more provenance or fallback).
- Baseline GLB (1.2MB) + source .blend materialized early by recipe. Renders for contact sheet/turntable/cameras running (slow in shared CPU env with parallel blenders; ~14 pngs done).
- Copied baseline GLB + source + available camera PNGs into games/.../assets/ as usable baseline.
- Will poll to full complete for summary/contact/turntable GIF. Meanwhile generate 19 team variants by loading baseline .blend in Blender, tinting key materials (lacquer/cloth/banner for 10 oxblood Takeda vs 10 indigo Uesugi), re-exporting distinct GLBs.
- games/ was near-empty (only redirect). drops/ has one prior 2D "indigo-stutter" canvas piece.
- No package.json; will build self-contained browser demo using CDN three.js + local GLTFLoader for zero-install play.
- Next immediate: implement Three.js countryside scene under the target path, load all 20 GLBs, implement orbit/zoom + charge/reform/inspect, add simple terrain/fog for Japanese field readability, frame close, add team coloring via material overrides or distinct models.
- Then Playwright HTTP verification (serve locally, capture screenshots + state JSON + console errors), produce required .md files, PR.

## Visual notes
- Samurai model from recipe: uses spheres for volumes + plate rows + curves for lacing/katana/sashimono. Materials: oxblood lacquer, indigo cloth, iron, brass. Avoids cylinder stacks and paddle feet per prompt. Sashimono banner present.
- Will verify in game camera that they read as distinct armored human figures (not blobs/blocks) before final.

## Artifacts tracked
- Baseline job dir: /cache/factory-edo-woodblock/asset-foundry/outputs/asset-1781907989449-2310d4ab
- Game: games/kawanakajima-autonomous-samurai-proof/ (self-contained index.html + 20 actor GLBs + baseline + contact/turntable)
- Required docs emitted under .factoryx/work-orders/work-order-1781907951905-7-16/ : ASSET_MANIFEST.md, PREVIEW.md, VERIFICATION.md, WORKLOG.md, UNITY_BLOCKER.md
- Screenshots + verification JSON produced via Playwright over HTTP

## Completion
- All 20 actors loaded from fresh Foundry-derived GLBs.
- Playwright verification: 20 actors, 0 errors, charge mutates state, non-blank canvas (variance confirmed on PNGs), screenshots captured.
- Original autonomous screenshot was too dark and wide, making the samurai read as tiny blocks despite valid GLBs.
- Operator repair on 2026-06-19 patched the default camera/lighting/scale and regenerated screenshots locally; repaired first screenshot now frames readable samurai in countryside (armor, banners, swords, body silhouettes visible).
- Unity unavailable → blocker + scaffold only.
- Worker failed before PR creation because runtime GitHub auth was unavailable; this branch is a local salvage branch for review.
- User visual review rejected the earlier crowd assets as Minecraft/block-art. Operator patched Asset Foundry's samurai recipe to use thinner curved/tapered armor plates and a darker mempo mask, pushed that recipe fix to Asset Foundry main, then regenerated baseline job `asset-1781910294741-3c2a83a8` through the live API.
- Replaced the deliverable baseline, stable camera renders, turntable, source blend, and all 20 actor GLBs with v3 Foundry outputs; the result is still stylized/funny, but the characters read more clearly as armored samurai in the game camera.
- Local game: games/kawanakajima-autonomous-samurai-proof/
