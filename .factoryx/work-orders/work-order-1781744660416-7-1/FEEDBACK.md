# FEEDBACK — Discord Deliverable Kickoff: Pictures of the Floating World (work-order-1781744660416-7-1)

**Status:** Strategy gate complete. Implementation has not started. This file seeds durable playtest / operator / asset feedback for the new kickoff.

## Relevant prior operator playtest + asset feedback (from Lantern Surf Courier, work-order-1781512090026-8-74)

All notes below are treated as product and art-direction context. Address relevant items before unrelated polish on the new deliverable.

### Blocking playtest (readability / feedback / flow)
- Preserve the woodblock / ukiyo-e courier/wave identity exactly (strong silhouettes, ink/paper, vermilion accents, restraint). Next passes should improve readable play and obvious rules, not repaint.
- Make collection/collision rules obvious (aperture bars, large legible elements, drawn X fail at exact site).
- Crisp success/fail feedback (+N pops, particles, X stamps).
- Bigger, more legible central elements at speed (letters 32x20 logical, wider crests).
- Clearer impact/collection, satisfying jump/surf momentum, visible speed ramp, better retry flow.
- First screen + interaction must be coherent without extra explanation; evaluable quickly.

### Blocking asset-pipeline feedback (2026-06-15T17:25:25Z — verbatim)
"the current seven-factory batch is relying too much on code-rendered canvas/SVG/vector placeholders and sparse oscillator/blip audio. Before the next accepted polish pass, inspect existing foundry or asset directories and reuse finished assets when present; otherwise create a local generated/authored asset or a deliberate procedural art/music system and document it in ASSET_MANIFEST.md in the Work Order context. Central heroes, enemies, worlds, and music-led moments should not remain throwaway vector blobs or oscillator-only bleeps. If foundry/asset generation is not exposed in this runtime, record that as a blocker instead of silently substituting placeholders."

**Addressed in prior run by:** explicit inspection log + deliberate authored procedural system (paperGrain, wave sampler, large drawCourier with satchel/seal/robe, lantern gates with aperture bars, large sealed letters, crests/yokai, winds, drawn X pops, designed SFX) + full ASSET_MANIFEST.md. Recorded "no foundry exposed".

**For this new Work Order (Kawanakajima samurai):**
- The human Discord brief explicitly asks to "use the Asset Foundry to generate the assets".
- Per payload requirements: prefer foundry assets under assets/generated/; otherwise create local generated/authored **file** assets (not just in-code). In-code procedural can support but does not satisfy generated_assets by itself.
- Strategy records the plan: use available image generation (GenerateImage / foundry exposure) to produce 20 real PNG files for the samurai (10 Takeda + 10 Uesugi), place under the game asset dir, document prompts + provenance in this WO's ASSET_MANIFEST.md.
- If foundry access is limited during execution, document the limitation plainly and do not claim full generated_assets coverage while central heroes remain code-only.

## This Work Order context
- New deliverable: generate 10 samurai each from Takeda vs Uesugi for Battles of Kawanakajima.
- Must produce a coherent user-facing creative_game artifact where the central subject (the 20 samurai prints) and first interaction are clear without extra explanation.
- Must fix the prior-run preview/runtime verification skip (no preview entrypoint resolved).
- House style and "ukiyo-e that can be touched" philosophy apply fully.
- Preserve working artifacts (lantern-surf-courier, inkblade, existing structure). Do not overwrite.

## Review / admin input
- None yet for this specific id. When any CHANGES_REQUESTED, admin comments, or live-preview feedback appears on the canonical PR, treat as blocking before peripheral work.
- Primary review questions (from payload):
  1. Does the result satisfy the concrete brief?
  2. Is the interaction coherent enough for a user to evaluate without extra instructions?
  3. Do the art and music assets feel intentional enough for the game concept, especially heroes, enemies, and boss moments?
  4. Are verification steps and known limitations clearly documented in the PR?

## Other durable notes
- All feedback and strategy notes for this Work Order live under `.factoryx/work-orders/work-order-1781744660416-7-1/`.
- Read this file (and the primary lantern FEEDBACK) before each polish pass.
- Record new playtest or operator input here as it arrives.

## Implementation checkpoint (2026-06-18)
- 20 real generated file assets (Takeda 10 + Uesugi 10) produced via GenerateImage + integrated.
- Coherent playable slice: reveal-as-brush + stage-the-instant, first screen clear, real assets (not blobs).
- `.factoryx/preview-entrypoint` + verif run clean with screenshots showing generated JPGs in roster and clash.
- All on canonical branch only; PR body to carry full prompt + Work Order Context.
- Addressed blocking asset feedback and prior preview skip before polish.

*This file is append-only for durable context. Do not use it for transient scratch.*
