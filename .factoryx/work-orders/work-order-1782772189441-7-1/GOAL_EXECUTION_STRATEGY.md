# GOAL EXECUTION STRATEGY — Playable Edo Living Print Loop

**Work Order:** `work-order-1782772189441-7-1`
**Branch:** `factoryx/factory-edo-woodblock/work-order-1782772189441-7-1`
**Created:** 2026-06-29
**Role:** coder1 (Utagawa Hiroshige)
**Archetype:** creative_game | **Playbook:** browser-game-2d

---

## 1. Vision and Player Fantasy

The player encounters a single, living ukiyo-e print. It is not a menu, a splash screen, or a tutorial. The first frame is already art — a quiet seascape or mountainscape rendered in ink on handmade paper, with mist, water, or wind already in motion.

The player fantasy is **completing a print that breathes**. Each touch or press is like running a baren across the block: it deposits ink, shapes weather, deepens atmosphere. The artwork is also the instrument — the visual feedback *is* the interaction, not a HUD overlaid on it.

The fantasy is mono no aware (物の哀れ): the beauty of transience. The print evolves over a minute of play, but nothing is permanent. The beauty is in the process, not in a score.

## 2. Mood, World, References, and Emotional Target

**Mood:** Quiet concentration, gentle wonder, slight melancholy.  
**World:** An Edo-era seascape or landscape — one strong horizon line, atmospheric depth through mist and negative space.

**References:**
- Hiroshige's *53 Stations of the Tokaido* — for mist-eaten horizons and restrained palette
- The existing `games/living-print/index.html` — for paper grain, ink wash, and wave-form horizons already prototyped in this repo
- Hokusai's *Great Wave* — for the single compositional gesture (one memorable form dominating the frame)

**Emotional target:** The player should feel they have participated in something slightly beautiful, not that they have "played a game." A 60-second interaction that leaves a faint sense of craft.

## 3. Core Interaction Loop and Progression

### The Core Verb: **Press**

One primary interaction: **press-and-hold** (mouse, touch, or spacebar). The player presses to lay down ink — but where and how depends on the scene state.

### The Loop

1. **Observe** — The print is already alive. A wave or mist moves gently.
2. **Act** — Press anywhere on the canvas. Ink deposits, the scene responds.
3. **Feedback** — The ink spreads like watercolor on wet paper. A subtle brush-stroke texture appears. The atmosphere deepens.
4. **Discover** — After several presses, the print transforms: the horizon shifts, new elements emerge (a bird, a distant temple, rain begins), or the weather changes. The print has memory.

### Progression Over 60 Seconds

The print has **four states** that deepen as the player interacts:

| State | Presses | Visual Shift |
|-------|---------|--------------|
| Dawn | 0-3 | Bare paper, minimal ink. Soft mist, single wave-horizon. |
| Deepening | 4-9 | Ink pools form. Second horizon layer appears. Color (faded vermilion or indigo) seeps into the composition. |
| Living | 10-18 | A living element emerges — a bird crosses, rain starts, or a distant lantern flickers. The scene is now richly layered. |
| Resolving | 19+ | The print begins to "dry" — elements fade gracefully. The piece becomes a completed print, held for a moment, then slowly dissolves back toward dawn, inviting replay. |

This is not a "level system." It is a **breathing cycle** — the print lives, peaks, and returns. The player discovers this arc through 60 seconds of gentle engagement.

### Surprising Consequence

After ~15 presses, the **weather shifts**: rain begins to fall. The ink on the page runs, creating beautiful accidental patterns. This is the "joyful discovery" — the player didn't just draw; they changed the climate of the print. Rain only triggers after sustained engagement, so it feels earned.

## 4. Art / Audio / Interaction Direction

### Visual Identity

- **Palette:** Off-white paper (#ede8df), sumi ink (#1a1a1a), deep indigo (#2a3a5c), and a single accent of faded vermilion (#c45a4a) or celadon (#8a9a7a) introduced at State 2+.
- **Paper texture:** Procedurally generated fiber grain (following the existing `games/living-print` paper system).
- **Ink behavior:** Ink deposits as soft-edged brush marks with slight bleed. Overlapping deposits create darker, richer areas.
- **Compositional gesture:** One strong diagonal or wave-form horizon line. Everything else serves it.
- **Negative space:** At least 40% of the frame remains paper. The power is in what is *not* drawn.

### Audio Direction

- **Near-silent by default.** No autoplay.
- **Audio starts only on first press** (user gesture).
- **SFX:** A subtle "shhh" brush-on-paper sound on each press. A low ambient tone (taiko or shamisen drone) fades in at State 3 (Living).
- **Approach:** Web Audio API oscillators shaped as a low drone, or a small generated WAV if the foundry is available. No external audio files unless foundry-delivered.
- **No melody.** The audio is texture and breath.

### Interaction Direction

- **Input:** Pointer (mouse/touch) + spacebar as fallback. Touch targets are the entire canvas.
- **Response time:** < 50ms visual feedback on press. Ink appears at cursor immediately.
- **Easing:** All motion uses ease-in-out or ease-out curves. No linear movement.
- **Feedback on press:** Brief ripple at press point, then ink spreads outward over ~500ms.
- **No HUD, no score, no instructions.** The canvas itself explains the interaction through its living response.

## 5. Real Asset Plan

### Foundry Assets

The foundry (`factoryx-edo-woodblock-asset-foundry:18113`) is healthy. I will query it for:
- **Paper texture images** — if available, use as the background instead of procedural generation.
- **Brush stroke patterns** — ink bleed textures for the deposit system.
- **Ambient audio** — a short loop for the State 3 drone if available.

If foundry does not return relevant 2D assets (it is primarily 3D-focused based on existing samurai work), I will use **canvas-native procedural generation** for visual art, which is documented and acceptable per the Work Order goal.

### Canvas-Native Art (Primary Path)

The existing `games/living-print/index.html` already demonstrates the visual approach:
- Procedural paper grain with fiber streaks
- Ink-wash wave forms using gradient strokes
- Mist layers using alpha compositing

I will extend this system, not rebuild it. The living-print code is the foundation.

### Generated File Assets (Secondary)

If time and foundry allow:
- A small PNG paper-texture overlay for more authentic grain
- A compressed WAV ambient loop for the State 3 drone

These are nice-to-have. The primary deliverable is a **playable, delightful interaction**, not a photorealistic texture collection.

### ASSET_MANIFEST.md

I will update the existing `ASSET_MANIFEST.md` in the Work Order context with:
- Canvas-native procedural art as primary visual system
- Any foundry-delivered audio or texture assets
- The living-print base code as the integration foundation
- Verification notes on browser compatibility

### Blender / 3D Assets

**Not applicable for this Work Order.** This is a 2D browser canvas experience. The "Edo living print" is a flat, interactive ukiyo-e — not a 3D scene. No Blender, GLB, or 3D asset pipeline needed.

## 6. Engine, Asset Pipeline, Controls, and Verification

### Engine: Single-File HTML5 Canvas

- **One `index.html`** in `games/edo-living-print/` (new directory)
- No build step, no dependencies, no framework
- Canvas 2D API for all rendering
- Web Audio API for sound
- Total payload target: < 50KB

### Controls

- **Primary:** Click/tap + hold to deposit ink
- **Secondary:** Move cursor/finger during hold to drag ink (brush stroke)
- **Keyboard:** Spacebar as press, arrow keys to shift viewpoint (if scene is wider than viewport)
- **Touch:** Full-screen touch target, no minimum gesture distance

### Asset Pipeline

1. Procedural paper texture generated at load (offscreen canvas)
2. Ink deposits rendered as soft gradient circles with noise-based edges
3. Weather layers (rain, mist) rendered as semi-transparent strokes
4. All art is drawn each frame; no sprite sheets or pre-rendered frames needed

### Verification

- **Browser runtime test:** Open `games/edo-living-print/index.html` in Chromium, verify canvas renders, press interaction works, no console errors
- **Screenshot evidence:** Capture the print at State 1 (dawn) and State 3 (living, with weather)
- **60fps check:** Simple frame-time logging in dev; average should be < 16.7ms per frame
- **Payload check:** Single HTML file, no external assets, < 50KB total
- **Touch + keyboard + mouse:** All three input methods verified

### Image/Audio Decode

- No image files to decode (canvas-native art)
- Audio uses Web Audio API oscillators (no decode needed)
- If foundry WAV files are used, verify `AudioContext.decodeAudioData` succeeds

## 7. What Not to Build

- **No save/load system** — the print is ephemeral by design
- **No inventory or collectibles** — the beauty is in the process
- **No multiple levels or scenes** — one print, one breath cycle
- **No score, high scores, or achievements** — this is art, not competition
- **No settings menu or options** — the aesthetic is fixed
- **No tutorial or onboarding screen** — the print teaches itself through response
- **No Unity, Three.js, or WebGL** — Canvas 2D is sufficient and more performant for this style
- **No external network dependencies** — everything self-contained, works offline
- **No bright saturated colors** — palette is strictly ukiyo-e: ink, paper, mist, and at most one accent color
- **No complex character or creature art** — this is a landscape/seascape, not a character game

## 8. Implementation Plan

### Phase 1: Playable Slice (Taste-Gate)

Build the taste-gate slice: **one verb in one space**.
- One canvas, one interaction (press to deposit ink), one visual scene (seascape horizon)
- Verify it opens and responds immediately
- **Gate:** If pressing the canvas doesn't produce an immediate, satisfying visual response, pivot before adding more systems

### Phase 2: Depth and Progression

- Add the four-state progression system (dawn -> deepening -> living -> resolving)
- Add weather shift (rain) as the surprising consequence
- Add ink bleed and atmospheric effects

### Phase 3: Polish and Feedback

- Add subtle audio (on user gesture only)
- Refine easing curves, ink spread behavior
- Add the dissolve/rebirth cycle
- Verify 60fps, test touch input

### Phase 4: Verification and Documentation

- Browser runtime verification with screenshots
- Update PREVIEW.md, VERIFICATION.md, ASSET_MANIFEST.md
- Update WORKLOG.md with decisions and learnings
- Commit and push

## 9. Tradeoffs and Guiding Decisions

| Decision | Rationale |
|----------|-----------|
| Canvas 2D over WebGL | Simpler, more performant for 2D ink style, no build step |
| No external assets | Self-contained, zero network deps, instant load |
| Single interaction verb | Fidelity over breadth; one well-crafted verb > five mediocre ones |
| No scoring or game metrics | Preserves the art-first identity; delight over competition |
| Procedural art over sprite sheets | The ink-deposit system is inherently dynamic; pre-baked frames would feel static |
| Audio from oscillators | No asset dependency, starts on user gesture, fits the ambient/texture goal |

## 10. Progress Updates Worth Sharing

- **Screenshot of the living print** at dawn (State 1) — shows the initial art quality
- **Screenshot of the weather shift** (rain appearing) — shows the surprising consequence
- **Brief note on the ink-deposit system** — how pressing feels like running a baren
- **Frame rate data** — proof of 60fps on mid-range hardware

## 11. Quality Bar Checklist

Before marking the Work Order review-ready:

- [ ] First screen is the playable print, not a landing page
- [ ] Player can understand the interaction within 5 seconds (press -> ink appears)
- [ ] At least one interaction loop has meaningful state (the 4-state progression)
- [ ] Progression or transformation over ~60 seconds (dawn -> resolving cycle)
- [ ] Input response < 100ms with visible feedback
- [ ] Easing on all motion
- [ ] Audio only after user gesture
- [ ] Touch targets >= 44px (entire canvas)
- [ ] 60fps on mid laptop
- [ ] Lightweight payload (< 50KB)
- [ ] No external network dependencies
- [ ] Verification screenshots and notes saved

---

**Author:** coder1 (Utagawa Hiroshige)  
**Status:** Strategy complete — ready for implementation  
**Next step:** Phase 1 — build the playable slice
