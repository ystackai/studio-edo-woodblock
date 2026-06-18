# GOAL_EXECUTION_STRATEGY — Discord Deliverable Kickoff: Pictures of the Floating World

**Work Order:** work-order-1781744660416-7-1  
**Factory:** factory-edo-woodblock (Pictures of the Floating World)  
**Branch:** factoryx/factory-edo-woodblock/work-order (canonical only; no parallel FactoryX branches)  
**PR:** existing #151 (keep current; include full prompt + Work Order Context section with this id)  
**Archetype:** creative_game  
**Deadline:** 2026-06-18T17:03:23Z (polish_until_deadline; do not stop at first reviewable)  
**Completion mode:** polish_until_deadline  
**Source:** automation interaction-feedback-sync (human Discord kickoff by gvr5105)  
**Primary playtest/feedback context:** `.factoryx/work-orders/work-order-1781512090026-8-74/FEEDBACK.md` (read before each pass; treat asset + readability notes as blocking before peripheral polish)  
**Previous run issue to address:** browser runtime verification skipped (no preview entrypoint resolvable). Must add `.factoryx/preview-entrypoint` (and/or payload) + ensure direct entrypoint serves the artifact.

---

## Vision and player fantasy

The viewer is not a general commanding troops in a modern RTS. The viewer is a late Edo master printer standing in the studio at the charged instant before the block is pulled. The fantasy is *bringing the floating world’s warriors into being* — 10 Takeda and 10 Uesugi samurai rendered as real ukiyo-e prints that can be touched, arranged, and witnessed in their moment of tension.

The human request is concrete: generate 10 samurai each from the Takeda and Uesugi clans for use in a game called Battles of Kawanakajima, using the Asset Foundry. The deliverable makes that request legible and reviewable in one coherent artifact: the first screen presents the two rival camps as living prints; the central interaction is the act of “commissioning / revealing / staging” the prints so that the 20 figures feel authored, distinct, and ready for the historical clash.

Success looks like: a reviewer opens the preview, immediately sees “these are the Takeda vs Uesugi samurai for Kawanakajima”, can reveal and stage them without instructions, and the result feels like a deliberate Edo artifact rather than a game menu or asset dump.

---

## Mood, world, references, and emotional target

**House style (non-negotiable):** see `.factoryx/FACTORY_CONTEXT.md`. Ink primary, restrained palette (sumi black, warm paper #f8f4eb, faint indigo, vermilion accents for seals/crests), strong silhouettes with feathered or mist-eaten edges, paper texture and fiber memory, meaningful emptiness (ma), the moment before the gesture.

**References (for art direction and prompts):**
- Yoshitoshi and other warrior musha-e prints (bold black line, limited color, dramatic but dignified stance).
- Hiroshige atmospheric distance and weather as emotional ground.
- Utamaro figure observation for individual character in faces, hands, armor details.
- Historical Kawanakajima (especially 4th battle) for names, crests (mon), weapons, but stylized — not literal reenactment illustration.

**Emotional target:** quiet dignity + the sweet melancholy of *mono no aware*. Valor that will not last. The beauty of the print that already feels slightly faded at the moment of completion. Never cute, never bombastic, never “game-y” in the bright modern sense. The interaction rewards attention and repeated gentle engagement, not frantic clicks.

The “game” is the print being made. The player is the final carver.

---

## Core interaction loop and progression

**First screen (must be self-explanatory in <5s):**
- Split or diptych composition: left camp Takeda (vermilion/black mon accents), right camp Uesugi (indigo tones).
- 5–6 visible portrait “woodblocks” per side (rows or arc), initially as faint ink sketches or mist-veiled silhouettes on paper ground.
- Large title treatment in restrained ink: “Battles of Kawanakajima” or “Takeda vs Uesugi — Ten Prints Each”.
- Subtle prompt integrated in the print (margin caption or first-figure telegraph): “Brush to pull the print” or equivalent that reads as part of the world, not UI chrome.
- One or two already-pulled exemplar samurai (large, readable) to anchor the visual language immediately.

**Core verb (the “Asset Foundry” enacted):**
- Pointer (mouse/touch) acts as the baren / brush. Hover or drag over a veiled figure → ink flows, details resolve (face, helmet crest, armor plates, weapon, subtle vermilion seal or mon). This is the generation/reveal moment.
- Click or sustained contact on a fully revealed samurai selects it and “brings it forward” into the confrontation stage (center or lower band).
- In the stage: two chosen samurai (one Takeda, one Uesugi) face in a small charged composition. Light interaction: adjust stance slightly (3–4 discrete carved poses per figure), or trigger “the instant” (a single telegraphed clash or parry with ink-splash feedback and paper tremor). The outcome is not a score or winner banner; it is a new still print of that pairing that the viewer can hold.
- Reveal order matters for progression: first 4–6 are easy seeds for verification and quick understanding; later ones require slightly more sustained attention or combinations to fully resolve (adds “craft” feeling without complexity).
- Optional light roster complete: when all 20 have been pulled at least once, a quiet final seal or collective banner can appear in negative space — earned, not announced.

**Arc in 30–90s:**
- 0–8s: first screen reads as two beautiful opposing prints; one or two figures already legible.
- 8–25s: player reveals 3–4 more; discovers that sustained contact deepens the print (more line weight, slight color memory).
- 25–60s: stages at least one Takeda vs Uesugi confrontation; sees the key moment rendered; can swap figures to stage another.
- 60s+: returns to roster, notices paper/ink variations, subtle clan personality differences; optional full-roster still life.

No instructions screen. No floating “how to play”. Affordances live in the image (thirsty paper zones, stronger line on key figures, approach glow or fiber shift on interactables).

**Progression / scope for timebox:**
- MVP: 20 distinct generated file-backed portraits (10+10), reveal interaction, staging of at least one pair with a single “clash instant”, clean first-screen coherence.
- Polish passes: more generated variants/poses if budget, richer ink-over-canvas composites, sparse audio, better telegraph and feedback, contact-sheet evidence, ASSET_MANIFEST provenance.

---

## Art / audio / interaction direction (intended visual + musical identity)

**Visual identity:**
- Every samurai must read as a deliberate ukiyo-e woodblock print, not a digital character sprite.
- Strong black sumi outlines, limited overprint color (vermilion for Takeda emphasis, indigo for Uesugi, faint gold or green for specific mons), paper shows through.
- Differentiation via: helmet/crest shape (maedate), facial hair/age/expression, weapon silhouette (yari, no-dachi, bow, tessen), armor style (ō-yoroi vs dō-maru hints), clan mon placement, subtle weather/mist treatment per figure.
- 10 Takeda: vary by role (vanguard, commander, monk-soldier, archer, etc.) while keeping clan cohesion.
- 10 Uesugi: similarly varied; Kenshin-inspired commander figure as capstone.
- Ground and framing: consistent handmade paper (fiber + subtle prior-ghost prints), distant mountains or torii for ma, minimal camp elements (banners as negative-space silhouettes, not clutter).
- Effects: ink bleed on reveal, fiber lift on brush, vermilion seal “stamp” pop on full resolve or perfect stage, soft mist drift. All feel physical and restrained — no video-game particle fountains.

**Musical / sonic identity (Tsutaya voice):**
- Sparse, gesture-gated only. No looping beds, no constant music.
- Reveal: soft brush-drag + paper-fiber texture (short filtered noise + low sine tail).
- Stamp/seal: quiet physical “thock” (designed saw+noise envelope, not beep).
- Clash instant: two low struck tones with ink-splash noise; very short decay.
- Clan difference: Takeda cues slightly warmer/brighter edge; Uesugi cooler/indigo-leaning. Subtle, almost felt more than heard.
- Toggle defaults off. First gesture enables context if sound is on. Matches house: sound is the memory of the block being lifted.

**Interaction feel:**
- Touch-as-carving: slight resistance (small delay or easing on full reveal), visible “wet” ink response that dries (settles).
- Not twitch. Reward lingering, re-visiting the same figure to see what more the paper remembers.
- Large touch targets; works on desktop pointer + touch + basic kbd (space/enter to stage, arrows or 1-0 to pick).
- All feedback (visual + audio) happens on the print itself; HUD minimal (perhaps faint count of “pulled prints” in margin ink, nothing that fights the paper).

---

## Real asset plan (authored / generated images, sprites, textures, UI, soundtrack cues)

**Inspection (performed before planning):**
- No `assets/generated/`, no mounted foundry outputs, `.ystack` asset manifest empty.
- No pre-existing samurai or Kawanakajima assets in workspace or usable /cache drops.
- No active MCP asset/foundry tool visible in current runtime for direct generation calls from code (prior lantern run recorded the same).
- Existing games (lantern-surf-courier, inkblade) are self-contained single-file canvas; pattern to preserve for coherence and preview simplicity.
- Per requirement 4 and prior blocking asset feedback (2026-06-15T17:25): in-code procedural alone does **not** satisfy generated_assets. Central heroes must have concrete file-backed assets with provenance.

**Chosen approach (real assets, not silent placeholders):**
- Primary portraits: 20 individual generated image files (PNG, ~300–420px logical on longest side, 2× for crisp) placed under `games/94-kawanakajima/assets/` (or `assets/generated/` if convention emerges). One file per samurai, named e.g. `takeda-01.png`, `uesugi-03.png`.
- Supporting generated assets (as budget allows in polish passes):
  - 1–2 paper ground textures or subtle fiber overlays (or deliberate procedural paperGrain as in lantern, but documented).
  - 2–4 action/stance variants for the staged confrontation (or use transform + ink overlay on base portraits for first pass).
  - Simple diptych frame or camp banner silhouettes as additional generated or authored ink elements.
- Audio: synthetic sparse cues designed in-code (see direction above); if short real audio motifs become available via future foundry, swap documented in manifest. Do not use raw oscillators as identity.
- Generation method: use available image generation capability (GenerateImage or equivalent foundry exposure) with precise house-style prompts. Example skeleton prompt:
  > “ukiyo-e woodblock print, late Edo style, bold sumi ink outlines with slight feathering, limited palette of warm paper, black, vermilion red, indigo blue, faint gold, portrait of a Takeda samurai warrior, distinctive helmet crest, serious weathered face, yari spear, armor plates, strong silhouette against mist, white space, paper texture visible, high contrast, print from the Battles of Kawanakajima series, no modern effects”
- Fallback if generation service limited: create a smaller authoritative set (e.g. 6+6 key figures) as real files + use high-quality deliberate procedural for the remainder, explicitly documented as such in ASSET_MANIFEST.md with “no foundry exposed at time of creation” note. Do not call the deliverable complete while central 10+10 remain throwaway canvas drawings.
- Integration: `<img>` or Image elements preloaded, drawn into main canvas (or layered absolutely) with ink overlays, transforms for pose, and canvas post-effects (slight paper grain composite, mist). Keep the HTML+JS self-contained after load; assets relative.

**Source of truth:** `ASSET_MANIFEST.md` in this Work Order context directory (will be created/updated on asset pass). Each entry records: filename, dimensions, generation prompt or method, integration point in the html, verification evidence (screenshot showing the file in-scene, not just listed).

**Verification of assets:** browser runtime must load the PNGs successfully (no 404s), screenshots must show the actual generated files (not vector stand-ins) in the first-screen roster and in the staged clash.

---

## Character and creature art plan (embodied characters)

**Contact sheet / references (to be produced in impl):**
- 20 primary generated portraits (10 Takeda left camp, 10 Uesugi right camp) at consistent aspect and treatment.
- Key variants: at minimum the two clan commanders (Takeda Shingen-inspired, Uesugi Kenshin-inspired) get 1–2 additional action stances (ready, strike telegraph, parry) for the confrontation stage.
- Poses/frames needed: idle/revealed bust (roster), forward-stance (stage), clash-instant (shared or per pairing overlay).
- Silhouettes first: each figure must read at small roster size and at large stage size by crest/weapon/shoulder line alone.
- No “generic samurai blob”. Every one has a distinct mon, weapon, age, posture, or expression that tells a micro-story.

**Enemy / opposing force:** the other clan is the “rival”, not cartoon villains. When staged, both sides keep dignity; the drama is in the charged space between them.

**Asset manifest will list:**
- All 20 (or authoritative subset + note) with exact filenames.
- Any supporting ink elements (seals, mons, banner fragments).

---

## Placeholder retirement checklist

Before this artifact is presented as review-worthy:

- [ ] Any initial canvas-drawn or SVG “samurai” stand-ins retired in favor of the generated file PNGs for the 20 core figures.
- [ ] Any generic rect/gradient camps or flat color fields replaced by paper + generated or deliberately authored ink grounds.
- [ ] Any placeholder “beep” or single-oscillator audio replaced by designed sparse physical cues (or documented motif).
- [ ] Staged confrontation uses the real generated portraits + ink overlay, not abstract circles or lines.
- [ ] ASSET_MANIFEST.md exists and is the source of truth; lists concrete files with generation method and integration points.
- [ ] Screenshot evidence (ready + post-interact) shows the actual asset files in the live scene.
- [ ] If foundry access was unavailable for full 20, the manifest and PR body clearly state the limitation and what was used instead; the  central subject (the 20 samurai) is still carried by real files, not code-only.

Do not call the game review-worthy while heroes depend on throwaway placeholders.

---

## Engine, asset pipeline, controls, and verification implications

**Engine / implementation pattern (preserve working repo conventions):**
- Single-file self-contained `games/94-kawanakajima/index.html` (like lantern and inkblade).
- Canvas primary for the living layer (reveal ink flow, mist, stage composites, clash feedback).
- Static generated PNGs loaded as Image assets (relative paths) and composited.
- No build step, no external deps after initial load, works file:// and in preview trees.
- ~60fps target on modest hardware; keep draw cost reasonable (pre-render paper/grain once, batch where possible).

**Controls:**
- Primary: pointer drag/hold to reveal (brush), click/tap to select and stage.
- Secondary: keyboard (space/enter to trigger instant, number keys or arrows to pick, R to reset view).
- Touch-friendly: large targets, no scroll hijack on canvas, double-tap or zones if needed for secondary actions.
- First gesture also unlocks AudioContext if sound enabled.

**Preview entrypoint (addresses prior runtime skip):**
- Create `.factoryx/preview-entrypoint` containing exactly: `games/94-kawanakajima/index.html`
- The preview root must open the artifact directly (or tiny valid redirect). Do not append review links after </html>. Do not rely on studio homepage unless this WO explicitly changes it.
- Update `games/index.html` with a new section describing the piece (preserve existing lantern + inkblade links and copy style).

**Verification (must actually run, not skipped):**
- Real browser runtime (chromium headless or equivalent) on the direct entrypoint.
- Capture: pageerror, console.error, failed asset requests (images must 200), blank screenshots, post-start state.
- At minimum: ready screenshot showing first screen with multiple revealed samurai visible (file assets, not blobs), and one post-interact screenshot showing a staged Takeda vs Uesugi confrontation with real portraits.
- Expose `window.__KAWANAKAJIMA_STATE` or equivalent for harness introspection if helpful (as lantern did).
- Exercise image decode (no broken images) + at least one interaction path (reveal + stage).
- 9/9 Game Feel checklist + quality bar re-affirmed in VERIFICATION.md.
- Update `VERIFICATION.md`, `PREVIEW.md`, `WORKLOG.md` with commands, output, evidence paths, and known limitations.

**Browser/runtime note from prior run:** the missing preview-entrypoint was the direct cause of skip. We will create the file early, point it at the game dir entry, and verify the harness can resolve it before claiming “preview healthy”.

---

## What not to build

- Full 10-vs-10 real-time battlefield (too busy, fights the house restraint and ma).
- Complex AI, pathing, morale, or multi-phase campaign.
- Bright saturated UI, floating help, tutorial overlays, or “game chrome” that explains the print.
- Overwriting or forking the existing lantern-surf-courier or inkblade artifacts (preserve anything already working).
- Parallel FactoryX branch or second PR.
- Mutation of root `index.html` or public homepage just to surface the preview (use the preview-entrypoint + games/index.html instead).
- Relying solely on in-code procedural for the 20 samurai (violates generated_assets requirement).
- Audio that is constant, melodic, or “nice”; keep sparse, physical, user-initiated.
- Large binary bloat; keep total under a few MB even with 20+ PNGs (optimize or limit variants).

---

## Guiding tradeoffs, references/evidence, non-goals, progress updates

**Tradeoffs:**
- Breadth (all 20) vs depth: prioritize 20 distinct file-backed primary portraits first; richer per-figure animation or extra poses only in remaining budget. A smaller authoritative set with clear “generated via foundry” evidence is better than 20 blurry placeholders.
- Procedural support vs files: canvas ink overlays, paper grain, and reveal effects are allowed and encouraged to make the prints feel alive; they supplement, they do not replace the PNG sources of truth.
- Historical fidelity vs house legibility: use real clan names/mons for flavor, but simplify and stylize so silhouettes and paper read in small Discord thumbnails and large stills.
- “New repo” suggestion: human mentioned “you can create a new repo called edo-bok-ep1”; we honor the intent (the deliverable) inside the canonical studio-edo-woodblock on the designated branch only.

**Evidence to carry:**
- Generated asset contact sheet (or grid screenshot) of the 20.
- First-screen + staged-clash screenshots from real browser verification.
- ASSET_MANIFEST.md with prompts/methods + file list.
- PREVIEW.md and VERIFICATION.md updated with exact entrypoint, commands, and clean output.

**Non-goals (this budget):**
- Complete historical simulation of any specific Kawanakajima battle.
- Soundtrack or dense music.
- Mobile app parity, accessibility beyond basic keyboard/pointer, or production pipeline for future episodes (unless it falls out of the slice).
- Homepage takeover or catalog changes beyond adding the games/index.html link.

**Progress updates worth sharing publicly (for PR comments, Discord, etc.):**
- The 20 samurai contact sheet once generated (with short note on prompt craft that produced woodblock character).
- Before/after of a single figure “pulled” from veil to full print.
- One clean “Takeda commander vs Uesugi monk-soldier” staged instant screenshot that feels like it could be a real print.
- Note on how the reveal verb enacts the “Asset Foundry” request directly in the interaction.
- Any real blockers (e.g. foundry access limits) called out plainly with what was done instead.

---

## Scope & sequence (larger product steps first when risk high; small when uncertain)

1. Durable memory (this strategy + initial WORKLOG + FEEDBACK seed from prior + PREVIEW/VERIFICATION skeletons + empty ASSET_MANIFEST skeleton) — this gate.
2. Create game dir + `.factoryx/preview-entrypoint` pointing at `games/94-kawanakajima/index.html` + stub the index + update games/index.html (so preview can resolve and verif will not skip).
3. Generate or author the first 4–6 real portrait files (using available image gen) + integrate load + basic reveal on canvas. Verify images decode and appear in screenshots.
4. Expand to full 20 (or documented authoritative set) + paper ground + camp framing so first screen is already a complete quiet statement.
5. Add staging / confrontation interaction (select one from each side, trigger the instant). Make the key moment legible and beautiful.
6. Add sparse audio, juice/ink feedback, retry flow, margin captions. Self-playtest for “no extra explanation needed”.
7. Real browser verification (chromium direct on entrypoint) + fresh screenshots into this WO’s screenshots/ + update VERIFICATION/PREVIEW/WORKLOG.
8. Write/update ASSET_MANIFEST.md with full provenance.
9. Re-affirm definition of done, review questions, 9/9 checklist.
10. Commit on canonical branch, push, keep PR body current with FactoryX Work Order Context (id + implemented scope + preview path + verif output + asset notes).
11. Polish passes (interaction feel, asset refinement, copy, accessibility touches) until deadline or real blocker. Address any new CHANGES_REQUESTED or admin comments as blocking before new ideas.

Use FACTORYX_WORK_ORDER_* envs / paths for all durable notes. Read FEEDBACK.md before polish passes.

---

## Success criteria (tied to payload definition of done + review questions)

- A reviewer can understand the requested scope from the PR body (10+10 samurai generated for Kawanakajima, Asset Foundry used or limitation documented, real file assets, ukiyo-e house style).
- The app has a clear first-screen experience and a meaningful interaction loop (reveal-as-printing, stage a confrontation) evaluable in <1 minute without extra instructions.
- Central visuals (the 20 samurai), sounds, copy, and interaction feel intentional for the subject, not temporary vector blobs or generic placeholder copy.
- Visual and audio assets have concrete file-backed pipeline (or explicit documented procedural authored system when foundry unavailable), ASSET_MANIFEST.md provenance, verification, and at least one screenshot/asset checkpoint.
- The PR includes verification output, preview instructions, and known limitations.
- The implementation is more than scaffolding (real generated assets + coherent interaction).
- Review questions answered: satisfies brief, coherent without instructions, art/music intentional especially for heroes, verif steps clear.

Finish only when budget expires or there is a real blocker. Keep the same branch/PR for all polish.

---

*This strategy is the plan of record. Update it (do not silently drift) if direction changes materially. All implementation and notes for this Work Order live under `.factoryx/work-orders/work-order-1781744660416-7-1/`.*

