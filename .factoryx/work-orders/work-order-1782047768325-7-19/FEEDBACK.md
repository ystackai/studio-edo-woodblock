# Pilot-4 Visual Gate Feedback

**Work Order:** `work-order-1782047768325-7-19`  
**Date:** 2026-06-21  

## Overall Assessment

All four pilot-4 samurai models pass the visual quality gates. The models are clean, well-proportioned, and visually distinct. No blocking flaws detected.

## Detailed Feedback

### Strengths

1. **Helmet differentiation is excellent** — Each samurai has a clearly distinct maedate: crescent moon (takeda-01), horned+jewel (takeda-02), X-cross (uesugi-01), deer antler spread (uesugi-02). From the top and front views, these are immediately distinguishable without close inspection.

2. **Proportions are human-like** — Ellipsoid torso instead of capsule, proper limb thickness relative to body, no toy/puppet proportions. The silhouettes read as samurai, not Minecraft-style primitives.

3. **Color palettes are faction-consistent** — Takeda (red/dark) and Uesugi (blue/dark) each have coherent palettes with appropriate accent colors (brass for Takeda, silver for Uesugi).

4. **Grounding is correct** — All feet visible and firmly on the ground plane in all view angles. No floating characters or detached parts.

5. **Props properly attached** — Katana at natural hip angle, sashimono banners on back, no floating or disconnected geometry.

### Areas for Improvement (non-blocking)

1. **Armor surface detail** — All four samurai have the same underlying geometry with only color differences. Adding surface detail (rivets, wear marks, fabric wrinkles) to differentiate models beyond just helmet and color would increase visual variety.

2. **PBR material maps** — All materials are solid colors. Adding at least a roughness map and normal map would add significant perceived quality without increasing polygon count.

3. **Banner cloth** — The sashimono is a flat plane. Subdividing into a small grid would enable wind animation and add volume.

4. **Face/mempo mask** — Stylized but could benefit from slightly more defined eye slits and cheek detail to read better at game scale.

5. **Mesh optimization** — 149–155 tris per samurai is fine for now but Draco compression should be applied before production to reduce ~5.2 MB total payload.

6. **Animation infrastructure** — No skeletal rig present. If animation interpolation between poses (idle → charge → attack) is planned, a basic bone structure should be added in a follow-up.

### Recommendations for Next Ticket

1. Add subtle surface detail variations (rivets, edge wear) to differentiate samurai beyond helmet and color
2. Generate PBR texture maps (at minimum roughness + normal) for the armor surfaces
3. Subdivide sashimono banner geometry for cloth animation support
4. Apply Draco compression to GLB exports
5. Consider adding a basic skeleton/bone rig if pose animation is planned
