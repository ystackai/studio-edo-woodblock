# Goal Execution Strategy: Lantern Surf Courier

Work Order: work-order-1781512090026-8-74  
Payload goal (verbatim excerpt): "Build an ambitious, bright, immediately readable Edo woodblock arcade game called Lantern Surf Courier. ... fast side-scrolling wave-runner: jump, dash, surf slopes, thread lantern gates, deliver sealed letters, ride wind currents, avoid yokai and wave crests, and escalate speed every minute. ... first screen must be playable within seconds and must visibly contain a large courier/surfer character, wave or bridge geometry, pickups, hazards, score/combo, and restart."

## Non-negotiables from instructions
- Taste-gate slice FIRST: 30-60s of *one verb in one space*. Get real browser-playable evidence (not just static) before systems expansion.
- House style from FACTORY_CONTEXT.md must inform visuals even while meeting "bright" and "juicy" and "Discord screenshot" needs from payload: ink/paper/silhouette/mist/restraint as base; color used as justified overprint (lanterns as warm deliberate glow).
- Game Feel Checklist must be verified before marking pass complete (see VERIFICATION.md).
- Quality bar before review: coherent first screen, <1min evaluable, clean live preview, verification runs, no uncaught errors or blank evidence.
- Completion mode = polish_until_deadline: continue improving same branch/PR past "reviewable" until 2026-06-15T14:28:32Z or hard blocker. Do not stop at first viable.
- Preview must be the exact entrypoint (or tiny valid redirect). Self-contained index.html preferred. No mutating public homepage for review links.
- Git: only push to FACTORYX_GITHUB_WORK_ORDER_BRANCH. One canonical PR. Include full "FactoryX Work Order Context" section (this prompt) in PR body. Update PR body with scope, preview, verification, issues.
- Browser runtime verification required (pageerror, console.error, request fails, in-game state after interaction).

## Slice definition (taste-gate)
- **One verb**: "Thread the lantern gate" (precise vertical timing while carried forward by the wave).
- **One space**: Open water at the hour when lanterns are lit; layered scrolling waves as the "road"; no levels, no warps.
- **Core loop (first 30s)**: Run starts. Player (large courier) is immediately visible riding the near wave. Wave geometry scrolls. Lantern gates (glowing pairs) and sealed letter pickups appear ahead. Jump (space / tap) to change height and thread the gate (pass in the lit opening). Collect letters for score. Wave crests (hazards) force either jump or precise surf height. On miss/crash: visible feedback, run ends with delivered count + restart. Speed ramps subtly to communicate "escalate".
- **Why this slice**: Directly exercises the signature "thread lantern gates" + wave ride + jump. Delivers large character, wave geo, pickups, hazards, score/combo, restart on first screen. Fun to watch (bright lanterns pop against ink waves). If timing not satisfying after play, we replace the mechanic before adding dash/wind/yokai.
- **Success criteria for slice (concrete)**:
  - On open: paper ground visible, no navy blank, large (>80px tall) courier silhouette on screen within 1s.
  - Within 5s of start gesture: scrolling waves, at least one gate or letter visible and interactable.
  - Jump produces <100ms visible response (player leaves wave surface with easing arc).
  - Passing a gate or collecting letter produces immediate feedback (pop, +pts, combo flash).
  - Hitting hazard produces hit feedback and ends run cleanly with restart affordance.
  - Score/combo visible and updating.
  - Keyboard + pointer/touch all drive the same verb successfully.
  - No console errors, no dropped frames on mid laptop, canvas fits and is readable on 360px-wide mobile.
  - Total file < 150kB (target <<2MB).

## Expansion plan (post-slice, only if slice passes taste)
- Add dash (second verb: short burst or carve for tight/low gates or to punch through light wind).
- Surf slopes: make wave surface a real varying-height ground; player can "carve" by staying on surface through dips/peaks for bonus or speed.
- Deliver sealed letters: make pickups more thematic (letters must be "caught" or delivered through specific gates?).
- Wind currents: visual flow lines or updraft zones that bias vy or allow higher jumps.
- Yokai: rare, clear silhouette hazards that require dash or special timing (not just more crests).
- Speed: every 60s (or 800 world units) increase base scroll speed + spawn density. Cap at "thrilling but readable".
- Polish: more wave layers, mist, particle ink splashes, lantern sway, courier animation (subtle robe flap, head bob), combo popups, high score persist in session, sound cues (sparse: whoosh jump, paper chime collect, low crack on crash, wind tone ramp).
- UI: clear distance or "minutes surfed", letter count as "delivered", combo xN with decay.
- Mobile: 44px+ virtual buttons if needed (but prefer direct canvas tap anywhere for jump, dedicated dash zone).

## Risk management & pivot triggers
- If jump timing on continuous wave feels mushy or random after 10 honest plays: replace with discrete "lane" surf + tap-to-switch + hold-to-surf-lower, or add visual "sweet spot" telegraph on gates.
- If character not reading as "large courier" instantly: increase scale, add explicit letter satchel silhouette + hat + flowing sleeve lines. Add subtle constant bob + forward lean.
- If performance or size balloons: cap particles, rasterize some layers, remove shadowBlur fallbacks.
- Blank/low-quality risk: every change must keep paper + large player + moving elements on screen at t=0+.
- House style violation: if payload "bright juicy" fights, justify color as lantern ink overprint; keep primary forms in ink silhouette; use mist/negative space; avoid particle spam that looks digital.

## Polish cadence
- Slice build + manual playtest + feel checklist.
- Self-review (read diff, play 20+ runs, screenshot).
- Run structured autoreview (see .factoryx/skills/autoreview).
- If clean: commit, push (via canonical), update PR (or open first with full context).
- Then repeat: add one system or polish pass, verify checklist again, re-review, push.
- Keep PR body current (implemented scope, known issues, verification output).
- Continue past first reviewable until deadline or true blocker.

## References
- Payload JSON (full in user query / PR body).
- WORKFLOW.md (taste-gate, git model, preview, game feel).
- .factoryx/skills/game-designer-2d/SKILL.md
- FACTORY_CONTEXT.md (house style + subagent voices).
- VERIFICATION.md for concrete checks.
- TECHNICAL_SYSTEM_DESIGN.md for impl approach.
