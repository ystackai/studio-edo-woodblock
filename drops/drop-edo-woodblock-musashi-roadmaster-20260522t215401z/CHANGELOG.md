# Changelog — Way of the Brush and Blade

All notable changes to this drop are tracked here.

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
