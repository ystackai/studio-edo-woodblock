# Edo Inkblade: Road to Ganryu — WORKLOG

## Artifact
`drops/edo-inkblade-ots/index.html` — over-the-shoulder Edo art-and-duel game (864 lines)

## Completed Passes

### Pass 11 — Paint depth wiring
- `paintPressTime` variable tracks paint press start
- Space keydown records press time; keyup computes hold duration → `player.paintHoldTime`
- Mouse right-click: mousedown records, mouseup computes hold
- Touch long-press (>500ms): touchend computes hold into paintHoldTime
- `paint()` uses `holdBonus = min(3, paintHoldTime/15)` — brush size varies by hold duration
- Ink check before paint prevents zero-ink paint with hold

### Pass 12 — Zone-triggered audio
- Temple bell at bridge zone (z=460-580): `bellRung` flag prevents re-trigger
- Bell uses 3-note chord (220→330→440 Hz, sine, harmonically spaced)
- Ambient bird chirps in shrine zone (z=120-350): random high-frequency sine pings
- Wind gain smoothly drifts with player.z via sin wave

### Pass 13 — Combat depth
- Duelist second attack pattern: after hit sets `attackCount=2/3` → follow-up thrust at lower wind threshold
- Block timing parry: `parryWindow` when wind 45-65 AND blocking → parry gives resolve+3, `parryBonus=3`
- Parry bonus feeds into damage calculation

### Pass 14 — Weather & scenery depth
- Fog layer (`drawFog`) with density scaling by z (200→800 range, two-phase fade)
- Drizzle particles (`drawDrizzle`) active between z=300-700, fade-in/out, rendered after river mist
- `drizzleActive` state variable for particle spawn/alpha
- 3 new scenery kinds: `lanternRow` (stone lantern row with warm glow), `crypt` (mossy tomb with inscription and blossoms), `willow` (weeping willow with cascading branches)
- `drawScenery` now handles all 22 kinds including the 3 new ones
- Fog/drizzle/mist rendering order in draw call: fog → mist → lanterns → leaves → fireflies → river mist → drizzle

### Pass 10 — Ganryu arrival ceremony
- `drawGanryu(w,hor)` function rendering layered water waves with sine-based shimmer, island silhouette, pier
- Victory ceremony: 120 particles, 8 colors, character-specific haiku

### Pass 9 — Mobile UX overhaul
- Touch gesture system: drag zones, long-press paint, tap slash, touchcancel reset
- Touch zone UI buttons auto-appear on `ontouchstart` detection

### Pass 8 — Richer drawScenery
- Replaced simple scenery with detailed renders: bamboo grove, rice paddy, temple gate, ancient tree, stone wall, waterfall

### Passes 5-7 — Audio, victory screen, combat feel
- Ambient audio (wind, footsteps, river), victory stats screen, HUD bars, enemy AI types, combat SFX

### Passes 1-4 — Scenery, stats summary, enemy AI, milestone popup
- Road scenery expansion, death/victory stats, patrol patterns, quest milestone popup

## Known Issues
- PR body needs screenshot integration (screenshots from preview not yet taken)
- Scenery variety could still benefit from more kinds
- Drizzle particles are simple dots — could be richer with rain streaks
- Audio could benefit from composed music rather than procedural tones

## Delivery Branch
`factoryx/factory-edo-woodblock/edo-inkblade-ots`
