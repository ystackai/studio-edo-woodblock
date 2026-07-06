# Technical System Design: Pictures of the Floating World

> **Work Order:** `work-order-1783320826952-7-1`
> **Factory:** `factory-edo-woodblock`
> **Playbook:** `browser-game-2d`
> **Archetype:** `creative_game`
> **Completion mode:** `polish_until_deadline`
> **Branch:** `factoryx/factory-edo-woodblock/work-order`
> **Target:** `games/94-kawanakajima/index.html` (single-file game)
> **Date:** 2026-07-06

---

## 1. Vision & Player Fantasy

### 1.1 Player Fantasy

The player is a master printmaker at an Edo-period workshop. Each click is the press of a *baren* against washi paper — deliberate, physically resistant, rewarding patience over speed. The player builds an ever-deepening ukiyo-e composition not through accumulation of features but through repeated, gentle engagement with the same gesture.

**Emotional target:** *Quiet mastery*. The piece feels like it was pulled from a woodblock — warm, slightly imperfect, alive with the breath of the maker. Repeated clicks accumulate into earned beauty, not score inflation.

### 1.2 Mood & References

| Aspect | Reference | Manifestation |
|--------|-----------|---------------|
| Atmosphere | Hiroshige's *Thirty-Six Views of Mt. Fuji* | Mist eating distance, atmospheric depth |
| Composition | Hokusai's *Great Wave* | Bold single gestures, dramatic cropping |
| Figure | Utamaro's *Bijin-ga* | Tenderness in line, charged stillness |
| Expression | Sharaku's portraits | Expressive simplicity, the mask that reveals |

### 1.3 "Good" Definition

A player who clicks once sees a quiet gesture. Three clicks with patience reveal a layered composition. Fifty slow clicks reveal something that feels like it was printed on real paper, in real ink, in the floating world. Frantic clicking produces diminishing returns — the paper saturates.

---

## 2. Core Interaction Loop

### 2.1 Redesign from Current State

| Current (Kawanakajima) | Target (Floating World) |
|------------------------|------------------------|
| Two 3D WebGL canvases with orbit controls | Single 2D canvas — the print surface |
| Roster of 20 samurai JPGs/GLBs | No roster — the canvas IS the work |
| "THE INSTANT" clash button | "Finish Print" → captures as PNG with seal |
| Click on roster selects GLB to load | Click on canvas places ink layer |
| Drag to orbit 3D view | Drag for brushstroke direction/length |
| Spacebar triggers clash animation | Long-press = "baren press" deepening |

### 2.2 Interaction Sequence

1. **Open** → Paper-textured canvas with a single faint outline (mountain, wave, or figure silhouette in light ink)
2. **Click once** → A brushstroke appears at the click point. Ink spreads from the point over 200–400ms with soft, asymmetric falloff
3. **Click repeatedly in the same area** → The print deepens: more ink layers, richer color (vermilion over indigo over black)
4. **Click across different regions** → New compositional elements emerge — mountains in distance, waves in foreground, figures in mid-ground
5. **Hold click (long press, >600ms)** → "Baren press" — sustained area gets darker, more saturated, as if the carver is pressing harder
6. **The print evolves organically** — each click adds to the whole; the canvas is never fully covered; paper grain always visible
7. **"Finish" button** → Captures the canvas as a PNG with a subtle vermilion seal stamp in the corner, triggers download

### 2.3 Resistance & Saturation Mechanics

| Mechanic | Implementation |
|----------|---------------|
| **Ink spread** | Radial gradient from click point, soft falloff, 200–400ms animation |
| **Diminishing returns** | Track per-pixel ink density; after ~5 rapid clicks in one area, further clicks produce smaller visual changes (paper saturation) |
| **Paper saturation** | Maintain a per-canvas saturation accumulator; high rapid-click count reduces opacity/ink spread radius for subsequent clicks |
| **Mist/ink bleed** | Subtle Gaussian-like blur overlay between clicks to soften edges |
| **Animation delay** | Ink doesn't appear instantly — it blooms from the click point |

### 2.4 Interaction Controls

| Input | Action |
|-------|--------|
| Click (tap) | Place a brushstroke / ink layer |
| Click + drag | Paint a line stroke (directional ink) |
| Hold click (>600ms) | Baren press — deepen the area under cursor |
| Release after hold | Finalize the baren press |
| "Finish Print" button | Capture + download as PNG |
| "Reset" button | Clear canvas, keep paper texture |
| Sound toggle | Toggle procedural audio |
| R | Reset canvas |

---

## 3. Art Direction

### 3.1 Visual Identity (Non-Negotiable Palette)

| Color | Hex | Role |
|-------|-----|------|
| Paper ground | `#f8f4eb` | Background — warm handmade washi |
| Ink (sumi) | `#0f172a` | Primary drawing — deep charcoal, never pure black |
| Vermilion | `#c2410f` | Accents, seals, highlights — used sparingly |
| Indigo (aizome) | `#2c3a5f` | Depth, secondary layers |
| Gold | `#b38b3f` | Seals, final touches — minimal |

### 3.2 Textures & Effects

| Texture | Source | Implementation |
|---------|--------|---------------|
| Paper grain | Procedural | Perlin-like noise layer, low opacity (3–5%), applied as canvas overlay |
| Woodblock grain | Procedural | Subtle horizontal/vertical line texture, very faint, behind the ink |
| Ink bleed | Procedural | Radial gradient with soft falloff (radius 30–80px), slight asymmetry via offset center |
| Mist/atmosphere | Procedural | Gradient overlay, opacity-based, drifts slowly |
| Brush stroke edge | Procedural | Imperfect circle — slightly elongated along stroke direction, soft edges |

### 3.3 Asset Plan

#### Foundry Assets (Primary)

| Asset ID | Recipe | Source | Integration | Status |
|----------|--------|--------|-------------|--------|
| `samurai-hero-1` (Takeda) | `samurai_character` | Asset Foundry job (pending) | Replaces GLB placeholder in final composition | Planned |
| `samurai-hero-2` (Uesugi) | `samurai_character` | Asset Foundry job (pending) | Replaces GLB placeholder in final composition | Planned |
| `mt-fuji-atmosphere` | `samurai_battlefield_pack` | Asset Foundry job (pending) | Background layer — misty Mt. Fuji silhouette | Planned |
| `wave-pattern` | `samurai_battlefield_pack` | Asset Foundry job (pending) | Foreground wave texture, Kanagawa-style | Planned |
| `ambient-wind` | `cozy_audio_pack` | Asset Foundry job (pending) | Background ambience, very sparse | Planned |
| `brush-stroke-sfx` | `cozy_audio_pack` | Asset Foundry job (pending) | Sound on each click | Planned |
| `baren-press-sfx` | `cozy_audio_pack` | Asset Foundry job (pending) | Sound on long-press release | Planned |

#### Procedural Fallback (Always Available)

| Asset | Source | Notes |
|-------|--------|-------|
| Paper grain texture | In-code canvas noise | Single function, generates at init time |
| Ink spread gradient | In-code radial gradient | Soft falloff, asymmetrical center offset |
| Brush stroke shapes | In-code path drawing | Imperfect circles/ellipses |
| Mist overlay | In-code gradient | Slowly animating opacity |
| Audio SFX | Web Audio API oscillators + noise | Sparse, physical sounds matching foundry intent |

#### Existing Assets (Preserve)

| Asset | Location | Role |
|-------|----------|------|
| 20 samurai JPG silhouettes | `games/94-kawanakajima/assets/*.jpg` | May be used as reference/seed for foundry prompts; not used directly as GLBs were rejected |
| 4 GLB props | `games/94-kawanakajima/assets/models/` | Keep as fallback but primary composition is 2D canvas |

### 3.4 Placeholder Retirement Checklist

| Placeholder | Target Replacement | Blocked By |
|-------------|-------------------|------------|
| GLB samurai models in 3D canvases | Foundry-generated samurai silhouettes integrated as 2D compositional elements | Foundry job completion |
| 3D WebGL canvas system | Pure 2D canvas drawing | N/A — deliberate simplification |
| Vector blob roster | N/A (roster removed) | N/A |
| Generic "clash" SFX | Foundry audio pack or Web Audio procedural | Foundry job / procedural fallback |
| "THE INSTANT" button | "Finish Print" with seal | N/A — interaction redesign |

**Note:** The 3D WebGL system from the current game is intentionally superseded by a 2D canvas-first approach. The GLB models remain in the repo as references but are not rendered. The existing paper grain, ink frame, and paper texture drawing functions from the current `index.html` are repurposed as the foundation for the new experience.

---

## 4. Technical Architecture

### 4.1 System Overview

```
┌─────────────────────────────────────────────┐
│              games/94-kawanakajima           │
│           index.html (single file)          │
├─────────────────────────────────────────────┤
│  HTML: canvas, UI overlay (buttons)         │
│  CSS: house palette, paper texture frame    │
│  JS:                                             │
│    ├── Canvas init & DPR handling           │
│    ├── Paper texture generator              │
│    ├── Ink stroke system                      │
│    │    ├── Click handler                  │
│    │    ├── Drag handler                   │
│    │    ├── Long-press (baren press)        │
│    │    └── Ink density tracker            │
│    ├── Composition layer                      │
│    │    ├── Background (mist, mountain)      │
│    │    ├── Ink strokes (accumulated)       │
│    │    └── Seal stamp (on finish)          │
│    ├── Audio system                           │
│    │    ├── Web Audio API context           │
│    │    ├── Procedural SFX (brush, press)  │
│    │    └── Ambient layer                  │
│    ├── Animation loop                         │
│    └── Asset integration                        │
│         ├── Foundry API calls               │
│         └── Fallback procedural generation  │
└─────────────────────────────────────────────┘
```

### 4.2 Canvas Architecture

The single `<canvas>` element replaces the dual-WebGL-canvases + overlay approach:

```
Canvas (1020×680 at 1× DPR, scaled by devicePixelRatio)
│
├── Layer 0: Paper texture (drawn once at init)
│   └── Procedural noise + subtle fiber lines
│
├── Layer 1: Background elements (drawn once at init)
│   ├── Mt. Fuji silhouette (light ink, far distance)
│   └── Mist gradient (slowly animating opacity)
│
├── Layer 2: User ink strokes (accumulated)
│   ├── Click strokes (radial ink bloom)
│   ├── Drag strokes (directional ink lines)
│   └── Baren press areas (sustained darkening)
│
├── Layer 3: Atmospheric overlay (animated)
│   └── Drifting mist / ink wash
│
└── Layer 4: UI overlay (HTML, not canvas)
    ├── "Finish Print" button
    ├── "Reset" button
    └── Sound toggle
```

**Rationale:** A single canvas simplifies the "finish" capture (one `toDataURL()` call) and matches the ukiyo-e aesthetic of a single print surface. The 3D WebGL system is not needed for this vision.

### 4.3 Data Models

```javascript
// Ink stroke record
const inkStroke = {
  x: number,           // center X of stroke
  y: number,           // center Y of stroke
  radius: number,      // spread radius (30-80px)
  color: string,       // ink color from palette
  opacity: number,     // 0.05-0.35 per stroke
  direction: {x, y},   // drag direction (for elongation)
  saturationLevel: number, // 0-5, affects diminishing returns
  timestamp: number    // for mist ordering
};

// Composition state
const compositionState = {
  strokes: inkStroke[],        // accumulated strokes
  saturation: number,          // 0-1 global saturation accumulator
  paperWash: number,           // 0-1 paper color shift
  mistOffset: number,          // animation phase
  sealPosition: {x, y},        // seal placement on finish
  finished: boolean            // has the player clicked finish?
};

// Audio state
const audioState = {
  ctx: AudioContext,
  on: boolean,
  ambientNode: GainNode|null,
  masterGain: GainNode
};
```

### 4.4 Ink System Design

The ink system is the core interaction model:

1. **Click** → Create an `inkStroke` at cursor position:
   - Draw a radial gradient from center
   - Color from palette (first few strokes = ink, later = vermilion/indigo based on composition density)
   - Radius 40-60px, opacity 0.15-0.25
   - Animate spread over 300ms using `requestAnimationFrame`

2. **Drag** → Create a series of overlapping ink strokes along the path:
   - Each stroke slightly elongated in drag direction
   - Closer spacing for faster drag → denser ink
   - Same color/opacity rules as click

3. **Long press** (hold >600ms) → Baren press:
   - On press start: begin a "press intensity" accumulator
   - While held: progressively darken the area (increase opacity in a larger radius)
   - On release: commit as a single deep ink layer, play baren SFX

4. **Diminishing returns:**
   - Track ink density per screen region (divided into 20×15 grid, ~50×45px cells)
   - After >5 strokes in one cell, each new stroke reduces opacity by ~15%
   - Total saturation cap prevents the canvas from becoming fully black

5. **Color evolution:**
   - First ~10 strokes: pure ink (`#0f172a`)
   - ~10-25 strokes: indigo begins to appear (`#2c3a5f`)
   - ~25+ strokes: vermilion accents appear (`#c2410f`) — seal-like
   - This mirrors traditional ukiyo-e multi-block printing

### 4.5 Asset Pipeline

```
                    ┌──────────────────┐
                    │  Asset Foundry   │
                    │  :18113/api      │
                    └────────┬─────────┘
                             │ POST /api/assets
                             │ recipe: samurai_character
                             │ recipe: cozy_audio_pack
                             │
                    ┌────────▼─────────┐
                    │   Job Submitted   │
                    │   (job_id logged) │
                    └────────┬─────────┘
                             │ Poll GET /api/assets/<job_id>
                             │ every 120s
                             │
              ┌──────────────┬────────────────┐
              │   SUCCESS    │    FAILED      │
              │              │                │
              ▼              ▼                │
   ┌────────────────┐  ┌──────────┐          │
   │ Copy /outputs/  │  │ Resubmit │          │
   │ <job_id>/...    │  │ once     │          │
   │ → assets/      │  └──────────┘          │
   └────────┬───────┘                         │
            │                                 │
            ▼                                 ▼
   ┌────────────────┐              ┌────────────────┐
   │ In-game import │              │ Procedural      │
   │ (Image/Sound)  │              │ fallback        │
   └────────────────┘              └────────────────┘
```

**Foundry integration points:**
- `samurai_character` recipe → Generate 2 samurai silhouettes (1 Takeda, 1 Uesugi) for compositional elements
- `cozy_audio_pack` recipe → Generate ambient wind + brush stroke SFX
- Job IDs logged in `ASSET_MANIFEST.md` immediately upon submission
- Polling every 120 seconds with foreground commands
- Outputs copied from `/outputs/<job_id>/<file>` to `assets/generated/`

### 4.6 Audio Design

Web Audio API procedural audio (no external audio files required):

| Sound | Trigger | Method |
|-------|---------|--------|
| Brush stroke | Click/drag start | Short noise burst through lowpass filter (300-500Hz), ~150ms |
| Baren press | Long-press release | Deeper noise burst + low oscillator tone, ~300ms |
| Mist ambience | Idle >3s | Very sparse low-frequency oscillator, modulated by sine at 0.1Hz |
| Finish seal | "Finish Print" click | Sharp tap + subtle resonance, ~200ms |

All sounds are user-gesture-initiated (browser autoplay policy compliant).

### 4.7 Animation System

```javascript
// Main loop: 60fps via requestAnimationFrame
function frame(now) {
  const dt = (now - lastT) / 1000;
  lastT = now;

  // Ink bloom animation (each stroke animates for 200-400ms)
  updateInkAnimations(dt);

  // Mist drift (slow, atmospheric)
  updateMist(dt);

  // Idle ambience trigger
  checkAmbientTrigger();

  render(); // single canvas
  requestAnimationFrame(frame);
}
```

### 4.8 Finish Capture

```javascript
function finishPrint() {
  // 1. Draw vermilion seal stamp on canvas
  drawSeal(composition.sealPosition);

  // 2. Add artist signature line (small text, bottom right)
  drawSignature();

  // 3. Export as PNG
  const dataURL = canvas.toDataURL('image/png');

  // 4. Trigger download
  const link = document.createElement('a');
  link.download = `ukiyo-e-${Date.now()}.png`;
  link.href = dataURL;
  link.click();
}
```

---

## 5. What Not to Build

- **No 3D WebGL rendering** — The vision is 2D print creation, not 3D scene viewing. The existing WebGL canvases, GLB loader, and orbit controls are superseded.
- **No roster UI** — The player engages directly with the canvas, not through character selection.
- **No score system** — This is not a game with points. It's a meditative craft simulation.
- **No multiplayer / sharing beyond download** — The output is a single PNG.
- **No service worker / offline support** — Outside scope for this work order.
- **No external font files** — Use system fonts (`system-ui`).
- **No WebGL2 fallback path** — Canvas 2D is the target; no need for complex fallback chains.

---

## 6. Verification Strategy

### 6.1 Smoke Test (First Pass)

1. Open `games/94-kawanakajima/index.html` in headless Chromium
2. Verify: page loads, canvas renders, no console errors
3. Simulate click on canvas: verify ink mark appears
4. Simulate rapid clicking in one area: verify diminishing returns visible
5. Simulate long press: verify baren press effect
6. Click "Finish Print": verify PNG download triggers
7. Screenshot mid-composition for evidence

### 6.2 Interaction Verification

| Test | Expected |
|------|----------|
| Single click | One ink mark appears at click point |
| 3-5 clicks (same area) | Composition deepens, ink layers visible |
| 3-5 clicks (spread out) | Multiple areas show ink, composition forms |
| Hold >600ms | Sustained area darkens progressively |
| Rapid clicking | Diminishing returns: later clicks produce smaller marks |
| Sound toggle | Audio initializes on first user gesture |
| "Finish" button | Canvas captures with seal, downloads as PNG |
| "Reset" button | Canvas clears to clean paper texture |

### 6.3 Visual Quality Check

- Canvas background shows paper texture (not blank or plain color)
- Ink marks look organic (imperfect circles, soft edges, not geometric)
- Colors stay within the defined palette (`#f8f4eb`, `#0f172a`, `#2c3a5f`, `#c2410f`, `#b38b3f`)
- Overall composition after 10+ clicks feels intentional, not random
- Paper grain visible through ink layers (never fully covered)

### 6.4 Known Limitations

| Limitation | Impact | Mitigation |
|------------|--------|------------|
| WebGL support required (for original 3D) | N/A — we're removing WebGL entirely | Canvas 2D works everywhere |
| Audio requires user gesture | Expected browser behavior | Audio only initializes on first interaction |
| No offline support | Minor | Outside scope for this work order |
| Asset Foundry may be slow | Asset quality may fall back to procedural | Procedural fallback is designed as first-class |
| Mobile touch vs. mouse | Minor input difference | Both use pointer events, handled identically |

---

## 7. Rollout Plan

### Phase 1: Canvas Foundation (Critical Path)
- Replace dual WebGL canvases with single canvas
- Implement paper texture generation (procedural noise)
- Implement ink stroke system (click, drag, long press)
- Implement ink density tracker and diminishing returns
- Basic render loop

### Phase 2: Atmosphere & Composition
- Background elements (Mt. Fuji silhouette, mist)
- Color evolution (ink → indigo → vermilion)
- Mist animation
- Seal stamp on finish
- PNG export + download

### Phase 3: Audio
- Procedural audio system
- Brush stroke SFX
- Baren press SFX
- Ambient wind layer
- Sound toggle

### Phase 4: Polish
- Tune ink spread radius, opacity decay, saturation curve
- Refine paper grain texture
- Polish finish screen (seal stamp, caption)
- Add poetic copy (Sei Shonagon voice)
- Touch/corner bleed effects

### Phase 5: Asset Foundry Integration (if time)
- Probe Asset Foundry
- Submit `samurai_character` and `cozy_audio_pack` jobs
- Poll and copy outputs
- Integrate foundry assets into composition
- Update ASSET_MANIFEST.md

### Phase 6: Verification
- Headless browser smoke test
- Screenshot evidence capture
- PR body write-up
- Push branch

---

## 8. Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Single file grows too large / unmanageable | Low | Medium | Keep code organized with comments; target ~400-600 lines (current is 763) |
| Ink interaction feels flat without foundry assets | Medium | Medium | Procedural fallback is designed as first-class; foundry enriches but doesn't enable |
| Audio API not available in headless browser | Medium | Low | Audio is toggleable; game functions without it |
| Diminishing returns feel frustrating rather than meditative | Medium | Medium | Tune via iteration; target >5 clicks before noticeable dimishing |
| Budget expires before polish passes | Medium | Medium | Prioritize Phase 1-2 baseline; polish uses remaining time |
| WebGL removal breaks preview | Low | High | Test incrementally; keep original 3D code in commented-out section as reference |

---

## 9. Open Questions

1. **Should the background Mt. Fuji be static or animated?**
   - *Decision:* Slowly drifting (very subtle opacity shift, 2-3 second cycle) — enough to feel alive without distracting.

2. **Should the color evolution be based on stroke count or ink density?**
   - *Decision:* Ink density (accumulated opacity per region). More organic than a counter.

3. **Should the seal stamp be randomized or fixed?**
   - *Decision:* Slightly randomized position (±5px) and rotation (±2°) per finish for a hand-crafted feel.

4. **How many samurai silhouettes from Foundry?**
   - *Decision:* 2 total (1 Takeda, 1 Uesugi) — enough for variety without overextending budget.

5. **Should the print save with or without the seal?**
   - *Decision:* Seal is automatically added when "Finish Print" is clicked. This is part of the "publishing" metaphor.

---

## 10. File Layout Changes

### Files Modified
- `games/94-kawanakajima/index.html` — Primary target. Full rewrite to 2D canvas ink system.

### Files Created
- `.factoryx/work-orders/work-order-1783320826952-7-1/TECHNICAL_SYSTEM_DESIGN.md` — This document.
- `games/94-kawanakajima/assets/generated/` — Directory for Foundry-generated assets (if/when foundry jobs complete).

### Files Preserved (not modified)
- `games/94-kawanakajima/assets/models/*.glb` — Kept in repo but no longer rendered.
- `games/94-kawanakajima/assets/*.jpg` — Samurai silhouettes, may be referenced in foundry prompts.
- All other repo files — Unchanged.

---

## 11. Success Criteria

| Criterion | How Verified |
|-----------|-------------|
| Paper texture visible at load | Visual check: canvas shows warm paper grain, not blank |
| Click produces visible ink mark | Visual check: ink bloom appears at click point |
| Diminishing returns visible | Visual check: rapid clicking produces progressively smaller marks |
| Long press deepens area | Visual check: sustained press darkens progressively |
| Finish captures as PNG | Functional check: download triggers with seal stamp |
| No console errors | Headless browser: no `pageerror` or `console.error` |
| Assets from Foundry have job IDs | ASSET_MANIFEST.md contains job IDs, source paths |
| Audio works after user gesture | Functional check: toggle initializes audio context |

---

*This design is the plan of record for Work Order `work-order-1783320826952-7-1`. Update when direction changes materially. Do not implement changes without reflecting them in this document first.*
