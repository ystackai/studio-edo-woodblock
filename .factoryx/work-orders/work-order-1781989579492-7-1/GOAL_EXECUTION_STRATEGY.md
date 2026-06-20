# GOAL EXECUTION STRATEGY — Kawanakajima Samurai Battlefield Playable Unity Deliverable

**Work Order:** work-order-1781989579492-7-1
**Branch:** `factoryx/factory-edo-woodblock/work-order-1781989579492-7-1`
**Deliverable:** `kawanakajima-samurai-game-world`
**Playbook:** `creative_game`
**Completion Mode:** polish_until_deadline
**Deadline:** 2026-06-21T21:06:19Z
**Last Updated:** 2026-06-20

---

## 1. Vision and Player Fantasy

**What the player experiences:** The player stands at the edge of the 1561 Battle of Kawanakajima, watching two clans — Takeda (red banners) and Uesugi (blue banners) — each arrayed with ten samurai, facing across a misty valley road. The scene reads as a living ukiyo-e tableau: ink-wash hills, paper-toned earth, pine silhouettes against pale sky, and warriors whose armor details catch the light. The player can orbit the scene, zoom in to inspect individual warriors, trigger a charge sequence that sends both sides surging together, then watch them reform. It is a **playable diorama**, not a combat game.

**Emotional target:** Quiet tension before violence. The moment of gathering storm. The scene should feel like a woodblock print that breathes — the banners flutter, the warriors breathe, mist drifts across the valley.

**References:** Kawanakajima battle illustrations (Tosa school, Edo period prints), Ken Burns-style cinematic pacing, Unity/Udon/Three.js proof-of-concept samurai scenes, ukiyo-e atmospheric perspective (muted distant tones, sharp foreground detail).

---

## 2. Mood, World, and Art Direction

**Visual identity:** Stylized low-poly, aligned with Edo Woodblock house style. Ink and paper palette dominates. Red and blue are used only for faction identification (Takeda vermilion, Uesugi indigo). Everything else reads as ink, paper, pine, stone.

**World composition (layered depth):**
- **Foreground (0–20m):** Ground plane with paper-earth material, scattered pine trees, field stones, the road track
- **Mid-ground (20–60m):** Two samurai formations facing each other, banners, atmospheric mist particles
- **Background (60m+):** Ink-wash mountains, pale sky, fog/fog volume that fades distance

**Lighting rig:**
- Cool near-white key light (primary illumination)
- Rim/kicker from behind to separate samurai silhouettes from background
- No saturated colored lights — color lives in materials and emissives only
- PCFSoft shadows for grounded feel
- ACES Filmic tone mapping

**Composition principle:** Default camera is shoulder-angle, slightly off-center, looking INTO the battlefield (rule of thirds). The wide overview is secondary. Close-ups frame the samurai at readable size.

---

## 3. Core Interaction Loop

| Input | Action |
|-------|--------|
| Mouse drag | Orbit camera around scene |
| Mouse wheel | Zoom in/out |
| Click samurai | Inspect individual (faction info panel) |
| `1` / Overview button | Wide battlefield overview |
| `2` / Red Close | Close-up on Takeda (red) line |
| `3` / Blue Close | Close-up on Uesugi (blue) line |
| `4` / Side | Side profile of the formation |
| `5` / Top | Top-down tactical formation view |
| `6` / Inspect | Asset detail close-up on hero samurai |
| `C` / Charge | Both sides charge toward each other |
| `R` / Reform | Samurais return to formation |
| `A` / Audio | Toggle battlefield ambient loop |
| `X` / Clash | Play clash SFX at the moment of contact |
| `P` / Pack | Toggle Foundry battlefield pack view |

**Gameplay states:** `Idle → Charge → Clash → Reform → Idle`
- Charge animation: smooth LERP toward charge targets over ~0.7s
- Clash: plays impact SFX, brief visual emphasis
- Reform: returns samurai to base positions with animation

---

## 4. Art and Asset Plan

### 4.1 Samurai Character Assets (20 total)

| Asset | Source | Provenance |
|-------|--------|------------|
| `samurai_character.glb` | Asset Foundry Blender job | `asset-1781913507610-bf69e595` (v5 repair) |
| `samurai_battlefield_pack.glb` | Asset Foundry Blender job | `asset-1781935845583-91a9fdbe` (v3) |
| Audio stems | Asset Foundry | `asset-1781916330853-f7d831d9` |

**Faction differentiation (already implemented):**
- Takeda (10 warriors): vermilion/red armor accents, Takeda crests on sashimono
- Uesugi (10 warriors): indigo/blue armor accents, Uesugi crests on sashimono
- Variants: slight pose/scale/stance transforms, some carry spears (yari) in addition to katana

**Unity integration:** Single GLB cloned 20× with per-actor color overrides on armor materials, additive props (spear on ~1/3), and sashimono color swaps.

### 4.2 World Assets (from battlefield pack)

| Asset | Content |
|-------|---------|
| `samurai_battlefield_pack.glb` | Terrain, hills, pine trees, field stones, road, river, rice paddies, 20 samurai in formation |

### 4.3 Audio Assets

| Asset | Size | Purpose |
|-------|------|---------|
| `battlefield_loop.wav` | 2.53 MB | Ambient battlefield rumble |
| `charge_cue.wav` | 15.9 KB | Charge initiation sound |
| `clash_accent.wav` | 53 KB | Impact/clash sound |
| `formation_step.wav` | 22.1 KB | Reformation footstep |
| `ui_confirm.wav` | 10.7 KB | UI button confirmation |

---

## 5. Blender / Foundry Quality Loop

Since Asset Foundry and Blender MCP are available (`http://factoryx-edo-woodblock-asset-foundry:18113`), the iteration loop is:

1. **Assess current asset quality** via existing contact sheets and hero renders
2. **If a visual issue is found** (capsule anatomy, disk faces, paddle feet, untextured primitives, Minecraft silhouettes):
   - Request Blender asset repair through Foundry (specify the exact issue)
   - Wait for new GLB export
   - Render new contact sheet with the same 6-camera set
   - Visually compare before/after
   - Preserve the best version
3. **Visual review gate:** A contact sheet with grey primitives, toy anatomy, cropped subjects, or unreadable tiny figures = FAIL. The asset must be reworked.
4. **Asset manifest:** Every change documented in ASSET_MANIFEST.md with job IDs, file sizes, and inspection notes.

**Current assessment (v5 samurai):**
- Readable silhouette with helmet, armor plates, weapons
- Faction coloring present (red/blue)
- Proper scale (not tiny blocks)
- Proper lighting with shadows and tone mapping
- Stylized/low-poly — not photorealistic, but meets the ukiyo-e aesthetic target

---

## 6. Unity MCP and Build Plan

### 6.1 Current Infrastructure
| Component | Status | Path/URL |
|-----------|--------|----------|
| Asset Foundry | **HEALTHY** (200) | `http://factoryx-edo-woodblock-asset-foundry:18113` |
| Blender MCP | Configured | Local `/usr/bin/blender` |
| Unity MCP listener | Reachable | `http://172.21.0.1:25666` (Mac Studio bridge) |
| Unity CLI | Available | `0.1.0-beta.7` (no Editor installed on worker) |
| Unity Editor | Not on worker | Mac Studio: `2023.2.20f1` |

### 6.2 Build Strategy
1. **Browser proof** (Three.js) — always available, always buildable
2. **Unity Editor Play Mode** — drive via MCP to `http://172.21.0.1:25666`, capture screenshots
3. **Unity Mac build** — via MCP `build-execute` or similar, produce `KawanakajimaSamurai.app`
4. If Mac build is blocked: capture the blocker with logs and keep Editor Play Mode as proof

### 6.3 Verification Screenshot Set
| View | Camera Preset | Purpose |
|------|--------------|---------|
| Wide overview | overview | Battlefield tableau, formation layout |
| Takeda close | redClose | Faction detail, armor readability |
| Uesugi close | blueClose | Faction detail, armor readability |
| Side profile | sideProfile | Silhouette and layering |
| Top-down | topFormation | Tactical formation clarity |
| Asset inspect | assetInspect | Single samurai detail |
| Charge state | runtime capture | Gameplay animation proof |

---

## 7. What NOT to Build

- **Combat mechanics:** No health, damage, AI behavior, or combat resolution. This is a tableau/diorama, not a fighting game.
- **Multiplayer:** No network, no lobby, no player accounts.
- **High-poly photorealism:** The aesthetic target is stylized low-poly with ukiyo-e sensibility.
- **Mobile build targets:** Focus on Mac desktop build.
- **New asset generation beyond refinement:** If current assets meet the visual gate, no new Blender jobs needed. Improve existing assets through iteration if issues arise.
- **Complex UI:** Diegetic, thin-line UI only. No HUD overlays with health bars or complex menus.

---

## 8. Engine, Asset Pipeline, and Verification Implications

### 8.1 Browser (Three.js)
- WebGL context, 20 samurai loaded from Foundry GLB
- Orbit controls, zoom, keyboard shortcuts (1–6, A, C, R, X, P, F)
- PCFSoft shadows, ACES tone mapping, atmospheric fog, vignette
- Canvas pixel variance confirms rendered scene
- Verification: `node verify.js` passes structure/asset/size checks

### 8.2 Unity (Editor + Play Mode)
- glTFast for GLB import (reflection-based, no hard dependency)
- 20 samurai instantiated from Foundry samurai GLB
- Audio system: file-backed WAV files, loop toggle, SFX playback
- Build hooks: `KawanakajimaUnityBuild` with WebGL, Linux, Mac targets
- Unity MCP: `com.ivanmurzak.unity.mcp` 0.81.1

### 8.3 Visual Review Gate
- First viewport must show non-blank 3D scene with camera framing subjects
- Canvas must show pixel variance (not blank)
- Close readable screenshot required for each focal asset (samurai)
- Wide shots alone are insufficient — must include shoulder/close-up view
- Any grey primitive, cropped subject, or unidentifiable shape = visual review failure

---

## 9. Execution Phases

### Phase 1: Asset Audit & Quality Check (Current)
- [x] Verify Asset Foundry health: **200 OK**
- [x] Verify Blender MCP availability: **configured, `/usr/bin/blender`**
- [x] Verify Unity MCP listener: **reachable at `http://172.21.0.1:25666`**
- [x] Inspect existing samurai contact sheet: readable silhouette, proper scale
- [x] Inspect existing browser proof: non-blank, 20 samurai, orbit controls
- [x] Inspect existing Unity build: 112 MB Mac .app, exit code 0

### Phase 2: Visual Polish (if time permits)
- [ ] Review contact sheets for any remaining issues
- [ ] If toy/capsule anatomy or untextured areas visible: request Blender repair
- [ ] Render new contact sheet, compare to existing
- [ ] Update ASSET_MANIFEST.md with findings

### Phase 3: Unity Verification
- [ ] Run Unity MCP preflight (status, scene list, assets-find)
- [ ] Play Mode verification: capture 20 samurai loaded, status message
- [ ] Capture screenshot set (6 camera presets + charge state)
- [ ] Attempt Mac build via MCP or batchmode

### Phase 4: Documentation & PR
- [ ] Update PREVIEW.md with current proof
- [ ] Update VERIFICATION.md with all verification results
- [ ] Update WORKLOG.md with iteration history
- [ ] Update ASSET_MANIFEST.md with final asset inventory
- [ ] Update DELIVERABLE_STATUS.md
- [ ] Update PR #167 with latest proof and summary

---

## 10. Progress Tracking

| Milestone | Status | Date |
|-----------|--------|------|
| Strategy document created | ✅ COMPLETE | 2026-06-20 |
| Asset Foundry preflight | ✅ HEALTHY | 2026-06-20 |
| Unity MCP preflight | ✅ REACHABLE | 2026-06-20 |
| Browser proof existing | ✅ VERIFIED | 2026-06-20 |
| Unity Mac build existing | ✅ VERIFIED | 2026-06-20 |
| PR #167 open | ✅ MERGEABLE | 2026-06-20 |
| Visual review pass | ⏳ PENDING | — |
| Unity Play Mode proof | ⏳ PENDING | — |
| Unity build proof | ⏳ PENDING | — |
| Documentation updated | ⏳ PENDING | — |

---

## 11. Blockers and Risks

| Risk | Likelihood | Mitigation |
|------|-----------|------------|
| Unity MCP listener unreachable | Low (currently working) | Fallback to browser proof as primary deliverable |
| Mac build fails on worker | High (no Editor installed) | Use MCP to drive Mac Studio build, or accept Editor Play Mode as proof |
| Asset quality insufficient | Low (v5 passes inspection) | Request Blender repair if issues found |
| Disk space on worker | Medium (already cleaned to ~3GB) | Use MCP for Unity operations, keep local builds minimal |
| Deadline pressure | Medium | Prioritize: (1) browser proof, (2) Unity Play Mode proof, (3) Mac build |

---

## 12. Success Criteria

The work order succeeds when:

1. **Browser proof** opens showing 20 samurai on battlefield with orbit controls, camera presets, charge/reform mechanics, and audio
2. **Unity scene** loads 20 samurai from Foundry assets with readable silhouettes
3. **At least one verification screenshot** shows the samurai close enough to judge silhouette, materials, and attached props
4. **Mac build** either produces a working `.app` or has a proven blocker documented
5. **All documentation** (PREVIEW, VERIFICATION, WORKLOG, ASSET_MANIFEST, DELIVERABLE_STATUS) is current and accurate
6. **PR #167** is updated with latest proof and links to all artifacts

A human reviewer should be able to open the preview URL and see a coherent playable scene without needing additional explanation or context.
