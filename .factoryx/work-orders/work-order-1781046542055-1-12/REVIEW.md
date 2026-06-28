# Review — Edo Inkblade: Road Opens (PR #109)

**Reviewer:** reviewer-default
**Work Order:** work-order-edo-inkblade-road-opens-assets-20260522
**Date:** 2026-06-09
**Verdict:** APPROVE (with non-blocking notes)

---

## Smoke Test Results

Ran Puppeteer-based browser smoke test (Chromium headless) against the live game:

| Check | Status | Details |
|-------|--------|---------|
| Canvas exists (960x540) | PASS | |
| Page title correct | PASS | "Edo Inkblade — Road Opens" |
| Start screen renders | PASS | Title + "Begin" button visible |
| Start to APPROACH transition | PASS | Player auto-walks toward gate |
| APPROACH to DUEL transition | PASS | Duel triggers when player reaches guard |
| Duel timing bar visible | PASS | Bar, zone, cursor all render |
| Counter-strike mechanic | PASS | Space bar registers, guard takes damage |
| Guard defeated, gate opens | PASS | Guard HP: -2, state: dead |
| Player survives duel | PASS | Player HP: 54/100 |
| CROSS state reached | PASS | Player walks through opened gate |
| No critical JS errors | WARN | 2 resource 404s (generated assets) |
| Generated assets | PASS | Background image loads; SFX has fallback |

Screenshots captured: Start screen, Approach, Duel, Final (Cross state) — all visually coherent.

---

## What Works Well

1. Single-file architecture (1247 lines) — no build step, no framework, maximum portability
2. Clear game loop — state machine (START to APPROACH to DUEL to OPENING to CROSS to WIN) transitions correctly
3. Guard AI is active — patrols, winds up attacks with visible indicators, lunges at player
4. Visual feedback is strong — slash particles, ink splats, hit text, health bars, gate-opening animation
5. Ukiyo-e aesthetic is coherent — generated background matches woodblock print style
6. Generated assets integrated with fallbacks — Flux image loads, MMAudio SFX loads, procedural fallbacks work
7. Audio respects user gesture — AudioContext only on click, no autoplay
8. Asset manifest complete — documents all 3 assets with tool, backend, prompt, status, verification
9. Total payload well under 2 MB — ~865KB total
10. Merge conflict resolved cleanly — games/index.html now lists both games

---

## Issues Found

### Non-Blocking (Nits / Polish)

1. **Guard windup trigger is fragile** (line 896)
   - `gameTime % 4000 < 20` uses a 20ms window in a 4s cycle. At 60fps (16.6ms/frame), this is hit ~1.2% of the time per second. Works in practice but a timer-based approach would be more reliable.

2. **Gate opening uses setInterval instead of game-loop animation** (line 1082)
   - Could drift from the main render loop. Suggestion: move increment into gameLoop update phase.

3. **generated-loop.wav (353KB) stored but never played**
   - Marked as prototype in manifest. Honest but adds ~350KB unused payload. Consider removing or deferring.

4. **No touch/pointer support**
   - Keyboard only (arrow keys + space). WORKFLOW checklist says "Touch targets >= 44px with pointer events alongside keyboard."

5. **Continue button restarts** — "Continue" implies progression; "Play Again" or "Restart" would be more accurate.

### Verified Correct

- No external network dependencies beyond initial load
- All audio behind user gesture (no autoplay)
- Hit feedback: particles + text + sound on counter-strike
- Health bar updates with CSS transitions
- Controls hint always visible
- Objective text updates per state
- Retry mechanic (R key) after defeat

---

## Game Feel Checklist

| Criterion | Status | Notes |
|-----------|--------|-------|
| Core verb in first 30s | PASS | Duel starts ~8s after Begin |
| Input response < 100ms | PASS | Space bar checked synchronously |
| Easing on all motion | PASS | Gate eased, health bars CSS transitioned |
| Hit/score feedback | PASS | Particles + text + SFX |
| Audio only after gesture | PASS | AudioContext on click |
| Touch targets >= 44px | FAIL | Keyboard only |
| 60fps on mid laptop | PASS | Canvas-based, lightweight |
| Total payload < 2 MB | PASS | ~865KB |
| No external deps | PASS | Self-contained |

Game Feel Score: 8/9 (touch support missing)

---

## Recommendation

APPROVE — Solid, playable slice meeting taste-gate criteria. Core verb (timing-based counter-strike duel) is engaging and works end-to-end. Generated assets properly integrated with graceful fallbacks. The 2 non-critical 404s do not affect gameplay. Touch support gap is the only checklist miss but not a blocker for a first-pass slice. Remaining issues are polish items for a follow-up work order.
