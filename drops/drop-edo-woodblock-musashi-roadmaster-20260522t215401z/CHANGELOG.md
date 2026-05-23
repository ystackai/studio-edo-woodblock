# Changelog — Way of the Brush and Blade

All notable changes to this drop are tracked here.

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
