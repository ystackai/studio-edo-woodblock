# ASSET_MANIFEST — Kawanakajima Autonomous Samurai Proof

Work Order: work-order-1781907951905-7-16

## Baseline (live Asset Foundry)
- Job ID: `asset-1781910294741-3c2a83a8`
- Recipe: `samurai_character`
- API: http://127.0.0.1:18113
- Prompt: `/goal`-style repair prompt after user visual rejection (believable game-ready samurai, kabuto/dark mempo/curved lamellar/katana/sashimono/sandals, explicitly avoid Minecraft/block-art silhouettes)
- Outputs captured:
  - `samurai_character.glb` (1.2 MB)
  - `samurai_character_source.blend` (4.5 MB)
  - `samurai_character_hero.png`, front, left, rear, top, three_quarter (stable inspection cameras)
  - `samurai_character_contact_sheet.png`
  - `samurai_character_turntable.gif`
  - `summary.json`
- Provenance: regenerated fresh via Asset Foundry API from the patched v3 recipe, then used to replace the visually rejected blockier baseline.

## Team Variants (20 actors, materialized from baseline)
- 10 Takeda (oxblood dominant lacquer + banner)
- 10 Uesugi (indigo dominant)
- Method: loaded v3 baseline source .blend in Blender, applied team color shifts to lacquer/cloth/banner materials + slight unique rotations per figure, exported fresh GLBs.
- Files: `assets/actor-takeda-00.glb` … `actor-takeda-09.glb`, `actor-uesugi-00.glb` … `actor-uesugi-09.glb`
- All GLBs ~1.2 MB each, self-contained, no external texture deps.

## Integration
- All 20 loaded by relative path in `games/kawanakajima-autonomous-samurai-proof/index.html`
- Three.js r128 + GLTFLoader (local copies for standalone)
- Scale 1.08 chosen after visual review so figures read as armored humans at the repaired close camera distance.
- No hand-authored placeholder models; all from v3 Foundry baseline + Foundry-derived variants.

## Verification evidence
- See `evidence/verification.json`
- Screenshots in `screenshots/`: initial-formation.png, after-charge.png, reformed.png
- Browser runtime: 20 actors, 0 page errors, 0 console errors, charge mutated state, first screenshot uses close readable framing instead of the original dark wide shot.

## File list (under games/kawanakajima-autonomous-samurai-proof/)
```
assets/
  actor-*.glb (20)
  samurai-baseline.glb
  samurai-baseline-source.blend
  samurai_character_contact_sheet.png
  samurai_character_turntable.gif
  baseline-summary.json
  + view pngs + turntable frames
screenshots/*.png
evidence/verification.json
```
## Unity
See UNITY_BLOCKER.md (Unity not present or licensed in this runtime).
