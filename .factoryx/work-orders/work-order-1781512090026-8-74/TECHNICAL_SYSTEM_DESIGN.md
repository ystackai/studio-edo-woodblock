# Technical System Design: Lantern Surf Courier (Slice)

Work Order: work-order-1781512090026-8-74

## High-level architecture
- Single-file self-contained browser game: `games/93-lantern-surf-courier/index.html`
- Pure HTML5 Canvas 2D (no frameworks, no external loads after initial).
- Game loop: requestAnimationFrame + fixed timestep accumulator for stability.
- All state in JS: world entities as simple objects/arrays (no classes if not needed for slice).
- Zero network after load. All assets procedural (waves, paper grain, character, particles, lanterns).
- Responsive: logical game size 960x540 (16:9-ish arcade feel). Canvas sized via CSS to fit viewport while preserving aspect (letterbox or scale-down on small). Touch/pointer lock to canvas rect.

## Core loop & timing
- `cameraX` or `worldOffset`: increases steadily at `baseSpeed` (px/s logical). Ramp: every 60s real time or every N world units, `baseSpeed *= 1.12` (tunable), spawn rate up.
- Fixed player screen X (e.g. 220). Player world X computed as offset + screenX for collisions.
- Delta time, ease functions (lerp, easeOutQuad, easeInOutSine) for all motion.
- On crash or manual restart: reset spawns, score, offset, player state; keep session high score.

## Player (the Courier)
- Large: target visual height 110-130 logical px (clear even on mobile).
- State: `x` (fixed), `y`, `vy`, `onGround`, `dashTimer` (for later), `crouch` (for later).
- Visual: composed of canvas paths on each draw:
  - Wave board or direct foot contact (small plank or bare feet on crest).
  - Legs in dynamic crouch based on vy/ground.
  - Torso + flowing robes (2-3 layered strokes for fabric).
  - Head with wrapped courier cap or wide hat (strong silhouette).
  - Strapped letter satchel on back (rect + flap + string lines; this makes "courier" and "deliver" readable instantly).
  - One arm forward with balance pole or guiding hand.
  - All primary forms black/dark indigo fill + slightly thicker ink stroke. Subtle highlight on edges for "wet ink" read.
- Motion: constant subtle head/robe bob (sin(time * freq) * amp). Jump: override vy, play arc. Land: damp vy, snap or spring to wave surface.
- Surf feel: when onGround, y = sampleWaveSurface(worldX) + rideOffset (small). Small forward lean tilt.

## Wave / geometry system (the "track")
- Wave surface is a continuous function: `waveY(worldX, layer=0)` using sum of sines with different freq/amp/phase + slow scroll offset.
- Multiple parallax layers (bg far slow, mid, near fast) drawn as thick stroked paths or filled regions below.
- Near layer has occasional "crest" markers (higher local amp or explicit hazard points).
- "Surf slopes": the varying y of near wave provides the geometry. Player "rides" it when grounded.
- Visual: ink-weight strokes (ctx.lineWidth 2-4 + lighter inner for volume), foam suggestion as short white/cream dashes on peaks only, very restrained.
- Paper ground: full-rect fill with subtle grain (offscreen canvas of small random dots + short fiber lines at low alpha, drawn once, then drawImage scaled).

## Lantern gates (primary collectible / threading target)
- Spawn ahead at intervals (base 420px, variance, denser over time).
- Each gate: worldX, baseY (on or above wave), height (opening size ~90-120px), swayPhase.
- Visual: two vertical-ish lantern forms (paper + frame) with bright core + soft glow (multiple radial or shadow for bloom). Warm vermilion fill + gold rim + thin ink lines. Connecting "thread" or torii-like lintel optional for readability.
- Thread success: when player worldX passes gateX, if player.y is inside [gateY - h/2, gateY + h/2] → +100 pts, combo++, juicy pop (particles + flash ring + score float).
- Miss: if gate passed with y out of band → combo reset, small penalty or just no points (keeps run alive for slice; later can be "near miss" hazard).
- Sway: gentle sin for life.

## Sealed letters (pickups)
- Spawn occasionally (every 2-3 gates or random).
- World pos (x, y floating above wave or in path).
- Visual: small folded paper rectangle, string seal (vermilion dot), ink address marks. Slight flutter (rotation or y bob).
- Collect: AABB overlap with player rect/hitbox (generous for feel). +25 pts, combo++, collect pop (2-4 paper flecks + soft tone).
- "Deliver": the count is "letters delivered". Thematic: each collected is one more the courier successfully carries forward.

## Hazards (wave crests / yokai precursors)
- For slice: "crashing crest" entities at worldX with tall peak height.
- If player onGround (or y too low relative to crest) when passing → crash.
- Crash: set crashed state, freeze or damp speed, show "CRASHED — X letters delivered", big restart affordance, ink-burst particles.
- Visual: sharp rising wave form with dark foam, slightly different ink weight. Optional low red flash on hit.

## Spawning & difficulty
- Simple distance or time based spawner. Keep a queue of upcoming obstacles (gates, letters, crests).
- No fancy pools for slice. Arrays cleared on restart.
- Ramp: on interval, increase speed, decrease min spawn gap, add slight y-variance or moving gates (for interest).

## Input (responsive, multi-modal)
- Keyboard: Space / ArrowUp / W / K → jump (buffer 120ms). Shift / X / ArrowDown for dash (later).
- Pointer: mousedown/touchstart on canvas anywhere (except explicit UI zones) → jump. Large hit area.
- Touch: same + swipe up for jump, hold or double for dash intent.
- Restart: dedicated large canvas button zone (bottom right, >=44px logical) or DOM <button> overlaid with 44px+ padding, clear label.
- Sound toggle: top-right icon button, starts OFF (or "sound" label). First gesture enables context. Clicks/taps do not auto-play audio.
- All inputs produce immediate feedback (<100ms): visual pop on player, or at least state change this frame.

## Camera, framing, UI
- Player leads: fixed screen x leaves ~200px "look ahead" for reacting to upcoming gates/hazards.
- HUD (drawn in canvas or light DOM overlay):
  - Top-left: score (large), "letters" count.
  - Top-center or right: combo "xN" (decays if no action in 4s).
  - Bottom or corner: distance or "time surfing" mm:ss, speed indicator (subtle).
  - On crash: centered modal-ish text + RESTART button.
- Title/branding subtle at very start or paused: "Lantern Surf Courier" in blocky or calligraphic weight (canvas fillText with tracking).
- No tutorial text after first 3s. The large character + moving waves + first gate telegraph the verb.

## Collision & hitboxes (forgiving for arcade feel)
- Player: AABB or small circle + vertical tolerance for "thread".
- Gates: vertical interval test on x-pass (forgiving in x by a few px).
- Letters: circle or rect overlap.
- Crests: when x-pass, compare player y vs crest peak y - tolerance. OnGround makes it stricter.
- Easing/feedback on every contact.

## Particles & juice (within house limits)
- Lantern thread: 6-10 warm sparks/glow orbs that fade + drift up or outward. Short life.
- Letter collect: 3-5 small cream paper squares that spin/fall 200ms.
- Land splash: 2-4 short horizontal dashes at contact y.
- Crash: 12-20 ink droplets + one expanding dark ring.
- All use simple arrays of {x,y,vx,vy,life,alpha,color}. Draw as arcs or rects. No physics lib.
- Limit total particles ~60. Use globalAlpha + no shadow for perf.

## Audio (sparse, gesture-gated)
- Web Audio API context created on first user gesture (start or first jump).
- Sounds (all synthetic, short):
  - Jump whoosh: quick low-pass noise + sine sweep down.
  - Gate thread: bright short chime (triangle + decay, slight pitch up per combo).
  - Letter: soft paper rustle (noise burst filtered).
  - Crash: dull wooden crack + low thud (two osc + noise).
  - No loops, no music. Volume low. Mute button mutes oscillator gains.
- Respect: audio only after gesture. Default silent until user taps "sound" or first action.

## Performance & size targets
- Target 60fps on mid 2023+ laptop (Chrome/Firefox). Profile with simple FPS counter (hidden or toggle).
- Canvas size: draw at logical 960x540, CSS scale for devicePixelRatio (crisp).
- Avoid: per-frame heavy alloc, shadow on 100s of items, globalComposite every frame, text every frame if measurable cost.
- File: keep <100kB gzipped ideal. Inline styles, no base64 images.

## State machine (minimal)
- `loading` (brief) → `ready` (title + big courier visible, waves gentle) → `running` (on start gesture) → `crashed` (or `ended`) → restart back to running.
- In ready: still allow jump preview (character hops in place) to demonstrate verb instantly.
- Global: `score`, `letters`, `combo`, `maxCombo`, `startTime`, `crashed`, `highScore` (session).

## Known risks / open
- Wave sampling must be deterministic and cheap for collision (pure math func, no image data).
- Gate threading "feel" must be tuned live: opening size, approach speed, player height response, visual telegraph (lanterns brighten or "open" 1s before).
- Character readability on small screens: test 360-400px widths; may need to scale player draw separate from world scale.
- Mobile touch: prevent scroll/zoom on canvas, passive listeners where possible.
- House vs juicy: particles and glows kept minimal and "ink or pollen or lantern ash" in character.

## Verification hooks
- Expose (for harness): `window.__LANTERN_GAME_STATE` with last score, letters, crashed, playerY, time.
- Log nothing noisy to console in normal path.
- Catch and surface uncaught in a visible banner only if debug (off by default).

See WORKLOG.md for day-by-day, VERIFICATION.md for checklist execution.
