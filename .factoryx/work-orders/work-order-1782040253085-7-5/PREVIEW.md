# Preview — Pilot-4 Samurai Assets

## What to Review

The generated samurai assets are at:

```
games/kawanakajima-foundry-samurai-proof/assets/generated/foundry/samurai-v17/pilot-4/
```

### Contact Sheet
Open `contact_sheet.png` in any image viewer. It shows 4 samurai side-by-side:
- **Left two:** Takeda (red-side) variants — crescent moon helmet, horned helmet
- **Right two:** Uesugi (blue-side) variants — X-cross helmet, deer antler helmet

### Hero Shot
`hero.png` is the hero render (820×1024) — frontal three-quarter view with soft lighting.

### Inspection Views
For each samurai, 6 views exist as `cs_*.png`:
- `cs_front.png` — front view
- `cs_side_l.png` — left side profile
- `cs_rear.png` — rear view
- `cs_qtr_fl.png` — front-left three-quarter
- `cs_qtr_fr.png` — front-right three-quarter
- `cs_top.png` — top-down formation view

### GLB Files
Four GLB files (~1.3 MB each) for Three.js/Unity integration:
- `takeda-01.glb`, `takeda-02.glb` (red side)
- `uesugi-01.glb`, `uesugi-02.glb` (blue side)

### Blender Sources
Four .blend source files for further editing.

## Browser Integration

The existing Three.js scene at `games/kawanakajima-foundry-samurai-proof/index.html` already loads GLB samurai assets. The new v17 assets can be loaded by updating the asset path reference from the old `assets/samurai_character.glb` to `assets/generated/foundry/samurai-v17/pilot-4/{samurai-name}.glb`.
