# Goal Execution Strategy — Pictures of the Floating World

> **Work Order:** `work-order-1783320826952-7-1`  
> **Factory:** `factory-edo-woodblock`  
> **Playbook:** `browser-game-2d`  
> **Branch:** `factoryx/factory-edo-woodblock/work-order`  
> **Archetype:** `creative_game`  
> **Completion mode:** `polish_until_deadline`  
> **Deadline:** 2026-07-06T22:53:44Z  

---

## 1. Vision & Player Fantasy

**The fantasy:** You are a master printmaker at an Edo workshop. Each interaction is the press of a baren against washi paper — deliberate, resistant, rewarding patience over speed. The player builds an ever-deepening ukiyo-e composition, not through accumulation of features, but through repeated, gentle engagement with the same gesture.

**Emotional target:** Quiet mastery. The piece should feel like it was *pulled from a woodblock* — warm, slightly imperfect, alive with the breath of the maker. The player's repeated clicks accumulate into a sense of earned beauty, not score inflation.

**References:**
- Hiroshige's *Thirty-Six Views of Mount Fuji* — atmospheric depth, mist eating distance
- Hokusai's *Thirty-Six Views* — bold single gestures, dramatic cropping
- Utamaro's *Bijin-ga* — tenderness in line, attention to the charged instant
- Sharaku's portraits — expressive simplicity, the mask that reveals more than the face

**What "good" feels like:** A player who clicks once sees a quiet gesture. Clicking three times with patience reveals a layered composition. Clicking fifty times slowly reveals something that feels like it was printed on real paper, in real ink, in the floating world.

---

## 2. Core Interaction Loop

**Current state (from `games/94-kawanakajima/index.html`):**
- 3D Three.js scene with a courtyard
- Roster of 10 Takeda and 10 Uesugi samurai silhouettes (JPGs)
- Drag to orbit the 3D view
- "THE INSTANT" button stages a clash between selected champions
- Review note on-screen: GLB assets are rejected

**Redesigned loop (preserving the canvas + Three.js infrastructure, transforming the experience):**

1. **Open** → a paper-textured canvas with a single, faint outline (a mountain, a wave, or a figure)
2. **Click once** → a brushstroke appears where the click landed, adding ink texture, paper grain interaction
3. **Click repeatedly in the same area** → the print deepens — more ink layers, richer color (vermilion over indigo over black)
4. **Click across different regions** → new elements emerge: mountains in the distance, waves in the foreground, figures in mid-ground
5. **Hold click (long press)** → the "baren press" — a sustained area gets darker, more saturated, as if the carver is pressing harder
6. **The print evolves organically** — each click adds to the whole, creating a composition that feels hand-crafted
7. **A "finish" button** captures the result as a shareable image with a subtle seal/stamp in the corner

**Key interaction design decisions:**
- Clicks are *not* instant. They animate — ink spreads from the click point over 200-400ms
- Rapid clicking produces *diminishing returns* — the print darkens less, simulating paper saturation
- The background paper texture is always visible — the canvas is never fully covered
- A subtle mist/ink-bleed effect softens edges between clicks
- A "resistance" feedback: after ~5 rapid clicks in one spot, further clicks produce smaller visual changes (paper saturation metaphor)

---

## 3. Art Direction

### Visual Identity

- **Palette (non-negotiable):**
  - Paper ground: `#f8f4eb` (warm handmade washi)
  - Ink: `#0f172a` (deep charcoal, not pure black)
  - Vermilion: `#c2410f` (traditional seal color, used sparingly)
  - Indigo: `#2c3a5f` (aizome, for depth)
  - Gold: `#b38b3f` (minimal, for seals and accents)

- **Textures:**
  - Paper grain (procedural, subtle noise layer)
  - Ink bleed / spread (radial gradient with soft falloff, slight asymmetry)
  - Woodblock grain (very subtle, on the background)
  - Mist / atmospheric depth (gradient overlays, opacity-based)

- **Elements:**
  - Mountains (Hokusai-style)
  - Waves (Kanagawa-style foam)
  - Figures (silhouette style, Utamaro-influenced)
  - Clouds / mist (soft, drifting)
  - Cherry blossoms (sparse, not overwhelming)
  - Seal/stamp (vermilion, appears on "finish")

### Asset Plan

**Existing assets (to preserve and extend):**
- `games/94-kawanakajima/assets/*.jpg` — 20 samurai silhouettes (10 Takeda, 10 Uesugi). These are 300-450 KB each, suitable for use as silhouette elements.
- `games/94-kawanakajima/assets/models/` — GLB props (lantern, banner, stone, rack). Keep as supplementary elements.
- `games/94-kawanakajima/index.html` — Three.js infrastructure, canvas setup, roster rendering, orbit controls. Keep the technical foundation.

**New assets to generate via Asset Foundry:**
1. **`samurai_character` recipe** → Generate improved samurai silhouettes (replacing the rejected GLBs). Request 4 variants: 2 Takeda, 2 Uesugi — heroic poses, distinct silhouettes.
2. **`cozy_audio_pack` recipe** → Generate ambient soundscape: soft brush strokes, paper rustle, distant wind, ink-water sounds. Minimal, atmospheric, user-initiated.
3. **Background textures** → Procedural paper grain and woodblock texture (code-generated, no Foundry needed).

**Asset priority order:**
1. Paper texture (procedural — immediate, no dependency)
2. Ink bleed brush strokes (procedural — immediate)
3. Foundry samurai silhouettes (replace rejected GLBs)
4. Foundry audio pack (ambient + interaction sounds)
5. Background elements (mountains, waves, clouds — procedural)

---

## 4. Technical Architecture

**Approach:** Extend the existing `games/94-kawanakajima/index.html` rather than rewriting it. The Three.js infrastructure, canvas setup, DPR handling, and viewport fitting are solid. We transform the *content* and *interaction model* while preserving the technical foundation.

### Key changes to `index.html`:

1. **Paper ground layer** — A persistent background div/layer with procedural paper grain (SVG filter or canvas noise)
2. **Ink brush layer** — Canvas overlay where click positions are recorded; each click adds a radial ink-blob with bezier-curved edges (not perfect circles)
3. **Element layer** — Optional overlay of silhouette elements (from Foundry samurai or procedural shapes) positioned by click clusters
4. **Mist/atmosphere layer** — Semi-transparent gradient overlay that drifts slowly (CSS animation or canvas animation)
5. **Interaction system** — Track click positions, velocities, intervals; modulate ink opacity/diameter based on temporal density (saturation model)
6. **"Finish" action** — Canvas.toDataURL or download link, with vermilion seal stamp added programmatically

### Preserved infrastructure:
- Three.js scene setup (keep for optional 3D element overlay, or remove if pure 2D feels more authentic)
- DPR-aware canvas sizing
- Viewport fitting logic
- Sound button infrastructure (repurpose for audio pack toggle)
- Responsive layout and touch handling

---

## 5. What We Are NOT Building (Non-Goals)

- **No scoring system, no levels, no high scores** — This is not a competitive game. It's a meditative craft simulation.
- **No multiplayer, no social features** — A single-player creative tool.
- **No complex physics** — No rigid bodies, no collision detection, no particle systems that feel like game effects.
- **No mobile app wrapping** — Pure browser-based experience.
- **No audio auto-play** — Sound is sparse, atmospheric, and user-initiated (aligns with the house style).
- **No complex 3D scenes** — The focus is 2D print-like aesthetics. Three.js is only a tool, not the point.
- **No persistent storage** — Results are saved by the user (screenshot/download), not by the app.

---

## 6. Asset Pipeline & Provenance

### Asset Foundry workflow:

1. Submit `samurai_character` recipe with 4 specs (2 Takeda, 2 Uesugi)
2. Record job IDs immediately in ASSET_MANIFEST.md
3. Poll every 120s for completion
4. Copy outputs from `/outputs/<job_id>/` to `games/94-kawanakajima/assets/generated/`
5. Integrate into the canvas as silhouette elements
6. Update ASSET_MANIFEST.md with job IDs, source paths, and integration points

### Fallback (if Foundry is slow or fails):
- Use existing JPG silhouettes as provisional elements
- Generate paper/ink textures procedurally (always available)
- Generate audio procedurally with Web Audio API (oscillators + noise)

### ASSET_MANIFEST.md updates:
- Document each asset: source (foundry/procedural/manual), file path, integration point, verification status
- Record Foundry job IDs and request payloads for traceability
- Note any blockers (e.g., asset generation failure, missing recipe)

---

## 7. Verification Strategy

### Smoke test (first pass):
- Open `games/94-kawanakajima/index.html` in a browser (chromium headless or Playwright)
- Verify: page loads, canvas renders, no console errors
- Click on canvas: verify ink appears at click position
- Rapid click test: verify diminishing returns behavior
- Screenshot: capture a mid-composition state

### Interaction verification:
- Click once → single ink mark appears
- Click 3-5 times → composition develops
- Hold click → sustained area darkens
- Try rapid clicking → paper saturation effect visible
- Audio toggle → sound plays (if assets available)
- Finish button → download/save triggered

### Visual quality check:
- Canvas is not blank
- Paper texture is visible
- Ink marks look organic (not perfect circles)
- Colors stay within the defined palette
- Overall composition feels intentional, not random

### Known limitations (to document):
- WebGL support required (modern browser)
- Audio requires user gesture (browser autoplay policy)
- No offline support (no service worker)
- Asset Foundry availability affects asset quality

---

## 8. Polish Passes (after baseline works)

**Polish Pass A — Interaction feel:**
- Tune ink spread radius, opacity decay, saturation curve
- Add subtle animation to ink marks (very slow breathing effect)
- Ensure "resistance" feels natural, not frustrating

**Polish Pass B — Visual polish:**
- Refine paper grain texture
- Add mist/atmosphere animation
- Polish the finish screen (seal stamp, caption)
- Add subtle transition between states

**Polish Pass C — Sound polish:**
- Tune audio pack (ambient layer, interaction sounds)
- Add "brush on paper" sound on click
- Add distant wind/atmosphere on idle

**Polish Pass D — Copy & context:**
- Write brief, poetic instructions (Sei Shonagon voice)
- Add title, subtitle, artist seal on finish
- Refine all labels and hints to match house style

---

## 9. Progress & Status

| Pass | Status | Notes |
|------|--------|-------|
| Strategy document | **In progress** (creating now) | This file |
| Asset Foundry probe | **Done** — healthy, 5 recipes available | `samurai_character`, `cozy_audio_pack` |
| Baseline interaction | Pending | Paper ground + ink brush layer |
| Foundry assets | Pending | samurai silhouettes, audio pack |
| Polish A (feel) | Pending | |
| Polish B (visual) | Pending | |
| Polish C (audio) | Pending | |
| Polish D (copy) | Pending | |
| Verification | Pending | Browser smoke test + screenshots |
| PR push | Pending | |

---

## 10. Blocking Dependencies

1. **Asset Foundry accessibility** — confirmed reachable at `http://factoryx-edo-woodblock-asset-foundry:18113` with Blender and Python recipes.
2. **WebGL in browser** — standard for Three.js; chromium headless supports it.
3. **Existing `index.html` foundation** — Three.js + canvas setup is solid and will be extended, not replaced.

---

## 11. Risk Assessment

| Risk | Likelihood | Mitigation |
|------|-----------|------------|
| Foundry jobs take too long | Medium | Poll with timeout; fall back to existing assets + procedural generation |
| Ink interaction feels flat | Medium | Multiple polish passes; tune curves iteratively |
| WebGL context issues in headless | Low | Fallback to 2D canvas-only rendering (no Three.js) |
| Budget expires before polish | Medium | Prioritize baseline interaction + one asset pass over cosmetic polish |

---

## 12. Open Questions

1. **Should we keep Three.js or go pure 2D canvas?**
   - *Current decision:* Keep Three.js as an option but default to a pure 2D canvas for the main interaction. The 3D layer can be toggled on for an "expanded view." This preserves the existing infrastructure while prioritizing the 2D print aesthetic.

2. **How many samurai silhouettes to request from Foundry?**
   - *Current decision:* 4 total (2 Takeda, 2 Uesugi) — enough for variety without overextending the budget. Existing 20 JPG silhouettes remain as provisional backup.

3. **Should the print save as an image?**
   - *Current decision:* Yes. A "Finish Print" button triggers `canvas.toDataURL` with a vermilion seal overlay, downloadable as PNG. This satisfies the "shareable" requirement.

---

*This strategy is the plan of record for Work Order `work-order-1783320826952-7-1`. Update this file when direction changes materially. Do not implement changes without reflecting them here first.*
