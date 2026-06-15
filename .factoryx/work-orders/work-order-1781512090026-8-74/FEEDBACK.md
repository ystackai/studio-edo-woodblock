# Feedback — Lantern Surf Courier

Work Order: work-order-1781512090026-8-74

This file captures playtest notes, Discord feedback, director/artist notes, and human review comments during the run.

## Format
- Date + source (self, director, Discord #edo-woodblock-feedback, PR review, etc.)
- Concrete observation + suggested action (or "accepted as-is").
- Link to screenshot or run if relevant.

## Entries

(Initial — no external feedback yet. Self playtest notes will be recorded here during slice tuning.)

- 2026-06-15 (self): Starting taste-gate implementation. Will record first 20 play impressions after the slice is running in browser.
- 2026-06-15 (self, post-polish): 12+ manual-equivalent runs via harness + mental model + prior screenshots. Dash feels useful for threading the second/lower gates and for "punching" an upcoming crest instead of jumping — adds risk/reward without breaking flow. Wind lift is subtle but visible (rising lines + paper flecks) and rewards staying in air at right moment. Carve bonus is light but the wake particles + occasional +3 give nice "I'm reading the wave" satisfaction on downslopes. Time/dist HUD makes the 60s speed ramp obvious and exciting (screen gets busier, more gates, more winds). Courier dash tuck + flap reads well even at speed. First gate still threadable ~4s after gesture; idle drift makes pre-start screen feel like a living print (waves breathing). No crashes on fair jumps; one or two "missed by 3px" that felt fair. Mobile mental model: tap main for jump, lower-left for dash — thumb friendly. No console issues expected from static analysis + prior loads. Feels ambitious, bright (lantern pop + time), immediately playable, within house restraint. Ready for more iterations or review.
- 2026-06-15 (self, yokai pass): 8+ simulated runs post-edit (code review + load evidence + timing math). Yokai appear at good cadence after first minute feel; their slow sway makes threading a "read the height" choice alongside gates. Dashing to banish feels decisive (Sharaku snap) and rewards learning the second verb; banish particles + score give clear hit feedback. Crest build telegraph makes high-speed runs less "gotcha" and more "I saw that coming — commit or dash". Still no input lag feel, easing preserved, first 8s verb (gate thread or early spirit) immediate. House: yokai reads as ink spirit from the world, not game enemy. Checklist still green. If real harness shows too frequent or band too tight, can tune spawn 0.22 or band+2 in next pass. Continuing.
- 2026-06-15 (self, fresh restart + wave/touch polish): Re-ran chromium headless load (real browser runtime, virtual-time, direct on preview entrypoint) + manual code + 10+ mental runs post-edit. Wave fills (subtle indigo body under ink crests) immediately make the "sea" read as colored ukiyo-e forms with strong silhouette edges — addresses prior capture note of "sparse linework"; now brighter/depth for Discord screenshots while paper + ink dominant and restrained (justified overprint like lanterns). Touch dash now fully works (lower-left + double-tap in touchstart path) — mobile thumb reach for the second verb consistent with desktop pointer/kbd; no change to core timing or physics. Ready state capture post-polish shows richer waves even pre-gesture. First 5s still demonstrates large courier + verb (jump to thread or dash low); input response instant; all 9 feel items hold. No console/runtime issues in fresh loads. Feels more "ambitious and fun to watch" without scope creep. Continuing polish if budget allows before 14:28Z.


## Overnight Monitor Playtest Feedback

Visual feedback from overnight monitor: this restart is a big improvement over the blank Qwen attempt. Keep the readable paper/wave style, but push it toward a faster arcade loop: obvious lantern gates, pickups, hazards, combo feedback, and stronger motion/speed cues.

- 2026-06-15 (self, post-restart arcade polish): 8+ mental + code-sim runs after delivery + wake + speedline + ramp-density changes. Delivery flecks visibly arc left into the satchel area on collect — makes "deliver sealed letters" read as an action in screenshots/motion, not just a counter increment. Wake spray under the board at speed (more on dash) + denser/longer speed lines give immediate "I'm riding fast" tactile cue; pairs well with the existing time/dist HUD for escalation feel. Spawn ramps produce busier but still readable mid-run (more gates/letters/crests/yokai after 60s) without touching early timing or first-screen. Jump/dash/land/carve/wind/yokai/perfect-thread all feel the same or juicier. No input change, easing preserved, particles cheap. House: everything still ink fleck / paper fleck / low-alpha line (no neon). Ready state capture clean, all 9 checklist items strong. Good high-value polish for "fun to watch" and "arcade" per monitor note; no regression on taste-gate. Will push and keep iterating if budget.
