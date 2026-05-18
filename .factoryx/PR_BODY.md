## Edo Inkblade: Road to Ganryu

FactoryX-WorkOrder: work-order-1779110113149-ots-polish
FactoryX-Factory: factory-edo-woodblock

### Scope
Polish the existing first/over-the-shoulder Edo art-and-duel bootstrap at `drops/edo-inkblade-ots/index.html` into a stronger vertical slice. Not Floating Score, not a top-down toy, not a landing page.

### Preview
`drops/edo-inkblade-ots/index.html`

### Changes Since Bootstrap (2 passes)
**Pass 1 — Art direction** (previous): Sky gradient with Edo sunset tones, sun glow halos, road lanterns with warm radial glow, denser mist, woodblock grain texture overlay, bloom post-effect, low-HP enemy danger glow, enemy attack flash, mark glow core, fresh-mark halo, player damage flash and invincible aura, ink splatter particles.

**Pass 2 — Combat feel & enemy AI** (current):
- Fixed missing player.damageFlash and player.invincible fields (were referenced but never set)
- Enemy AI types: chaser (dock ronin - aggressive rush), prowler (cedar bandit - flanking), duelist (bridge challenger - patient, high damage)
- Attack telegraphing with wind glow on enemy weapon before swing
- Screen shake on hit and death for impact feel
- Enemy death dissolve animation instead of instant vanish
- Richer burst particles with two-color variation
- Player damage flash + invincibility frames after hit
- Block damage reduction varies by enemy type

### Verification
- `node drops/edo-inkblade-ots/test.js` passes
- JS syntax check OK

### Known Gaps / Next Polish
- No audio yet
- Ink regeneration feels slow
- Waymark visual on road could be clearer for objective progression
- Mouse look not implemented (arrow keys only)
- Road scenery detail and variety could improve
- Enemy types limited (3)

### FactoryX WorkOrder Context
Full prompt and constraints preserved. Delivery branch: `factoryx/factory-edo-woodblock/edo-inkblade-ots`. Target repo: `ystackai/studio-edo-woodblock`. Deadline: 2026-05-19T06:15:13Z. Finish policy: polish_until_deadline.
