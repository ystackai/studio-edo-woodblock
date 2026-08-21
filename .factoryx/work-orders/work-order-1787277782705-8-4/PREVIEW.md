# Preview — work-order-1787277782705-8-4

**Date:** 2026-08-21

## Playable Browser Proof

- **URL:** `games/kawanakajima-foundry-samurai-proof/index.html`
- **Description:** Three.js WebGL scene with 20 samurai (10 Takeda/red vs 10 Uesugi/blue) on a Japanese countryside battlefield. 6 camera presets with smooth easing, charge/reform gameplay loop, screen flash feedback, audio toggle, and review panel with contact sheets and hero renders.
- **Controls:**
    - Mouse drag → orbit camera
    - Mouse wheel → zoom
    - Click samurai → inspect faction info
    - Keys 1-6 → camera presets
    - `C` → charge (both sides charge), `R` → reform
    - `A` → toggle audio, `X` → clash accent
- **Game feel:** All checklist items pass (core verb in 30s, <100ms input response, easing on motion, hit feedback, audio gated by gesture, 60fps target, no external deps).

## Unity Preview (Source Handoff Only)

- **Not buildable** in this session — MCP listener unreachable.
- Source handoff is complete and was previously verified working on a local Mac Studio (Unity 2023.2.20f1, 112 MB Mac build).
- Unity project at: `unity/kawanakajima-samurai/`
- Build scripts available: `KawanakajimaUnityBuild.BuildMac()`, `BuildWebGL()`, `BuildLinux()`

## Screenshots

- 6 screenshots committed under `screenshots/`
- Unity review assets under `unity/kawanakajima-samurai/Assets/Kawanakajima/Review/`
