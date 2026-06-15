# Edo Inkblade: Road to Ganryu — Technical System Design

> Design gate for the Week-long OTS build. Implementation resumes after this document is committed.

---

## 1. Files / Module Layout

The artifact is a **single-file HTML game** (`drops/edo-inkblade-ots/index.html`) with supporting files for verification and preview. All rendering, game state, audio, and UI live in one HTML document (~518 lines currently). The single-file constraint keeps deployment trivial: drop the HTML anywhere and it works.

### Current file map

| Path | Role |
|---|---|
| `drops/edo-inkblade-ots/index.html` | Canonical game artifact |
| `drops/edo-inkblade-ots/preview.html` | Minimal redirect → index.html |
| `drops/edo-inkblade-ots/test.js` | Headless verification (Node) |
| `.factoryx/GOAL_EXECUTION_STRATEGY.md` | Product vision & process milestones |
| `.factoryx/TECHNICAL_SYSTEM_DESIGN.md` | This document |
| `.factoryx/PR_BODY.md` | GitHub PR body template |
| `.factoryx/WORKLOG.md` | Running build log |

### Module boundaries *within* index.html (ordered by call flow)

Each "module" is a section of code in the single script block, separated by logical blank lines and comment headers. This is informal but stable enough for a 518-line game.

1. **Constants & Config** — hero definitions, route milestones, color palette, audio context.
2. **State** — `player` object, `enemies[]`, `scenery[]`, global flags (`won`, `hitStop`, etc.).
3. **Audio** — `initAudio()`, `sfx` map for wind/footsteps/river/ink/combat.
4. **Initialization** — `start(id)`, `resize()`, game clock reset.
5. **Game Loop** — `loop(t)` → `step(dt)` + `draw()`.
6. **Update / Logic** — `step()`, `updateEnemies()`, `paint()`, `slash()`, `updateQuest()`.
7. **Rendering** — `draw()`, `drawRoad()`, `drawSun()`, `drawMountains()`, `drawMist()`, `drawMilestoneGlow()`, `drawLanterns()`, `drawBloom()`, `drawWoodblockTexture()`, `drawScenery()`, `drawEnemy()`, `drawMark()`, `drawPlayer()`, `drawSparks()`, `drawLeaves()`, `drawFireflies()`, `drawRiverMist()`, `drawVignette()`, `drawVictoryParticles()`.
8. **UI** — `updateUi()`, `say()`, overlay handling (character select, death, victory).
9. **Utilities** — `project()` (pseudo-3D projection), `burst()`, `inkSplatter()`.

### Growth boundary

If the file exceeds **1,000 lines** in a single pass, extract rendering into a separate `<script>` module embedded after the core logic, or split into distinct script blocks by concern (state, render, audio). The single-HTML constraint must be preserved.

---

## 2. Data Flow

```
Input Events (keyboard/mouse/touch)
    │
    ▼
step(dt)  ◄──  loop(t)
    │
    ├── updateEnemies(dt)      ──  enemies[] patrol/combat/telegraph
    ├── paint() / slash()      ──  marks[], sparks[], audio, state
    ├── updateQuest()           ──  route[].triggered, milestonePopup
    └── ambient particles       ──  leaves[], fireflies[], riverMist[]
    │
    ▼
draw()   ──  background → scenery → enemies → marks → player → sparks → atmosphere → UI
    │
    ▼
updateUi() ──  DOM element updates (HP, ink, resolve, quest text, messages)
```

**Key invariants:**
- Every frame: `project(x, z, height)` converts world coordinates to screen coordinates using a fixed horizon line and a simple z-division perspective.
- `player.z` advances monotonically along the road. Enemies and scenery are spawned ahead and despawned behind.
- Game state is mutable in `step()` only; `draw()` is a read-only render pass.
- Audio is lazily initialized on first user interaction (desktop/mobile autoplay policy).

---

## 3. Game-State Layout

### Player state

```js
player = {
  x: 0,              // lateral offset on road (-1 .. 1)
  z: 0,              // distance along road (progress)
  heading: 0,        // camera orbit angle
  hp: 100,           // current health
  ink: 5,            // ink resource (current)
  resolve: 0,        // avoidance resource bar
  blocking: false,   // block toggle
  slashTimer: 0,     // cooldown frames
  paintTimer: 0,     // cooldown frames
  damageFlash: 0,    // frames remaining for damage flash
  invincible: 0,     // frames remaining for invincibility
  mx: 0, mz: 0,      // movement velocity (lerped)
  bobPhase: 0,       // head-bob animation phase
  displayHp: 100,    // animated display value for HUD
  displayInk: 5,     // animated display value for HUD
  deathFade: 0,      // death-screen fade progress
  inkTimer: 0        // regen cooldown frames
}
```

### World state

| Variable | Type | Purpose |
|---|---|---|
| `enemies[]` | Array of objects | Enemy entities with patrol, combat, telegraph state |
| `marks[]` | Array of brush-stroke objects | Ink marks placed on the road, rendered as layered splashes |
| `sparks[]` | Array of particles | Short-lived impact/ink/leaves particles |
| `scenery[]` | Array of scenery objects | Road-side decorations (pagoda, teaHouse, bamboo, etc.) |
| `leaves[]` | Array of leaf particles | Ambient falling leaves |
| `fireflies[]` | Array of glow particles | Ambient fireflies |
| `riverMist[]` | Array of mist particles | Fog over river section near bridge |
| `route[]` | Array of milestone objects | Waypoints with quest text and triggered flag |
| `won` | Boolean | Victory condition met |
| `hitStop` | Number | Freeze-frame frames for combat impact |
| `last` | Number | Timestamp of previous frame for delta-time |
| `screenShake` | Number | Intensity of screen shake effect |
| `windDrift` | Number | Audio wind-drift phase |
| `messages[]` | Array of strings | Recent UI log messages (max 5) |
| `milestonePopup` | Object | Active popup with text + timer |

### Hero definitions

A fixed roster of 3+ characters with different ink color, starting stats, and flavor text. Currently: Musashi, Koeda (artist), Yoshino (wanderer). Each has a distinct ink palette and edge in combat/resolve/ink.

### Progression model

- Distance-based: `player.z` drives milestone triggers.
- Milestones: paint waymarks → cross bridge → reach Ganryu shore.
- Each milestone fires a popup once (`triggered` flag), advances quest text.
- Victory: crossing the final route milestone triggers `won=true`.

---

## 4. Controls

### Desktop

| Input | Action |
|---|---|
| `W` / `ArrowUp` / `Click road ahead` | Move forward / accelerate |
| `A` / `D` / `ArrowLeft` / `ArrowRight` | Strafe left/right (road lateral) |
| Mouse look (drag) | Orbit camera heading |
| Left-click / `Space` | Slash / block |
| Right-click / hold | Paint ink mark at cursor |
| `R` | Restart after death/victory |

### Mobile (touch)

| Touch zone | Action |
|---|---|
| Left half of screen (tap) | Move forward |
| Right half (drag) | Camera orbit |
| Tap anywhere | Slash |
| Long-press anywhere | Paint ink mark |

All controls must work without tutorial text. A brief hint panel is shown on first load.

---

## 5. Rendering Approach

### Layer order (back to front)

1. Sky gradient (sunset ochre to charcoal).
2. Sun halo + bloom.
3. Far mountains (faint ink-wash silhouettes).
4. Road with dashed lane markings, grass/flowers at edges, shadow gradient.
5. Road-side lanterns with radial glow.
6. Mid-ground mist bands.
7. Scenery items (pagodas, tea houses, bamboo, bridges, shrines, etc.).
8. Milestone glow indicator.
9. Enemies (silhouette style with weapon glow telegraph).
10. Ink marks (brushstroke shapes with layered opacity and glow halo).
11. Player character (kimono + weapon silhouette).
12. Sparks / particle effects (hit, ink splatter, death dissolve).
13. Ambient particles (falling leaves, fireflies, river mist).
14. Bloom overlay (soft glow).
15. Woodblock grain texture overlay.
16. Vignette (darkened edges for depth).
17. HUD / UI overlays (stats panel, quest text, hint, character select, death/victory).

### Projection

A fixed-horizon pseudo-3D projection function maps world coordinates to screen:

```js
function project(x, z, h) {
  // z is depth, horizon = 0.32 * canvas height
  // Objects at z=180 map to horizon; further objects converge
  // x and h are scaled by perspective factor
}
```

This creates an over-the-shoulder depth effect without a full 3D engine. The road curves slightly via `player.heading` applied during projection.

### Post-effects

| Effect | Technique |
|---|---|
| Bloom | Radial gradient overlay at sun/enemy glow positions |
| Woodblock grain | Small random dots placed across canvas at draw time |
| Vignette | Radial gradient darkening at canvas edges |
| Screen shake | Random offset applied to canvas translation on hit |
| Damage flash | Red overlay on player silhouette |
| Invincibility aura | White flash / glow ring around player after hit |

### Visual budget (per frame)

- ~30 scenery items drawn (far items skip detail)
- ~5 enemies at most
- ~15 ink marks visible
- ~50 sparks, 30 leaves, 20 fireflies, 20 river mist particles
- All canvas operations are 2D with no shadows/masks/3D transforms

---

## 6. Audio Plan

### Current
- Lowpass wind noise (oscillator with drift)
- River drone (sine wave, zone-triggered)
- Footstep percussion (oscillator burst with cooldown)
- Ink splash / slash / block / hit / death / fanfare (oscillator-based SFX)

### Target additions
- Distant temple bell or struck-metal cue with musical tuning
- Rain in valley zone with texture rather than raw noise
- A road motif and low musical bed that can thin out into silence
- Duel tension layer and Ganryu arrival cue

Audio may use committed audio files, generated/recorded loops, or deliberately composed Web Audio. Oscillator-only SFX are acceptable as temporary scaffolding, but not as the final sound identity.

---

## 7. Asset Plan

### Current generated assets (procedural, canvas-based)

| Asset | Generation method | Current state |
|---|---|---|
| Road scenery (pagoda, tea house, bamboo, stone marker, rice paddy, bridge arch, stall, shrine gate) | Canvas path drawing with ink-wash fills | 12 types, 48 items |
| Character silhouettes (Musashi, Koeda, Yoshino) | Canvas rect/circle combinations with weapon lines | 3 types, functional |
| Enemy silhouettes (chaser, prowler, duelist) | Canvas shape drawing with size/color variance | 3 types, functional |
| Ink marks | Layered brush-stroke shapes with opacity falloff | Working |
| Sky / sun / mist | Gradient fills | Working |
| Lanterns | Radial glow + pole shape | Working |
| Woodblock texture overlay | Random dot grid | Working |
| Title banner / character-select calligraphy | Canvas text + ink-brush frame | Minimal |
| Victory/Death screens | DOM overlays with stat grid | Working |

### Asset pipeline and quality bar
The single-file bootstrap was useful for speed, but it should not constrain art quality. Use `drops/edo-inkblade-ots/assets/` for committed assets when they improve the game.

| Folder | Purpose |
|---|---|
| `assets/title/` | title art, key art, logo/calligraphy plates |
| `assets/characters/` | portraits, sprite sheets, stance/duel poses, character-select art |
| `assets/enemies/` | ronin/bandit/yamabushi designs, silhouettes, attack telegraph art |
| `assets/environment/` | Ganryu shore, bridge, shrine, bamboo, rain, paper/ink textures |
| `assets/audio/` | road ambience, musical motif, duel layer, Ganryu arrival cue, polished SFX |

Allowed sources: authored art, generated image/audio assets, and procedural generation exported to files. Procedural runtime drawing remains useful for fog, particles, and variation, but the review-worthy artifact needs real visual and musical identity.

Verification must confirm referenced asset paths exist, load from the preview root, and do not silently fall back to missing placeholders. The PR body should call out which assets are final-quality, which are provisional, and what remains to replace.

---

## 8. Verification Strategy

### Headless test (`drops/edo-inkblade-ots/test.js`)

Reads the HTML file, parses the script block, and runs 15+ checks:
- Syntax validation via `new Function()`
- Required function names (`project`, `paint`, `slash`, `updateQuest`, etc.)
- Character definitions present
- Controls registered (WASD, arrows, click, right-click)
- Over-the-shoulder rendering (projection, horizon)
- Canvas renderer (`getContext('2d')`)
- Animation loop (`requestAnimationFrame`)
- Negative checks: not Floating Score, not falling-object game
- Preview redirect working

Runs under Node.js — no browser dependency required.

### Visual smoke check (optional, when Playwright available)

`scripts/verify-smoke.sh` or inline `verify.html`:
- Opens artifact in Playwright
- Captures screenshots at: title screen, mid-journey, combat, victory
- Checks pixel dimensions and rendering coherence

### Runtime integrity checks (to add)

- No `NaN` positions in player or enemy state
- Game loop never stalls (delta clamped to 40ms max)
- Audio context not garbage-collected while playing
- UI elements reference valid DOM IDs

---

## 9. Risks

| Risk | Likelihood | Mitigation |
|---|---|---|
| Single file exceeds manageable length | Medium | Extract render module at ~800 lines; keep under 1000 |
| Controls confuse mobile users | Medium | Add brief touch hint on first load; test on mobile viewport |
| Enemies stuck in patrol when player approaches | Low | Add aggression radius check; force state transition on proximity |
| Projection artifacts at extreme z values | Low | Clamp projection z to visible range (60–600); skip draw beyond range |
| Audio autoplay blocked by browser | Medium | Lazy init on user gesture; silent fallback if blocked |
| Runtime variable corruption (NaN, undefined) | Low | Add integrity guards in step(); export state for test checks |
| Deadline pressure for polish | Medium | Prioritize core loop over visual extras; use timebox wisely |
| PR body goes stale after many passes | Medium | Update PR body with each verification pass; keep WORKLOG current |

---

## 10. Rollout / Delivery

### Branch
`factoryx/factory-edo-woodblock/edo-inkblade-ots` — the canonical delivery branch.

### PR
PR #107 at `github.com/ystackai/studio-edo-woodblock/pull/107`. This PR is kept open and updated; no parallel FactoryX PRs are created.

### Preview
The artifact at `drops/edo-inkblade-ots/index.html` is served directly. The preview root (`drops/edo-inkblade-ots/preview.html`) redirects using `window.location.replace`. No studio homepage is mutated.

### Commit cadence
- Commit after each logical pass (strategy doc, technical design, character select, paint, combat, milestones, polish).
- Verification runs before each commit.
- PR body updated at natural checkpoints (new features, verification fixes, screenshots).

### What not to build (reiteration from strategy)
- No open-world RPG mechanics
- No fighting-game combos
- No painting simulator (infinite canvas)
- No multiplayer
- No XP/gold/level-ups
- No particle toy (spam without readability)
- No landing-page-wrapped demo

---

## 11. Implementation Order (planned passes)

> These passes are for implementation **after** this design gate is committed. Listed for completeness.

1. **Character-select screen** — ink-brush frame, 3 characters with unique stats/ink color, calligraphy-style name labels.
2. **Deeper road scenery** — 6+ new scenery types (temple gate, flooded rice, misty gorge, storm lanterns, bamboo grove, abandoned boat).
3. **Paint mark persistence** — marks last longer, respond to road terrain (bridge paint looks different), ink marks glow brighter near milestones.
4. **Combat depth** — duelist gets a second attack pattern; block timing matters more; telegraph becomes thinner/faster for skilled enemies.
5. **Arrival at Ganryu** — final zone with layered mist/water, island silhouette, closing ceremony screen with full journey stats.
6. **Audio polish** — zone-triggered temple bell, rain in valley, more silence between events.
7. **Mobile UX** — verify touch zones; add mobile-specific hint; test at 375px viewport.
8. **Verification & PR body** — update all checks, capture screenshots, write final PR body, invite review.

---

*Technical Design v1 — May 2026. Updated as implementation progresses.*
