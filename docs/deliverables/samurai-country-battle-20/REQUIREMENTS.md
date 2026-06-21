# 20 Samurai Country Battle Deliverable

## Objective

Create a playable Unity game scene where twenty warring samurai meet on the
Japanese countryside: ten from one side and ten from the opposing side. The
deliverable must produce high-quality samurai assets through Asset Foundry and
Blender, integrate them into a coherent Unity world, and ship a playable game
loop that can be inspected and reviewed without special operator knowledge.

## Required Outcome

- Build twenty distinct samurai character assets: ten allied and ten opposing.
- Assets must be generated or improved through Asset Foundry using Blender and
  Blender MCP where possible.
- Each samurai should read as a real armored samurai rather than a blocky,
  Minecraft-like placeholder.
- Distinguish the two sides through banners, armor palette, crests, stance, or
  equipment while keeping the style coherent.
- Create a Japanese countryside battlefield in Unity with terrain, paths,
  grass/fields, trees or bamboo, atmospheric sky/lighting, and a legible meeting
  space for both forces.
- Place all twenty samurai in the Unity world with clear opposing formations.
- Make the world playable: the reviewer can enter the scene, move or control a
  camera/player, and understand the encounter immediately.
- Include basic game state or interaction such as formation inspection,
  approach/charge trigger, simple combat demonstration, or tactical camera mode.
- Preserve generated source assets and exported runtime assets in reviewable
  repo locations.
- Provide screenshots or rendered proof views that show asset quality and the
  Unity world from multiple angles.

## Asset Quality Loop

Use the Boeing-747-style self-verification prompt pattern:

1. Build repeatable camera/view systems for asset inspection.
2. After significant asset changes, render the same views.
3. Identify the least realistic visible issue.
4. Improve that issue.
5. Preserve the best version.
6. Repeat until no visible issue remains worth fixing within the work order.

For samurai assets, verify at minimum:

- recognizable kabuto/helmet silhouette,
- shoulder and torso armor layering,
- cloth or hakama-like lower body,
- katana, yari, bow, banner, or other period-appropriate equipment,
- non-blocky proportions,
- material variation between metal, lacquer, cloth, leather, and skin,
- readable side/team identity from a game camera distance.

## Unity Requirements

- Use the existing Unity project at
  `unity/kawanakajima-samurai`.
- Use Unity MCP for scene creation and inspection when available.
- The main deliverable scene should be saved under
  `Assets/Kawanakajima/Scenes/`.
- Include or update any scripts needed for playability.
- The scene must be non-empty, loadable, and visibly contain the world and all
  twenty samurai.
- Do not leave placeholder cubes/capsules as the final representation of the
  samurai unless they are hidden debug helpers.

## Verification Requirements

Before marking the deliverable complete, produce evidence for:

- Asset Foundry/Blender outputs exist for the samurai set.
- At least one asset-quality proof render or screenshot exists.
- Unity scene loads and contains the twenty placed samurai.
- Play mode or equivalent Unity validation can run without immediate errors.
- A reviewer can identify both sides and the countryside setting from captured
  screenshots.
- The game is reachable from the repo's normal preview/review path when
  applicable.

## Operating Guidance

If a blocker appears, fix the root cause, verify the fix, and restart the
production loop. Keep iterating until FactoryX can continue producing coherent
work on this deliverable without operator intervention.

GitHub API rate limits, queue pressure, or a stale work order should not be
treated as completion. If the system cannot make progress because of one of
those, document the cause, mitigate it where possible, and retry.
