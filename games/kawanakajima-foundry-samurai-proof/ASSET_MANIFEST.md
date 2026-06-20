# ASSET_MANIFEST — kawanakajima-foundry-samurai-proof (work-order-1781913967751-7-1)

**Work Order:** work-order-1781913967751-7-1  
**Experiment:** samurai-foundry-correction-v4  
**Foundry Job (source):** asset-1781913507610-bf69e595  
**Date:** 2026-06-20  
**Status:** Browser proof built with live Foundry GLB. 20 actors via clone+pose variants. Self-verification cameras implemented. Visual review gate active.

## Foundry Source Assets (downloaded live from API)
All preserved under `games/kawanakajima-foundry-samurai-proof/assets/generated/foundry/samurai/` and mirrored to `assets/` for the proof:

- `samurai_character.glb` (1.2 MB) — primary production asset. 268 meshes, 13 materials, detailed kabuto/mempo/sode/kusazuri/kote/hakama/tabi/katana/saya/sashimono. No animations/skins (static pose base).
  - Provenance: http://factoryx-edo-woodblock-asset-foundry:18113/outputs/asset-1781913507610-bf69e595/samurai_character.glb
  - Integration: loaded via THREE.GLTFLoader as single source; 20 clones with transform/pose variants + additive props only. Base materials untouched.
- `samurai_character_source.blend` (4.4 MB)
  - Provenance: http://factoryx-edo-woodblock-asset-foundry:18113/outputs/asset-1781913507610-bf69e595/samurai_character_source.blend
- `samurai_character_contact_sheet.png` (486 KB, 840×1140 RGB)
  - Provenance: .../samurai_character_contact_sheet.png
  - Used in-game: review panel for direct visual comparison during INSPECT ASSET.
- `samurai_character_hero.png` (907 KB)
  - Provenance: .../samurai_character_hero.png
  - Used: thumb + reference in review panel.
- `samurai_character_turntable.gif` (749 KB)
  - Provenance: .../samurai_character_turntable.gif

## Game Proof Location
`games/kawanakajima-foundry-samurai-proof/index.html` (preview entrypoint per payload)

## 20 Samurai Construction
- Single Foundry GLB cloned 20× (10 takeda left, 10 uesugi right).
- Variants created exclusively via:
  - Pose transforms on named parts (left/right armored upper arm, kote, gloved hand, kabuto helmet bowl, sashimono pole/cloth/bar).
  - Small scale (0.96–1.01), formation stagger, body lean, banner tilt.
  - Additive external props (simple yari/spear) on 1/3 of actors — never mutating or replacing katana/saya or core meshes.
- Base GLB materials, emissives, and geometry 100% preserved and inspectable at close cam.
- No hand-authored placeholder geometry for hero characters.
- Formation: opposing lines ~1.22 spacing, staggered depth, readable silhouettes at review cameras.

## World / Environment (file-backed in scene)
- Layered ground planes + distant hills (ink-tone paper/earth).
- Sparse stylized pines (low-face cones + cylinders, restrained palette).
- Scattered low stones.
- Atmospheric: FogExp2 + cool key/rim lighting (no saturated keys).
- All per Edo house style: ink restraint, silhouette priority, ma via fog/distance.

## Audio
Foundry audio job `asset-1781916330853-f7d831d9` is preserved under
`games/kawanakajima-foundry-samurai-proof/assets/generated/foundry/audio/asset-1781916330853-f7d831d9/`
and mirrored into playable filenames under `assets/audio/`.

- `assets/audio/battlefield_loop.wav` (5.2 MB, 30.968s) — mirrored from `music_v2/cozy_bunny_tracker_loop_v2.wav`; looped by the AUDIO button/key.
- `assets/audio/charge_cue.wav` (124 KB) — mirrored from `sfx_v2/pickup_chime_bright.wav`; played when CHARGE is triggered while audio is enabled.
- `assets/audio/clash_accent.wav` (72 KB) — mirrored from `sfx_v2/soft_impact_puff.wav`; played by CLASH button/key and after charge.
- `assets/audio/ui_confirm.wav` (83 KB) — mirrored from `sfx_v2/ui_confirm_glass.wav`; confirms audio enable.
- `assets/audio/formation_step.wav` (59 KB) — mirrored from `sfx_v2/bunny_hop_plush.wav`; played on REFORM while audio is enabled.
- Raw source/evidence retained: `cozy_bunny_loop_v2.mod`, `cozy_bunny_tracker_loop_v2.arrangement.json`, `music_v2_waveform.png`, `sfx_v2_waveforms.png`, `summary.json`, `status.json`, and `spec.json`.

Limit: the current Foundry audio recipe is generic and filenames are cozy-bunny themed; the playable mirrors document their battlefield use without hiding the source provenance.

## Inspection / Review Mode
- 6 repeatable cameras (OVERVIEW, RED CLOSE, BLUE CLOSE, SIDE PROFILE, TOP FORMATION, INSPECT ASSET).
- Click any samurai or INSPECT ASSET or key `6` → close three-quarter framing on base asset + auto-opens contact sheet panel for side-by-side human comparison of silhouette, lamellar plates, mempo, crest, sashimono mon, tabi, katana.
- TOGGLE CONTACT button and `T` key.
- Presets also bound to 1-6 keys.
- All cameras preserve large focal asset size for visual judgment (no tiny silhouettes).

## Self-Verification Cameras (used in loop)
1. overview — wide tableau establishing 20 + countryside.
2. redClose — Takeda side, characters large and readable.
3. blueClose — Uesugi side.
4. sideProfile — formation edge-on.
5. topFormation — overhead for spacing/arrangement.
6. assetInspect — close on unmodified Foundry hero for material/silhouette gate.

## Blockers
- **Unity:** Unity CLI exists, but no Unity Editor/project listener is installed and `/cache` only has 4.5G free. No Unity project or build was created or claimed. This PR remains the browser/Three.js review proof plus Unity handoff. See `UNITY_BLOCKER.md`.
- No per-actor unique Blender variants beyond pose/scale (single source GLB used for fidelity; variants are runtime transforms only — acceptable per "use the Foundry GLB as the base visual asset").
- Visual gate (via WORKER_RUNTIME_VISION_REVIEW_MODEL + gateway): close-up review renders read as having blocky/cylindrical limbs, flat paddle feet, and stylized helmet forms (same as source contact sheet). This is a characteristic of the delivered Foundry asset rather than placeholder geometry. Large framing + contact comparison panel provided so human reviewer can judge directly. No hand-made geo substituted.

## Self-Verification Loop
1. Established repeatable cameras: overview, redClose (Takeda focal), blueClose (Uesugi focal), sideProfile, topFormation, assetInspect (close three-quarter on unmodified actor + contact panel).
2. After lighting/ground tweaks + camera merge forward + each structural pass: re-ran capture-views.sh + node verify.js.
3. Least realistic issue identified via vision + pixel analysis on 1280x800 shots: stylized low-poly forms read somewhat cubic/cylindrical at distance (source GLB property). Earlier wide captures hit the loading state; the capture gate now waits for all 20 actors plus two rendered frames before marking a camera ready.
4. Improvements: boosted rim/ambient/ground for base nonblank visibility + early renderer.render; repaired URL-camera capture readiness; kept Foundry GLB 100% unmodified; inspection mode for side-by-side.
5. Best version preserved. Deliverable not called "final prod art" — explicit browser review proof. Do not accept if review cameras show unreadable dots; current evidence uses large close views of the live asset.

## Evidence
- Direct download logs: 200 responses, exact byte sizes above.
- `samurai_character.glb` node names confirm anatomy (kabuto, mempo, sode, kote, tabi, katana blade, sashimono cloth, etc.).
- Browser loads: 20 actors, no 404 on GLB, first viewport shows non-blank 3D with camera framing subject.
- Contact sheet + hero committed and referenced in-game.
- Vision gate query saved in work order context (see WORKLOG).
- ASSET_MANIFEST + this file in `.factoryx/work-orders/work-order-1781913967751-7-1/`.
- Good review shots: overview.png (139k), sideProfile.png (240k), topFormation.png (101k), redClose.png (353k), blueClose.png (246k), assetInspect.png (406k). All six repeatable cameras show real scene content, and the close/inspect views keep samurai large enough for silhouette/material judgment.

## Integration Points
- `index.html` loads `assets/samurai_character.glb` relative.
- `index.html` loads file-backed WAVs from `assets/audio/`, exposes `audioPaths` and `hasFileBackedAudio` on `window.KAWANAKAJIMA_FOUNDRY`, and wires AUDIO/CLASH controls plus charge/reform cues.
- Review panel embeds the exact contact/hero PNGs.
- Exposed `window.KAWANAKAJIMA_FOUNDRY` for harness (actorCount, doCharge, applyCam, getCanvas, audioPaths, hasFileBackedAudio).
- Preview path: `games/kawanakajima-foundry-samurai-proof/`

Do not call deliverable acceptable while characters read blocky from review cameras. Current passes use the detailed 268-mesh Foundry source with readable close framing. Vision confirmed source fidelity but flagged stylized readability as the visible issue (recorded, not hidden).
