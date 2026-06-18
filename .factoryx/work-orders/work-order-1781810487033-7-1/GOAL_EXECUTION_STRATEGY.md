# Goal Execution Strategy — work-order-1781810487033-7-1

**Work Order:** Technical planning gate for Discord Deliverable Kickoff: Pictures of the Floating World (3D assets extension)
**Core constraint:** The prior delivery (2D JPG portraits under PR #158 / work-order-1781744660416-7-1) satisfied the image generation request but did not deliver "actual 3D assets". Per explicit human kickoff: "The missing deliverable is actual 3D assets, not 2D images." 20 file-backed samurai models (GLB/GLTF) are required. JPG/PNG portraits, SVG, screenshots, and in-code procedural geometry do not count.

**Deliverable intact:** Extend the Kawanakajima game to make 3D models the central, reviewable subject: 10 Takeda + 10 Uesugi file-backed 3D samurai under `games/94-kawanakajima/assets/models/`, with textures/materials, ASSET_MANIFEST provenance, in-browser inspection/preview, and updated verification.

## Feedback to resolve (verbatim from kickoff + asset contract)
"Extend Edo PR #158 for Battles of Kawanakajima. The missing deliverable is actual 3D assets, not 2D images. Build 20 file-backed samurai models: 10 Takeda and 10 Uesugi. Output GLB/GLTF model files under games/94-kawanakajima/assets/models/ with texture/material assets and ASSET_MANIFEST.md provenance. Do not count JPG/PNG portraits, SVG, screenshots, or in-code procedural geometry as satisfying this. Update the preview so the models can be inspected in-browser, and include verification plus preview instructions in the PR."

Playtest/asset feedback from prior (lantern + kawanakajima 2D):
- Central heroes must be concrete file-backed assets (GLB/GLTF explicitly called out as acceptable form in operator contract).
- In-code procedural or 2D images alone do not satisfy generated_assets for this request.
- Treat prior 2D delivery as context, not the end state; 3D models replace or augment the visual subject.

## Acceptance (tied directly to brief + WORKFLOW + house style)
- 20 real .glb or .gltf files (10 takeda-*.glb, 10 uesugi-*.glb) committed under `games/94-kawanakajima/assets/models/`.
- Each model has associated texture/material assets (png/jpg or embedded) when materially needed for the figure.
- ASSET_MANIFEST.md (in this WO context) records exact filenames, generation/authoring method or source, vertex counts or LOD notes, texture refs, integration points, and browser verification evidence.
- The preview (`games/94-kawanakajima/index.html` or dedicated inspector) renders at least one model (and ideally the full set via selector) live in-browser using a 3D runtime so a reviewer can orbit/inspect without external tools.
- First-screen or primary view makes the 3D models the unmistakable central subject (not a secondary tab after 2D portraits).
- Real browser verification (chromium) succeeds: no pageerror, successful model + texture loads (no 404s), non-blank post-load capture showing 3D geometry (not fallback 2D), at least one post-interaction or inspected state.
- Interaction remains coherent with house philosophy: the "print" / "instant" feeling can be preserved by using stylized low-poly or print-shaded models, or by compositing rendered 3D views back into a paper/ink frame; the charged moment before gesture stays legible.
- `.factoryx/preview-entrypoint` continues to point at the updated entry so harness and reviewers resolve directly.
- Definition of done items from payload satisfied; review questions addressed in PR body.

## Slice definition for the technical design gate
This gate produces only planning artifacts (this strategy + TECHNICAL_SYSTEM_DESIGN.md + updated PREVIEW/VERIFICATION skeletons + ASSET_MANIFEST skeleton). No production code or asset file changes yet.

The design must specify:
- Filesystem layout under games/94-kawanakajima/assets/models/ and texture subdirs if used.
- How the main preview will surface 3D inspection (embedded viewer in the existing index.html, or a thin models-inspector.html with redirect note).
- Library choice and vendoring strategy for GLTF loading + render (three.js minimal + GLTFLoader vendored to satisfy offline/file:// + self-contained after load).
- Data flow: preload or on-demand fetch of .glb (relative paths), scene setup per clan, simple orbit controls or preset views that feel "print-like".
- Asset generation / authoring path: how the 20 GLBs will be produced (text-to-3D if exposed, manual authored via external then imported, or documented procedural export to GLB format with note that it does not count as satisfying "file-backed" unless real authored geometry is used).
- Verification updates: new harness steps for model decode, texture binding, basic render (clear color + at least silhouette visible), console guards for WebGL context loss or load errors.
- How house style (ink, paper, ma, restraint) will be honored when introducing 3D (e.g. toon/post-process to woodblock, limited palette, paper frame around the 3D viewport, no bright game UI).
- Risks and non-goals (see below).

## How the 3D subject becomes obvious without lecturing
- The first meaningful view after load should present one or more 3D samurai in a paper-framed "block" context, with clear affordance to rotate/inspect or switch figures (the 20 must be selectable or pageable without a separate "assets" screen).
- Clan camps or a "roster of blocks" can be represented by 3D busts or full figures on stands; selecting stages a confrontation using the actual 3D meshes (simple animation or pose switch for "the instant").
- Caption or margin ink remains poetic and integrated.

## Risk controls
- 3D runtime bloat or complexity: keep vendored three.js + loader under reasonable size; if too heavy, design a dedicated lightweight inspector page rather than replacing the entire 2D experience.
- No 3D generation pipeline: explicitly call out in design and manifest if models must be produced outside this runtime (e.g. via external Blender + export). Do not substitute procedural three.js Box/Sphere geometry or canvas-drawn stand-ins.
- WebGL availability in verification harness: use headless flags that support WebGL (or note software fallback limits); capture must show actual shaded geometry.
- House style clash: 3D realistic samurai would fight ukiyo-e. Design calls for deliberate stylization (flat shading, ink-line post, limited color) or 2.5D billboarded prints of the 3D models if full 3D render proves too divergent.
- Browser compatibility for GLTF: target modern evergreen; document any required extensions.

## Sequence (this gate only)
1. Read prior GOAL (kawanakajima 2D), PREVIEW, VERIFICATION, ASSET_MANIFEST, FEEDBACK, and this new kickoff payload.
2. Write GOAL_EXECUTION_STRATEGY.md (this file) capturing 3D-specific vision, feedback, acceptance, slice, risks.
3. Write TECHNICAL_SYSTEM_DESIGN.md with concrete filesystem, modules, data flow, libraries, asset plan, verification approach, non-goals.
4. Seed or update PREVIEW.md, VERIFICATION.md, WORKLOG.md, ASSET_MANIFEST.md skeletons under this WO dir.
5. Commit only the planning docs on the canonical branch (no game changes).
6. Do not open PR or ask for review from this gate.

Implementation (models/ dir + real GLB files + viewer wiring + verification) is the next autonomous step after this gate.

## What not to build in the eventual implementation (for reference in design)
- A full 3D battlefield or physics sim (keep to roster + staged "instant" like before).
- Bright PBR 3D game UI or modern game chrome.
- Replacing every working 2D paper/mist interaction with raw 3D unless it serves the new brief.
- External CDNs for three.js or model viewers (must work offline/file:// after initial open).
- 20 placeholder GLBs containing only cubes or untextured default shapes.

## Success for this gate
- TECHNICAL_SYSTEM_DESIGN.md exists, is specific, and can be handed to an implementation agent without ambiguity on layout, libs, verification, and how "file-backed 3D + in-browser inspect" will be proven.
- All durable notes stay under `.factoryx/work-orders/work-order-1781810487033-7-1/`.
- The 3D requirement is treated as the product intent; the prior 2D delivery is historical context.

Work Order: work-order-1781810487033-7-1
