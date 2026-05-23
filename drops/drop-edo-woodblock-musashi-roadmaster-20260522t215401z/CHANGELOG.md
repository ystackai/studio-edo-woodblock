# Changelog — Way of the Brush and Blade

All notable changes to this drop are tracked here.

## [v1.46] — 2026-05-23 — Fix Perfect Hit Threshold Being Wider Than Hit Threshold

### Fixed
- **Perfect hit threshold was too generous** — the perfect hit check used a raw `diff <= 8` (8 percentage points), while the converted hit threshold was narrower (~5% at typical zone widths). This meant every hit was also scored as a perfect hit, making the "Perfect strike!" message meaningless. Changed perfect threshold to `((targetW / 4) + 2) / zoneW * 100`, requiring the indicator to be within the inner quarter of the target zone plus a 2px buffer. This scales correctly with mastery (wider targets make perfects easier) and is always stricter than the hit threshold.

### Technical Debt
- File: ~1631 lines (still well under 5000-line limit)

## [v1.45] — 2026-05-23 — Prevent Stroke Placement After Timer Expires

### Fixed
- **Brush strokes could be placed after timer expired** — when the composition timer reached 0, the minigame waited 600ms before calling `finishBrushMinigame()`. During this window, players could still click the zone or press Enter to place additional strokes, gaining an unfair advantage. Added `timerPaused` guard to `placeStroke()` and `toggleStrokeSelection()` so all interaction is blocked once time runs out.

### Technical Debt
- File: ~1629 lines (still well under 5000-line limit)

## [v1.44] — 2026-05-23 — Fix Duel Hit Detection Mixing Pixels & Percentages

### Fixed
- **Duel hit threshold used wrong units** — the hit detection compared `indicatorPos` and `targetLeft` (both in percentage points) against a threshold calculated from `targetW` (in pixels). This made the duel difficulty vary with screen width: easier on narrow screens, harder on wide screens. The threshold is now converted to percentage of the zone width, ensuring consistent difficulty across all screen sizes. The target width scaling with mastery (wider = easier) is preserved.

### Technical Debt
- File: ~1629 lines (still well under 5000-line limit)

## [v1.43] — 2026-05-23 — Final Duel Context Announcement for Screen Readers

### Added
- **Final duel context explicitly announced for screen readers** — the Ganryūjima context text (which varies by mastery level) is now explicitly announced via `announceSr()` after being set, ensuring screen reader users hear the atmospheric setup even though the element's `aria-live` announcement may be missed during the screen transition.

### Technical Debt
- File: ~1627 lines (still well under 5000-line limit)

## [v1.42] — 2026-05-23 — Keyboard Hint Consistency & Timer Pause Accessibility

### Changed
- **Title screen hint updated** — now reads "Press ENTER/SPACE or click to begin" to match the actual keyboard handler that accepts both keys.
- **Sword instruction updated** — now reads "Press SPACE/ENTER or tap when the moving indicator aligns with the target zone" for consistency with the updated keyboard handler.

### Added
- **Screen reader announcements for timer pause/resume** — the brush composition timer now announces "Timer paused" when the tab becomes hidden and "Timer resumed, X seconds remaining" when the user returns, giving screen reader users awareness of time changes during tab switches.

### Technical Debt
- File: ~1625 lines (still well under 5000-line limit)

## [v1.41] — 2026-05-23 — Enter Key Support for Sword Duels & Resume Mastery Gain Fix

### Added
- **Enter key support for sword striking** — the sword and final duel minigames now accept both Space and Enter as valid strike keys, improving keyboard accessibility. Hint text and help overlay documentation updated accordingly.

### Fixed
- **Stale mastery gain display on resume** — when resuming a saved game, `_lastMasteryGain` is now reset to 0 to prevent showing a stale "+X Mastery" message from a previous session.

### Technical Debt
- File: ~1623 lines (still well under 5000-line limit)

## [v1.40] — 2026-05-23 — Duel Speed Reset Between Rounds & Ending Scroll Flash Fix

### Fixed
- **Duel speed not resetting between rounds** — the `speed` variable was defined once in the minigame scope and persisted across all rounds. When a feint fired in one round, `speed *= 1.3` permanently increased the indicator speed for all subsequent rounds, making them unfairly harder. Moved the speed calculation inside `startRound()` so each round uses the intended base speed, with feint acceleration applying only to the current round.
- **Ending scroll flash before animation** — the scroll element was briefly visible at full size before the `scroll-entrance` animation class was applied (which waits one animation frame). Added default CSS `opacity:0; transform:scaleY(0)` to `#ending-scroll` so it starts hidden, and the animation fill correctly reveals it. Also extended the `prefers-reduced-motion` rule to cover the default state, ensuring scroll visibility when animations are disabled.

### Technical Debt
- File: ~1622 lines (still well under 5000-line limit)

### Fixed
- **Loading overlay wrapper restored** — the `id="loading-overlay" class="loading-overlay"` wrapper div was accidentally removed in v1.38, causing the `#app` div to close prematurely and leaving all game screens outside the application container. This broke layout, positioning, and max-width constraints. Restored the wrapper with proper ARIA attributes.
- **Loading overlay `aria-hidden` toggling** — the overlay now dynamically sets `aria-hidden="true"` when hidden (via `.hidden` class), preventing screen readers from accessing invisible loading content.

### Changed
- **Brush timer `aria-live` removed** — replaced `aria-live="polite"` with bare `role="timer"` (no live region) to eliminate overly chatty screen reader announcements from 100ms updates. Key time thresholds (10s, 5s, 0s) continue to be announced via the dedicated `announceSr()` live region. `aria-atomic` is not needed without a live region.
- **Screen transition announcements use `announceSr()`** — the `showScreen` function now uses the consistent `announceSr()` helper instead of directly setting `textContent` on the live region, ensuring reliable announcement delivery.
- **Waypoint vignette announced for screen readers** — the vignette text is now explicitly announced via `announceSr()` when entering a waypoint, giving screen reader users access to the atmospheric descriptions.
- **Ending scroll paper `aria-label` is dynamic** — the scroll paper's `aria-label` now includes the names of placed brush strokes (e.g., "Journey painting scroll with Bamboo, Plum Blossom, Mountain Peak"), providing screen reader users with a description of their accumulated artwork.
- **`aria-atomic="true"` on `sr-announce`** — the screen reader announcement live region now has `aria-atomic="true"` to ensure announcements are read as cohesive units.
- **`prefers-reduced-motion` extended** — the CSS `@media` rule now also disables the loading bar fill animation and the progress-dot pulse animation when reduced motion is preferred.

### Technical Debt
- File: ~1617 lines (still well under 5000-line limit)

## [v1.38] — 2026-05-22 — Loading ARIA, Timer Accessibility & Scroll Motion

### Fixed
- **Loading overlay `aria-valuenow`** — was hardcoded to `100`; now starts at `0` and is updated progressively via a simulated loading interval, giving screen readers accurate progress feedback
- **Brush timer `aria-atomic` removed** — the `role="timer"` element no longer has `aria-atomic="true"`, preventing overly chatty screen reader announcements on every 100ms tick; screen readers now announce only when `aria-live="polite"` region content changes at key thresholds (10s, 5s, 0s)
- **Ending scroll `aria-hidden`** — the decorative scroll container now has `aria-hidden="true"` since its visual content is already described in the ending text
- **Ending scroll animation respects `prefers-reduced-motion`** — the `scroll-entrance` animation is now skipped when the user's system prefers reduced motion, matching the existing CSS `@media` rule with a JS fallback
- **Help overlay focus restoration safety** — the `toggleHelp` function now checks `typeof _helpPrevFocus.focus === 'function'` and wraps the call in a `try/catch`, preventing errors when the previously focused element is no longer in the DOM

### Technical Debt
- File: ~1607 lines (still well under 5000-line limit)

## [v1.37] — 2026-05-22 — Feint Warning Alert Role & Final Consistency

### Added
- **`role="alert"` on feint warnings** — both the regular and final duel feint warning elements now have `role="alert"` in addition to `aria-live="assertive"`, ensuring screen readers announce feint information as priority alerts

### Technical Debt
- File: ~1593 lines (still well under 5000-line limit)

## [v1.36] — 2026-05-22 — Duel Zone Screen Reader Ready State

### Added
- **Screen reader "Strike now!" announcement** — a visually-hidden `aria-live="polite"` status span has been added inside both the regular and final duel zones. When the indicator enters the target zone and the player can strike, the text updates to "Strike now!"; when it leaves, it updates to "Wait for the indicator". This gives screen reader users real-time awareness of when to press Space or tap

### Technical Debt
- File: ~1593 lines (still well under 5000-line limit)

## [v1.35] — 2026-05-22 — Loading Progressbar ARIA & Timer Unpause Fix

### Added
- **`role="progressbar"` on loading bar** — the loading animation now has proper ARIA progressbar role with `aria-valuemin`, `aria-valuemax`, and `aria-valuenow` attributes, improving screen reader feedback during initial asset loading

### Fixed
- **Brush timer announcement after unpause** — `_lastAnnouncedSec` is now reset to -1 when the timer resumes from a tab-visibility pause, ensuring that key thresholds (10s, 5s, 0s) missed during the hidden period can be announced when the user returns

### Technical Debt
- File: ~1577 lines (still well under 5000-line limit)

## [v1.34] — 2026-05-22 — Fix Target Zone Width Formula (Inverted Bug)

### Fixed
- **Target zone width formula inverted** — the duel target zone width was calculated as `50 - G.mastery * 0.2`, making it **narrower** with higher mastery (50px at mastery 0 → 30px at mastery 100). Corrected to `30 + G.mastery * 0.2`, which properly **widens** the target zone with higher mastery (30px at mastery 0 → 50px at mastery 100), matching the help text description and making higher mastery correctly grant an advantage

### Technical Debt
- File: ~1575 lines (still well under 5000-line limit)

## [v1.33] — 2026-05-22 — Audio Optimization & Small Screen Polish

### Changed
- **Ambient audio skip on same src** — `playAmbient` now checks if the requested audio source is already playing and skips the fade cycle, preventing unnecessary volume ramps when transitioning between screens that use the same background music
- **Ending stats word-break** — added `word-break: break-word` to the journey statistics on the ending screen to prevent text overflow on narrow screens

### Technical Debt
- File: ~1575 lines (still well under 5000-line limit)

## [v1.32] — 2026-05-22 — Duel Miss Message Clarity & Animation Performance

### Changed
- **Duel miss message clarified** — when the indicator passes without the player striking, the result now shows "The moment passed — watch the indicator carefully" instead of just "Missed", giving clearer feedback on what went wrong
- **Screen reader announcement on miss** — added `announceSr('Missed — the moment passed')` so screen reader users also receive clear miss feedback
- **Duel indicator performance** — added `will-change: left` to the `.duel-indicator` CSS, allowing the browser to optimize the indicator's animation for smoother movement

### Technical Debt
- File: ~1573 lines (still well under 5000-line limit)

## [v1.31] — 2026-05-22 — Help Overlay Robustness & Scroll Accessibility

### Fixed
- **Help overlay focus trap safety** — `_helpTabTrap` now checks for empty focusable list before attempting focus, preventing potential errors if no focusable elements exist in the overlay
- **Help backdrop click guard** — `_helpBackdropClick` now verifies the overlay is still active before toggling, preventing stale listeners from reopening a closed overlay

### Added
- **`aria-label` on ending scroll paper** — the scroll paper element now has `aria-label="Journey painting scroll"`, giving screen readers a meaningful description of the visual scroll

### Technical Debt
- File: ~1572 lines (still well under 5000-line limit)

## [v1.30] — 2026-05-22 — UX & Instruction Clarifications

### Added
- **Ending screen restart confirmation** — players who click "Walk the Road Again" on the ending screen now see a confirmation dialog before restarting, preventing accidental loss of the ending view
- **Brush minigame timeout guidance** — when time runs out with no strokes placed, the score display now shows "No strokes placed — 0 coherence. Try selecting strokes next time!" instead of the default score breakdown, helping players understand what happened

### Changed
- **Sword minigame instruction clarified** — updated from "Wait for the ink stroke to complete" to "Press SPACE or tap when the moving indicator aligns with the target zone", more accurately describing the timing mechanic

### Technical Debt
- File: ~1569 lines (still well under 5000-line limit)

## [v1.29] — 2026-05-22 — Accessibility Refinements: Decorative aria-hidden & Screen Reader Timer

### Added
- **`aria-hidden="true"` on decorative elements** — added to all `bg-img`, `bg-overlay`, `ink-line`, `ink-line-thin`, `mastery-bar`, `duel-target`, `timer-bar`, `scroll-rod-top`, `scroll-rod-bottom`, `scroll-roller-end`, `ink-overlay`, and the title screen ink-drop animation container. These elements are purely visual and should be ignored by screen readers
- **`aria-hidden="true"` on duel-round dots** — dynamically created round indicators now have `aria-hidden="true"` since they are decorative visual progress indicators
- **`role="timer"` and `aria-atomic="true"` on brush timer** — the composition timer now uses the proper ARIA role for timers, improving semantic accessibility
- **Key threshold screen reader announcements** — the brush timer now announces at 10s, 5s, and 0s remaining (via `announceSr`) instead of every second, reducing screen reader noise while keeping users informed

### Changed
- **Brush timer `aria-live` removed** — replaced continuous `aria-live="polite"` on the timer element with targeted announcements at key thresholds, preventing excessive screen reader chatter during the countdown

### Technical Debt
- File: ~1562 lines (still well under 5000-line limit)

## [v1.28] — 2026-05-22 — Help Overlay Listener Leak Fix & Robustness Improvements

### Fixed
- **Help overlay event listener leak** — `_helpBackdropClick` and `_helpTabTrap` were function declarations inside `toggleHelp()`, so each call created new function objects and `removeEventListener` could never remove the original listeners. Moved to `init()` scope for stable references, preventing listener accumulation across help open/close cycles
- **Dead code in Escape key handler** — removed unreachable Escape condition in the help toggle keydown handler

### Added
- **`type="button"` to all buttons** — added explicit `type="button"` to all static and dynamically-created buttons to prevent accidental form submission behavior and improve semantic correctness
- **Dynamic aria-label on stroke zone** — the composition area's `aria-label` now updates to reflect the number of strokes placed (e.g., "Composition area with 2 of 3 strokes placed")
- **`aria-live="polite"` on final duel context** — the Ganryūjima context text is now announced by screen readers when the final duel screen appears

### Changed
- **Brush timer interval** — reduced from 200ms to 100ms for smoother timer bar and text display updates

### Technical Debt
- File: ~1550 lines (still well under 5000-line limit)

## [v1.27] — 2026-05-22 — Best Mastery Persistence & Title Screen Display

### Added
- **Best mastery tracking** — the player's best mastery score is now saved to localStorage (`edo-musashi-best-mastery-v1`) and displayed on both the title screen and ending screen, giving players a long-term goal across play sessions
- **Title screen best mastery** — shows "Best Mastery: X / 100" below the hint text when a previous best exists
- **Ending screen best mastery** — shows "Best: X/100" in the journey statistics when the current score isn't the best

### Technical Debt
- File: ~1547 lines (still well under 5000-line limit)

## [v1.26] — 2026-05-22 — Title Screen Subtitle Animation & Loading Pulse

### Added
- **Subtitle reveal animation** — the subtitle on the title screen now fades in with a slight upward motion (`@keyframes subtitleReveal`) 0.3s after the screen appears
- **Loading text pulse** — the "Preparing the road..." text on the loading screen now pulses gently (`@keyframes loadPulse`)
- **Start button glow** — the "Begin the Journey" button has a subtle amber glow (`btn-start-glow` class) to draw attention

### Technical Debt
- File: ~1533 lines (still well under 5000-line limit)

## [v1.25] — 2026-05-22 — Better Aria-Labels & Scroll Seal Animation

### Added
- **Descriptive aria-labels for stroke buttons** — each stroke button now has an `aria-label` that includes the stroke name, description, and keyboard shortcut (e.g., "Bamboo: Slender green stem. Press 1 to select"), improving screen reader usability
- **Scroll seal animation** — the seal/stamp on the ending scroll now appears with a dramatic spin-and-scale animation (`@keyframes sealAppear`) shortly after the scroll unrolls

### Changed
- **Seal implementation** — replaced inline styles with a CSS class (`.scroll-seal`) for better maintainability and animation support

### Technical Debt
- File: ~1529 lines (still well under 5000-line limit)

## [v1.24] — 2026-05-22 — Journey Statistics on Ending Screen

### Added
- **Journey statistics** — the ending screen now displays a summary of the player's journey, including total sword hits, brush compositions completed, and final duel result, giving players a sense of their overall performance

### Technical Debt
- File: ~1526 lines (still well under 5000-line limit)

## [v1.23] — 2026-05-22 — Waypoint Choice History

### Added
- **Waypoint choice history** — the waypoint screen now shows what the player chose at the previous stop (e.g., "Previous: Sword — 2/3 hits" or "Previous: Brush — Coherence 14"), helping players track their journey and plan their next choice

### Technical Debt
- File: ~1511 lines (still well under 5000-line limit)

## [v1.22] — 2026-05-22 — Mastery Gain Display on Waypoint Return

### Added
- **Mastery gain notification** — after completing a sword or brush minigame, returning to the waypoint screen now shows a "✦ +X Mastery" message that fades out after 3 seconds, giving players clear feedback on their progression
- **Mastery tracking** — `_lastMasteryGain` variable tracks the delta between pre- and post-minigame mastery, enabling the gain display

### Technical Debt
- File: ~1495 lines (still well under 5000-line limit)

## [v1.21] — 2026-05-22 — Time's Up Animation & Round Number Display

### Added
- **"Time's up!" animation** — when the brush minigame timer expires, the timer text now shows a dramatic "Time's up!" message with a scale-in animation and a 600ms delay before transitioning to the result, giving the player a clear signal that time has run out
- **Round number label** — sword duel and final duel screens now display the current round number (e.g., "Round 2 / 3") above the duel zone, updated live as each round progresses

### Technical Debt
- File: ~1476 lines (still well under 5000-line limit)

## [v1.20] — 2026-05-22 — Enhanced Help Overlay & Audio Preference Persistence

### Added
- **Audio mute persistence** — the mute preference is now saved to localStorage under key `edo-musashi-muted-v1` and restored on page load, so returning players don't need to re-mute
- **Endings section in help** — the help overlay now explains all three endings and their unlock conditions (Wooden Oar: mastery 80+ and victory; Long Path: victory with lower mastery; Other Shore: loss)
- **Coherence hints in help** — the brush composition section now mentions specific pairings (Bamboo + Plum Blossom, Mountain + Pine) and the coherence hint UI

### Changed
- **Help overlay content** — expanded from 4 sections to 5 (added "Endings"), with richer descriptions for each minigame

### Technical Debt
- File: ~1462 lines (still well under 5000-line limit)

## [v1.19] — 2026-05-22 — Ending Scroll Stroke Animation & Coherence Hints

### Added
- **Staggered scroll stroke animation** — brush strokes on the ending scroll now fade in one by one with a scale effect and staggered delays (`@keyframes scrollStrokeIn`), creating a dramatic reveal of the accumulated painting
- **Coherence combination hints** — when selecting strokes in the brush minigame, a hint line below the stroke tray shows the best-matching pair and its rating (Excellent/Good/Fair), helping players learn which strokes complement each other

### Technical Debt
- File: ~1451 lines (still well under 5000-line limit)

## [v1.18] — 2026-05-22 — Miss Animation, Narrow-Screen Scroll & Touch Hints

### Added
- **Duel miss animation** — when the indicator passes the target without the player striking, the duel zone flashes red (`duel-zone.miss-feedback`), providing clear negative feedback
- **Narrow-screen stroke tray scroll** — on screens ≤480px wide, the stroke palette switches to a horizontal scroll with snap points, preventing overflow on small devices
- **Touch device detection** — `IS_TOUCH` flag detects touch capability at startup; sword duel, brush composition, and final duel hints now show device-appropriate text ("Tap the duel zone" vs "Press SPACE", "Tap strokes to select" vs "Press 1-6")

### Changed
- **Brush minigame hint** — updated to reflect the click-to-place mechanism (removed drag reference, added click/tap instruction)
- **Timer class reset** — `brush-timer` CSS class is reset when the minigame starts, clearing any leftover urgency styling from a previous round

### Technical Debt
- File: ~1431 lines (still well under 5000-line limit)

## [v1.17] — 2026-05-22 — Duel Ready Cue, Result Animation & Title Reveal

### Added
- **Duel zone "ready" cue** — when the indicator approaches the target and the player can strike, the duel zone border glows amber with a subtle inner shadow (`duel-zone.ready`), giving a clear visual signal that it's time to press Space or tap
- **Duel result entrance animation** — round result text now scales in with a brief overshoot (`@keyframes resultAppear`), making hits/misses more satisfying
- **Waypoint title reveal** — screen titles now fade in with a subtle downward slide (`@keyframes titleReveal`) when a new screen becomes active

### Technical Debt
- File: ~1412 lines (still well under 5000-line limit)

## [v1.16] — 2026-05-22 — Multi-Stroke Composition View

### Changed
- **Brush composition zone now shows all placed strokes** — previously only the latest stroke was visible in the composition area; now all 3 placed strokes remain visible, arranged in a triptych-like layout so the player can see their full composition building up
- **Stroke cleanup** — `startBrushMinigame()` now removes all `.placed-stroke` elements instead of only the first, preventing stale strokes from persisting between rounds

### Technical Debt
- File: ~1405 lines (still well under 5000-line limit)

## [v1.15] — 2026-05-22 — Timer Urgency, Vignette Animation & Touch Consistency

### Added
- **Timer urgency visual** — brush minigame timer text turns amber at ≤10s and red with pulsing animation at ≤5s; timer bar gradient shifts to match urgency level (amber → red)
- **Vignette fade-in** — waypoint vignette text now fades in with a subtle upward slide (`@keyframes vignetteFade`) each time a new waypoint is shown
- **Progress dot pulse** — the current waypoint dot now gently pulses with a scale animation (`@keyframes dotPulse`) to visually distinguish the active stop
- **`touch-action: manipulation`** — added to mute toggle, help toggle, and help overlay close button to prevent double-tap zoom on mobile

### Technical Debt
- File: ~1402 lines (still well under 5000-line limit)

## [v1.14] — 2026-05-22 — Image Preloading, Interactive Semantics & A11y Polish

### Added
- **Image preloading** — all waypoint background images and style frames are preloaded at startup via `preloadImages()`, preventing visual flicker when transitioning between screens
- **Stroke placement animation** — placed strokes in the composition zone now animate in with a smooth scale-and-fade effect (`@keyframes strokePlace`)
- **Screen reader announcements** — `announceSr()` helper clears and re-sets text content to force announcement of repeated strings; now used for duel round results (perfect/hit/miss), brush stroke placement (stroke name + count), brush minigame completion (score + mastery), and ending reveal (title + excerpt)
- **`aria-pressed` on mute button** — the mute toggle now reports its pressed state to assistive technology
- **`aria-expanded` on help toggle** — the help button now reports expanded/collapsed state to assistive technology

### Changed
- **Duel zone semantics** — changed `role="img"` to `role="application"` with `aria-roledescription="Duel timing zone"` on both regular and final duel zones, since these are interactive timing widgets, not static images
- **Focus management** — brush minigame now auto-focuses the first stroke button when the tray is populated, improving keyboard navigation
- **Performance** — added `will-change: left` to `.duel-indicator` for smoother animation compositing
- **CSS organisation** — added missing base style for `.mute-toggle` (was only defined with hover/focus-visible)

### Technical Debt
- File: ~1388 lines (still well under 5000-line limit)

## [v1.13] — 2026-05-22 — Focus Trap Fix

### Fixed
- **Help overlay focus trapping** — Tab trap was attached to the overlay element but focus could escape to elements outside the overlay (e.g. mute button), breaking the trap; now attached to `document` so Tab is trapped regardless of where focus is

### Technical Debt
- File: ~1342 lines (still well under 5000-line limit)

## [v1.12] — 2026-05-22 — Help Button, Target Zone Polish

## [v1.11] — 2026-05-22 — Reduced Motion Support

## [v1.10] — 2026-05-22 — Help Overlay Fade, Screen Reader Round Numbers

## [v1.9] — 2026-05-22 — Touch Feedback, Scroll Animation Polish, Title Guard
### Added
- **Duel zone tap feedback** — brief golden ripple animation on the duel zone when the player strikes, improving tactile feel on mobile and desktop

### Changed
- **Ending scroll animation** — unroll duration increased from 0.8s to 1s with a more gradual opacity ramp (40% opacity at midpoint, slight overshoot at 70%) for a smoother reveal

### Fixed
- Title screen ENTER/SPACE handler no longer fires when help overlay is active, preventing accidental game start while reading instructions

### Technical Debt
- File: ~1328 lines (still well under 5000-line limit)


## [v1.8] — 2026-05-22 — Tab-Visibility Pause, Focus Trapping, A11y & Animation

### Added
- **Tab-visibility auto-pause** — brush minigame timer pauses when the user switches away from the game tab and resumes accurately when they return, preventing unfair time loss
- **Help overlay focus trapping** — Tab/Shift+Tab cycles through overlay buttons only; focus returns to the previously focused element when the overlay closes (important a11y improvement)
- **Help overlay click-outside-to-close** — clicking the dark backdrop (not content) closes the overlay
- **Ending scroll unroll animation** — the hanging scroll now animates with a smooth vertical unroll effect when the ending screen appears
- **Progress dot screen reader text** — visually-hidden `aria-live` text announces "Stop X of 5. Y completed." so screen reader users can track journey progress
- **Paused indicator** — brush timer shows "⏸ Paused" when the browser tab is hidden

### Changed
- **Brush timer accuracy** — timer now uses `Date.now()` delta instead of `setInterval` counting, ensuring accurate elapsed time even under heavy CPU load
- **Keyboard shortcut isolation** — pressing M, ?, 1-6, Space, or Enter while the help overlay is open no longer triggers game actions behind it
- **Mute toggle guard** — M key shortcut is disabled when help overlay is active to prevent double-toggle

### Fixed
- Brush timer continued counting down while the browser tab was hidden; now paused via `visibilitychange` listener
- Keyboard focus could escape behind the help overlay, breaking keyboard-only navigation
- Sword strike and brush placement handlers fired while help overlay was open, causing accidental inputs
- Progress dots had no accessible labels for screen readers

### Technical Debt
- File: ~1321 lines (still well under 5000-line limit)

## [v1.7] — 2026-05-22 — Loading Screen & Credits

### Added
- **Loading overlay** — initial page load shows "Preparing the road..." with animated progress bar, fades out after 800ms
- **Credits** — ending screen now shows "Built for Pictures of the Floating World studio. Assets by FactoryX proof-pack pipeline."
- **Help overlay content** — now includes keyboard shortcut reference (M, ?, ENTER/SPACE, 1-6)

### Technical Debt
- File: ~1218 lines (still well under 5000-line limit)

## [v1.6] — 2026-05-22 — Help Overlay & Restart Protection

### Added
- **Help overlay** — press <strong>?</strong> or click to open a how-to-play dialog covering sword duel, brush composition, final duel, and keyboard shortcuts
- **Restart confirmation** — `confirm()` dialog prevents accidental loss of progress mid-journey; only appears when waypoint > 0 and game not completed
- **Escape key** — closes the help overlay when active

### Changed
- **Keyboard shortcut system** — `?` key opens/closes help, `Escape` closes help

### Technical Debt
- File: ~1199 lines (still well under 5000-line limit)

## [v1.5] — 2026-05-22 — Haptic Feedback & Image Fallback

### Added
- **Haptic feedback** — mobile devices vibrate briefly on sword strikes (30ms on hit, 15ms on miss) via `navigator.vibrate()`
- **Background image fallback** — `setBgImage()` helper preloads images and falls back to solid color `#1f1a14` on load error
- **Ink splash size variant** — perfect strikes now show a larger splash (160px) vs normal hits (100px)

### Changed
- **Background image loading** — waypoint background images now use `setBgImage()` helper with error handling

### Technical Debt
- File: ~1146 lines (still well under 5000-line limit)

## [v1.4] — 2026-05-22 — Timer Visuals & Screen Reader Navigation

### Added
- **Brush minigame timer bar** — visual progress bar below the timer text that depletes from 100% to 0%
- **Screen transition announcements** — `#sr-announce` live region announces each screen change for screen readers (e.g. "Screen: waypoint", "Screen: sword")
- **Updated studio.json** — now references the polished drop version (t215401z) instead of the original

### Changed
- **Timer system** — brush minigame timer now drives both text and a visual progress bar via `#brush-timer-fill`

### Technical Debt
- File: ~1130 lines (still well under 5000-line limit)

## [v1.3] — 2026-05-22 — Audio Controls & Accessibility

### Added
- **Mute/unmute button** — persistent audio toggle in top-right corner of the app; cycles between 🔊 and 🔇
- **M keyboard shortcut** — press M to toggle audio mute from any screen
- **Screen reader announcements** — `aria-live` regions on duel results, brush score, timer, feint warnings, and ending text for assistive technology

### Changed
- **Audio system** — `playAmbient()` and `playSfx()` now respect `_muted` flag; ambient audio stops immediately when muted
- **Title screen keyboard handling** — pressing ENTER resumes a saved journey when one exists (previously always started new game)

### Technical Debt
- File: ~1118 lines (still well under 5000-line limit)

## [v1.2] — 2026-05-22 — Accessibility & Visual Polish

### Added
- **SVG-based stroke rendering** — brush strokes now render as detailed SVGs (bamboo, plum blossom, pine, wave crest, mountain peak, flying crane) instead of CSS gradients, improving visual quality at all sizes
- **Waypoint progress dots** — five dots show completed, current, and upcoming waypoints at a glance
- **Aria-live regions** — `aria-live="polite"` on duel results, brush score, timer, and ending text; `aria-live="assertive"` on feint warnings for screen reader announcements
- **`touch-action: manipulation`** — on duel zones and stroke buttons to prevent double-tap zoom on mobile
- **Ink splash effect** — missing `.ink-splash` CSS class and `@keyframes inkSplash` restored; now visible on sword hits and perfect strikes
- **Drag-and-drop** — stroke buttons now have `draggable="true"`, enabling HTML5 drag-and-drop to the composition zone

### Changed
- **Ink-wash transition timing** — overlay fade timeout increased from 200ms to 500ms to match CSS transition duration (0.5s), preventing visual glitch
- **Title screen keyboard handling** — pressing ENTER now resumes a saved journey instead of always starting a new game
- **Stroke button styling** — `.stroke-btn.used` adds `cursor:default`, `.stroke-btn.selected` adds `box-shadow` for better visual feedback
- **Duel round dots** — added `box-shadow` on hit rounds for subtle glow effect
- **Feint warning** — added `font-style:italic` and `opacity` transition for smoother text changes

### Fixed
- `.ink-splash` CSS class was missing from v1.1 (present in v1.0); ink splash effects are now visible on sword strikes
- Stroke previews used CSS gradients that didn't render consistently; now use inline SVGs
- HTML5 drag-and-drop was broken because stroke buttons lacked `draggable="true"`
- Ink-wash overlay timeout (200ms) was shorter than CSS transition (500ms), causing abrupt screen transitions
- Title screen ENTER key always started new game even when a saved journey existed
- Duplicate `feint-warning` and `brush-score` elements in HTML cleaned up

### Technical Debt
- File: ~1085 lines (still well under 5000-line limit)
- No external CDN dependency beyond Google Fonts

## [v1.1] — 2026-05-22 — Polish Pass

### Added
- **Japanese display font (Noto Serif JP)** — loaded via Google Fonts CSS API with system fallback for offline mode
- **Ambient audio crossfade** — smooth fade between waypoint music tracks instead of hard-cut
- **Brush minigame SFX** — `pack3-sfx.wav` now plays on each stroke placement
- **Ink-wash screen transition** — radial overlay fades between screens for smoother navigation
- **Feint visual cue** — timing indicator pulses with amber glow during feints in the final duel
- **Keyboard accessibility** — `.keyboard-user` class highlights focus outlines when keyboard input is detected
- **Mobile layout queries** — expanded responsive CSS for narrow (≤480px) and wide (≥768px) viewports
- **Hover/focus glow** — choice buttons show subtle radial glow on hover/focus
- **Idle ink-drop animation** — slow animation on the title screen
- **Final duel background layer** — low-opacity ink-wash overlay from pack1-style-frame.png
- **CHANGELOG.md** — this file

### Changed
- **Vignette persistence** — vignette choice is now stored per-waypoint in `vignetteForWaypoint[]`, preventing reroll on page refresh mid-journey
- **Scroll painting visual** — now renders as a traditional hanging scroll (kakemono) with wooden rods, roller-end caps, and paper texture inset
- **Screen transition system** — `showScreen()` now uses an ink-wash overlay for smooth crossfade between screens

### Fixed
- `pack3-sfx.wav` was defined in assets but never played; now wired to brush stroke placement
- Vignette text was rerolled on page refresh; now persisted to localStorage
- No visual distinction between feint and real strike in final duel; now indicator pulses amber during feints

### Technical Debt
- File grew from 958 to 1062 lines (still well under 5000-line limit)
- No external CDN dependency beyond Google Fonts (offline fallback works via system font stack)

## [v1.0] — 2026-05-22 — Initial Drop

### Added
- Complete single-file interactive web game (index.html, ~958 lines)
- Title screen with "Begin the Journey" and "Continue Previous Journey" buttons
- Five waypoints (Temple Yard at Dawn, River Crossing in Rain, The Mountain Teahouse, Snowbound Pass, Fishing Village at Dusk)
- Sword minigame: timing-based draw-cut with 3 rounds per stop
- Brush minigame: sumi-e composition with 6 stroke types and coherence scoring
- Final duel at Ganryujima with feint detection and difficulty scaling
- Three endings: The Wooden Oar, The Long Path, The Other Shore
- Accumulated painting scroll displayed at ending screen
- localStorage save/resume under key `edo-musashi-roadmaster-v1`
- Keyboard accessibility (SPACE, 1-6, ENTER)
- Three asset packs (style frames, music loops, SFX, 3D models)
- README.md with how-to-play and file structure
