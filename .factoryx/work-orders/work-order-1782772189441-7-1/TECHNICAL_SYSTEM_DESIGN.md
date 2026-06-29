# Technical System Design — Playable Edo Living Print Loop Canary

**Work Order:** work-order-1782772189441-7-1
**Branch:** factoryx/factory-edo-woodblock/work-order-1782772771581-7-5
**Archetype:** creative_game
**Playbook:** browser-game-2d
**Date:** 2026-06-29

---

## 1. Product Intent (from strategy / goal)

Build a single-screen, immediately playable ukiyo-e inspired interactive experience. The player observes a living print, acts with pointer/touch/keyboard, gets immediate visual feedback, and discovers a joyful transformation over ~60 seconds. No landing page — the first screen is the game.

## 2. Concept: "Kawaki" (河霧 — River Mist)

A faded ukiyo-e of a river scene at dawn. The print is partially dissolved — mist obscures most of the image. The player's touch or click "presses ink" into the paper, locally clearing mist and revealing the scene beneath. As ink accumulates, the print comes alive:

- **0–30% ink:** Faded mountain silhouette emerges from mist. Paper grain is visible.
- **30–60% ink:** A small wooden boat (sampan) drifts into frame. River ripples animate around where the player pressed.
- **60–85% ink:** A lone bird (gull or heron) appears and flies a slow arc. Rain begins to fall, each drop creating small ripples.
- **85–100% ink:** The full print resolves — lanterns light on the boat, the bird circles, rain intensifies then softens. The scene "breathes" as a living print.

The single compositional gesture: **pressing ink reveals the world**. The print is also the instrument — the more you engage, the more alive it becomes.

### Core Loop (one verb, one space)

1. **Observe:** A misty, almost blank paper with a faint landscape ghost.
2. **Act:** Press/click/tap anywhere on the canvas. Each press deposits "ink" in a radial bloom, clearing mist and triggering a soft visual response.
3. **Respond:** A brush-stroke ripple expands from the contact point. Ink darkens the paper locally. If enough ink has accumulated, new elements animate in (boat, bird, rain).
4. **Discover:** At ~60 seconds of sustained gentle engagement, the print fully resolves into a complete, breathing scene — a small but genuine "reveal" moment.

### Why This Concept

- Fits the house style: paper, ink, mist, weather, negative space, one strong gesture.
- Immediately understandable: the faded paper invites pressing. No tutorial needed.
- Has meaningful state: ink level drives scene progression.
- Transformation over ~60s: from blank paper to living print.
- Procedural canvas-native art is appropriate here — the aesthetic is paper/ink, not character-driven 3D.

## 3. System Architecture

```
index.html (entrypoint)
├── game.js          — main game loop, scene state, interaction, rendering
├── audio.js         — Web Audio API: sparse, physical sounds
└── styles.css       — minimal layout, paper background, UI overlay
```

### 3.1 File Structure

```
drops/kawaki/
├── index.html       — self-contained entry point, no external deps
├── game.js          — ~600 lines; scene, loop, input, state machine
├── audio.js         — ~200 lines; ink press SFX, ambient rain texture
├── styles.css       — ~50 lines; minimal, paper-texture background
└── assets/
    └── paper-texture.png  — small (256x256), seamless paper grain (generated)
```

Total payload target: **< 150KB** uncompressed.

### 3.2 Module Responsibilities

#### `game.js`

| Component | Responsibility |
|-----------|---------------|
| `Scene` | Manages the layered print: paper base, mist layer, mountain silhouette, river, boat, bird, rain |
| `InkSystem` | Tracks total ink (0–100), radial ink deposits, ink bloom animation per press |
| `MistSystem` | Procedural mist field; ink clears mist locally; mist slowly regenerates at edges |
| `ElementSpawner` | Conditionally spawns/animates elements based on ink thresholds |
| `InputHandler` | Pointer/touch/keyboard events; converts to ink deposits |
| `RenderLoop` | 60fps `requestAnimationFrame`; composites layers with `globalCompositeOperation` |
| `State` | Game phase: `IDLE` → `PRESSING` → `LIVING` → `RESOLVED` |

#### `audio.js`

| Component | Responsibility |
|-----------|---------------|
| `AudioContext` | Created on first user gesture (no autoplay) |
| `InkSound` | Short, soft "shhh" — ink deposit on paper (filtered noise burst) |
| `RainTexture` | Faint rain ambience only after 60% ink, using filtered noise |
| `BirdCall` | Single distant chirp after 60% ink, triggered by bird entrance |

All audio is procedural (oscillators + noise buffers), no external audio files needed.

#### `styles.css`

Minimal layout: full-viewport canvas, subtle paper-color background, small title overlay (fades out after first interaction).

## 4. Data Flow

```
User gesture (pointer/touch/keyboard)
    ↓
InputHandler → creates InkDeposit at {x, y}
    ↓
InkSystem → adds deposit to radial bloom queue, increments total ink
    ↓
RenderLoop (60fps):
  1. Draw paper base (tinted warm off-white, with procedural grain)
  2. Draw ink deposits (dark radial gradients with feathered edges)
  3. Draw scene elements (masked by ink — more ink = more visible)
  4. Draw mist layer (procedural fog, thinner where ink is)
  5. Draw rain particles (after 60% threshold)
    ↓
ElementSpawner checks ink thresholds → triggers new element animations
    ↓
AudioSystem plays context-appropriate SFX on first interaction, and threshold crossings
```

### 4.1 State Machine

```
┌──────────┐     first press     ┌──────────┐
│   IDLE   │ ──────────────────→ │ PRESSING │
└──────────┘                     └──────┬───┘
                                        │
                              ink ≥ 30%  ↓
                               ┌──────────────┐
                               │   AWAKENING  │ (boat enters)
                               └──────┬───────┘
                                      │
                            ink ≥ 60%  ↓
                            ┌─────────────────┐
                            │     LIVING      │ (bird, rain)
                            └──────┬──────────┘
                                   │
                            ink ≥ 85%  ↓
                            ┌─────────────────┐
                            │    RESOLVED     │ (full scene, breathing)
                            └─────────────────┘
```

Transitions are animated (2–3 second crossfades), never instant.

## 5. Visual Design — Canvas Implementation

### 5.1 Paper Base
- Warm off-white: `#F2EDE6`
- Procedural grain: Perlin-like noise at 256x256, tiled, with `globalCompositeOperation: 'multiply'` at 8% opacity
- Subtle fiber texture via noise function (no external image needed for grain; `paper-texture.png` is optional optimization)

### 5.2 Ink System
- Each press creates a radial gradient bloom: dark center (`#1a1a2e` at 40% opacity) fading to transparent at ~80px radius
- Blooms expand over 400ms with cubic bezier easing `cubicBezier(0.25, 1.0, 0.5, 1.0)`
- Ink persists; overlapping presses compound opacity multiplicatively
- Total ink is computed as the average opacity across the paper surface

### 5.3 Mist Layer
- Procedural: layered sine-wave displacement + noise, creating soft fog patches
- Mist density = `1.0 - (inkLevel / 100) * 0.85`
- Where ink is deposited, mist thins radially (the "clearing" effect)
- Slow regeneration: mist slowly fills back at edges (0.001 per frame), creating a gentle tension

### 5.4 Scene Elements (drawn through ink/mist mask)

**Mountain silhouette** (visible from 0% ink, becomes clearer with more ink):
- Simple bezier path: one large mountain (Fuji-like), one smaller behind it
- Rendered as filled path with slight feathered edge
- Color: deep indigo `#213B5E` at variable opacity based on ink level

**River** (visible from 15% ink):
- Horizontal band across lower third
- Sine-wave animated ripples, color `#5886A0` at low opacity
- Ripple amplitude increases with ink level

**Boat** (spawns at 30% ink, 2s animated entrance):
- Small sampan silhouette, drifting slowly right-to-left
- Lantern glow (faint vermilion `#C2453D`) appears at 85% ink
- Gentle bobbing animation (2s period)

**Bird** (spawns at 60% ink):
- Simple heron silhouette (3–4 bezier strokes)
- Flies a slow arc across the scene
- Wing flap animation at 0.5s period

**Rain** (spawns at 60% ink):
- ~20–40 rain streaks, diagonal at 75°
- Each drop creates a small ripple on the river surface
- Rain intensity scales: light drizzle at 60%, moderate at 85%, then softens

### 5.5 The "Living" Feel
- At 85%+ ink, the entire scene enters a "breathing" mode:
  - Mountains subtly shift (0.5px drift, 8s period)
  - River ripples gain secondary wave patterns
  - Mist edges pulse gently
  - Boat lantern flickers
- This is the payoff: the print is alive

## 6. Audio Design

### 6.1 Philosophy
Sparse, physical, user-initiated. No continuous ambient music. Sound is the memory of ink on paper.

### 6.2 Sound Events

| Event | Trigger | Sound |
|-------|---------|-------|
| First press | Any interaction | Soft "shhh" — filtered noise burst, 200ms, 60dB attenuation |
| Subsequent press | Each ink deposit | Same shhh, slightly randomized pitch (±5%) |
| Boat entrance | Ink crosses 30% | Single soft "whoosh" — low-frequency sweep, 800ms |
| Bird entrance | Ink crosses 60% | Distant chirp — two-note oscillation, 400ms |
| Rain start | Ink crosses 60% | Faint rain texture — filtered pink noise, very quiet |
| Full reveal | Ink crosses 85% | Subtle "bloom" — warm chord (C major, muted), 1.5s fade |

### 6.3 Implementation
- `AudioContext` created lazily on first `pointerdown`
- All sounds are procedural: `OscillatorNode` + `BiquadFilterNode` + `GainNode`
- Rain texture: `ScriptProcessorNode` generating filtered noise
- No external audio files
- Master volume default: 0.3 (quiet, atmospheric)

## 7. Input Design

### 7.1 Pointer (mouse/touch)
- Primary interaction: `pointerdown` / `pointermove` (with button held) / `pointerup`
- Each contact point creates an ink deposit
- Dragging creates a trail of deposits (like a brush stroke)
- Touch targets: the entire canvas (well above 44px minimum)

### 7.2 Keyboard
- `Space` or `Enter`: deposit ink at current cursor position (or center if no cursor)
- `R`: reset (fades everything back to mist)
- These are secondary; pointer is the main input

### 7.3 Response Time
- Ink deposit visible within 1 frame (~16ms) of press
- Audio feedback within 50ms
- No input lag

## 8. Asset Strategy

### 8.1 Procedural-first approach
This concept is well-suited to procedural canvas art. The ukiyo-e aesthetic (paper, ink, mist) is naturally expressed through:
- Canvas gradients (ink deposits)
- Sine-wave functions (ripples, rain, bird flight)
- Noise functions (paper grain, mist)
- Bezier paths (mountain silhouettes, boat, bird)

### 8.2 Foundry-generated assets (optional enhancement)
If available during implementation:
- Use Blender to generate a simple paper-texture image (256x256 PNG, seamless)
- This replaces the procedural noise grain with a more authentic texture
- Record in ASSET_MANIFEST.md with Blender job ID and provenance

### 8.3 No 3D assets needed
This is a 2D canvas experience. No Blender character or vehicle models. No Unity integration. The visual identity is procedural ink-on-paper.

## 9. Libraries and Dependencies

- **Zero external libraries.** Everything is vanilla JS + Canvas 2D + Web Audio API.
- This ensures: lightweight payload, no CDN dependencies, offline capability, fast load.
- Target: single `index.html` + 3 small files, total < 50KB gzipped.

## 10. Verification Plan

### 10.1 Automated checks (run before PR)
1. **Syntax check:** `node --check game.js && node --check audio.js`
2. **Browser runtime test:** Use Puppeteer/Playwright to:
   - Open the page
   - Simulate 10 pointer presses over 30 seconds
   - Capture screenshot at 30%, 60%, 85% ink levels
   - Verify no `console.error` or `pageerror` events
   - Verify canvas is non-blank (pixel variance > threshold)
3. **Payload check:** `du -sh drops/kawaki/` should be < 150KB

### 10.2 Game Feel Checklist verification
- [ ] Core verb (pressing ink) demonstrated in first 30 seconds — immediate visual feedback on first press
- [ ] Input response < 100ms — ink deposit visible same frame as press
- [ ] Easing on all motion — cubic bezier for ink bloom, sine waves for environmental animation
- [ ] Hit/score feedback — each press has visual bloom + soft audio "shhh"
- [ ] Audio only after user gesture — AudioContext created on first pointerdown
- [ ] Touch targets ≥ 44px — entire canvas is interactive
- [ ] 60fps target — single canvas, simple shapes, no heavy computation
- [ ] Lightweight payload — < 50KB gzipped, no external deps
- [ ] No external network dependencies — self-contained, works offline

### 10.3 Screenshot evidence
Capture 4 screenshots for review:
1. **Idle state** — misty, almost blank paper
2. **30% ink** — mountain emerging, boat entering
3. **70% ink** — bird present, rain falling
4. **100% ink** — full living scene, breathing mode

## 11. Risks and Mitigations

| Risk | Likelihood | Mitigation |
|------|-----------|------------|
| Procedural art feels generic, not ukiyo-e | Medium | Test early; if the mountain/boat silhouettes feel like generic vector art, adjust the bezier paths to have the characteristic asymmetry and flatness of ukiyo-e |
| Ink system feels like a "fill meter" not "brushing" | Medium | Ink deposits must have visible brush-stroke character: irregular edges, slight color variation, not perfect circles |
| 60-second progression is too slow or too fast | Low | Tune thresholds iteratively; test with a timer |
| Audio doesn't work on some browsers | Low | Graceful degradation: audio is enhancement, not required for playability |
| Canvas performance on mobile | Low | Keep particle counts low (≤40 rain drops, ≤10 ink deposits active); profile on mid-device |

## 12. Non-Goals

- No save/load or persistence
- No multiple scenes or levels
- No inventory or scoring system
- No network calls or external APIs
- No Unity or 3D integration
- No complex character animation or sprite sheets
- No multiplayer or social features
- No settings menu or options screen
- No landing page or tutorial — the experience IS the landing page

## 13. Implementation Order

1. **Paper + mist base** — the blank canvas, procedural mist, paper grain
2. **Ink deposit system** — pointer input creates visible ink blooms with easing
3. **Mountain silhouette** — the first scene element, revealed by ink
4. **Ink threshold tracking** — compute total ink, trigger threshold crossings
5. **Boat entrance** — animated spawn at 30% ink
6. **Bird + rain** — spawn at 60% ink
7. **Audio integration** — ink sounds, boat whoosh, bird chirp, rain texture
8. **Resolved state** — breathing mode at 85%+, full scene alive
9. **Polish pass** — tune easing curves, colors, animation periods
10. **Verification** — automated checks, screenshots, game feel checklist

## 14. Preview Path

- Preview URL: `drops/kawaki/index.html`
- Relative link: `drops/kawaki/`
- No redirect or homepage changes needed
- Opens directly to the playable scene

---

*Design locked for 12h canary. Implementation begins after this doc is committed.*
