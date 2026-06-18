# Technical System Design — work-order-1781810487033-7-1

**Work Order:** Discord Deliverable Kickoff: Pictures of the Floating World (3D extension)
**Artifact under design:** `games/94-kawanakajima/` (primary: index.html + assets/models/ + supporting textures) + WO context notes (ASSET_MANIFEST.md etc.)
**Constraints from WORKFLOW + payload + GOAL_EXECUTION_STRATEGY:** creative_game, browser-game-2d playbook, file-backed 3D assets required (GLB/GLTF only for heroes), no JPG/PNG portraits or procedural geometry count as the deliverable, in-browser inspectable, self-contained after load (file:// + preview tree), house ukiyo-e style must be honored, `.factoryx/preview-entrypoint` must resolve, real chromium verification (WebGL + model loads), keep one canonical branch/PR.

## High-level architecture
- Core experience remains a single coherent "print studio" page at `games/94-kawanakajima/index.html` (self-contained or with minimal relative asset includes).
- 3D models become the source of truth for the 20 samurai (10 Takeda + 10 Uesugi). They replace the prior 2D generated portraits as the central visual subject.
- Rendering split:
  - Primary interaction layer can retain canvas 2D paper/ink framing + "pull" metaphor for consistency with house (the block, the baren, mist, ma).
  - 3D content is rendered via a WebGL canvas (or layered) inside the paper frame so the models feel like "carved blocks" or "standing prints in space".
  - A dedicated lightweight inspection mode (or always-visible inspector pane for review) allows orbiting/inspecting any model with minimal controls (mouse drag orbit, wheel zoom, click to select next/prev, preset "front / three-quarter / side" buttons). This satisfies "models can be inspected in-browser".
- State: roster of 20 model refs (by filename key), current selected per clan, current pose or "instant" trigger that can swap model animations or camera if present.
- No external network after first load: all .glb, textures, and runtime (three.js + loader) must be relative files or inlined.

## Filesystem / module layout (under games/94-kawanakajima/)
```
games/94-kawanakajima/
├── index.html                 # main preview + interaction (updated to load + display 3D)
├── assets/
│   ├── models/
│   │   ├── takeda-01.glb
│   │   ├── ...
│   │   └── uesugi-10.glb
│   ├── textures/              # optional PBR or stylized maps (albedo, normal if used)
│   │   └── *.png
│   └── (legacy 2D jpgs may stay for reference or transition but are not the deliverable)
├── (optional) js/
│   └── viewer.js              # extracted 3D setup if index.html grows; keep small
└── (no build step)
```
- All new 3D assets live only under `assets/models/` (and textures/ if separate).
- ASSET_MANIFEST.md lives in the Work Order context dir (`.factoryx/work-orders/work-order-1781810487033-7-1/ASSET_MANIFEST.md`) as the provenance source of truth; a copy or summary may be referenced from the game dir if useful for reviewers.
- `.factoryx/preview-entrypoint` remains `games/94-kawanakajima/index.html` (or a tiny index that forwards if we split the inspector).

## Libraries / runtime (vendoring required)
- Three.js (r128 or similar stable) + GLTFLoader for .glb parsing and scene.
  - Vendored as `assets/vendor/three.min.js` and `assets/vendor/GLTFLoader.js` (or a single combined `three-gltf-inline.js` if a minimal custom bundle is produced).
  - Reason: no node build, no CDN (must satisfy file:// and "no external net after load").
  - Size budget: target < 800kB combined gzipped for the 3D runtime; if exceeds, prefer a dedicated `models-inspector.html` entry that still satisfies preview root.
- WebGL 1/2 via three; graceful fallback note if context fails (but verification requires successful render).
- No other deps. Keep the 2D canvas parts (paper grain, mist, ink overlays) as supporting authored procedures around the 3D viewports — they do not satisfy the asset requirement.

## Data flow
1. On load: synchronously or async preload a manifest of the 20 models (hard-coded array or small JSON sidecar for keys/paths).
2. Load selected or initial models via THREE.GLTFLoader.load( relativePath ) → scene, meshes, materials, animations if authored.
3. Textures referenced inside .glb or external relative .png loaded by three's texture loader.
4. Render loop: requestAnimationFrame → three renderer.render on a WebGL canvas sized inside the paper frame.
5. Interaction:
   - Pointer over roster thumbnails (or low-res 2D stand-ins / wire previews) selects a model for a clan.
   - Main 3D viewport supports orbit (Pointer drag) + zoom; tap/click cycles or triggers "instant" (camera push or brief pose change).
   - "The instant" can be a short cross-fade or triggered keyframe between two models facing each other, with ink-splat overlay composited from the 2D layer for house continuity.
6. Expose for verification: `window.__KAWANAKAJIMA_3D_STATE = { modelsLoaded: [...], currentT, currentU, renderOK, lastError }`.

## Asset / evidence generation plan
- 20 .glb files (embedded or with external .bin) + any required texture PNGs.
- Generation method options (to be executed in impl pass):
  - If a 3D foundry / text-to-3D or Blender MCP becomes available: use house-style prompts ("ukiyo-e musha-e samurai, bold silhouette, limited palette, feathered edges, Takeda/Uesugi clan crest, specific weapon/helmet, low-poly or mid-poly for browser, PBR or toon material") to produce or refine.
  - Otherwise: external production of stylized GLBs (documented), imported as files. Pure procedural three.Mesh creation inside code does **not** count.
- Each model should have readable silhouette at small preview size and clear clan differentiation (maedate/crest shape, weapon, armor profile, subtle mon).
- Textures: keep minimal (1-2 per model) and low-res to control payload. Prefer vertex color + simple toon material for print-like read.
- ASSET_MANIFEST.md (WO context) will list:
  - filename, bytes, triangle count, material count, texture filenames, generation method/prompt or source note, integration (roster key, stage key), verification evidence path.
- Contact sheet: at minimum one verification screenshot per model (or grid) showing the 3D render in the paper frame.

## Preview & in-browser inspection
- Direct open of `games/94-kawanakajima/index.html` must show the 3D models as the focal subject.
- Controls for inspection:
  - Click a clan portrait slot (even if represented by a 3D thumbnail render or label) → load that model into the active inspector viewport.
  - Drag to orbit, scroll to dolly, buttons for front / 3/4 / profile views.
  - "Stage the instant" button loads both selected models into a diptych 3D view (two viewports or one split scene) with facing orientation.
- If full replacement of the 2D experience with live 3D makes the first screen too heavy or style-violating, the design allows a hybrid: the "roster" uses small 3D WebGL thumbs (or pre-rendered but the real .glb is what gets inspected on click), and the large interaction uses the primary model in a framed 3D canvas. The key is that a reviewer can get to an interactive 3D render of the actual committed .glb without leaving the preview.
- Update any games/index.html link text if present to mention "3D models".

## Verification (must actually exercise 3D)
- Harness runs against the direct entrypoint (chromium with WebGL flags: --use-gl=swiftshader or equivalent for headless if needed).
- Checks:
  - No pageerror or uncaught during load + first RAF.
  - Successful relative fetch of at least 2 .glb + their textures (network log or loader 'load' events).
  - WebGL canvas present and has non-zero client size.
  - Post-paint capture shows actual shaded 3D content (not solid rect or 2D fallback); harness may use pixel sampling or rely on exposed state + manual review of screenshot.
  - "Inspect" path exercised: select different models, trigger at least one orbit or pose change, capture a second state.
  - Console has no WebGL context lost or shader compile errors for the models.
- Update VERIFICATION.md with exact chromium command(s), expected state checks, and screenshot paths.
- 9/9 game feel and house quality bar still apply (coherent without instructions, intentional not placeholder).

## State, reset, and controls parity
- Model roster keys: 't1'..'t10', 'u1'..'u10' map to `assets/models/takeda-01.glb` etc.
- Selection requires the model to be "revealed" or always-available for 3D (the reveal verb can gate higher LOD or material detail if desired, but all models must be loadable immediately for inspection).
- Keyboard parity: 1-5 quick select, space = instant, R = reset stage, arrows or click to orbit nudge.
- Touch: orbit gestures on the 3D canvas; large tap targets for roster.

## Performance & payload
- Target: 30-60 fps on modest laptop for the 3D viewport(s) with 1-2 models visible.
- Keep per-model triangle count reasonable for browser (target < 8k-15k tris per samurai for first pass; LOD if authored).
- Texture sizes: 256-512 px, power of two, compressed if possible (but keep simple png for broad compat).
- Lazy load models on first inspect (do not preload all 20 on boot to keep initial payload light).
- Total added size: document in PR; acceptable for purposeful art per prior 2D precedent.

## Integration with existing 2D / house elements (deliberate)
- Retain paper grain, mist veil, ink wash layers as composited overlays or CSS/frame around the WebGL canvas so the 3D "lives on the block".
- Use restrained palette inside materials (sumi, vermilion, indigo, warm paper as emissive/ground).
- "The instant" feedback can be a 2D ink burst + 3D camera push or model shake for continuity.
- Do not introduce bright game lighting, rim lights, or modern PBR defaults that fight the floating world melancholy.

## Known risks & mitigations (called out for impl)
- No 3D asset pipeline in this runtime (GenerateImage is 2D only; no Blender, no gltf exporter exposed). If real authored GLBs cannot be obtained and committed, record as blocker in manifest and PR body; do not ship 20 empty or cube-only placeholders.
- three.js + GLTFLoader vendoring size and maintenance: choose a pinned known-good version; keep loader as small include.
- Headless WebGL in verification: may require --enable-webgl or software renderer flags; if captures are black, add a "software" note and still require functional code path + manual evidence.
- Style mismatch: 3D samurai may read as too "real". Mitigate with flat shading, limited color, post-process ink lines if three supports (or render target + 2D canvas composite).
- File:// loading of .glb: three's loader uses fetch or XHR which works for file:// in modern browsers for same-dir files; test explicitly.

## File surface for implementation (after this gate)
- Primary: games/94-kawanakajima/index.html (extend or refactor to include 3D viewer)
- New: games/94-kawanakajima/assets/models/*.glb (and textures/*.png)
- New/updated: games/94-kawanakajima/assets/vendor/* (three + loader) — or decide on size and split to a models-inspector.html
- WO context: ASSET_MANIFEST.md (full), PREVIEW.md, VERIFICATION.md, WORKLOG.md, screenshots/ from 3D captures
- Optional: update studio.json or games/index.html only if it materially helps discovery (prefer not).

## Known non-goals for this WO
- Full 3D real-time battle simulation or physics.
- High-fidelity PBR, shadows, or post-processing stack beyond what is needed for legibility.
- Animation-heavy rigged models (simple static or 2-3 pose variants sufficient unless budget allows).
- Changes to other games, root index, or unrelated drops.
- Parallel branches/PRs.
- Relying on external viewers (Sketchfab etc.) for the "in-browser" requirement.

## Rollout / verification notes
- All changes on `factoryx/factory-edo-woodblock/work-order` only.
- PR body will include full Work Order Context (id + this prompt), implemented scope (20 GLBs + manifest + viewer), preview instructions, verification output, known limits.
- Keep prior 2D assets if they help transition or fallback, but do not let them satisfy the 3D requirement.

## Open questions for impl (to resolve before code)
- Exact vendored three.js version and minimal feature set (OrbitControls?).
- Whether the main interaction stays 2D-framed-with-3D-inside or becomes primarily 3D diptych.
- How "reveal" verb translates to 3D (material opacity, LOD swap, ink overlay on render target?).
- If full 20 real GLBs prove impossible in budget, authoritative subset (e.g. commanders + 4 per side) + clear documentation.

All planning artifacts for this Work Order are isolated under `.factoryx/work-orders/work-order-1781810487033-7-1/`.

Work Order: work-order-1781810487033-7-1
