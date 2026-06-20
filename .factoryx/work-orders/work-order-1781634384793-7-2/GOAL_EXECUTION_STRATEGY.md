# Goal Execution Strategy — Rework Lantern Surf Courier (use asset foundry for better 2D art)

## Intent (from payload + feedback)
Operator requested rework for the "Lantern Surf Courier" deliverable. Specific feedback: "need to use asset foundry to generate better 2D art".
Decision context points back to prior selected work-order-1781512090026-8-74 (the initial implementation that passed review but used non-foundry asset production per its ASSET_MANIFEST and code comments: "No foundry/asset pipeline exposed in runtime").

Keep the existing deliverable goal intact: deliver a reviewable, playable, taste-gated 2D browser game slice (one primary verb: wave-surf + jump-to-thread lantern gates in one ukiyo-e sea space) that expands to the full courier fantasy (letters, dash risk/reward, yokai avoid, wind/slope) while strictly following:
- Edo-woodblock house style (FACTORY_CONTEXT.md)
- browser-game-2d playbook / WORKFLOW.md (taste-gate first, no save/inv/levels/procedural broad unless asked; GitHub WO branch model; preview direct; browser runtime verif; game feel 9/9 checklist)
- produce normal reviewable output (github_pr expected artifact)

## Why this size of change
The feedback is narrowly about *how the 2D art was produced* ("use asset foundry") and quality ("better"). Prior implementation was already coherent, verified, and game-feel solid (per review WO 1781546054493-7-8). Re-implementing from scratch would risk the verified slice quality. Instead:
- Treat as "follow-up attached to same node": reproduce the exact deliverable (same slug 93-lantern-surf-courier) on this new WO branch.
- Make the asset production the visible, reviewable change: explicit foundry calls, better prompts yielding stronger prints, updated manifest + code comments.
- This is a "larger product-shaped change" justified by risk: the prior art was the noted gap; regenerating via foundry + slight prompt refinement directly addresses operator request without scope creep.

## Constraints & non-negotiables
- Preview root: games/93-lantern-surf-courier/index.html (self-contained single file + relative assets/)
- No external net in game; offline after load; <2MB total purposeful payload (foundry jpgs will be the heavy but justified part per "reviewable file-backed").
- Browser runtime verification must succeed (real chromium, pageerror/console, in-game state post start gesture, 60fps, no blank).
- All game feel items must pass before presenting for human review.
- Audio only post user gesture.
- Use .factoryx paths for durable notes.
- Push only the canonical branch; one PR; include full prompt in PR body FactoryX section.

## Phased plan (risk-sized steps)
1. **Bootstrap & recon (small, certain):** mkdir tree, init all WO memory files (WORKLOG, PREVIEW, VERIF, FEEDBACK, strategy, design), extract prior game source + evidence via git/gh for reuse as base (proven not to re-invent verified feel).
2. **Asset foundry (core of this WO, medium risk/uncertainty on "better"):** 
   - Craft 4+ detailed prompts per imagegen skill (use case: illustration-story or stylized-concept + historical ukiyo-e; house palette/silhouette/mist/paper/bleed/edge).
   - Call GenerateImage (the foundry) for each; inspect outputs (via move + perhaps file info or later visual in verif screenshots).
   - Iterate 1-2x per asset if first gen lacks "better" (stronger line, more ink presence, paper texture memory, compositional charge).
   - Copy final chosen to games/93-lantern-surf-courier/assets/*.jpg (match prior contract for minimal diff in integration).
3. **SFX (small):** Prior used python-synth WAVs + file-backed. Re-synth 4-5 sparse ones (whoosh, pop, thud, swhoosh) using python/numpy or similar if available; place in assets/sfx/. (Keep fallback osc always.)
4. **Game rebase + foundry wiring (medium):** 
   - Write index.html based on extracted prior (58kB solid).
   - Update header comments, asset comments, ASSET_MANIFEST ref to proudly declare "Produced via asset foundry / GenerateImage + refined ukiyo-e prompts per rework feedback".
   - Keep all harness mitigations (paperGrain eager, lanternFirstGesture, easy letter seed, eager render after listeners).
   - Ensure drawImage paths + .complete fallbacks + no external.
5. **Taste gate first (high value, low risk of overbuild):** Run the core (ride + first gate thread + letter) under browser verif immediately after minimal wiring. Only then expand full verbs (dash, yokai, wind, HUD juice, particles, crash). Pivot only if core verb not interesting (unlikely, prior passed).
6. **Verification & polish (iterative, required):** 
   - Run chromium headless vtime on exact file:// entrypoint; fix runtime errors/blank/low quality/feel issues with small diffs.
   - Capture screenshots to WO/screenshots/ + game/screenshots/ if structure.
   - Update PREVIEW/VERIFICATION with concrete evidence (paths, console clean, state, fps).
   - Self-play mental + any shell play if X available; address game feel items.
7. **Closeout:** Write final ASSET_MANIFEST.md (foundry contract), commit only on branch, push canonical, create/update PR with full context, update WO notes.

## Success criteria (from payload + WORKFLOW + prior review)
- Operator feedback directly actioned and visible (foundry used; art demonstrably "better" via prompt care + house fidelity).
- Same deliverable goal: coherent first screen, core verb <30s no-explain, full 30-60s slice interesting.
- All 9 game feel checks + quality bar (no browser errors, preview direct, verif ran+passed).
- Normal factory output: github_pr, reviewable, durable notes in .factoryx/WO/.

## Out of scope (explicit)
- New mechanics, second space, save/load, inventory, achievements, multiple levels, broad procedural.
- Changing house style or core fantasy.
- Homepage/index changes (unless this WO payload asked; it doesn't).
- Anything not required to make the art-foundry change reviewable and verified.

Work Order: work-order-1781634384793-7-2
