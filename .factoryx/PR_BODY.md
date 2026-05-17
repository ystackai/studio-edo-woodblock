## FactoryX WorkOrder Context

**WorkOrder ID:** `work-order-1779049180797-1`
**Factory:** `factory-edo-woodblock`
**Studio:** `studio-edo-woodblock` — "Pictures of the Floating World"
**Project:** `ystackai/studio-edo-woodblock`
**Branch:** `factoryx/factory-edo-woodblock/studio-art-build`
**Deadline:** 2026-05-18T12:19:40Z

### Brief
- Build a visual instrument where user input creates meaningful changes over time
- Include at least one progression mechanic (levels, unlocks, streaks, score)
- Ship a polished vertical slice with no dead buttons, broken layout, or placeholder screens

### Human Review Feedback Addressed
Reviewer `tallhamn` requested at `5109f70`:
> "the begin button doesn't do anything. Please add tests and fix it."

Fixed across 5 commits after `5109f70`:
1. `613f3f0` — Added `test-begin-button.js` + verify.sh regression gate
2. `3970042` — Added `.gitignore`, `package.json` test scripts
3. `5959a5d` — Rewrote test file with robust assertions
4. `bedc819` — Added `canvas.focus()` in `startGame()`, high score comparison, game-over flavor text
5. `a3fe611` — Fixed preview root redirect for Floating Score

---

## Implemented Scope

### Game: `drops/floating-score/index.html`

**Core interaction:** Timed ukiyo-e element collection game with streak-based scoring.

**Progression mechanics:**
- **Levels** — Speed increases every 5 catches, max level 10; scoring multiplier grows
- **Streaks** — Bonus points at 3 (Gentle Breeze), 5 (Spring Gust), 10 (Autumn Gust), 15 (Tempest), 25 (Dragon Flight), 50 (Wind of Paradise)
- **Score** — Points per type (waves=1, blossoms=1, mountains=2, birds=3, clouds=5)
- **Timer** — 60-second countdown with danger pulse at ≤10s
- **Difficulty** — PACE bar tracks efficiency; danger pulse triggers at risk of missing
- **Achievements** — 6 achievements unlocked at score thresholds (50, 150, 300, 500, 750, 1000)
- **High score persistence** — localStorage with score comparison and celebration glow

**Interaction features:**
- Click/tap to catch drifting ukiyo-e elements
- Keyboard: Space/Enter to catch, P/Esc pause, M mute, ?/H controls
- Touch: `touch-action: manipulation`, pointer event handling
- Canvas focus management, aria-labels, aria-live polite region
- Controls modal with keyboard shortcut reference

**Polish features:**
- Ukiyo-e flavor text on game-over (5 quote tiers based on score)
- Sakura petal overlay on game-over (fade-in animation)
- Woodblock texture overlay, combo meter, level flash, miss flash, danger pulse
- Count-up score animation, new-highscore celebration glow
- Ambient drone audio, catch/streak tone/level-up sounds
- Fade transitions on start/game-over screens

**Accessibility (current):**
- `aria-label` on all buttons and canvas
- `aria-live="polite"` region for game state announcements
- Keyboard shortcuts for all core actions
- Focus management: canvas on start, retry button on game-over, close button in controls modal
- Auto-focus restoration when controls modal closes

### Verification

**Regression test:** `test-begin-button.js` — Playwright end-to-end test (19 assertions)
- Preview redirect, start screen, Begin button click, timer, score, level, canvas
- Game-over screen, final score, stats breakdown, retry button, home button, flavor text
- Retry restarts game, Mute key (M) toggles/restores mute state

**Structural verification:** `verify.sh` — 31 structural grep checks + Playwright gate
- HTML validity, canvas, score/level/streak/timer mechanics
- Keyboard/touch support, ukiyo-e drawing functions, studio.json/asset-manifest/drops/index registration
- Audio (playTone, playCatch, playStreak, startAmbientDrone)
- aria-label, controls-hint, stat-row, relative home URL
- Level announcement, streak unlock, timer-seconds display
- Danger-pulse, miss-flash, spawnPetals, petalFall, combo-meter, combo-gold, level-flash, woodblock-texture
- animateCountUp, new-highscore, score comparison, game-over flavor, fadeIn
- Mute key handler, controls modal focus management

**Verification output:**
```
=== Verification: Floating Score ===
All regression checks passed (19 assertions)
All structural checks passed (31 checks)
=== All verifications passed ===
```

### Preview

The preview root (`index.html` at repo root) redirects to `drops/floating-score/` via the FactoryX preview path:
- `/factoryx/previews/edo-woodblock/studio-art-build/` → `drops/floating-score/`
- Preview works with relative paths under the FactoryX preview tree
- No studio homepage mutations were needed for the preview link

### Known Limitations
- Audio requires initial user gesture for Web Audio API (browser autoplay policy)
- No service-worker or offline caching
- Canvas renders at display resolution (retina scaling via `devicePixelRatio`)
- `gh` CLI token not available in this runtime, so PR body could not be updated via `gh pr update`
- Preview redirect uses relative paths

### Review Questions
1. Does the result satisfy the concrete brief? (visual instrument, progression mechanics, polished vertical slice)
2. Is the interaction coherent enough for a user to evaluate without extra instructions? (start screen explains mechanics, controls modal available)
3. Are verification steps and known limitations clearly documented in the PR? (verification output included, limitations called out)
