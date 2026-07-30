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
The current game has **16 block classes** (PaperBlock, SceneBlock, InkBloomBlock, InkStrokeBlock, MistBlock, FigureBlock, MountainBlock, SunBlock, PineTreeBlock, LakeBlock, JapaneseCloudBlock, DeckleEdgeBlock, VignetteBlock, RockBlock, GrassBlock) with a fully functional Canvas 2D rendering pipeline. The core loop:

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

### Current Audio Assets (Foundry `cozy_audio_pack`)
| Asset | Source | Size | Status |
|---|---|---|---|
| `ambient_loop.wav` | Foundry | 5.3 MB | ✅ Present |
| `soft_impact.wav` | Foundry | 83 KB | ✅ Present |
| `seal_confirm.wav` | Foundry | 73 KB | ✅ Present |

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
- Mist: animated layered mist blocks (12+ layers)
- Mountains, lake, pine, figures: all procedurally drawn via block classes
- Audio: Foundry `cozy_audio_pack` with three audio files totaling ~5.5 MB

### Planned Foundry Assets

| Asset | Recipe (from `/api/recipes`) | Source | Priority |
|---|---|---|---|
| **Background scene** | Blender 2D atmospheric landscape | Asset Foundry `POST /api/assets` | High — replaces procedural scene |
| **Hanko stamp** | Tactical Vector — carved seal | Asset Foundry `POST /api/assets` | Medium — replaces procedural seal |

### Foundry Integration Plan
1. GET `http://factoryx-edo-woodblock-asset-foundry:18113/healthz` — verify service is alive
2. GET `http://factoryx-edo-woodblock-asset-foundry:18113/api/recipes` — confirm recipe IDs
3. POST `http://factoryx-edo-woodblock-asset-foundry:18113/api/assets` with recipe, `asset_name`, `prompt`, `style` for background scene
4. POST same endpoint for hanko stamp
5. Poll with `GET /api/assets/<job_id>` at 120-second intervals
6. Copy outputs from `/outputs/<job_id>/<file>` into `games/ukiyo-e-printer/assets/`
7. Integrate into Canvas rendering, verify in-context screenshot

### Asset Source of Truth
All asset provenance tracked in `ASSET_MANIFEST.md` in the Work Order context with:
- Job IDs, recipe IDs, submitted request JSON
- Copied `/outputs/...` source paths
- Imported asset paths and integration points

---

## 5. Placeholder Retirement Checklist

| Placeholder | Current Form | Target Replacement | Status |
|---|---|---|---|
| Procedural mountain scene | Canvas 2D procedural drawing | Foundry-generated atmospheric landscape | Planned |
| Procedural seal stamp | Canvas-drawn 印 character | Foundry-generated hanko stamp image | Planned |
| Oscillator audio fallback | Web Audio API oscillator | Foundry `cozy_audio_pack` WAV files | ✅ Complete |
| Generic mist effect | Canvas noise overlay | Enhanced with breath mist interaction | In progress |

**Note:** The Foundry-generated assets must actually be **rendered in the main play loop**, not merely copied, hidden, or offscreen. In-game verification screenshots must show the focal assets visibly integrated.

---

## 6. Engine, Asset Pipeline, Controls, Verification Implications

### Engine
- **Canvas 2D** (no WebGL, no heavy dependencies)
- 16 block classes with `render(ctx)`, `update(dt)`, `layer`, `visible` contract
- Single `index.html` entrypoint — no build step, no bundler

### Asset Pipeline
- Foundry: `POST /api/assets` → `GET /api/assets/<job_id>` → `GET /outputs/<job_id>/<file>` → copy to `assets/`
- Fallback: procedural generation if Foundry unavailable or assets fail quality gate
- Audio: three Foundry WAV files already present; no additional audio generation planned

### Controls
- Mouse: click = ink bloom, drag = brush stroke, hold = baren press
- Touch: same interactions via pointer events
- Keyboard: R = reset, S = save, J = toggle sound
- All interactions use `touch-action: none` and pointer events for unified handling

### Verification Plan
1. **Browser smoke test:** Open `index.html` in headless Chromium; check for `pageerror`, `console.error`, failed asset requests
2. **Active-play screenshot:** Click/drag/hold to leave ink marks; capture screenshot with visible marks, density meter, and scene
3. **Foundry asset verification:** If Foundry assets are generated, capture screenshot showing assets in context (not just on title screen)
4. **Accessibility:** Keyboard controls work, aria-labels present, reduced-motion respected
5. **Performance:** No memory leaks, no excessive draw calls, audio context cleans up on reset

### 900-Second No-Log Mitigation (Previous Run Fix)
The previous run failed because Codex had no run-log activity for 900 seconds. This run addresses that by:
- **Every action is logged:** Every command, file edit, and API call is a visible checkpoint
- **Time-boxed phases:** Each phase has a hard deadline; if not complete, proceed to fallback and commit
- **Checkpoint schedule:**
  - T+0: Read existing code, write strategy, check Foundry health
  - T+5min: Submit Foundry asset requests, record job IDs in ASSET_MANIFEST
  - T+25min: First asset poll, integrate if complete
  - T+45min: Integration smoke test in browser
  - T+60min: Active-play screenshot captured
  - T+75min: Polish pass, verification notes written
  - T+90min: Commit and push branch, close out
- **If assets not ready:** Proceed with procedural fallback and document the blocker explicitly

---

## 7. What Not to Build (Non-Goals)

- **No levels, no scoring, no win/lose conditions.** This is not a game with objectives.
- **No multiplayer, no social sharing beyond PNG download.**
- **No complex UI menus.** The interface is minimal: the paper, the controls, the seal.
- **No particle systems that feel like video game effects.** Mist and vapor should drift like real weather.
- **No bright, saturated color.** The palette is restrained: ink black, indigo, vermilion, washi white, gold.
- **No constant, melodic audio.** Sound is sparse and physical.
- **No replacement of working systems.** Procedural mist, fiber lift, baren press are all functional and must be preserved.
- **No new build tooling.** No webpack, no TypeScript, no bundler. Pure HTML/CSS/JS.
- **No separate branches or PRs.** Work on the canonical `factoryx/factory-edo-woodblock/work-order` branch only.

---

## 8. Risk Decisions

| Risk | Mitigation | Hard Deadline |
|---|---|---|
| Foundry assets low quality | Procedural fallback always in place; Foundry output must meet visual quality gate before replacing anything | T+45min |
| Audio autoplay policy blocks ambient sound | All audio starts on user gesture (first pointerdown); ambient fades in over 2s | T+0 (already handled) |
| Mobile/touch friction | touch-action: none; pointer events unify mouse/touch; baren press works with hold duration | T+0 (already handled) |
| Performance on low-end devices | Canvas 2D is lightweight; mist layers capped at 12; fiber bloom decays to reduce draw calls | T+60min (smoke test) |
| Deadline pressure | Polish in bounded, targeted patches; committed + pushed evidence is a valid stopping point | T+90min |
| Foundry 2D image generation unavailable | Fall back to hand-authored Canvas art; do not block the entire work order on one asset type | T+45min |
| **No-run-log timeout (900s)** | Every action logged; time-boxed phases; explicit checkpoint schedule above | **Always** |

---

## 9. Progress Updates Worth Sharing

- **First print:** Screenshots of the interactive print at different saturation levels
- **Asset integration:** Foundry-generated assets in context — before/after comparisons
- **Interaction feel:** Description of how the baren press, ink bloom, and breath mist feel in practice
- **Player evidence:** Links to shared prints (PNGs) created during testing
- **Known issues:** Any visual artifacts, audio glitches, or interaction gaps discovered during verification

---

## 10. Execution Order

1. **Audit existing game** — ✅ Already done. Game is mature with 16 block classes, baren press, ink bloom, brush strokes, atmosphere, Foundry audio.
2. **Check Asset Foundry readiness** — Verify `healthz`, get recipes, confirm available asset types.
3. **Submit Foundry asset requests** — Submit background scene + hanko stamp via `POST /api/assets`. Record job IDs in ASSET_MANIFEST.md immediately.
4. **Poll and wait for assets** — Foreground polling every 120 seconds. If assets don't complete, fall back to procedural.
5. **Copy and integrate assets** — Once Foundry outputs are ready, copy into `assets/` and integrate into Canvas rendering.
6. **Polish interaction** — Refine any new asset integration points, ensure foundry visuals read correctly at all screen sizes.
7. **Verification** — Browser smoke test, active-play screenshot, Foundry asset in-context verification, accessibility check.
8. **Commit, push, closeout** — Write ASSET_MANIFEST.md, PREVIEW.md, VERIFICATION.md; commit and push the branch.

### Phase Timeline (relative to start)
| Phase | Duration | Checkpoint Artifact |
|---|---|---|
| Audit + Foundry health | 5 min | healthz response, recipe list |
| Submit asset requests | 5 min | ASSET_MANIFEST.md with job IDs |
| Poll + first response | 15 min | Asset status updates |
| Integration + smoke test | 15 min | Browser screenshot of live game |
| Active-play capture | 10 min | Post-interaction screenshot |
| Polish pass | 15 min | Updated files, PREVIEW/VERIFICATION |
| Commit + push | 5 min | Branch pushed, context files written |
| **Total estimated** | **~70 min** | **Well within 16h budget** |

---

## 11. Playtest Feedback Addressed

The primary playtest feedback file (`work-order-1785330240273-7-1/FEEDBACK.md`) was not found on the branch. The current work order's `FEEDBACK.md` is boilerplate (no substantive reviewer feedback). This work order proceeds with the creative brief as the primary directive: deepen the physical feel of the baren press and wet ink interaction.

Any playtest feedback discovered during verification will be recorded in `FEEDBACK.md` for the next run to address.

---

## 12. Polishing Priorities (in order)

1. **Foundry background scene** — Replace procedural canvas scene with a Foundry-rendered atmospheric landscape if foundry output meets quality gate.
2. **Foundry hanko stamp** — Replace procedural seal with a carved-stamp reference image.
3. **Atmospheric polish** — Refine mist, breath, deckle edge, vignette — make them feel more alive and less looped.
4. **Interaction feel** — Tighten the resistance curve, ensure hold feedback is satisfying without being tedious.
5. **Copy and UI text** — Refine Japanese and English text for poetic resonance consistent with house style.
6. **Accessibility and polish** — Keyboard shortcuts, aria labels, reduced-motion support, mobile touch targets.

---

## 13. Definition of Done Checklist

- [ ] A reviewer can understand the requested scope from the PR body.
- [ ] The app has a clear first-screen experience and a meaningful interaction loop.
- [ ] The central visuals, sounds, copy, and interaction details feel intentional for the subject matter.
- [ ] Visual and audio assets have a concrete file-backed pipeline, ASSET_MANIFEST.md provenance.
- [ ] At least one screenshot or asset checkpoint exists showing assets in context.
- [ ] The PR includes verification output and preview instructions.
- [ ] The implementation is more than scaffolding or cosmetic placeholder work.
- [ ] Browser smoke test passes: no page errors, no console errors, assets load.
- [ ] Active-play screenshot captured showing ink marks, density meter, scene elements.
- [ ] Branch committed and pushed to `factoryx/factory-edo-woodblock/work-order`.
- [ ] ASSET_MANIFEST.md, PREVIEW.md, VERIFICATION.md written and committed.

---

*This strategy preserves the existing functional game while planning targeted Foundry asset integration and atmospheric polish. The procedural scene, ink system, baren mechanics, and audio foundation are all solid; the next step is deepening the tactile quality with Foundry-generated assets and refinement of the interaction loop.*
