# Technical System Design — Lantern Surf Courier (rework for asset foundry)

## Architecture (unchanged from prior verified base)
- Single self-contained `games/93-lantern-surf-courier/index.html` (~55-60kB source).
- 960x540 logical canvas (DPR scaled 1-2x), crisp-edges.
- Fixed-player side-view "scrolling sea run": worldOffset drives everything right-to-left; player fixed at PLAYER_X=158, Y driven by physics + wave sampler.
- Primary surface: layered deterministic waveY(wx, layer) using summed sines (cheap, no RNG in hot path, repeatable for verif).
- Entities (spawned ahead of view, culled behind): gates (thread targets), letters (pickups), crests (hazards), yokai (rare dash-only hazards), winds (passive lift zones), particles + scorePops (juice).
- Core loop: rAF -> update(dt) [physics, input consume, collisions x-pass, spawn, particles] -> draw (paper, waves ink+indigo volume, entities with draw* + image overlays, courier with transforms, HUD text in canvas, pops).
- Input: unified (kbd + pointer + touch). Jump: space/up/w/k or tap/click on canvas (buffered). Dash: x/down/j/shift or lower-left zone tap or double-tap (cooldown ~650ms, brief tuck + speed + invuln window).
- Collision: AABB-ish with tuned radii (letter d<32, yokai ~26 band, crest y-band, gate aperture x-pass + y-window). On thread/collect: addScore, sfx, pops, combo ramp. On crest/yokai hit while not dashing: endRun.
- Camera/framing: courier left-third, waves + gates fill most frame; vertical bob on courier + lean/tilt for feel; no camera code beyond offset.
- State export: window.__LANTERN_SURF_STATE = {score, letters, combo, running, crashed, surfDist, playerY, ...} for harness introspection.
- Boot mitigations (for .factoryx runtime check html inlining/eval): paperGrain declared+made immediately; eager render(0) after seed+listeners; lanternFirstGesture wrapper for any redecl; easy letter seed in resetRun for post-gesture collect in <1s vtime.

## Assets (the delta for this rework)
- **Foundry origin (new):** All 4 jpgs produced by calling the runtime's GenerateImage tool (the asset foundry) using prompts crafted per .system/imagegen/SKILL.md + FACTORY_CONTEXT house style.
  - Use case taxonomy: illustration-story + historical-scene (ukiyo-e).
  - Subjects: courier (hero silhouette with lantern pole, satchel, vermilion seal accents), letter (sealed hanko, folds, ink marks), lantern-gate (framed aperture, hanging form, paper/ink), yokai (theatrical ink-spirit, mask-like, restrained menace).
  - Style spec in every prompt: "ukiyo-e woodblock print, Edo period, strong decisive black ink silhouettes against atmospheric grounds, edges feather/bleed or eaten by mist, paper fiber/tooth visible in negative space and as subtle ground, restrained palette (warm off-white handmade paper #f8f4eb, deep #0f172a ink, faded vermilion #c2410f accents, deep indigo overprints only for volume), no bright digital color, no hard anti-aliased edges, no video-game glow/gradient/particle-vfx, ma (charged emptiness), single strong compositional gesture."
  - Output: jpg (opaque, matches prior contract for drop-in). Final chosen assets moved/copied under games/93-lantern-surf-courier/assets/*.jpg .
  - Fallbacks: if (!img.complete || img.naturalWidth===0) use prior pure-canvas procedural draw (silhouette + details) so first paint and feel never regress.
- **SFX:** 4-5 sparse file-backed WAVs under assets/sfx/ (whoosh, pop, thud, swhoosh, crash). Synthesized via small python script (numpy/scipy or wave stdlib + math) for "authored physical" character (attack/decay, noise+tonal, lowpass). Loaded as Audio on first gesture only. Always-backed by WebAudio osc/noise fallbacks (playTone/playNoise) so no missing sound ever blocks.
- **ASSET_MANIFEST.md (in WO context):** Records for each: filename, source=GenerateImage(<full prompt verbatim>), style/prompt notes, integration=drawImage + fallback, size after, verification evidence (used in chromium captures), "foundry used: yes (this rework)".

## Integration & graceful degradation
- In boot: new Image(), .src = 'assets/xxx.jpg' (relative; works file:// and under /factoryx/previews/...).
- In drawCourier/drawLetter/drawGate/drawYokai: if (img.complete && img.naturalWidth>0) { ctx.save(); ... transforms for pose/sway/scale; ctx.drawImage(...); ctx.restore(); } else { drawProceduralSilhouetteVersion(); }
- Same for Audio files in ensureAudio() (post-gesture).
- This satisfies "reviewable file-backed" + "no blank first screen" + "feel 100% preserved".

## Performance & payload
- Canvas only; <30 particles active; wave is 3-4 path fills + 2 stroke passes; 4 image draws max per frame (with cheap transforms).
- 60fps target on mid laptop: measured via internal fps avg (no DOM writes in loop).
- Total: html source ~58k + 4 jpg (aim for <400kB each after gen, compressed) + 5 wav (~50-150kB total) <2MB. If a gen is oversized, note and/or downscale post (pillow if needed) but keep purposeful for hero identity.
- No fetch, no remote, no webfonts in game.

## Controls & mobile
- Pointer/touch: canvas mousedown/touchstart -> jump; lower-left 28% width zone or double-tap (<280ms) -> dash.
- Kbd parity: space/w/up/k jump; x/j/down/shift dash; r/enter restart.
- Buttons: RESTART (top + overlay, >=44px), ♪ mute toggle.
- All targets large; no hover-only.

## States & juice (house + feel)
- Attract/idle: waves + lanterns sway, courier gentle bob, prompt visible; first gesture starts run.
- Run: speed ramps slowly; combo on recent actions; dash tucks + brief invuln + ink-burst particles.
- Thread gate: exact x-pass + y in aperture -> +36-46, sfxGate, big ink-ring pop + verticals, gate "open" telegraph.
- Collect letter: distance <32 -> +26, delivery arc juice (satchel seal burst + ink flecks), sfx, HUD letters++.
- Hit crest (not dashing): crash with X stamp + radial flecks drawn at exact world pos, large burst.
- Yokai: similar, avoid or dash-through for bonus.
- Crash: overlay with stats; full tap or R restarts (resetRun does ink burst + easy seed for harness).
- Easing: all vy integrated with grav, sin for bobs/sways, life-based alpha/scale for pops/particles, dash lean uses lerp.

## Verification hooks (non-visible to player)
- window.__LANTERN_SURF_STATE for post-interact state queries.
- Easy letter seed only on reset (disappears after 1-2s real time).
- Eager draw after boot + first listener attach.
- Named lanternFirstGesture() to avoid redecl in harness inlines.

## Differences from prior (this rework only)
- Asset production: explicit foundry + "better" prompts (more carving-like line weight variation, deeper blacks with controlled bleed, stronger courier as "one large gesture", yokai more mask-theatrical per Sharaku, lantern aperture more charged negative space).
- Comments + manifest updated to declare foundry usage (addresses the exact blocker note from prior review: "no foundry... recorded explicitly").
- No other mechanical or visual changes unless required to keep verif green or improve feel within house (small polish only).

Work Order: work-order-1781634384793-7-2
