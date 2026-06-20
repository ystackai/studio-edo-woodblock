# Preview — Kawanakajima Foundry Samurai Proof (work-order-1781916431833-7-15)

**Work Order:** work-order-1781916431833-7-15  
**Target repo:** ystackai/studio-edo-woodblock  
**Canonical entrypoint:** `games/kawanakajima-foundry-samurai-proof/` (or index.html directly)  
**Continues PR:** https://github.com/ystackai/studio-edo-woodblock/pull/161 (branch factoryx/factory-edo-woodblock/work-order-1781913967751-7-1 updates via this WO branch)

## How to preview
- Direct: open `games/kawanakajima-foundry-samurai-proof/index.html`
- Factory previews under the game path.
- The preview root opens the 3D proof directly.

## What the review sees
- 20 samurai (10 Takeda vs 10 Uesugi) using live Foundry GLB asset-1781913507610-bf69e595.
- File-backed audio: battlefield_loop (music), charge_cue / clash_accent / ui_confirm (sfx) from Foundry job asset-1781916330853-f7d831d9. Controls for music/sfx; triggers on gestures. (Limitation if cozy: documented, still file not osc.)
- Richer Japanese countryside: layered ground, multiple pine depths, path/fields, fog, ink-tone.
- Faction differentiation via additive props and pose bias (no GLB re-tint).
- Formation readable with thin reference lines.
- 6 repeatable cameras (1-6 or buttons): overview, redClose, blueClose, sideProfile, topFormation, assetInspect. Close cams keep samurai large for silhouette/material review + contact sheet.
- Controls: orbit drag, wheel zoom, click to inspect, CHARGE/REFORM, audio toggles.
- First viewport non-blank with framed subject.

## Assets
- Samurai + all 5 outputs from asset-1781913507610-bf69e595.
- Audio outputs from asset-1781916330853-f7d831d9 under generated/foundry/audio + playable mirror.
- See ASSET_MANIFEST.md (WO + game).

## Unity
UNITY_BLOCKER.md: runtime has no usable Unity Editor (0.1.0-beta.7 stub, no editors, low disk). Honest browser proof only.

## Evidence
Screenshots captured to work-order-1781916431833-7-15/screenshots/ and game/screenshots/ after each significant polish pass. Only nonblank, actual-content shots committed.

Do not approve if cameras show unreadable tiny/dark/blocky figures.
