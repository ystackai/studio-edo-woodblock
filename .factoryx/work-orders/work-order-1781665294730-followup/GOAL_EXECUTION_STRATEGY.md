# Goal Execution Strategy — work-order-1781665294730-followup (Rework Smoke: Edo asset-generation skill proof pack)

**Work Order:** Rework for "Smoke: Edo asset-generation skill proof pack" (explicit followup)
**Core constraint:** Taste-gate slice first. 30–60 second playable slice of **one verb in one space** before any systems expansion. Get browser-playable evidence before expanding. If not interesting after honest play — pivot. Concrete criteria over adjectives. (From WORKFLOW.md)
**Deliverable intact:** The goal of the original deliverable (prove that the Edo asset-generation skill can supply usable art + melody for a coherent interactive piece) remains. This rework keeps the proof-pack nature and the "indigo stutter" identity; it deepens the interaction so the point is legible. Real file-backed assets + manifest required per payload asset_contract_v2.

## Feedback to resolve (verbatim)
"melody plus art is a nice combo but not sure what is going on here this seems kind of flat and pointless, and i dont understand the point of the interaction. Either make it more obvious to explore or describe it to user."

## Acceptance (tied directly to feedback + WORKFLOW + house style + asset contract)
- A new player sees the first screen and within ~5-8s can identify "the thing that is alive/stuttering" (prominent trembling ink forms) and the implied action (rub/trace/press the living areas to still them).
- Sustained engagement (hold or slow drag over active zones) over 10-20s produces visible + audible resolution: ink steadies locally, mist parts or thins in attended regions, a hidden form or sharpened layer emerges, the broken audio phrase resolves into a sustained soft tone or simple repeating motif that the player can "hold" by continued presence.
- By 30-45s the player has "completed" one full calming cycle and can see the effect of their attention (the resolved print is visibly more coherent/beautiful); releasing lets it breathe back toward stutter (mono no aware — nothing is fixed forever; the melancholy is felt through the return).
- No separate instructions screen. No "click here" floating UI that fights the paper aesthetic. Affordances live inside the print (damp zones on living lines, pressure rings, cursor-as-brush, subtle telegraph on stutter forms via jitter amp + breathing).
- Description, if any, is minimal, poetic, and appears only as part of the world (e.g. a faint caption in the margin that fades after first success, or is "printed" on the paper). Caption is grace note after the player has already discovered the verb.
- 9/9 Game Feel Checklist met (see VERIFICATION.md).
- Real browser runtime verification passes with non-blank ready + post-interact captures showing before/after state difference and positive in-game observable.
- Total self-contained payload stays light (<2MB); works file:// and offline after load.
- House style: ink, paper, mist, silhouette, one strong gesture, restraint. Never cute/bombastic. Quiet sensuality + slight melancholy.
- Asset contract v2: at least one (preferably two) real authored/generated file(s) under drops/indigo-stutter/assets/ (or assets/generated/), plus ASSET_MANIFEST.md with entries and short provenance note. The generated layers are used in the piece (composite or bg). In-code-only procedural does not satisfy for material visual changes in this deliverable.

## Slice definition (one verb, one space)
- **Space:** A single "woodblock print" — framed or edge-bleed paper surface on screen. Warm handmade paper ground with subtle fiber. Primary forms in indigo ink: horizon or wave crest line + mist veils + one quiet central motif (lone boat, pine, or robed figure — silhouette first, decisive). The "stutter" (visible jitter/phase shift) lives primarily on the high-curvature or key ink lines so the eye is drawn to them.
- **Verb:** Sustained gentle pressure / tracing (mouse drag, touch drag, or hold-space while pointer over active zones). Not frantic clicking or rapid gestures. The player is "using the baren", "breathing on the wet ink", or "carving the final pass" to still the trembling.
- **Camera:** Fixed, direct, "the screen is the block" — orthographic or slight oblique paper view so every mark feels intimate. Generous paper margins.
- **30-60s arc:** 
  - 0-5s: First screen registers as beautiful but "unsettled" (subtle-to-moderate live jitter on key lines, mist breathing, paper fiber). The tremble makes the viewer lean in.
  - 5-15s: Player discovers active zones by moving pointer; cursor (or touch) produces soft pressure ring; lines under contact begin to visibly steady immediately.
  - 15-35s: Sustained contact on one or more key zones causes the full resolution: mist lifts/thins locally, a second deeper ink layer or reflection or distant detail sharpens, audio smooths from gapped drops to a 2-3 note resolved phrase that can be "held".
  - 35-60s: Player can experiment with where and how long to hold; the piece "remembers" recent stilling for a few seconds after release (slow return to stutter). A tiny caption may grace the first success. "Re-ink" (R) lets them feel the cycle again.
- **No extras:** No scoring HUD, no levels, no inventory, no procedural world gen, no multiple prints, no achievements, no save/load, no settings. One living print. (Per taste-gate.)

## How we make "the point" obvious without lecturing
- Visual telegraph (primary): The stutter is not uniform or subtle — it lives on specific, high-contrast, high-curvature ink forms that beg to be followed. Those forms have a distinct "thirsty"/"damp" treatment (slightly lighter absorption or micro texture) vs surrounding dry paper. When contact is made, a soft expanding ring + local line stabilization (jitter -> 0) gives immediate "this is working" + "I am the one doing it" feedback. Jitter amp on idle is high enough that the tremble reads even in a static glance.
- Auditory consequence: The initial sound (after first gesture) is clearly "stuttering" (gapped, hesitant drops or a tone with rhythmic holes and irregularity). Sustained contact over living zones fills the holes in real time; the change is perceptible and directly tied to the player's action. Release re-opens the gaps.
- Emotional throughline: The theme (quieting something fragile and beautiful by patient, sustained attention; the world that results is more whole but only while you hold it) is enacted by the verb itself. The reward is the emergent beauty and coherence of the resolved print, not points or a banner. Releasing lets the world exhale back toward unsettled — the slight melancholy is experienced, not told.
- Optional light cue: After first successful ~2-3s hold that achieves visible resolve, a single line of small 8-11pt ink text may appear for ~4s in the margin or lower corner: "the hand that stills the ink" (or "what the baren quiets, the ink remembers"). It is not instructions; it is the print's caption for the gesture. It fades on its own or on reset. If it fights the "obvious to explore", we omit or make even quieter.

## What "good" looks like here (per house + taste gate + feedback resolution)
Good: First frame is already a complete quiet statement (like a late Hiroshige or Utamaro that happens to tremble). The unsettled lines + breathing mist make a new player want to touch it. Within 20s of play they understand they are the carver of the final state — their sustained attention completes the print. They play longer because the resolution feels earned, fragile, and reversible. Release carries the "mono no aware" without words. The asset-gen proof (art + melody) is used by the player, not just presented.
Mediocre (the state being fixed): A pretty picture + nice tones that you watch or poke randomly with no legible "why my action matters" or "what changes because I did this."

## Risk controls
- If after implementing the slice the interaction still feels flat in honest self-play (verb not found <10s, resolve not felt as reward <30s, no sense of agency): pivot the telegraph or verb immediately (small diff, e.g. increase jitter, add micro-pulse on living lines, make damp treatment stronger, slow the reveal slightly so it reads as "my doing"). Do not polish a failed taste gate.
- Asset files required: Use GenerateImage tool for 1-2 deliberate ukiyo-e elements (base motif layer as "generated print", optional settled under-detail). Place in drops/indigo-stutter/assets/ (or assets/generated/), reference relatively with canvas fallback if load fails. Update ASSET_MANIFEST.md with filename, prompt/description, role in piece, date. This satisfies "real file-backed" beyond ASSET_MANIFEST alone or pure procedural.
- Audio: WebAudio primary (lightweight, no external, gesture-safe, resolution behavior itself is the "melody" proof). If a short wav asset is easy to synthesize (e.g. via node), include one as additional proof; otherwise note the synthesized usage as the skill's melody exercised.
- Browser verif is gate: any pageerror, console fatal, blank capture, missing state diff, audio on load = blocker, fix in source and re-verify.
- Keep diff focused: drops/indigo-stutter/index.html (full redesign), drops/indigo-stutter/assets/* + manifest, this WO's .factoryx/ notes + screenshots/. No unrelated files, no catalog changes, no other games.

## Sequence (size steps to risk; larger product-shaped when needed)
1. Create WO context dir + durable notes (WORKLOG, FEEDBACK, PREVIEW, VERIFICATION, GOAL, TECHNICAL) treating prior 7-3 as plan of record, updated for this followup id and current passive code state.
2. Generate real assets with GenerateImage (1-2 ukiyo-e ink layers); place under assets/, write minimal ASSET_MANIFEST.md + provenance.
3. Implement minimal viable taste-gate slice in one file (canvas render + input + state + audio + asset compositing + reset). Make first screen alive with obvious stutter.
4. Self-playtest honestly (multiple short sessions, pretend new player); iterate telegraph/verb/response until core verb legible in <10s and point felt in <30s. Record in FEEDBACK/WORKLOG.
5. Add real-browser chromium verification harness runs (ready + post-gesture captures, console/pageerror checks, state observable). Fix all blockers. Update VERIFICATION + screenshots/.
6. Final checklist pass (9/9), payload items (generated_assets, browser_runtime_verification, screenshots, review_summary notes), update PREVIEW/VERIF with evidence.
7. Closeout quality (run autoreview skill if present and useful). Commit focused changes only.
8. Push only the canonical branch (`git push origin HEAD:factoryx/...`), inspect PR (gh pr view / list / comments), create or update the one canonical PR with full prompt in body + WO context, leave changes in place.

Work Order: work-order-1781665294730-followup
Branch: factoryx/factory-edo-woodblock/work-order-1781665294730-followup
