# Goal Execution Strategy

**Work Order:** `work-order-1785416542610-7-1`
**Title:** Daily Work Order: Pictures of the Floating World
**Archetype:** creative_game
**Factory:** Pictures of the Floating World (Edo Woodblock)
**Branch:** `factoryx/factory-edo-woodblock/work-order`
**Completion Mode:** polish_until_deadline
**Deadline:** 2026-07-30T14:32:22Z
**Core Interaction:** Baren press / wet ink — physical, slightly resistant, not frictionless
**Creative Brief:** "Touch feels like pressing a baren or breathing on wet ink"

---

## 1. Vision and Player Fantasy

### The Fantasy
The player stands before a freshly prepared woodblock on a noren-draped workbench. They are an apprentice *horimono* carver, learning patience and presence. The floating world (*ukiyo*) is not a place to conquer but a moment to inhabit. The cursor is the baren; the canvas is handmade washi paper; each gesture leaves a trace that the paper remembers.

### Emotional Target
- **Mono no aware** — the gentle sadness of impermanence. Each mark is a small death; the print records what happened, not what will be.
- **Ma** — the charged emptiness. Silence between strokes matters as much as the strokes themselves.
- **Wabi-sabi** — beauty in the imperfect, the worn, the faded. One perfect stroke plus a hundred imperfect ones reads truer than twenty perfect strokes.

### What "Good" Looks Like
A late-period Hiroshige or a Hokusai *okubi-e* that feels complete on the first screen. The interaction does not explain the image — it deepens it. The piece knows when to stop. The player closes the tab and feels they spent time with something real.

---

## 2. Core Interaction Loop and Progression

### The Loop (building on the existing `games/ukiyo-e-printer`)
1. **Breathe** — Player sees paper, Fuji silhouette, drifting mist, and a poetic prompt inviting them to begin.
2. **Touch** — Click/tap leaves an ink bloom with organic, irregular edges. Drag draws a brushstroke with soft ink bleed.
3. **Press** — Hold for 1–2 seconds triggers a baren press: ink deepens, vermilion appears at 60%+ saturation.
4. **Layer** — Patient, repeated engagement produces richer, more saturated prints. Frantic clicking accumulates saturation, making subsequent marks fainter (friction rewards patience).
5. **Finish** — Player captures the canvas as a PNG with a seal stamp (印) overlay and optional download.

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
- **Palette:** Black (`#0f172a`), deep indigo (`#2c3a5f`), faded vermilion (`#c2410f`), warm off-white washi (`#f8f4eb`), gold (`#b38b3f`). Additional hues only as deliberate overprints.
- **Scene:** Layered mountains (Hokusai's *Thirty-Six Views* influence), mist, lake, pine tree, walking figures (Hiroshige travelers). Atmospheric, not decorative.
- **Edges:** Soft, feathered, eaten by mist. No hard anti-aliased edges on primary forms.
- **The single strong gesture:** Fuji as the dominant compositional anchor. Everything else serves it.

### Audio Identity
- **Sound as memory:** the block being lifted, the brush leaving paper, the breath between moments. Sparse, physical, user-initiated.
- **Ambient:** water sounds, wind through pines — never constant, never melodic or "nice."
- **Interaction sounds:** ink bloom on paper (soft, wet), baren press (deep, resonant, muffled — like hand on wood).

### House Style Compliance
All visual and audio decisions must satisfy the Factory house style:
- No bright, saturated digital color without historical justification
- No particle systems that feel like video game effects
- No constant, melodic audio
- The piece must hold attention, not try to entertain

---

## 4. Asset Plan

### Current State Assessment
The existing `ukiyo-e-printer` uses **procedurally generated visuals** entirely within Canvas 2D:
- Paper texture: procedural grain via noise functions
- Mist: 12 animated layered mist blocks
- Mountains, lake, pine, figures: all procedurally drawn
- Audio: Foundry `cozy_audio_pack` (ambient_loop, soft_impact, seal_confirm) + oscillator fallback

### Generated Assets Needed

| Asset | Source | Status | Priority |
|---|---|---|---|
| **Background scene image** | Asset Foundry (Blender) — atmospheric landscape | Planned. Procedural scene exists and is functional. A Foundry-rendered scene with organic depth would add the "pulled from a floating world" quality the house style demands. | High |
| **Hanko seal stamp image** | Asset Foundry or hand-authored SVG | Planned. Current seal (印) is drawn procedurally. A carved-stamp reference image would deepen the finish moment. | Medium |
| **Paper texture** | Asset Foundry or hand-authored | Low. Procedural paper grain is acceptable and already reads well as washi. Foundry could add subtle deckle-edge texture variation. | Low |
| **Ambient soundtrack** | Asset Foundry `cozy_audio_pack` | **Complete.** Three WAV files (ambient_loop 5.3 MB, soft_impact 73 KB, seal_confirm 83 KB) from the previous work order are integrated. | Done |

### Asset Pipeline
- **Primary:** Asset Foundry at `http://factoryx-edo-woodblock-asset-foundry:18113` (Blender configured; healthz confirmed)
- **Fallback:** Procedural generation within Canvas 2D (already working)
- **Process:** Submit recipe → poll job → copy outputs → integrate → document in ASSET_MANIFEST.md

### Foundry Integration Plan
1. Submit a Blender recipe for an atmospheric ukiyo-e landscape scene (Fuji + mountains + lake + pine, misty atmosphere, muted palette).
2. Submit a second Blender recipe for a hanko seal stamp image (red stamped 印 on paper texture).
3. Poll both jobs with foreground commands, printing state every 120 seconds.
4. Copy completed outputs into `games/ukiyo-e-printer/assets/`.
5. Integrate into Canvas rendering pipeline.
6. Document all assets, job IDs, and integration points in ASSET_MANIFEST.md.

### Blender / 3D Considerations
- Blender 3.x compatibility: use `ShaderNodeBsdfPrincipled` (not `ShaderNodeBsdfPrincipledBSDF`), `poly.use_smooth` (not `poly.smooth`), `bpy.ops.export_scene.gltf` for GLB export.
- Z-up axis for all 3D models.
- Repeatable inspection cameras, contact sheets, per-ID naming.
- If Foundry 2D image generation is not accessible, fall back to hand-authored SVG or Canvas-generated art.

---

## 5. Placeholder Retirement Checklist

| Placeholder | Current State | Replacement | Priority |
|---|---|---|---|
| Procedural background scene | Canvas-drawn Fuji + mountains + lake + pine | Foundry-rendered atmospheric landscape with organic depth | High |
| Procedural seal stamp (印) | Canvas-drawn red rounded rect with character | Hand-authored or Foundry hanko stamp image | Medium |
| Procedural paper grain | Noise function + fiber lines on canvas | Could remain (reads well) or gain Foundry deckle texture | Low |

**Rule:** Do not replace a working procedural system unless the Foundry output demonstrably improves the experience. The procedural scene is layered and atmospheric; a Foundry scene must add organic depth that procedural generation cannot.

---

## 6. Engine, Asset Pipeline, Controls, Verification Implications

### Engine
- Pure Canvas 2D, no dependencies, no build step
- BlockList pattern: all visual elements as registered blocks, sorted by layer
- Pointer events for input, Web Audio API for sound
- DPR-aware canvas scaling

### Verification
- **Browser smoke test:** Open the game, verify no JS errors, no 404s, canvas renders, audio initializes on first interaction
- **Interaction test:** Click, drag, hold — verify physical feedback (ink bloom, density meter, breath mist, fiber lift)
- **Active-play screenshot:** Capture a post-interaction screenshot showing ink marks, density meter, and scene elements
- **Accessibility:** Keyboard controls (R=reset, S=save, J=sound), aria-labels on buttons
- **Foundry asset verification:** Confirm Foundry assets are actually rendered in the canvas (not just copied or hidden), with at least one in-context screenshot
- **Performance:** Canvas redraw on each frame, no memory leaks, audio context cleanup on reset

---

## 7. What Not to Build (Non-Goals)

- **No levels, no scoring, no win/lose conditions.** This is not a game with objectives.
- **No multiplayer, no social sharing beyond PNG download.**
- **No complex UI menus.** The interface is minimal: the paper, the controls, the seal.
- **No particle systems that feel like video game effects.** Mist and vapor should drift like real weather.
- **No bright, saturated color.** The palette is restrained: ink black, indigo, vermilion, washi white, gold.
- **No constant, melodic audio.** Sound is sparse and physical.
- **No replacement of working systems.** Procedural mist, fiber lift, baren press are all functional and must be preserved.

---

## 8. Risk Decisions

| Risk | Mitigation |
|---|---|
| Foundry assets are low quality | Procedural fallback always in place; Foundry output must meet visual quality gate before replacing anything |
| Audio autoplay policy blocks ambient sound | All audio starts on user gesture (first pointerdown); ambient fades in over 2s |
| Mobile/touch friction | touch-action: none; pointer events unify mouse/touch; baren press works with hold duration |
| Performance on low-end devices | Canvas 2D is lightweight; mist layers capped at 12; fiber bloom decays to reduce draw calls |
| Deadline pressure | Polish in bounded, targeted patches; committed + pushed evidence is a valid stopping point |
| Foundry 2D image generation unavailable | Fall back to hand-authored Canvas art; do not block the entire work order on one asset type |

---

## 9. Progress Updates Worth Sharing

- **First print:** Screenshots of the interactive print at different saturation levels
- **Asset integration:** Foundry-generated assets in context — before/after comparisons
- **Interaction feel:** Description of how the baren press, ink bloom, and breath mist feel in practice
- **Player evidence:** Links to shared prints (PNGs) created during testing
- **Known issues:** Any visual artifacts, audio glitches, or interaction gaps discovered during verification

---

## 10. Execution Order

1. **Audit existing game** — ✅ Already done. Game is mature and functional with baren press, ink bloom, brush strokes, atmosphere, Foundry audio.
2. **Check Asset Foundry readiness** — ✅ healthz confirmed; Blender configured.
3. **Submit Foundry recipes** — Submit background scene + hanko stamp via `POST /api/assets` with appropriate recipes.
4. **Poll and wait for assets** — Foreground polling every 120 seconds, record job IDs in ASSET_MANIFEST.md.
5. **Copy and integrate assets** — Once Foundry outputs are ready, copy into `games/ukiyo-e-printer/assets/` and integrate into Canvas rendering.
6. **Polish interaction** — Refine any new asset integration points, ensure foundry visuals read correctly at all screen sizes.
7. **Verification** — Browser smoke test, active-play screenshot, Foundry asset in-context verification, accessibility check.
8. **Commit, push, closeout** — Write ASSET_MANIFEST.md, PREVIEW.md, VERIFICATION.md; commit and push the branch.

---

## 11. Playtest Feedback Addressed

The primary playtest feedback file (`work-order-1785330240273-7-1/FEEDBACK.md`) contains only boilerplate — no substantive reviewer feedback. This work order proceeds with the creative brief as the primary directive: deepen the physical feel of the baren press and wet ink interaction.

---

## 12. Polishing Priorities (in order)

1. **Foundry background scene** — Replace procedural canvas scene with a Foundry-rendered atmospheric landscape if foundry output is high quality.
2. **Foundry hanko stamp** — Replace procedural seal with a carved-stamp reference image.
3. **Atmospheric polish** — Refine mist, breath, deckle edge, vignette — make them feel more alive and less looped.
4. **Interaction feel** — Tighten the resistance curve, ensure hold feedback is satisfying without being tedious.
5. **Copy and UI text** — Refine Japanese and English text for poetic resonance consistent with house style.
6. **Accessibility and polish** — Keyboard shortcuts, aria labels, reduced-motion support, mobile touch targets.

---

*This strategy preserves the existing functional game while planning targeted Foundry asset integration and atmospheric polish. The procedural scene, ink system, baren mechanics, and audio foundation are all solid; the next step is to deepening the tactile quality with Foundry-generated assets and refinement of the interaction loop.*
