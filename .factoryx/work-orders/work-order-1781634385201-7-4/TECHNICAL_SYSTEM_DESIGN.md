# Technical System Design — work-order-1781634385201-7-4

**Artifact:** games/inkblade/index.html (self-contained single-file playable slice)
**Constraints from WORKFLOW + payload + house style:** browser-game-2d, taste-gate one-verb 30-60s slice, <2MB total, real browser verif (chromium + pageerror/console/request + in-game state), gesture-only audio, responsive controls (kbd + pointer + touch, ≥44px targets), 60fps on mid laptop, no external net after load, direct preview root (games/inkblade/index.html), one strong compositional gesture, ink/paper/mist/silhouette/restraint/mono no aware.

## High-level architecture (kept deliberately tiny)
- Single HTML + inline <style> + <script>. No external CSS/JS after load.
- One <canvas id="print"> at stable internal resolution (960x600 logical). CSS scales to fit viewport preserving aspect (max-width/height 100%, object-fit none, image-rendering crisp). DPR compensated so ink stays sharp on high-DPI without extra cost.
- Animation loop: requestAnimationFrame + fixed-timestep accumulator (dt ~16ms) for stable sim independent of frame rate.
- Input: pointer events (pointerdown/move/up, with setPointerCapture for reliable drag; touch equivalents auto-mapped) + keyboard (Space/Enter for sustained "press", Arrow keys or WASD for gentle nudge of traveler once path is open, R to reset the print). All inputs produce <100ms visible/audible feedback.
- State: focused on the print's "openness" (0..1). Sub-states for feel only (idle, carving, resolving, breathing). No full game state machine with 6 phases.
- All visuals authored in code as ink procedures (paper fiber, mist layers, road strokes, gate/ward form with jitter, traveler silhouette, feathered lifts). This is the "generated asset" — the procedures are the authored ukiyo-e that a Flux-style skill could have produced as layers.
- Audio: WebAudio created on first user gesture only. All sounds synthesized (osc + noise + filters + short envelopes) to be sparse and physical: brush scrape grains on carve, low woody tone that "opens" (filter opens, gaps close) with progress. No wav files unless a small generated one is embedded later.

## Visual layers (back to front, all on canvas, cheap draws for 60fps)
1. Paper ground: #f8f4eb fill + subtle fiber (small random dots or low-freq noise field drawn once or every few frames at very low density; slight tooth via micro offset strokes).
2. Atmosphere/mist: 3-4 large soft radial/gradient indigo-gray washes (#0A0F3C at 0.06-0.12 alpha) that slowly drift on sin(phase) in x/y. Creates "looking into weather". One layer thins locally when road opens.
3. Distant mountains / horizon ink: very faint multiple offset strokes, feathered by 2-3 low-alpha passes.
4. Road: series of diminishing-width ink strokes (dark #0f172a with slight warm bleed) receding; cross-hatching for texture in near field; the "open" continuation is drawn with lower alpha or lighter until progress reveals full strength.
5. Blocking ward/gate form (the living element):
   - Strong silhouette cross-bar or shimenawa + ofuda (rectangle with ink characters or simple knot).
   - Each segment has base points + current jitterAmp + targetJitter.
   - When idle: jitterAmp ~ 1.2-2.0 px organic tremble on control points (sin per segment + global phase).
   - "Thirsty" treatment: the ward strokes are drawn with slightly lighter base + micro fiber so they read as "not yet dry" vs settled paper.
   - On carve contact: targetJitter lerps to 0, local thickness reduces, short feathered "lift" strokes are emitted at contact point (restrained, 3-5 short curves, alpha decay, no game particles).
6. Reveal / opened road: as global progress (average resistance drained) rises, a lighter path ink or stepping stones or parted gate leaves fade in with easing. Mist opacity in the center band lerps down.
7. Traveler (small robed figure silhouette): at near road position when progress=0; as progress increases it advances a short distance along road with eased walk cycle (subtle leg swing). Drawn with decisive single-weight strokes + hat brim, no face detail. When path fully open, user can "lead" it the last 80-100px with pointer or keys (limited so it doesn't become a full walker sim).
8. Blade/brush cursor: hidden real cursor when over canvas. When pointer is over the active ward zone (generous 50px radius around the form), draw a short slanted blade (2-3px #0f172a line with small guard) or a chisel/brush fan. On contact draw an additional soft pressure ellipse (low alpha vermilion or indigo tint, eases out). Large effective target area.
9. Margin caption (optional, post first progress): 9pt ink text in lower right margin, appears eased, holds 4-6s, fades. Uses a simple font stack that reads as print (system serif or "Noto Serif JP" fallback if present; otherwise sans is acceptable for code size).

All motion uses easing (easeOutCubic, damped lerp, sin for idle phases). No linear teleports. Jitter returns on release with a slow "exhale" rate.

## "Resistance" / opening model (the thing the player carves)
- The ward is modeled as N segments (e.g. 5-7), each with:
  - resistance[i] : 1.0 down to 0.0 (drains on contact proximity + time)
  - jitterBase, currentJitter
- On each frame while carving (pointer down and near a segment): drain rate 0.8-1.2 /s scaled by how centered the contact is; jitter target = resistance * base.
- Global progress = 1 - avg(resistance). At progress > 0.35 the road "begins to open" (continuation visible). At >0.85 the ward is considered parted (leaves separate visually, final tone event).
- On pointer up or away: resistance slowly creeps back up (0.15 /s) for the "it breathes closed again" feeling. Progress never goes below 0 after first full cycle in a play session (or does, for purity).
- The traveler advance distance = progress * maxAdvance.

## Audio (WebAudio, first-gesture only, sparse/physical)
- Context + master gain created on first pointer/keydown over surface. Gain starts at 0, ramps to low master (0.25-0.4).
- Carve grain: short filtered noise burst (highpass 800Hz, lowpass 2400Hz, 20-40ms decay) triggered on move while down, rate-limited (every 60-90ms) and volume scaled by speed/drain. Sounds like stiff brush or carving tool on sized paper.
- Resolve tone: low sine or triangle (e.g. 110Hz or 146Hz) + light harmonic. While contact active and progress rising, the tone's gain rises and a lowpass opens (or a slow AM LFO quiets); gaps in a scheduled "creak" scheduler close. On release the tone decays and the scheduler re-introduces hesitation.
- Open event (when crossing 0.85 threshold first time in cycle): one soft woody strike (sine 180Hz short + noise transient for "wood") + a paper-lift whoosh (very low filtered noise 150ms). Never repeats in same cycle.
- No melody, no constant ambient, no bright tones. Volume very low; the point is the change, not the sound itself.
- Optional tiny mute control (bottom-right, 44px+ hit area, ink circle with slash): toggles master gain without destroying context. Label is a small "音" or "♪" in ink.

## Input & feel (parity, large targets, responsive)
- Pointer: pointerdown on canvas starts "carving" if over ward (or always within generous zone); pointermove while down applies carve at current point. pointerup ends. Touch maps 1:1.
- Keyboard: while over canvas, Space or Enter acts as sustained "hold press" (good for accessibility / no-drag fatigue). ArrowLeft/Right or A/D once open: nudges traveler position ± (clamped). R anywhere resets the whole print to full resistance + idle stutter.
- Cursor feedback <100ms: the blade appears the instant pointer enters the ward zone; pressure ring + local thinning on first move frame.
- Touch targets: the active ward zone is thick (the bar is 18-24px visual, hit radius 40px+); bottom controls 44px minimum with padding. No tiny elements.
- Latency: input event immediately sets targetJitter and drain accumulator; render and audio params update in the same or next frame.
- Easing on all: traveler pos, mist alpha, ward separation, caption opacity, tone gain.

## Performance & payload
- Draw budget: <150 path ops / frame. Use ctx.save/restore sparingly; cache static paper + road base as offscreen canvas or just redraw cheap elements every frame (they are simple strokes).
- 60fps: measure frame time; if hot, reduce mist layers or fiber density or use Path2D for ward.
- Memory: one canvas + one offscreen if used, tiny JS arrays for segments/resistance. No images loaded unless we embed a small generated one.
- <2MB: the HTML will be ~35-60kB source (gz ~12kB). Any embedded image data URL kept under 150kB and only if it materially improves the "generated assets" story without fighting the live ink.
- Works file:// : no fetch, no CORS, audio unlocked by gesture.

## State & reset
- resetPrint(): resistances = [1,1,...], progress=0, traveler at start, jitter phases reseeded, caption hidden, audio scheduler reset.
- On load or R: reset + enter idle (animation running, first screen alive with subtle ward tremble + breathing mist).
- Expose for verif harness: window.__INKBLADE_SLICE = { progress, isCarving, opened, audioActive } or similar.

## Preview & verification hooks
- The file itself is the direct preview: open games/inkblade/index.html (modern browser; file:// valid).
- For chromium harness: load file, wait for RAF + idle animation, capture "ready" (ward visibly stuttering, no gesture yet, full composition legible, paper tone clear).
- Then synthetic or scripted gesture: mousedown + slow drag/hold over the ward zone for virtual 2-3s (or real if harness supports), wait for progress >0.7, capture "opened" (ward parted, road continuation strong, traveler advanced, mist thinner in center).
- Guard against: pageerror, console.error during load or 10s run, any network request (should be zero after html), blank or low-contrast captures, traveler or opening not visible in post shot.
- Also run the autoreview skill harness if it exercises the runtime (it does per prior WOs).

## Asset integration notes (for "with generated assets")
- In this slice the generated art is the authored ink procedures + paper + mist treatment. These are exactly the kind of output the asset skill (Flux ukiyo-e prompts, sumi-e post) would supply as base layers; here they are live so the player can carve them.
- If a real generated file strengthens the proof: call GenerateImage with a precise "ukiyo-e woodblock print, limited palette black deep indigo warm paper, receding mountain road blocked by a simple gate with ofuda seal, strong silhouette, feathered edges, mist, Hiroshige style, 960x600" and composite the result under the jitter ink (with fallback). Record in this WO's notes + any manifest.
- Audio "generated" is the shaped behavior; a future MMAudio/HeartMuLa skill could supply base grains or wood samples that we trigger instead of pure osc/noise.

## File surface (strict minimal)
- Primary: games/inkblade/index.html (full replacement/improvement; self-contained)
- New/updated: .factoryx/work-orders/work-order-1781634385201-7-4/* (notes + screenshots/*.png from verif runs)
- Non-goals (do not touch unless the WO payload explicitly required homepage work): index.html, drops/index.html, games/index.html (leave the redirect as-is), studio.json, public/, other drops, blog, team.
- If a tiny games/inkblade/index.html redirect is needed for path niceness in preview trees, it can be added as a 3-line file, but prefer the direct html as root.

## Known non-goals for this WO
- Restoring the old multi-state duel/approach/win chrome or health or timing bar.
- Adding levels, multiple wards, procgen road, achievements.
- Mutating catalog or homepage to "feature" this preview.
- External asset pipeline or manifest changes beyond what serves the single slice.
- Any bright color, hard edges, video-game particle, constant sound, or non-house visual language.

All changes serve the taste gate + house style + direct address of "art and music terrible".

Work Order: work-order-1781634385201-7-4
