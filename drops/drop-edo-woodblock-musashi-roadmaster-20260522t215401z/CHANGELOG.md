# Changelog — Way of the Brush and Blade

All notable changes to this drop are tracked here.

## [v1.10] — 2026-05-22 — Help Overlay Fade, Screen Reader Round Numbers

### Added
- **Help overlay fade transition** — overlay now fades in/out over 0.4s instead of appearing instantly, for a smoother UX

### Changed
- **Duel result screen reader text** — each round result now includes the round number (e.g. "Round 1: Perfect strike!", "Round 2: Miss") so screen reader users can track duel progress

### Technical Debt
- File: ~1328 lines (still well under 5000-line limit)

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
