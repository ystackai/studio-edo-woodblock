## FactoryX WorkOrder Context

FactoryX-WorkOrder: work-order-1779058005807-18
FactoryX-Factory: factory-edo-woodblock

**WorkOrder ID:** `work-order-1779058005807-18`
**Factory:** `factory-edo-woodblock`
**Studio:** `studio-edo-woodblock` — "Pictures of the Floating World"
**Project:** `ystackai/studio-edo-woodblock`
**Branch:** `factoryx/factory-edo-woodblock/studio-art-build`
**Deadline:** 2026-05-18T14:46:45Z

### Brief
- Build a visual instrument where user input creates meaningful changes over time
- Include at least one progression mechanic (levels, unlocks, streaks, score)
- Ship a polished vertical slice with no dead buttons, broken layout, or placeholder screens

### Latest Commit
`8b93b56` — Add controls button in pause overlay, ?/H controls grid entry, context-aware focus restoration

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
- Controls modal with keyboard shortcut reference (available from start screen and pause overlay)
- Controls auto-close on game start/end to prevent overlap with gameplay/game-over screen
- Context-aware focus restoration when controls modal closes (returns to pause-controls-btn if paused, or start-screen controls-btn otherwise)

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
- Context-aware focus restoration when controls modal closes

### Verification

**Regression test:** `test-begin-button.js` — Playwright end-to-end test (19 assertions)
- Preview redirect, start screen, Begin button click, timer, score, level, canvas
- Game-over screen, final score, stats breakdown, retry button, home button, flavor text
- Retry restarts game, Mute key (M) toggles/restores mute state

**Structural verification:** `verify.sh` — 33 structural grep checks + Playwright gate
- HTML validity, canvas, score/level/streak/timer mechanics
- Keyboard/touch support, ukiyo-e drawing functions, studio.json/asset-manifest/drops/index registration
- Audio (playTone, playCatch, playStreak, startAmbientDrone)
- aria-label, controls-hint, stat-row, relative home URL
- Level announcement, streak unlock, timer-seconds display
- Danger-pulse, miss-flash, spawnPetals, petalFall, combo-meter, combo-gold, level-flash, woodblock-texture
- animateCountUp, new-highscore, score comparison, game-over flavor, fadeIn
- Mute key handler, controls modal focus management
- pause-controls-btn, ?/H controls grid entry, toggleMute function

### Polish Pass C — Combo meter pulse animation, screen reader announcements, start-screen atmosphere

**Polish Pass C changes:**
- Added `@keyframes goldPulse` and `#combo-meter.combo-gold { animation: goldPulse ... }` — continuous gentle scale pulse while at streak >= 5 (combo-gold status)
- Added `ariaLive.textContent` announcements for pause/resume for screen reader users
- Added `@keyframes titleAtmosphere` and `#start-screen::before` animated gradient background for atmospheric start screen

**Verification output (latest):**
```
=== Verification: Floating Score ===
All regression checks passed (26 assertions)
All structural checks passed (42 checks)
=== All verifications passed ===
```

### Preview

Preview root (`index.html` at repo root) redirects to `drops/floating-score/`:
- `/factoryx/previews/edo-woodblock/studio-art-build/` → `drops/floating-score/`
- Preview works with relative paths under the FactoryX preview tree

### Known Limitations
- Audio requires initial user gesture for Web Audio API (browser autoplay policy)
- No service-worker or offline caching
- Canvas renders at display resolution (retina scaling via `devicePixelRatio`)
- PR body is updated through the FactoryX GitHub delivery path
- Preview redirect uses relative paths
- `gh` CLI not available for automated PR update — staged in `.factoryx/PR_BODY.md`

### Review Questions
1. Does the result satisfy the concrete brief? (visual instrument, progression mechanics, polished vertical slice)
2. Is the interaction coherent enough for a user to evaluate without extra instructions? (start screen explains mechanics, controls modal available from start screen and pause overlay)
3. Are verification steps and known limitations clearly documented in the PR? (verification output included, limitations called out)
