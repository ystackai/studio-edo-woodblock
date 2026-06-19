# PREVIEW — Discord Deliverable Kickoff: Pictures of the Floating World (work-order-1781891881600-7-1)

**Entrypoint:** games/94-kawanakajima/index.html  
**Preview root:** controlled by `.factoryx/preview-entrypoint` (already set to the kawanakajima courtyard slice).

## What a reviewer sees
- A self-contained ukiyo-e flavored 3D "print" viewer that has become a small playable samurai courtyard scene.
- Two facing carved samurai (real GLB geometry, improved layered armor and distinct crests/weapons per feedback).
- Paper frames, ink grain, tatami courtyard lines + lantern silhouettes in the charged space between them.
- Clear first interaction: drag either viewport to orbit/inspect; click roster thumbnails to swap variants; press SPACE or THE INSTANT button to stage the clash encounter (models step forward, ink burst + verdict label appears).
- No instructions needed — title, hint, and stage band communicate "two prints in the courtyard... choose... clash".
- 24 file-backed assets (20 samurai variants + 4 props) with provenance in ASSET_MANIFEST.md.

## How to open locally
```
# serve the checkout (required for GLB fetch + WebGL)
python3 -m http.server 8765
# then open http://localhost:8765/games/94-kawanakajima/index.html
```
Or rely on the FactoryX preview deployment for the branch.

## Controls (browser + touch friendly)
- Pointer drag on 3D views: orbit yaw/pitch
- Wheel: dolly
- V: cycle preset views (front / three-quarter / profile)
- Click roster items: load that GLB variant into the side
- Space or button: trigger clash (the core encounter verb)
- R: reset stage (keeps selections)
- ♪ : toggle sparse gesture-gated SFX (off by default)

## Known preview notes
- WebGL + relative .glb loads require HTTP (not pure file://).
- Headless captures may appear darker; live browser shows full ink + shading.
- Payload remains lightweight; all assets committed and relative.

## Evidence
Screenshots (ready + post-interact/clash) captured into this context dir during verification.

Work Order: work-order-1781891881600-7-1
