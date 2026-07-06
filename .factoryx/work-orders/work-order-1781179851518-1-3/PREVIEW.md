# Preview — trial e3/35b · p3-lantern-rain

## How to preview

Open in browser: `games/trial-e3-p3-lantern-rain/index.html`

Or visit the PR: https://github.com/ystackai/studio-edo-woodblock/pull/135

## What to expect

1. A dark dusk scene with rain falling diagonally
2. A single paper lantern hanging, warm glow visible through wet paper
3. Move your mouse/finger over the lantern to shelter it from rain
4. Hold still near the lantern for 3+ seconds to see the flame burn steadier
5. Click the "rain sound" toggle (bottom-right) to hear rain ambience

## Notes

- Runtime error from previous run (`Cannot read properties of undefined (reading 'radius')`) has been fixed by ensuring the `lantern` object and `W`/`H` variables are initialized before rain/water-drop code executes.
