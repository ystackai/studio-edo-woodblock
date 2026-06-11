# Worklog: p1-living-print

## 2026-06-10

**Goal:** Cut one living print — a single wave-form horizon in ink on paper grain.

**Implementation:**
- Created `games/living-print/index.html` — single self-contained HTML file (~12 KB)
- Wave-form horizon: three overlapping sine waves at different frequencies create one gentle, organic line
- Ink wash: gradient from faint at horizon to deep indigo at bottom, modulated by press depth
- Mist system: 32 particles drifting horizontally with vertical wobble, opacity increases with press depth
- Baren press: press-and-hold interaction with ~350ms resistance delay, slow deepening (0.004/frame), faster release
- Paper grain: procedural noise texture with fiber streaks, warm off-white palette
- Audio: breathy low tone on press, rare mist-breath noise at deep hold, AudioContext only on user gesture
- No external dependencies, works offline, 60fps

**Push:** Branch `factoryx/factory-edo-woodblock/work-order-1781124885345-1-1`
**PR:** https://github.com/ystackai/studio-edo-woodblock/pull/114
