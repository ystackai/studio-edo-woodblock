# Verification: Rain Lantern 雨灯

## Artifact
`games/trial-e1b-p3-lantern-rain-b/index.html` (14.5 KB, single self-contained file)

## Static Checks
- HTML structure valid: DOCTYPE, html, head, body all present and closed
- Script syntax validated: no JS syntax errors
- Self-contained: no external dependencies, no network requests
- File size: 14.5 KB (well under 2 MB limit)

## Runtime Verification (Browser)
1. Load `games/trial-e1b-p3-lantern-rain-b/index.html` in any modern browser
2. No page errors should appear in console
3. Canvas renders with:
    - Dusk sky gradient (deep indigo)
    - Mountain silhouettes (two layers)
    - Swaying bamboo stalks with leaves on right
    - Central paper lantern with warm vermilion glow
    - Wet paper texture, rain streaks falling diagonally
    - Ground reflection of lantern glow
    - Floating sparks when flame is steady (reward)
    - Paper grain overlay and vignette
4. Interact (click/touch/space) for 1+ seconds:
    - Shield hand rises to lantern with easing
    - Flame steadies visually (less flicker, brighter)
    - Rain sound begins (user-initiated audio)
    - Start overlay fades out
    - Warm sparks float up from flame
5. Release:
    - Hand lowers with easing
    - Flame gradually destabilizes
    - Rain sound fades out
    - Sparks stop spawning

## Game Feel Checklist
- [x] Core verb (shield lantern) available immediately on first interaction
- [x] Input response is instant (pointer events, no loading)
- [x] Easing on all motion (shield hand opacity/position, flame steadiness)
- [x] Visual feedback at moment of impact (sparks when flame is steady)
- [x] Audio only after user gesture (rain sound starts on first touch)
- [x] Full canvas is touch target (> 44px)
- [x] Canvas scales with DPR to mid-laptop resolution
- [x] Payload is 14.5 KB, well under 2 MB
- [x] No external network dependencies
