## Edo Inkblade: Road to Ganryu

FactoryX-WorkOrder: work-order-1779110113149-ots-polish
FactoryX-Factory: factory-edo-woodblock

### Scope
Polish the existing first/over-the-shoulder Edo art-and-duel bootstrap at `drops/edo-inkblade-ots/index.html` into a stronger vertical slice. Not Floating Score, not a top-down toy, not a landing page.

### Preview
`drops/edo-inkblade-ots/index.html`

### Changes (4 passes)

**Pass 1 — Art direction**: Sky gradient with Edo sunset tones, sun glow halos, road lanterns with warm radial glow, denser mist, woodblock grain texture overlay, bloom post-effect, low-HP enemy danger glow, enemy attack flash, mark glow core, fresh-mark halo, player damage flash and invincible aura, ink splatter particles.

**Pass 2 — Combat feel & enemy AI**:
- Fixed missing player.damageFlash and player.invincible fields
- Enemy AI types: chaser (aggressive rush), prowler (flanking), duelist (patient, high damage)
- Attack telegraphing with wind glow on enemy weapon before swing
- Screen shake on hit/death for impact feel
- Enemy death dissolve animation
- Richer burst particles with two-color variation
- Player damage flash + invincibility frames after hit
- Block damage reduction varies by enemy type

**Pass 3 — Art & objective progression**:
- Waymark stakes with wooden post and ground glow for clearer road placement
- Road edge marker poles for distance/depth cues
- Paint action triggers inkSplatter particles for richer feedback
- Ink regen visual feedback (green tint pulse when ink recovers)
- Refined miss message with micro screen shake
- Improved quest text phrasing

**Pass 4 — Controls & movement feel** (current):
- Mouse click left = slash, right click = paint; touch support added
- Smooth acceleration/deceleration via velocity lerp (0.18 factor)
- Head bob when running (sine wave on player Y height)
- Camera lean when strafing (X offset based on lateral velocity)
- Updated controls hint UI text

### Verification
- `node drops/edo-inkblade-ots/test.js` passes
- JS syntax check OK

### Known Gaps / Next Polish
- No audio yet
- Road scenery variety could improve
- Enemy types limited (3)
- Death screen is functional but minimal
- Ink regen visual has tautological condition

### FactoryX WorkOrder Context
Full prompt and constraints preserved. Delivery branch: `factoryx/factory-edo-woodblock/edo-inkblade-ots`. Target repo: `ystackai/studio-edo-woodblock`. Deadline: 2026-05-19T06:15:13Z. Finish policy: polish_until_deadline.
