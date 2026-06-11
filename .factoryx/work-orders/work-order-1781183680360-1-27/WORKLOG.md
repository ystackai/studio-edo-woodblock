# Worklog: Living Print — Wave Horizon (trial e1b/b)

## Session Summary

### Fix: Runtime TypeError (Critical)
- **Bug**: `createImageData(paper.data)` threw `TypeError: parameter 1 is not of type 'ImageData'`
- **Root cause**: `paper.data` is a `Uint8ClampedArray`, not an `ImageData` object. `createImageData` only accepts `(width, height)` numbers or an existing `ImageData` object.
- **Fix**: Removed the redundant `paper = ctx.createImageData(paper.data)` call. The first `createImageData(W, H)` on the preceding line already created the ImageData with proper dimensions, and pixel data was filled correctly.

### Polish Pass 2 — "Living" Enhancements

**Problem from previous run**: Fun scored 3/5 — the piece was static and lacked engagement.

**Changes made**:

1. **Second wave layer (drawWaveB)**: Added a distant mountain silhouette rendered behind the main wave horizon. Gives the scene more depth and makes the horizon feel more alive.

2. **Cumulative ink deepening**: Added `cumulativePress` variable that accumulates while pressing, creating ink that "deepens inward" — the more you press, the more ink bleeds into the paper grain. This ink persists (slowly fades) even after release, making each press leave a subtle trace.

3. **Ink wick/tendrils**: On press, thin dark tendrils grow downward from the wave, simulating ink bleeding into paper fibers. This adds organic, woodblock-like texture.

4. **Mist response to press**: Mist particles now thin out and slow down under baren press, as if pressure displaces the mist. Depth-based modulation makes near mist more affected than far mist.

5. **Press resistance curve**: Added `easeInOutCubic` with exponential resistance — the first 200ms of pressing feels heavier, simulating physical resistance.

6. **Sound throttling**: Baren press sound now has an 800ms cooldown to prevent audio spam during sustained press.

7. **Delta capping**: Frame delta capped at 50ms to prevent visual jumps after browser tab switches.

8. **Paper grain animation**: Paper grain subtly shifts over time, giving the paper a breathing quality.

### Self-Review Scores
- Graphics: 4
- Sound: 4
- Fun: 4
- Unique style: 4

All anchors ≥ 4. No further polish pass needed.
