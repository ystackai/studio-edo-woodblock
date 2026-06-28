# Goal Execution Strategy — Asset Skill Smoke

**Work Order:** `work-order-asset-skill-smoke-edo-20260522`
**Game:** The Indigo Stutter (`drops/indigo-stutter/`)
**Date:** 2026-05-22

## Strategy

Minimal proof-of-concept integration of FactoryX-generated assets into the existing Edo game.

1. **Confirmed existing game boots** — Puppeteer smoke test: start button visible, click starts water-rise animation, no fatal JS errors.
2. **Verified asset service health** — `GET /health` returned ok=true, Flux (ComfyUI) and MMAudio available.
3. **Requested a proof pack** — POST to `/v1/proof-pack` with Edo-themed prompt.
4. **Downloaded 3 generated assets:**
   - Flux-generated ukiyo-e background image (PNG, 449KB)
   - MMAudio-generated water-drop SFX (WAV, 61KB)
   - HeartMuLa procedural ambient loop (WAV, 352KB)
5. **Integrated into game:**
   - Background image loaded as `#generated-bg` div at 25% opacity behind all game layers.
   - MMAudio waterdrop replaces the procedural wet-drop sound when loaded; graceful fallback to procedural noise.
   - HeartMuLa ambient loop plays during the water-rise phase; silent fallback if audio blocked.
6. **Re-verified** — Browser smoke test passed: no asset 404s, no page errors, background visible at correct opacity.

## Risk Decisions

- Kept this as a smoke, not a full art pass. One background image + two audio assets.
- All audio is user-gesture triggered (play starts on click) — no autoplay policy violations.
- Fallback to procedural assets if generated ones fail to load.
