# Work Order 1781512090026-8-74: Lantern Surf Courier

**Factory:** factory-edo-woodblock (edo-woodblock)  
**Role:** coder-default (grok-build runtime)  
**Branch:** factoryx/factory-edo-woodblock/work-order-1781512090026-8-74  
**Deadline:** 2026-06-15T14:28:32Z (polish_until_deadline)  
**Preview:** games/93-lantern-surf-courier/index.html  
**Experiment:** seven-studio-overnight-edo-grok-restart-20260615  
**Variant:** grok-restart-after-blank-evidence

## Context from previous run
- Prior "Moonlit Wave Courier" attempt produced blank/low-quality evidence.
- Agent runner had Grok version update + auth interstitial (now resolved by fresh runtime).
- Directive: start fresh. Do not build on blank artifact. Use only repo conventions and any real assets found (none for prior courier found in checkout).
- House style (ukiyo-e / Pictures of the Floating World) applies: ink, paper, silhouette, mist, restraint. Payload additionally requires bright readable Discord-friendly visuals, lantern glow, juicy effects, strong silhouettes, clear UI, fast side-scroll wave-runner.

## Execution approach (per WORKFLOW.md)
1. **Taste-gate slice first**: 30-60s playable of *one primary verb in one space*.
   - Chosen verb for slice: "thread glowing lantern gates while riding scrolling wave crests".
   - One space: open sea at dusk/dawn with layered ukiyo-e waves, paper ground, distant silhouettes.
   - Camera: classic 2D side-scroller, player fixed ~left-of-center, world scrolls right-to-left.
   - Large courier/surfer character visible immediately (strong black silhouette + robe/pack details).
   - Core loop elements in slice: jump timing, gate threading (score+combo), letter pickups, wave-crest hazards (avoid or crash), basic speed feel.
   - No: save/load, multi-levels, proc gen beyond simple timed spawns, broad settings, achievements.
2. Get browser-playable evidence (real canvas runtime, no console errors, visible first-screen action, input response) before expanding systems.
3. If slice not interesting after honest play — pivot. Concrete criteria over adjectives.
4. Then expand to full requested verbs (dash, surf slopes, wind currents, deliver letters, yokai) + speed ramp every minute while polishing the same slice.
5. Follow Game Feel Checklist strictly before any "pass complete".
6. Quality bar: first screen makes sense w/o explanation; interaction evaluable in <60s; live preview opens clean; verification actually runs and passes or blockers called out.

## Progress log

### 2026-06-15 (start)
- Inspected workspace, git (HEAD 84a120b on target branch), no open PR for this exact WO branch yet (gh pr list returned empty for head), pre-push hook in place (enforces ancestor), no prior lantern-surf or moonlit code/assets in checkout (games/ only stub, drops/ has unrelated indigo-stutter).
- Created `.factoryx/work-orders/work-order-1781512090026-8-74/` and initialized durable notes (WORKLOG, PREVIEW, VERIFICATION, GOAL_EXECUTION_STRATEGY, TECHNICAL_SYSTEM_DESIGN).
- Read FACTORY_CONTEXT.md (house style), game-designer-2d skill (use for 2d browser), coder1/coder2 agent tomls (Hiroshige for atmosphere/accumulation, Sharaku for expressive motion/intensity).
- Chose implementation: single self-contained `games/93-lantern-surf-courier/index.html` (canvas 2D + minimal DOM overlays for HUD/controls). Matches preview entrypoint, <2MB target, offline after load, no external net.
- Slice scope locked: auto-scroll wave runner, physics jump + land on wave surface, gate threading for primary score, letter pickups, crest hazards (crash on contact), restart, score/combo/distance UI. Speed starts moderate, ramps on timer for "escalate every minute".
- Palette decision (reconcile goal "bright...colorful" + house "ink primary, restraint"): off-white paper (#f8f4eb + grain), deep indigo/ink (#0f172a, #1e2937) for waves/silhouettes, vermilion-orange (#ea580c) + warm gold (#f59e0b) for deliberate lantern "overprint/glow", teal accents for sea. Strong edges with slight feather via multi-stroke. No hard neon.
- Next: implement the slice HTML. Focus first on: paper bg + immediate large player silhouette + scrolling wave layers + basic jump/land + one gate type + letter + hazard spawner + score + restart + input (space/click/tap) + audio stub (WebAudio, gesture only). Verify no blank, no tiny elements, 60fps on mid hardware, input latency low.
- Will use autoreview skill + manual play + (if available) browser harness before PR.

### 2026-06-15 — Taste-gate slice implemented
- Created self-contained `games/93-lantern-surf-courier/index.html` (28kB source; ~100kB png evidence).
- Core: side-scroll wave runner. One verb (thread lantern gates via timed jumps while riding wave surface). One space (open stylized sea at lantern hour).
- Immediate first screen (no gesture yet): warm paper + grain + faint grid read as texture, layered ink waves, distant mountain + torii silhouette (house style), large courier (k=2.6 scaled paths: wide hat, flowing robe, prominent strapped satchel with vermilion seal, balance pole, eye slit — reads instantly as "courier/surfer"), two glowing lanterns ahead, one sealed letter pickup, one crest hazard, HUD (score/letters/combo), sound toggle (off), restart, centered prompt "LANTERN SURF COURIER / TAP / CLICK / SPACE TO RIDE" pushed low so it does not obscure character.
- On gesture: run starts, world scrolls, player physics (vy/grav, land on sampled waveY with splash particles), gates thread for +pts + combo + sfx + glow pop, letters collect for "delivered" + pts, crest hit → crash with ink burst + stat overlay + restart. Speed ramps ~every 58s.
- Controls: space/up/w/k or any canvas pointer/tap → jump (buffered, air nudge); R/enter or large bottom-right canvas zone or DOM buttons → restart. All >=44px targets. Keyboard + pointer + touch.
- Audio: WebAudio lazy on first gesture; sparse synthetic (jump whoosh+noise, gate chimes, letter rustle, crash crack). Mute button; starts silent.
- Feel: player lean from vy, land damp + particles, gate/letter particles (warm sparks + paper flecks), score pop via combo, easing via sin bob + physics arc + life fade on particles. No linear pops.
- Evidence: headless chromium load + screenshot at ready state (no JS exceptions; process clean; png written). Screenshot archived to `screenshots/ready.png`. Manual inspection of image: no blank navy, large courier visible left, wave geometry, pickups/hazards ahead, paper ground, UI present, title/prompt readable.
- Runtime hook: `window.__LANTERN_SURF_STATE` always available for harness (score/letters/combo/crashed/running/player.y/onGround/speed).
- Game Feel Checklist (slice): all items addressed for the primary path; full 9/9 will be re-checked after any expansion.
- Size/perf: 28kB source; draws are simple paths + few particles; target 60fps observed in load; offline self-contained.
- Next (per strategy): honest play 15-20 runs. If timing/jump feel weak, tune or pivot the verb before adding dash/wind/yokai. Then polish, autoreview (codex call had engine failure in this env — will retry on push), commit, push to canonical branch, open PR with full WO context.

Screenshots:
- `screenshots/ready.png` (ready state: large courier + all required visible elements on paper, no blank, gates/letter/hazard ahead).

### Polish passes
(continue until deadline)

- PR #151 opened: https://github.com/ystackai/studio-edo-woodblock/pull/151
- gh pr view: OPEN, REVIEW_REQUIRED, no comments/reviews, "facts" check queued (standard). No blocking input. Safe to continue polish on same branch/PR.
- Small polish landed: worldOffset -120 so first gates/letters/crests visible within 1s of run (stronger "immediately" + verb demo). Commit 4e5037e on canonical.
