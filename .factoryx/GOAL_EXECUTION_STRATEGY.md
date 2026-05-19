# Edo Inkblade: Road to Ganryu — Goal Execution Strategy

## Vision & Player Fantasy

**Player fantasy**: You are a wandering ink-sage in Edo-era Japan — part artist, part swordsman, part philosopher. You walk the old road toward the island of Ganryu, marking the world with brushstrokes of living ink and cutting through only those who force a duel. The game is about *movement, mark-making, restraint, and clarity* — not about maxing damage or clearing a map. It is Musashi's journey distilled: wander, observe, paint, fight when honor demands it, and arrive transformed.

The player selects from a small roster of Edo archetypes (Musashi, an artist, a wanderer, a monk) who share the same core loop but feel distinct in ink style, combat rhythm, and mood.

## Mood, World, References & Emotional Target

**Mood**: *Tempered, vast, and intimate.*  
- A sunset-and-mist road that stretches ahead as a ribbon of lantern-lit earth.  
- The world is not "open world" but a *long corridor of moments* — a painted scroll you walk through.  
- Sound is quiet wind, distant water, footsteps on packed earth, and rare blade strikes.

**Emotional target**:  
- Arrival at Ganryu should feel earned, not grindy.  
- A duel should feel consequential, not frequent.  
- Painting ink into the world should feel like a creative act, not a "buff."

**Visual references (already partially realized)**:  
- Ukiyo-e woodblock prints (Hokusai's *Great Wave*, *Journey to Ganryu*).  
- Sumi-e ink wash textures.  
- Late Edo-period lantern glow and silhouette depth.  
- The game already achieves: sunset sky gradient, lantern glow, bloom, ink splatter, woodblock grain overlay, silhouette enemies, mist.  
- Future: richer road-side vignettes, painted ink marks that persist at landmarks, seasonal moments, stronger depth-atmosphere through layered fog.

## Core Interaction Loop & Progression

### Loop
1. **Walk the road** — player moves forward through auto-scrolling or driven perspective. The road generates and scrolls with layered scenery.
2. **Paint marks** — right-click / touch-press places ink marks on the world. Marks have visual weight, glow, and persist. Ink is a resource that recharges slowly.
3. **Encounters** — enemies appear at intervals. Some can be avoided (sprint past / hide in mist), some must be dueled. Combat is quick, decisive, and risky.
4. **Milestone zones** — specific points on the road: a bridge, a shrine, a forest gap, a mountain pass. At each, a quest popup appears linking the journey to Ganryu.
5. **Arrival at Ganryu** — after enough travel distance and milestone triggers, the road converges on Ganryu island. A final duel or a moment of arrival ends the journey.

### Progression (already present)
- Distance-based zone triggers (bridge, shrine, valley, pass, Ganryu).  
- Stats tracked: enemies defeated, ink used, marks placed, journey time.  
- Death screen and victory screen with summary grid.  
- Resolve bar (duel avoidance resource).  
- Future: character-select affects starting stats and ink style; branching milestone order; more than one ending.

### What the player immediately understands (target)
- "I'm walking toward Ganryu. I can paint the world. I may need to fight. When I arrive, I see my journey story."

## Art / Audio / Interaction Direction

### Art
- **Palette**: Edo sunset — amber, ochre, warm rust, charcoal, off-white, muted vermillion.  
- **Silhouettes & Layering**: Far elements (mountains, pagodas) are faint ink washes. Mid elements (trees, lanterns, enemies) are warm-lit silhouettes. Near elements (player, marks, UI) have the highest contrast and glow.  
- **Ink marks**: Brushstroke shapes with opacity falloff, surrounded by a subtle glow. The world remembers ink marks for a duration.  
- **Woodblock grain**: Subtle overlay texture across the canvas. Strengthen with paper edge vignette.  
- **Character design**: Kimono silhouette with weapon silhouette. Simple but recognizable. Enemy designs: three types (chaser yamabushi, prowler bandit, duelist ronin) with distinct silhouette profiles.

### Audio and music quality bar
- Current oscillator wind, river, footsteps, and combat SFX are temporary scaffolding, not the desired final sound identity.  
- Target: a real musical identity for the road to Ganryu: a restrained main motif, a walking/road ambience layer, a duel tension layer, and an arrival cue for Ganryu.  
- Sound can be implemented with committed audio files or deliberately composed Web Audio, but oscillator-only beeps and generic drones are not acceptable as final art direction.  
- Audio should be atmospheric, musical, and culturally coherent. Silence is still a tool, but it must feel chosen rather than absent.

### Interaction
- **Movement**: Click/tap to move forward. Mouse look (orbit camera) optional. Auto-scroll with speed control.  
- **Paint**: Right-click / hold to paint ink at cursor position. Brush size varies with hold duration.  
- **Combat**: Click to slash. Tap to block. Timing matters. Attack telegraph (wind glow) before enemy strike.  
- **Controls must feel natural on both desktop and mobile** (touch zones for movement / paint / slash).

## Engine, Asset, Controls & Verification Implications

### Engine
- **Canvas 2D with pseudo-3D projection** (already implemented).  
- No external runtime or framework. Single HTML file.  
- Future: extract rendering into a small module structure if the file threatens to exceed 1000 lines in a single pass.

### Assets and authored art quality bar
- Procedural generation is allowed when it produces richness, variation, or replay value. It is not a license for placeholder-only primitives.  
- The branch should grow an explicit asset set under `drops/edo-inkblade-ots/assets/` when that improves quality: title/key art, character portraits or sprite sheets, enemy designs, Ganryu shoreline/backdrop art, UI brush frames, texture plates, and music/audio cues.  
- Generated images are welcome if they are committed as inspectable assets and integrated into the game, not merely described in a plan.  
- Canvas-drawn elements may remain where they are strong, but weak silhouettes, crude shapes, and generic gradients should be replaced or supported by higher-quality authored/generated art.  
- Future process posts should share asset sheets, screenshots, music direction, and concept choices, not line counts.

### Controls
- Desktop: arrow/WASD movement, mouse click/look, right-click paint, space to block.  
- Mobile: touch zones — left half walk, right half look, tap to slash, long-press to paint.  
- All controls must be discoverable without tutorial text (though brief help is shown on first load).

### Verification
- `node drops/edo-inkblade-ots/test.js` — runs headless canvas tests for rendering, state, and game loop.  
- A visual smoke check script (`scripts/verify-smoke.sh`) opens the artifact in playwright and captures screenshots at key moments (title screen, mid-journey, combat, victory).  
- Future: add state-integrity checks (no NaN positions, no stuck game loops, no undefined variables at runtime).  
- Errors must fail the verification, not be silently ignored.

## What Not to Build (Non-Goals)

1. **Not an open-world RPG** — no inventory, NPCs, shops, dialogue trees, or quest system. The road is linear.
2. **Not a fighting game** — combat is quick and directional, not multi-combo or competitive.
3. **Not a painting simulator** — marks are meaningful and finite, not an infinite canvas.
4. **No online / multiplayer** — single-player journey only.
5. **No complex economy** — no XP, gold, level-ups. Stats exist for the death/victory summary.
6. **No landing-page-wrapped demo** — the artifact must open straight to character select or journey, not a studio homepage.
7. **No particle toy** — every visual effect serves readability, mood, or feedback. No gratuitous particle spam.

## Process Milestones Worth Sharing Publicly

| Milestone | What to share |
|---|---|
| Strategy gate done | Design vision, mood references, interaction doc, non-goals, game-flow sketch |
| Technical design gate done | Data flow, rendering plan, file layout, asset plan, verification design |
| Character-select screen | Screenshots of the ink-brush character roster with distinct silhouettes |
| First paint-ink test | Animated GIF or screenshot showing ink marks placed on the road |
| Milestone arrival at Ganryu | Screenshot of the Ganryu arrival frame, journey stats visible |
| Combat showcase | Short GIF showing telegraph, duel, blocking, victory over enemy |
| Full-route playthrough | A full no-death run captured as screenshots or recording |
| Polish & verification pass | Verification output, known gaps, PR body update |
| Deadline wrap | Final screenshots, PR body, review invitation |

---

*Strategy version 1 — May 2026. Updated as implementation progresses.*
