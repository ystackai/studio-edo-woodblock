# Edo Inkblade: The Road of Lanterns

## One-Paragraph Game

Edo Inkblade is a top-down action-adventure road game. The player is a wandering inkblade carrying a living lantern through a cursed Edo highway. Each road segment has a readable obstacle: duel a guard, cut spirit knots, collect a seal, open the next gate. Win the slice by clearing three road gates and reaching the sunrise bridge. Lose if the lantern flame reaches zero.

## Player Experience

The player should understand the first objective in under 10 seconds: move, slash, survive, open the road. The game should feel like a small complete journey, not a demo room. The road must visibly extend forward as gates open, with clear "before closed / after open" states and a final destination.

## Core Loop

1. Enter a road segment with the next gate visibly closed.
2. Read the immediate task from the world: guard, knot, seal, or shrine.
3. Move with WASD/arrows, slash with Space, dodge by movement.
4. Resolve the obstacle and watch the road state change.
5. Advance north to the next segment.
6. Repeat through three gates, then cross the sunrise bridge.

## Slice Content

Build at least three connected road segments in `games/inkblade/index.html` with no build step:

- Gate 1: a human guard patrols and attacks. Defeating him opens the first gate.
- Gate 2: two drifting ink spirits and three cuttable curse knots. Cutting all knots opens the second gate.
- Gate 3: a captain guard plus a seal pickup. Survive the duel and carry the seal to the shrine to open the bridge.
- Finale: the player walks into the opened sunrise bridge and receives a clear ending.

## Combat and State

- Player has direct control at all times except ending overlays.
- The lantern flame is health and should be visible as both bar and world object.
- Slash must have range, cooldown, impact feedback, and visible hit reactions.
- Enemies must visibly move, threaten, attack, take damage, and die or disperse.
- The player must be able to lose and restart quickly.

## Visual Direction

Use a stylized ukiyo-e/ink-wash look with strong readability. The road, gates, player, enemies, interactables, and destination must be legible in screenshots. Generated image/audio assets can be used once the core loop works, but the game must remain coherent without them.

## Asset Direction

After the three-gate loop is playable, use the FactoryX game asset service for a small production support pack:

- one visual asset that materially improves the road, gate, bridge, enemy, or UI identity;
- one ambient loop or short motif;
- two to four gameplay SFX for slash, hit, gate open, and win.

Generated assets are not the goal. They should make the game feel more like Edo Inkblade. Load them in the game or mark them prototype/unused with a reason.

## Done Definition

A player can open the preview, immediately understand how to play, clear three gates with direct control, see the road open multiple times, cross the final bridge, and hear/see at least minimal feedback for action, damage, gates, and ending. Verification must include screenshots or playtest notes from the actual game.
