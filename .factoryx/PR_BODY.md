## FactoryX WorkOrder Context

FactoryX-WorkOrder: work-order-1779065426437-1
FactoryX-Factory: factory-edo-woodblock

**WorkOrder ID:** `work-order-1779065426437-1`
**Factory:** `factory-edo-woodblock`
**Studio:** `studio-edo-woodblock` — "Pictures of the Floating World"
**Project:** `ystackai/studio-edo-woodblock`
**Branch:** `factoryx/factory-edo-woodblock/studio-art-build`
**Deadline:** 2026-05-18T16:50:24Z

### Brief
- Build a visual instrument where user input creates meaningful changes over time
- Core interaction: make the primary mouse/touch/keyboard loop obvious within the first five seconds
- Ship a polished vertical slice with no dead buttons, broken layout, or placeholder-only screens

---

## Implemented Scope

### Game: `drops/floating-score/index.html`

**Core interaction:** Timed ukiyo-e element collection game with streak-based scoring. Start screen explains mechanics with element legend and controls hint — the primary loop (click/tap to catch drifting elements, score points, manage timer) is obvious within the first five seconds.

**Progression mechanics:**
- **Levels** — Speed increases every 5 catches, max level 10; scoring multiplier grows
- **Streaks** — Bonus points at 3 (Gentle Breeze), 5 (Spring Gust), 10 (Autumn Gust), 15 (Tempest), 25 (Dragon Flight), 50 (Wind of Paradise)
- **Score** — Points per type (waves=1, blossoms=1, mountains=2, birds=3, clouds=5)
- **Timer** — 60-second countdown with danger pulse at ≤10s, warning at ≤20s
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
- Context-aware focus restoration when controls modal closes
- **NEW: Escape closes controls modal** — pressing Escape while controls modal is open closes it without triggering pause toggle

**Polish features:**
- Ukiyo-e flavor text on game-over (5 quote tiers based on score)
- Sakura petal overlay on game-over (fade-in animation)
- Woodblock texture overlay, combo meter, level flash, miss flash, danger pulse
- Count-up score animation, new-highscore celebration glow
- Ambient drone audio, catch/streak tone/level-up sounds
- Start-screen animated gradient background (`titleAtmosphere` keyframe)
- Combo meter gold pulse animation at streak ≥ 5
- Fade transitions on start/game-over screens
- **NEW: Ambient animation stops during gameplay** — `requestAnimationFrame` loop is cancelled when game starts and resumed when game ends, reducing unnecessary CPU work
- **NEW: Focus-visible keyboard navigation styles** — gold outline + subtle glow on all buttons, canvas, and controls for keyboard users

**Accessibility:**
- `aria-label` on all buttons and canvas
- `aria-live="polite"` region for game state announcements (pause/resume)
- Keyboard shortcuts for all core actions
- Focus management: canvas on start, retry button on game-over, close button in controls modal
- Context-aware focus restoration when controls modal closes
- `:focus-visible` styles with gold accent outline for keyboard navigation

### Verification

**Regression test:** `test-begin-button.js` — Playwright end-to-end test (27 assertions)
- Preview redirect, start screen, Begin button click, timer, score, level, canvas
- Pause/resume, controls modal open/close, Escape closes controls modal
- Game-over screen, final score, stats breakdown, retry/home buttons, flavor text
- Mute key (M) toggle, retry restarts game
- **NEW: Escape key closes controls modal while paused**

**Structural verification:** `verify.sh` — 42 structural grep checks + Playwright gate
- HTML validity, canvas, score/level/streak/timer mechanics
- Keyboard/touch support, ukiyo-e drawing functions, studio.json/asset-manifest/drops/index registration
- Audio (playTone, playCatch, playStreak, startAmbientDrone, stopAmbientDrone)
- aria-label, controls-hint, stat-row, relative home URL
- Level announcement, streak unlock, timer-seconds display
- Danger-pulse, miss-flash, spawnPetals, petalFall, combo-meter, combo-gold, level-flash, woodblock-texture
- animateCountUp, new-highscore, score comparison, game-over flavor, fadeIn
- Mute key handler, controls modal focus management
- pause-controls-btn, ?/H controls grid entry, toggleMute function
- aria-live announcements, titleAtmosphere keyframe, goldPulse keyframe

**Verification output (latest):**
```
=== Verification: Floating Score ===
All regression checks passed (27 assertions)
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
- Preview redirect uses relative paths
- `gh` CLI not fully available for automated PR update — staged in `.factoryx/PR_BODY.md`

### Review Questions
1. Does the result satisfy the concrete brief? (visual instrument with progression mechanics, obvious core interaction within 5 seconds, polished vertical slice)
2. Is the interaction coherent enough for a user to evaluate without extra instructions? (start screen explains mechanics, controls modal available, keyboard shortcuts documented)
3. Are verification steps and known limitations clearly documented in the PR? (verification output included, limitations called out)
