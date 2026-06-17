# Technical System Design — work-order-1781665294730-followup

**Artifact:** drops/indigo-stutter/index.html (self-contained single-file "living print" + local assets/ tree)
**Constraints from WORKFLOW + payload:** browser-game-2d, <2MB total, real browser verif (chromium), gesture-only audio (no autoplay), responsive controls (kbd + pointer + touch), 60fps mid-laptop, no external net after load, direct preview root (the html itself), one-verb slice, real file-backed generated assets + manifest/provenance for material changes.

## High-level architecture (kept deliberately tiny and focused)
- Single HTML + inline <style> + <script>. No external CSS/JS/fonts after load for the artifact (title + minimal body only).
- One <canvas id="print"> sized to a stable internal resolution (e.g. 960x620 logical, scaled via CSS to fit viewport while preserving aspect; DPR compensated for crisp ink lines). Canvas is the entire interactive surface.
- Assets: drops/indigo-stutter/assets/ (relative) containing 1-2 small generated PNGs (ukiyo-e base motif layer + optional reveal/detail layer). Loaded once at start with fallback to pure procedural draw if image fails (ensures first paint always works). ASSET_MANIFEST.md at assets/ root with entries + provenance.
- Animation loop: requestAnimationFrame + fixed timestep accumulator for stable sim + cheap draw every frame. No heavy per-frame work.
- Input: pointer events (pointermove/pointerdown/pointerup + touch equivalents mapped) on canvas + document-level for safety; keyboard (space/enter for "press/hold", r for re-ink/reset, m/? for mute toggle). Pointer lock not used; soft cursor drawn inside canvas when active.
- State machine / model: 'idle' (subtle-moderate live stutter visible on key forms, no sound), 'awakening' (first gesture starts AudioContext + initial rhythm), 'tracing' (active pressure applied to zones under contact), 'resolving' (sustained attention pays off, reveal increases), 'breathing' (after release, slow return of jitter + gaps). Global "stillness" accumulator (0-1) drives audio and reveal.
- All visuals authored as ink procedures (paper grain, mist layers, primary paths with jitter, pressure ring, reveal overlay) + optional composited generated PNG base layer. This is the "generated asset" style proof: the skill produces the base print; the live system lets the player finish it.
- No fetch, no remote resources in the game path.

## Visual layers (back to front, all on canvas; cheap)
1. Paper ground: warm #f4f0e6 fill + subtle fiber (small random low-alpha dots or short strokes seeded once; redrawn cheap or cached as pattern if needed).
2. Generated base motif (if asset loads): the ukiyo-e ink layer (horizon + mist + silhouette) drawn first at low-mid alpha or as base "print". Provides the authored "skill output" look. Falls back to equivalent procedural paths if image missing.
3. Atmosphere/mist: 2-3 large soft radial or layered low-alpha indigo/gray washes (ctx.globalAlpha 0.08-0.18) that slowly drift via sin(phase) offsets — creates the "looking into weather". One layer can be masked or alpha-modulated by local reveal progress.
4. Primary ink forms (the stutter subject — the heart of the interaction):
   - A horizon or wave crest line (multiple stroked segments or a Path2D with slight random phase jitter when stuttering).
   - One strong silhouette motif (boat/pine/figure) — clean decisive silhouette, edges feathered by drawing multiple offset passes at low alpha + slight bleed.
   - "Living" zones: the segments/sub-paths or logical areas that carry the stutter jitter. These are the only (or primary) areas that respond to pressure. Defined as array of {points: [{x,y}], baseJitter, currentJitter, phase}.
5. Pressure/trace feedback: soft expanding ring (low alpha indigo or faint vermilion tint, 1-2px stroke or fill) centered on contact point, damped easing (radius goes 8->28->8); local line stabilization (currentJitter lerped toward 0 under contact, with distance falloff for nearby).
6. Reveal layer: a second "under-ink" or reflection or distant form (e.g. a fainter boat wake, a bird, or just deeper settled ink lines) that increases opacity only in regions that have received sustained contact (per-zone progress or globalStillness * mask). Can be a second generated asset layer or pure draw.
7. Final seal / brush memory (optional, earned): a small decisive mark (e.g. a tiny vermilion chop or single brush flick) that appears only after a full resolve cycle (stillness > 0.7 for 2s); fades slowly on release or reset.
8. Cursor/brush: when pointer is over canvas and in tracing/awakening, hide real OS cursor (canvas.style.cursor = 'none'), draw a soft circle or short bristle fan / baren stamp (low alpha fill + 1px stroke) at the logical position. Large effective target (active zones have generous logical radius 40-70px).

All motion eased: jitter uses damped lerp (current = current * 0.85 + target * 0.15 or similar spring), ring radius easeOutCubic or sin, mist phase continuous, reveal alpha lerp, tone freq/gain ramps. No linear teleports.

## "Stutter" model (the thing the player quiets — core of feedback resolution)
- Each living ink segment/zone has:
  - basePoints: fixed array of {x, y} (or parametric curve samples)
  - baseJitterAmp: e.g. 2.5-4.5 (high enough on idle that tremble is the first thing you notice)
  - currentJitterAmp: lerps toward target (0 when pressed near, base when idle)
  - phase: for per-frame sin offset
  - lastContact: timestamp or accumulator for reveal
- In update (fixed step): for each zone, compute targetJitter = isPressedNear(zone) ? 0 : baseJitterAmp; currentJitterAmp = lerp(current, target, 0.12) or spring. phase += speed.
- Draw: for the path, offset each sample point by (currentJitterAmp * sin(phase + i*0.7 + y*0.01)) in x and/or y for organic tremble. Use multiple low-alpha passes for feathering.
- Global stillness = 1 - (average normalized currentJitter across zones). Can be time-smoothed. Drives audio gap probability, tone gain, reveal alpha, and any final seal.
- Idle animation: even with no input, phase advances and a very slow "breathing" (baseJitterAmp * (0.7 + 0.3*sin(slowPhase))) keeps it alive on first screen.

## Audio (WebAudio, created on first gesture only, sparse, physical, user-controlled)
- Context + masterGain created on first pointer/keydown/touch over canvas. masterGain.gain ramps from 0 to quiet level (0.6-0.8).
- "Stutter source": scheduled soft "water drop" or filtered noise bursts with irregular gaps. Use a scheduler (setTimeout chain or AudioContext currentTime based) with gapMs = 180 + random(0,220) when low stillness; gap shrinks toward 40-80 as stillness rises. Short decay (0.08-0.18s), lowpass ~900Hz, low volume. Represents the broken/hesitant rhythm.
- "Resolve tone": 1-2 quiet oscillators (sine or triangle, e.g. 196Hz + 294Hz or a gentle minor third). When stillness > ~0.35, gaps close and/or a slow LFO or lowpass opens so the tone "sings" continuously while contact is held. On release, gaps reopen gradually over 1.5-2s, tone gain or filter closes. This makes the resolution audible consequence of the verb.
- Friction micro-grain (optional, nice-to-have): very short (0.03s) filtered noise on pointer move while pressure active (like baren on paper) — low gain 0.15, sparse, only if move delta > threshold. Physical not melodic.
- Mute: a tiny ♪ / speaker icon (large 44px tap target, bottom-right or corner) toggles masterGain.gain to 0 or restored. Does not stop context or create sound on its own. State persisted in a var.
- No music loop file unless a short generated wav asset is added; the "melody" here is the behavior (broken -> resolved under attention). This exercises the skill's melody half through player action.
- All sound stops or fades gracefully on reset/re-ink.

## Input & feel (responsive, parity, <100ms)
- Pointer: pointerdown/move/up (or mousedown etc fallback) on canvas. Touchstart/move/end mapped to same (preventDefault to avoid scroll). "Pressure active" = isDown && (current logical point is within generous radius of any living zone or always-apply with distance-weighted falloff for simplicity and large targets).
- Keyboard parity: while pointer is over canvas, Space or Enter acts as sustained "press" (good for desktop without drag fatigue; sets a virtual isKeyPressing flag that contributes to pressure). R key anywhere triggers re-ink/reset (full jitter restore, reveal zero, audio gaps reopen). M or / or ? toggles mute.
- Touch targets: the canvas itself (fills most of viewport) is the verb surface; active ink zones sized generously (thick strokes + 50px+ logical hit radius). Bottom or corner controls (re-ink pill, mute) are 44px+ with padding and high contrast for thumb.
- Latency: state change (jitter target, isPressing) on the input event itself; render uses current jitter immediately next frame; audio scheduler reads current stillness same or next tick. Pressure ring drawn at pointer pos in same frame.
- Cursor trail or pressure ring gives visible <100ms feedback. No double-tap zoom issues (viewport meta).

## Performance & payload (<2MB, 60fps)
- Draw budget: < 150-250 path ops / few thousand points total per frame. Use ctx.beginPath + lineTo loops or Path2D (cached where stable). Grain at low density (e.g. 1 dot per 12px) or pre-cached offscreen pattern. Mist 3-4 rect/radial only.
- 60fps target: RAF + accumulator; if frame time >14ms (measure via performance.now marks), simplify (fewer mist layers, lower grain density, fewer jitter samples, skip optional friction).
- Memory: one canvas, tiny JS state (~few KB), 1-2 <150kB PNGs. Html source ~25-45kB gzipped.
- <2MB: enforced; any generated assets small and purposeful (ukiyo-e ink on paper, compressed). Fallbacks ensure no broken first paint.
- No external network: all <img src="assets/xxx.png"> are relative; audio is pure WebAudio; fonts system or none (monospace for any tiny caption).

## State & reset (replayable slice)
- resetPrint(): re-seed all zone phases and currentJitter to base, zero all reveal progress accumulators, restore full stutter, clear any final seal, reset caption timer. Audio gaps reopen if context exists.
- On load or 'r' key: resetPrint() + enter idle (RAF loop ensures first screen is already alive with visible tremble).
- Expose for verif harness: window.__INDIGO_STUTTER_STATE = { still: globalStillness, resolved: revealProgress or zoneCountWithReveal, audioActive: !!audioContext, captionVisible: !!captionEl && !captionEl.classList.contains('fade') } or equivalent simple object. Updated each frame or on change.
- A "re-ink" button (large, paper-colored pill with ink text "re-ink") calls resetPrint(). Positioned outside or in margin of canvas so it doesn't fight the print.

## Preview & verification hooks
- The file drops/indigo-stutter/index.html is the direct preview entrypoint. Open it; it must render the living print immediately.
- For chromium harness: load via file://, wait for first paint + 800-1200ms idle RAF so stutter cycles, capture "ready" (stutter visible, no user gesture yet, paper/mist/forms clear).
- Then simulate gesture: either (a) use puppeteer if available for mousedown+move+hold, or (b) for pure cli: temporarily expose an auto-gesture mode behind a flag (e.g. ?auto=1) that applies 2s virtual pressure to a known active zone after load, or (c) run with real interaction if display available and note it. Capture "post" showing jitter diff + reveal >0 + state hook.
- Guard against: pageerror during load/run, console.error (fatal paths), request failures (none), blank/white/low-contrast capture (stutter must read), audio created before gesture.
- After capture, revert any temp harness flags; evidence goes in screenshots/ + this VERIFICATION.md.

## Asset integration notes (for skill proof + contract v2)
- Generated assets (via GenerateImage or authored): e.g. "base-ink-motif.png" (the horizon + boat + mist as a static ukiyo-e "print" layer from the skill) and optionally "reveal-detail.png" (a subtle under-layer that appears with attention). Place in drops/indigo-stutter/assets/ (or assets/generated/).
- In code: load the PNG(s) once, drawImage at appropriate scale/alpha under the live jitter ink and over paper/mist. If load fails or slow, skip or draw equivalent procedural paths (ensures playable even without assets).
- ASSET_MANIFEST.md: list each file, short description/prompt used, role ("base motif layer under live stutter ink"), size, date, provenance ("generated for indigo-stutter rework via asset-gen skill smoke; part of proof pack").
- This satisfies "real file-backed ... plus manifest/provenance" when asset changes are material. The live system (jitter + reveal + pressure) is the interaction proof around the generated art.
- Audio: if a short wav is added (e.g. a resolved "hum" sample), treat same way; otherwise the WebAudio resolution behavior stands as the melody half exercised by the player.

## File surface (keep minimal and focused)
- Primary edit: drops/indigo-stutter/index.html (full replacement of the passive linear version with the interactive taste-gate slice; keep file size reasonable).
- New: drops/indigo-stutter/assets/ (generated pngs + ASSET_MANIFEST.md)
- New/updated: .factoryx/work-orders/work-order-1781665294730-followup/* (all notes + screenshots/*.png from verif runs)
- Optional minimal: if a small generated wav is added for audio proof, same assets/ treatment.
- Never: edit root index.html, drops/index.html, studio.json, games/, blog/, or other drops for this WO. No drive-by.

## Known non-goals for this WO (per taste-gate + "address feedback before unrelated polish")
- Multiple prints or "levels" or gallery
- Persistent state / localStorage / replay history
- High-score, delivery mechanics, or achievements
- External asset pipeline UI or "foundry" controls
- Changes to studio homepage, drops catalog page, or other games/drops
- Broad settings, volume slider beyond mute, color themes
- Any save/load, inventory, or progression systems

All of the above would be scope creep past the taste gate and the "rework the existing deliverable" instruction. If the slice is not interesting after honest play, pivot the verb/telegraph within this file, do not expand.

Work Order: work-order-1781665294730-followup
Branch: factoryx/factory-edo-woodblock/work-order-1781665294730-followup
