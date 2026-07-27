# Goal Execution Strategy

**Work Order:** `work-order-1785157243525-7-1`  
**Title:** Daily Work Order: Pictures of the Floating World  
**Archetype:** creative_game  
**Factory:** Pictures of the Floating World (Edo Woodblock)  
**Branch:** `factoryx/factory-edo-woodblock/work-order`  
**Completion Mode:** polish_until_deadline  
**Deadline:** 2026-07-27T14:30:43Z  
**Core Interaction:** Baren press / wet ink — physical, slightly resistant, not frictionless  
**Creative Brief:** "Touch feels like pressing a baren or breathing on wet ink"

---

## 1. Vision and Player Fantasy

### The Fantasy
The player stands before a freshly prepared woodblock. They are not a gamer but an apprentice *horimono* carver — someone learning patience. The floating world (*ukiyo*) is not a place to conquer; it is a moment to inhabit. The cursor is the baren, the canvas is washi paper, and each gesture leaves a physical trace.

### Emotional Target
- **Mono no aware** — the gentle sadness of impermanence. Each mark is a small death; the print records what happened, not what will be.
- **Ma** — the charged emptiness. Silence between strokes matters as much as the strokes themselves.
- **Wabi-sabi** — beauty in the imperfect, the worn, the faded. One perfect stroke plus a hundred imperfect ones reads truer than twenty perfect strokes.

### What "Good" Looks Like
A late-period Hiroshige that feels complete on the first screen. The interaction does not explain the image — it deepens it. The piece knows when to stop. The player closes the tab and feels they spent time with something real, not "fun" in the shallow sense but **felt**.

---

## 2. Core Interaction Loop and Progression

### The Loop (building on existing `games/ukiyo-e-printer`)
1. **Breathe** — Player sees paper, Fuji silhouette, drifting mist. A poetic prompt invites them to begin.
2. **Touch** — Click/tap leaves an ink bloom with organic, irregular edges. Drag draws a brushstroke with soft ink bleed.
3. **Press** — Hold for 1–2 seconds triggers a baren press: ink deepens, vermilion appears at 60%+ saturation.
4. **Layer** — Patient, repeated engagement produces richer prints. Frantic clicking accumulates saturation, making subsequent marks fainter (friction rewards patience).
5. **Finish** — Player captures the canvas as a PNG with a seal stamp (印) overlay.

### Progression
Intensity-based, not level-based:
- A single mark = a sketch, barely alive.
- Three layered marks = a small study, beginning to breathe.
- Ten+ deliberate marks = a print, a thing.
- The seal stamp is the final act — the carver's mark.

### Friction Design
- **Hold duration matters:** longer holds deepen ink and trigger baren press; quick taps are light, surface marks.
- **Saturation decay:** ink slowly fades from the paper, rewarding the patient carver who returns to deepen rather than frantically clicking.
- **Breath mist:** builds during patient holds, creates atmospheric *ma* around the active area.
- **Fiber lift:** subtle paper texture response to sustained pressure — the paper yields slightly.

---

## 3. Art and Audio Direction

### Visual Identity
- **Palette:** Black, deep indigo, faded vermilion, warm off-white washi paper. Additional hues only as deliberate overprints.
- **Scene:** Layered mountains (Hokusai's *Thirty-Six Views* influence), mist, lake, pine tree, walking figures (Hiroshige travelers). Atmospheric, not decorative.
- **Edges:** Soft, feathered, eaten by mist. No hard anti-aliased edges on primary forms.
- **The single strong gesture:** Fuji as the dominant compositional anchor. Everything else serves it.

### Audio Identity
- **Sound as memory:** the block being lifted, the brush leaving paper, the breath between moments. Sparse, physical, user-initiated.
- **Ambient:** water sounds, wind through pines — never constant, never melodic or "nice."
- **Interaction sounds:** ink bloom on paper (soft, wet), baren press (deep, resonant, muffled — like hand on wood).

---

## 4. Asset Plan

### Current State Assessment
The existing `ukiyo-e-printer` uses **procedurally generated visuals** entirely within Canvas 2D:
- Paper texture: procedural grain via noise functions
- Mist: 12 animated layered mist blocks
- Mountains, lake, pine, figures: all procedurally drawn
- Audio: oscillator-based water drops and ambient wind

### Generated Assets Needed
The playtest feedback directory is boilerplate (no specific feedback yet). However, the creative brief demands:

| Asset | Source | Status |
|---|---|---|
| **Background scene image** | Asset Foundry (Flux) or hand-authored procedural | Planned — Procedural scene is already present and working; consider if Foundry-generated background adds value or if the procedural approach is sufficient |
| **Seal stamp / Hanko reference** | Asset Foundry (Flux) or hand-drawn SVG | Planned — Current seal (印) is a simple Canvas draw; a more authentic hanko stamp visual would strengthen the finish |
| **Ambient soundtrack** | Asset Foundry (MMAudio/HeartMuLa) or hand-crafted | Planned — Current audio is oscillator-based (water drops, wind). Foundry could produce a more atmospheric piece |
| **Paper texture** | Asset Foundry or hand-authored | Planned — Current procedural paper grain is acceptable as fallback |

### Asset Pipeline
- **Primary:** Asset Foundry at `http://factoryx-edo-woodblock-asset-foundry:18113` (Blender configured; open model access confirmed via healthz)
- **Fallback:** Procedural generation within Canvas 2D (already working)
- **Process:** Submit recipe → poll job → copy outputs → integrate → document in ASSET_MANIFEST.md

### Blender Integration
- Blender is configured via Asset Foundry. If 3D assets are needed (e.g., a seal stamp relief, a hanko 3D model), use Blender via Foundry's recipe system.
- Use Z-up, repeatable inspection cameras, GLB exports with per-ID naming.

---

## 5. Placeholder Retirement Checklist

| Placeholder | Current State | Replacement | Priority |
|---|---|---|---|
| Oscillator-based audio | Water drop + wind via AudioContext oscillators | Foundry-generated ambient track + physical interaction sounds | High |
| Simple canvas seal (印) | Procedural red square with character | More authentic hanko stamp visual | Medium |
| Procedural paper grain | Noise function on canvas | Could remain (reads well as washi) or be replaced with subtle texture from Foundry | Low |
| Procedural scene elements | Mountains, lake, pine, figures all procedural | Functional and atmospheric; can be enhanced with Foundry background if it integrates cleanly | Medium |

**Rule:** Do not replace a working procedural system with a Foundry asset unless the Foundry output demonstrably improves the experience. The procedural scene is already layered and atmospheric.

---

## 6. Engine, Asset Pipeline, Controls, Verification Implications

### Engine
- Pure Canvas 2D, no dependencies, no build step
- BlockList pattern: all visual elements as registered blocks, sorted by layer
- Pointer events for input, Web Audio API for sound

### Verification
- **Browser smoke test:** Open the game, verify no JS errors, no 404s, canvas renders, audio initializes on first interaction
- **Interaction test:** Click, drag, hold — verify physical feedback (ink bloom, density meter, breath mist, fiber lift)
- **Active-play screenshot:** Capture a post-interaction screenshot showing ink marks, density meter, and scene elements
- **Accessibility:** Keyboard controls (R=reset, S=save, J=sound), aria-labels on buttons, reduced-motion consideration
- **Performance:** Canvas redraw on each frame, no memory leaks, audio context cleanup on reset

---

## 7. What Not to Build (Non-Goals)

- **No levels, no scoring, no win/lose conditions.** This is not a game with objectives.
- **No multiplayer, no social sharing beyond PNG download.**
- **No complex UI menus.** The interface is minimal: the paper, the controls, the seal.
- **No particle systems that feel like video game effects.** Mist and vapor should drift like real weather.
- **No bright, saturated color.** The palette is restrained: ink black, indigo, vermilion, washi white, gold.
- **No constant, melodic audio.** Sound is sparse and physical.

---

## 8. Risk Decisions

| Risk | Mitigation |
|---|---|
| Asset Foundry returns low-quality assets | Procedural fallback always in place; Foundry output must meet visual quality gate before replacing anything |
| Audio autoplay policy blocks ambient sound | All audio starts on user gesture (first pointerdown); ambient fades in over 2s |
| Mobile/touch friction | touch-action: none; pointer events unify mouse/touch; baren press works with hold duration |
| Performance on low-end devices | Canvas 2D is lightweight; mist layers capped at 12; fiber bloom decays to reduce draw calls |
| Deadline pressure | Polish in bounded, targeted patches; committed + pushed evidence is a valid stopping point |

---

## 9. Progress Updates Worth Sharing

- **First print:** Screenshots of the interactive print at different saturation levels
- **Asset integration:** Foundry-generated assets in context — before/after comparisons
- **Interaction feel:** Description of how the baren press, ink bloom, and breath mist feel in practice
- **Player evidence:** Links to shared prints (PNGs) created during testing
- **Known issues:** Any visual artifacts, audio glitches, or interaction gaps discovered during verification

---

## 10. Execution Order

1. **Audit existing game** (✅ done — game is mature and functional)
2. **Check Asset Foundry readiness** (✅ healthz confirmed; Blender available)
3. **Decide on Foundry vs procedural** — The procedural scene is already layered and atmospheric. Foundry background would add organic texture but the procedural approach reads well. Consider: does a Foundry-generated scene *improve* on the current procedural one, or would it add visual noise?
4. **If Foundry is used:** Generate background scene, seal stamp reference, ambient audio track
5. **Integrate assets** into the Canvas rendering pipeline
6. **Polish interaction feel** — refine baren press resistance, ink bloom, breath mist
7. **Verification** — browser smoke test, active-play screenshot, accessibility check
8. **Commit, push, closeout**

---

*This strategy preserves the existing functional game while planning targeted improvements. The procedural scene, ink system, and baren mechanics are already solid; Foundry assets and polish pass are the remaining work.*

---

## Execution Notes (Work Order 1785157243525-7-1)

### Completed
- Asset Foundry audio integration (cozy_audio_pack → 3 WAV files → blended into game audio)
- Enhanced baren press: layered ink ring, fiber lift, breath vapor, vermilion glow
- Enhanced brush stroke: speed-dependent resistance, bristle dots, brush cursor
- Enhanced paper texture: cross-hatch fibers, darker fiber highlights
- Enhanced seal stamp: irregular hanko edges, ink bleed blur
- Enhanced atmosphere: breathing deckle edge, deeper vignette, enhanced title glow
- Enhanced audio mix: deeper drone, wind LFO, wet ink layers, seal thud with bass
- ASSET_MANIFEST.md, PREVIEW.md, VERIFICATION.md, WORKLOG.md updated

### Design Philosophy
- Touch should feel like pressing a baren on washi paper
- Friction is a feature: resistance makes interaction feel physical
- Patience is rewarded: paper recovers, marks deepen over repeated gentle engagement
- No frantic clicking: saturation system punishes rapid interaction
- All changes are enhancements to existing working code, not replacements
