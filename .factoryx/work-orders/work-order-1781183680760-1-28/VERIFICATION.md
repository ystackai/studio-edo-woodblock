# Verification: trial e1b/a — p2-quiet-opening

## Artifact path
`games/trial-e1b-p2-quiet-opening-a/index.html`

## Acceptance criteria

| Criterion | Status |
|-----------|--------|
| File exists at `games/trial-e1b-p2-quiet-opening-a/index.html` | ✅ |
| Single self-contained HTML file | ✅ |
| No external network dependencies | ✅ |
| Total payload < 2 MB (actual: 12 KB) | ✅ |
| Opens without browser runtime errors | ✅ |
| Canvas renders to DOM | ✅ |
| Fog layers move slowly (6 layers, different speeds) | ✅ |
| Paper grain overlay present | ✅ |
| Pointer movement parts fog | ✅ |
| No tutorial/prompt — opens directly | ✅ |
| Responsive (handles resize) | ✅ |
| No audio autoplay | ✅ |

## Implementation notes
- Canvas-based rendering with DPR-aware scaling
- Procedural fog system using pixel-level fog density map with `destination-out` compositing
- 6 fog layers with independent speeds, directions, amplitudes
- Paper grain generated procedurally via pixel noise
- Pointer drift uses eased interpolation for smooth fog parting
- Fog slowly regenerates when not being parted
- Japanese pine shape with characteristic weeping branch
- Muted, desaturated color palette throughout
