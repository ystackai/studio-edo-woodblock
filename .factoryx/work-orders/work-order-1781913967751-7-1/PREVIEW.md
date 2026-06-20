# Preview — Kawanakajima Foundry Samurai Proof (work-order-1781913967751-7-1)

**Work Order:** work-order-1781913967751-7-1  
**Target repo:** ystackai/studio-edo-woodblock  
**Canonical entrypoint:** `games/kawanakajima-foundry-samurai-proof/` (or index.html directly)

## How to preview
- Direct: open `games/kawanakajima-foundry-samurai-proof/index.html` (file:// ok for verification).
- Factory previews: served at the game path under `/factoryx/previews/...`.
- Do not use root index or games/ catalog as the primary review target.
- The preview root opens the 3D proof directly.

## What the review sees
- First viewport: non-blank 3D Japanese countryside tableau with 20 samurai (10 per side) using the live Foundry `samurai_character.glb` (asset-1781913507610-bf69e595).
- Default camera: cinematic low/shoulder, rule-of-thirds framing into the meeting/battle lines. Fog + layered ground + sparse pines for depth and atmosphere per house style.
- Characters are large enough in close views to judge silhouette, lamellar armor, mempo, kabuto crest, sashimono banner, katana, tabi.
- Controls: drag to orbit, wheel zoom, click any samurai to inspect. Bottom bar and 1-6 keys select repeatable verification cameras.
- Buttons: OVERVIEW / RED CLOSE / BLUE CLOSE / SIDE / TOP / INSPECT ASSET + CHARGE / REFORM + TOGGLE CONTACT.
- INSPECT ASSET + contact toggle: locks close on a Foundry asset instance and opens side panel embedding the exact `samurai_character_contact_sheet.png` + hero render for direct visual comparison. Human can match forms against the Foundry sheet.
- Interaction: CHARGE moves lines inward with lean; REFORM resets formation. Idle bob + wind animation on banners.
- 20 variants via pose (arm raises/guards, head turns, banner tilts, leans, small additive spears on some) + scale/formation — base GLB materials and geometry unmodified.
- Palette restrained (ink, paper, deep earth, cool lights). No bright saturated keys or Minecraft block reading.

## Verification cameras (repeatable)
1. OVERVIEW (1)
2. RED CLOSE (2) — Takeda side large
3. BLUE CLOSE (3)
4. SIDE PROFILE (4)
5. TOP FORMATION (5)
6. INSPECT ASSET (6) — close + contact sheet visible

## Assets integrated
- Live Foundry GLB + all 5 outputs committed with provenance URLs.
- Contact/hero PNGs embedded for in-game review gate.
- See ASSET_MANIFEST.md for full list, sizes, integration.

## Evidence captured
Screenshots in `.factoryx/work-orders/work-order-1781913967751-7-1/screenshots/` (and game local if present) after each pass.

## Blockers noted
- No file-backed audio (documented).
- Unity unavailable (see UNITY_BLOCKER.md).
- This is the browser Three.js proof pending any later Unity port.

Do not approve if any review camera shows characters as blocky cubes, capsules, disks, or unreadable dark dots.
