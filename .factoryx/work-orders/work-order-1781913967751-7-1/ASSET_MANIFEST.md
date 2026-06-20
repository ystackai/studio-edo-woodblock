# ASSET_MANIFEST — work-order-1781913967751-7-1

**Factory:** factory-edo-woodblock  
**Project:** edo-woodblock  
**Role:** coder1  
**Foundry Job:** asset-1781913507610-bf69e595  
**Title:** Correct blocky Samurai proof with live Foundry asset

See the authoritative copy under the deliverable:
`games/kawanakajima-foundry-samurai-proof/ASSET_MANIFEST.md`

## Key Downloaded Assets (live API)
- samurai_character.glb (1.2M) — http://factoryx-edo-woodblock-asset-foundry:18113/outputs/asset-1781913507610-bf69e595/samurai_character.glb
- samurai_character_contact_sheet.png, samurai_character_hero.png, samurai_character_turntable.gif, samurai_character_source.blend

All committed to `games/kawanakajima-foundry-samurai-proof/assets/generated/foundry/samurai/`

## Verification Evidence Location
- Screenshots captured under this dir: `.factoryx/work-orders/work-order-1781913967751-7-1/screenshots/`
- Browser runtime exercised via local server + chromium.
- In-game contact sheet comparison implemented.

## Remaining Blockers
- Audio: file-backed audio not available (documented).
- Unity: see UNITY_BLOCKER.md (also mirrored).
- No further generated variants from Blender in this pass (single high-fidelity source preserved).
- Visual: vision gate on close shots notes the Foundry source asset renders with stylized (cylinder-limb, flat foot) forms that can read blocky; faithfully reproduced at large scale in review cameras + contact comparison; recorded, not substituted. See game ASSET_MANIFEST + WORKLOG for full vision response.

## PR Requirements (from payload)
- github_pr
- preview_url_if_available (games/kawanakajima-foundry-samurai-proof/)
- review_summary
- screenshots
