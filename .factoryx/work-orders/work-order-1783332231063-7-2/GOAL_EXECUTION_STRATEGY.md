# Goal Execution Strategy

**Work Order:** `work-order-1783332231063-7-2`  
**Archetype:** creative_game  
**Factory:** Pictures of the Floating World (Edo Woodblock)  
**Branch:** `factoryx/factory-edo-woodblock/work-order`  
**Completion Mode:** polish_until_deadline (deadline: 2026-07-07T02:03:22Z)  
**Creative Brief:** "Touch feels like pressing a baren or breathing on wet ink"

---

## 1. Vision and Player Fantasy

### The Fantasy
The player is not a gamer but an *horimono* apprentice — a carver standing before a freshly prepared woodblock. They are meant to slow down, breathe, and feel the weight of each gesture. The floating world (*ukiyo*) is not a place to conquer; it is a moment to inhabit.

### Emotional Target
- **Mono no aware** — the gentle sadness of impermanence. Each mark on the paper is a small death; the print is a record of what happened, not what will be.
- **Ma** — the charged emptiness between marks. Silence between ink strokes matters as much as the strokes themselves.
- **Wabi-sabi** — beauty in the imperfect, the worn, the faded. A print with one perfect stroke and a hundred imperfect ones reads truer than one with twenty perfect strokes.

### Audience
Users who appreciate slow media: museum visitors, print collectors, fans of *The Great Wave*, *Shogun*, or *Hiroshige 100 Views of Edo*. Not casual gamers. This is for people who want to *feel* something.

---

## 2. Mood, World, References, Emotional Target

### Mood
- Dawn, not noon. Mist on water. The first light catching wet ink.
- Quiet. The room of the carver, not a festival.
- Slightly melancholic but never bleak.

### Visual References
- Hokusai's *Thirty-Six Views of Mount Fuji* — the power of a single dominant form.
- Hiroshige's *Fifty-Three Stations of the Tōkaidō* — layered depth, weather as mood.
- Utamaro's *Bijin-ga* — the living line, the charge in the space between forms.
- Sharaku's portraits — the mask that reveals more than the face.

### Emotional Target
The player should close the tab and feel like they've spent time with something real. Not "fun" in the shallow sense — **felt**.

---

## 3. Core Interaction Loop and Progression

### The Loop (already established by the existing `ukiyo-e-printer`)
1. **Breathe** — Player sees paper, Fuji silhouette, mist. A poetic prompt invites them to begin.
2. **Touch** — Click/tap leaves an ink bloom with organic, irregular edges. Drag draws a brushstroke with soft ink bleed.
3. **Press** — Hold for 1–2 seconds triggers a baren press: the ink deepens, vermilion appears at 60%+ depth.
4. **Layer** — Patient, repeated engagement produces richer, darker prints. Frantic clicking accumulates saturation, making subsequent marks fainter.
5. **Finish** — Player captures the canvas as a PNG with a seal stamp (印) overlay.

### Progression
Unlike a game with levels, progression here is **intensity-based**:
- A single mark = a sketch, barely alive.
- Three layered marks = a small study, beginning to breathe.
- Ten+ deliberate marks = a print, a thing.
- The seal stamp is the final act — the carver's mark.

There are no levels, no scores, no endings. The progression is in the *quality* of attention, not the quantity of inputs.

---

## 4. Art, Audio, and Interaction Direction

### Visual Direction
- **Palette:** Sumi (ink black `#0f172a`), ai-zuri (indigo `#2c3a5f`), beni (vermilion `#c2410f`), paper white (`#f8f4eb`). Gold (`#b38b3f`) for text only.
- **Background:** Mt. Fuji as the dominant compositional form, rendered as a silhouette with snow caps, atmospheric perspective.
- **Mist:** Animated drifting ellipses at multiple speeds and opacities. Mist is never static; it lives.
- **Paper texture:** Procedural washi fiber noise. Subtle tooth. Not a flat surface.
- **Ink behavior:** Variable width strokes with soft, bleeding edges. Blooms that spread with cubic ease. Paper saturation model where frantic clicking degrades quality.

### Audio Direction (already implemented)
- Wind noise (bandpass filtered noise at 380 Hz) — ambient, always present when audio is on.
- Two temple drones (82 Hz and 123.5 Hz) — a deep harmonic bed.
- Brush-on-paper SFX — decaying random noise with high-pass, triggered on each stroke.
- Baren press thud — low sine drop (90→35 Hz) on hold at 15–30% progress.
- Audio starts only after user gesture — never autoplay.

### Interaction Design
- **Input response is physical and slightly resistant** — no frictionless swipe-through. Hold duration matters; it is not a tap that instantly fires.
- **Patience rewarded** — slower, more deliberate interaction produces darker, richer marks.
- **Frantic clicking punished** — saturation model makes rapid taps fade each other out.
- **Touch targets ≥ 44px** — controls are tappable on mobile.
- **Keyboard shortcuts** — `R` for reset, `S` for finish.

---

## 5. Real Asset Plan

### Current Asset State
The existing `ukiyo-e-printer` uses **100% procedural assets** — all visuals and audio are generated in-code via Canvas 2D and Web Audio API. There are no external image or audio files.

### Asset Gaps
For this work order, the key gaps relative to the "review-worthy" quality bar are:

| Gap | Current State | Plan |
|-----|---------------|------|
| **Paper texture** | Procedural noise/fiber canvas | Improve with more realistic washi texture (fibers, deckle edges, subtle color variation) |
| **Mt. Fuji** | Procedural silhouette with snow caps | Could be replaced by a Foundry-generated image or a hand-drawn reference |
| **Mist layers** | 8 animated ellipses (simple shapes) | Could be improved with layered noise textures or sprite-based mist |
| **Seal stamp (印)** | Procedural red rect + kanji | Could be replaced with a real carved seal scan or Foundry-generated image |
| **Audio** | Procedural Web Audio (satisfactory) | No change needed — procedural audio fits the aesthetic well |

### Asset Pipeline Strategy
- **Asset Foundry** is available (Blender configured, but not HuggingFace or OpenAI image generation).
- Since the Foundry's primary capability here is Blender (3D mesh/render), and this project is 2D canvas-based, we are **not dependent on the Foundry** for core assets.
- **Fallback strategy:** The existing procedural assets are sufficient and stylistically appropriate. The key improvement is **refinement** of the procedural paper texture, ink bleed behavior, and overall atmospheric quality rather than asset replacement.
- **Blocker:** No OpenAI or HuggingFace configured means no AI-generated images for paper texture, seal stamp, or Fuji. This is documented but not blocking — the procedural approach is valid for this aesthetic.

### ASSET_MANIFEST.md
Will be updated to document all procedural assets, their generation method (in-code at runtime), and integration points. Since these are procedural, provenance is the source code itself.

---

## 6. Placeholder Retirement Checklist

### What's Already Review-Worthy
- ✅ Paper texture procedural — functional and atmospheric
- ✅ Mt. Fuji silhouette — clear composition, recognizable form
- ✅ Mist animation — living, breathing atmosphere
- ✅ Ink bloom — organic edges, visual feedback
- ✅ Ink strokes — variable width with soft bleed
- ✅ Baren press mechanic — hold-based resistance
- ✅ Paper saturation — punishes frantic clicking
- ✅ Seal stamp — functional finish mechanism
- ✅ Audio — procedural but fits the aesthetic well
- ✅ Responsive layout — works on mobile and desktop

### What Could Be Polished (Non-Blocking)
- Paper texture: add deckle-edge framing, subtle color variation (warm ivory, not pure white)
- Ink behavior: add more realistic capillary spread, edge darkening
- Mist: more layers, more variation in speed/opacity, subtle parallax
- UI chrome: reduce visual noise, make controls feel carved not pressed
- Typography: ensure appropriate Japanese serif font fallback chain
- Overlay prompt text: could be more poetic, more specific

**None of these are blockers.** The game is already reviewable in its current state. These are polish items for the `polish_until_deadline` mode.

---

## 7. Asset Manifest (Initial)

See `ASSET_MANIFEST.md` in the Work Order context for full provenance. Key entries:

| Asset | Type | Source | Integration |
|-------|------|--------|-------------|
| Paper texture | Procedural canvas (1024×768) | Noise + fiber lines at init | Background layer |
| Mt. Fuji | Procedural canvas | Silhouette + snow caps + clouds | Mid-ground layer |
| Mist layers | Procedural canvas | 8 animated ellipses | Foreground ink layer |
| Ink bloom | Procedural radial gradient | Pointer down, irregular edges | Core interaction |
| Ink strokes | Procedural path | Pointer move, variable width | Core interaction |
| Baren press | Procedural radial gradient + vermilion | Pointer hold, deepens over 2s | Core interaction |
| Seal stamp | Procedural canvas rect + kanji | Finish action, bottom-right | Download overlay |
| Wind noise | Web Audio filtered noise | AudioContext init, looped | Ambient background |
| Temple drones | Web Audio sine oscillators | AudioContext init | Ambient layer |
| Brush SFX | Web Audio noise + sine | Triggered per stroke | Per-stroke feedback |
| Baren thud | Web Audio sine decay | Triggered on hold | Hold feedback |

---

## 8. Engine, Asset Pipeline, Controls, and Verification Implications

### Engine
- **Pure Canvas 2D** — no WebGL, no Three.js, no framework. Single HTML file, zero dependencies.
- **DPR-aware** — canvas scaled to device pixel ratio (capped at 2x for performance).
- **Responsive** — canvas fits viewport at any size; touch and mouse supported.
- **No build step** — opens directly in browser.

### Asset Pipeline Implications
- All assets are **procedural and self-contained** — no network requests, no external files.
- This means: fast load, no broken asset 404s, works offline.
- Trade-off: assets are algorithmic, not photographic or hand-drawn. Acceptable for this aesthetic (washi texture, ink bleed, mist are all naturally procedural).
- **Verification** must confirm: canvas renders at 1024×768 DPR-scaled, audio starts after gesture, no console errors, responsive behavior works.

### Controls
| Input | Action |
|-------|--------|
| Click/tap | Ink bloom at point |
| Click + drag | Brushstroke with ink bleed |
| Hold 1–2s | Baren press (deeper ink, vermilion accent) |
| Sound button (♪) | Toggle ambient audio |
| Reset button / `R` | Clear all ink, reset saturation |
| Finish button / `S` | Capture canvas as PNG with seal stamp, download |

### Verification Plan
1. **Static check** — `node verify.js` (canvas present, mechanics implemented, audio init, sound toggle, seal stamp, mist layers).
2. **Browser smoke test** — open `games/ukiyo-e-printer/index.html` in headless Chromium, capture post-interaction screenshot.
3. **Console error check** — verify no `pageerror`, `console.error`, or failed asset requests during play.
4. **Post-interaction screenshot** — capture the canvas after several deliberate ink marks to demonstrate the layered, rich quality of patient engagement.

---

## 9. What NOT to Build (Hard Constraints)

### Out of Scope
- **No multiplayer or social features** — this is a solitary experience.
- **No levels, scores, or leaderboards** — no gamification that rewards speed or quantity.
- **No bright, saturated digital color** — palette is restrained to ink, indigo, vermilion, and paper.
- **No hard, perfectly anti-aliased edges** — all forms should feather or bleed at edges.
- **No particle systems that read as VFX** — particles, if used, must drift like ink or pollen.
- **No constant melodic audio** — sound is sparse, physical, user-initiated.
- **No trying to be "fun" in the shallow sense** — the goal is to hold attention, not entertain.
- **No external dependencies** — no CDN loads, no npm packages, no build tools.
- **No replacing the procedural approach** — the algorithmic nature of washi texture, ink bleed, and mist is intentional and fits the aesthetic.

---

## 10. Polish Priorities (polish_until_deadline mode)

Given the `polish_until_deadline` completion mode and the deadline of 2026-07-07T02:03:22Z:

### Phase 1: Core Polish (Priority 1)
1. **Paper texture improvement** — deckle-edge frame, subtle fiber variation, warm ivory tone.
2. **Ink behavior refinement** — more realistic capillary spread, edge darkening, variable opacity based on hold duration.
3. **Mist atmosphere** — additional layers, more natural drift patterns, subtle parallax with mouse position.

### Phase 2: UI and Copy Polish (Priority 2)
4. **Control chrome** — reduce visual noise, make buttons feel carved/subtle.
5. **Typography** — refine font fallback chain, improve prompt text poetry.
6. **Overlay animation** — smoother transitions, more atmospheric fade.

### Phase 3: Accessibility and Polish (Priority 3)
7. **Keyboard accessibility** — ensure all controls work via keyboard, add focus indicators.
8. **Mobile touch refinement** — prevent scroll on canvas, improve touch target feel.
9. **Performance** — ensure 60fps on mid-range devices, optimize mist animation.

### Phase 4: Finalization
10. **Verification** — run static checks, browser smoke test, screenshot capture.
11. **PR body** — update with implementation scope, verification output, preview instructions.
12. **Asset manifest** — finalize with all provenance.

---

## 11. Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Asset Foundry unavailable for image gen | High (no HuggingFace/OpenAI) | Low | Procedural approach already in place; not dependent on it |
| AudioContext autoplay restrictions | Low (expected) | Low | Audio starts only on user gesture — already implemented |
| Mobile canvas performance | Medium | Medium | DPR capped at 2; mist layers bounded; will test on mobile if possible |
| Browser compatibility | Low | Low | Canvas 2D is universally supported |
| Deadline pressure | Medium | Medium | Prioritize core polish (Phase 1) before cosmetic (Phase 4) |

---

## 12. Success Criteria

1. **First screen** — opens with paper, Fuji, mist, and poetic prompt. Makes sense without explanation.
2. **Interaction loop** — user can click, drag, hold, and finish within 30 seconds of opening.
3. **Physical feel** — input response has resistance (baren press hold time, ink saturation decay).
4. **Patience rewarded** — deliberate, slow engagement produces richer marks than frantic clicking.
5. **No runtime errors** — zero `console.error`, zero failed asset requests, zero uncaught exceptions.
6. **Screenshots captured** — at least one post-interaction screenshot showing layered, rich ink marks.
7. **PR body complete** — work order context, implemented scope, verification output, preview instructions included.

---

*This strategy document is the plan of record. It will be updated if the direction changes materially during implementation. No PR or human review is opened from this gate — the implementation work order will proceed from this foundation.*
