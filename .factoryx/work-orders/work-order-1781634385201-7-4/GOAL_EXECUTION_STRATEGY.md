# Goal Execution Strategy — work-order-1781634385201-7-4

**Work Order:** Rekick: Edo Inkblade road-opening slice with generated assets
**Core constraint:** Taste-gate slice first. 30–60 second playable slice of **one verb in one space** before any systems expansion. Get browser-playable evidence before expanding. If not interesting after honest play — pivot. Concrete criteria over adjectives.
**Deliverable intact:** The goal of the original deliverable (a playable browser slice of the road-opening moment using generated assets, in the Edo Inkblade identity) remains. This rework keeps the "road opens" narrative and slice nature; it replaces the art direction, interaction model, and audio with ones that pass the house style and make the experience legible and worth the player's attention.

## Feedback to resolve (verbatim)
music and art are terrible please improve

## Acceptance (tied directly to feedback + WORKFLOW + house style)
- A new player sees the first screen and within ~5-8s understands they are looking at a single ukiyo-e woodblock print (warm paper, decisive ink silhouettes, mist/atmosphere) of a road blocked at a gate or ward, with a small traveler and the implication of an "opening" action.
- The primary verb is immediately discoverable by moving the pointer: the cursor transforms into a blade/brush only over the living/blocking form; contact produces immediate visible response (local thinning, jitter damping, ink lifting as feathered resistance).
- Sustained 15-30s of the verb (steady tracing or pressing the barrier) produces the "road opening": the blocking form yields and parts with easing, the path continues visually into mist, a small traveler figure advances or is guided through, the world resolves to a quieter, open state. Releasing lets some resistance breathe back (mono no aware).
- Audio is sparse, physical, user-gesture initiated only: brush-on-paper scrape or soft wood-fiber tones on contact, a resolving low woody "open" tone or struck wood that becomes more continuous/held as the cut progresses. No loops, no melodic music, no autoplay, no bright synths.
- No game UI chrome (no health bars, no duel timer overlay, no pixel font, no bright gradients). Any labels or hints are faint ink text in the print margins, in the voice of the studio (Sei Shonagon style, minimal).
- 9/9 Game Feel Checklist met (see VERIFICATION).
- Real browser runtime verification passes with non-blank ready + post-interact captures showing the opened state; no pageerror, no console errors, no request failures.
- Total self-contained payload stays light (<2MB, ideally <<1MB); works file:// and offline after load. All "generated assets" are either procedural ink procedures (standing for the output of Flux/MMAudio skill) or small embedded data if a real generated file is added via tool.
- House style non-negotiable and strictly followed: ink as primary material, paper ground, silhouette + feathered/bleeding edges, mist as emotional temperature, one strong gesture, touch as carving, restraint, quiet sensuality + slight melancholy. Never cute, bombastic, "fun", or video-gamey.

## Slice definition (one verb, one space)
- **Space:** A single "woodblock print" surface (fixed logical 960x600 or 960x540 to match prior, CSS scaled, DPR aware). Warm handmade paper #f8f4eb. Receding road in traditional ukiyo-e ink (diminishing width + fine cross strokes for texture). Background: faint mountains, layered mist veils that drift slowly. Foreground/mid: a closed gate or a bold horizontal "ward" ink-bar + ofuda seal rendered with living jitter/stutter on its lines. Small robed traveler silhouette at the near end of the road.
- **Verb:** Sustained carving / tracing with the inkblade (pointer down + slow drag or hold over the blocking form). Not frantic swipes or button mashing. The player is "using the baren or the carving knife on the final block" or "drawing the blade through the resisting ink to open the way." The resistance is felt as the form pushes back (jitter returns, partial close) unless contact is maintained.
- **Camera/perspective:** Fixed, "the screen is the woodblock" — slight oblique paper view or pure orthographic with receding road drawn in 2.5d ink convention so every stroke feels intimate and the print itself is the object.
- **30-60s arc:**
  - 0-5s: First screen registers as a complete, quiet ukiyo-e statement that is "blocked" (the strong ink ward across the road is the salient unsettled element; mist breathes; traveler waits).
  - 5-12s: Player moves pointer; over the ward the cursor becomes a short decisive blade/brush; contact shows soft pressure "cut" feedback (local line thins or ink lifts as short feathered strokes).
  - 12-35s: Sustained contact on the ward (or tracing its length) drains its resistance; the form visibly yields and begins to part in the middle; the road beyond appears (continuation ink lines + stepping stones or open gate leaves); mist thins locally; traveler takes a step or two.
  - 35-55s: Full opening: the ward splits or dissolves, the road is continuous, a final soft resolution tone sounds, the traveler can be guided the last distance into the mist (or completes the crossing on sustained presence). Releasing the cut allows the mist to drift back a little — the opening is not permanent.
  - The "point" is felt as: my patient attention with the blade co-authors the print and opens the road that was closed.
- **No extras:** No scoring, no rounds, no multiple barriers or levels, no inventory, no save, no achievements, no broad world. One living print. The "generated assets" proof is the style itself (procedures that could come from an image gen skill) + the audio behavior (could be shaped from skill-supplied base tones).

## How we make "the point" obvious without lecturing
- Visual: The ward/barrier is the highest-contrast, highest-curvature, most "alive" element on first view (subtle organic jitter on its strokes, slightly "wet" or thirsty treatment vs dry paper). The rest of the print is settled. The blade cursor only appears over it — clear affordance. Progress is local and cumulative (thinning + parting that stays until release).
- Auditory: Initial contact is clearly "working against resistance" (short, gritty, irregular scrape). As the cut deepens the sound resolves (gaps close, a low held tone emerges that the player can "keep alive" by staying engaged). On full open a single physical "gate/road open" event (soft wood + paper lift).
- Emotional throughline: The theme (a fleeting opening earned by attention, in a world of mist and ink that remembers) is enacted by the verb and the reversible nature of the reveal. No text needed to "get it."
- Optional light cue: After first meaningful progress (~8s sustained), a single line of small 9-10pt ink text may appear for 5s in the lower margin: "the blade that parts the ward for a moment" (or similar). It is caption, not tutorial. Fades.

## What "good" looks like here (per house + taste gate)
Good: First frame is already a Hiroshige-quality statement — you want to touch the unsettled ward because the composition asks you to. 20s of play and you understand you are the carver who opens the road. The resolution feels earned, fragile, and slightly sad when it breathes closed again. You play longer to hold the open state.
Mediocre: A pretty generated picture + some sounds that you poke; the "road opens" never feels like your action produced a real, felt change in the world of the print.

## Risk controls
- If after implementing the slice the interaction still feels flat or the opening not legible in self-play: pivot the telegraph (stronger contrast on ward, more obvious blade, larger active zone, micro pulse on the barrier) or the verb immediately (small diff). Do not polish a failed taste gate.
- If a real generated asset file would strengthen the "with generated assets" proof without fighting house style or bloat: use the GenerateImage tool for 1 key layer (e.g. the base road/gate composition as a restrained ukiyo-e ink wash) and composite it under the live ink procedures. Keep fallback to pure procedural.
- Browser verif is gate: any pageerror, console fatal, blank capture, missing post-interact "opened" state, or >2MB payload = blocker, fix before next push.
- Keep diff focused on games/inkblade/index.html (self-contained) + this WO's .factoryx notes. Do not mutate root index.html, drops catalog, studio.json, or other games for preview purposes. Preview root = games/inkblade/index.html (or games/inkblade/ if a tiny index redirect is added, but prefer direct file).
- Since current tree state on this branch is post-indigo-stutter, we explicitly (re)introduce the inkblade slice here as the reworked deliverable artifact attached to the same node. No unrelated cleanups.

## Sequence
1. Write durable notes (this + technical design + initial PREVIEW/VERIF/WORKLOG/FEEDBACK skeletons).
2. Implement minimal viable taste-gate slice in one self-contained file (canvas + input + state + audio + house ink procedures).
3. Self-playtest + iterate until core verb legible in <10s and the "I opened the road with my attention" point felt in <30s, with house style perfect.
4. Add real-browser chromium verification (or autoreview harness if it exercises runtime), archive ready + post-gesture screenshots showing opened road + traveler progress.
5. Update PREVIEW/VERIFICATION/WORKLOG with evidence + full 9/9 checklist pass.
6. Closeout quality (autoreview if tool present, or manual per quality bar: first screen makes sense, <1min coherent, live preview clean).
7. Commit only the required (inkblade + WO notes), push only the canonical branch, open/update PR with the full FactoryX prompt in the body and WO context section.
8. Report PR URL; leave changes in place.

Work Order: work-order-1781634385201-7-4
Target deliverable: rekick-edo-inkblade-road-opening-slice-with-generated-assets-7236f90a
Previous ref: work-order-edo-inkblade-road-opens-assets-20260522
