# Worklog

FactoryX Work Order: `work-order-1782001404838-7-7`

## 2026-06-21 UTC

- Replaced `unity/kawanakajima-samurai/Assets/StreamingAssets/Kawanakajima/samurai_character.glb` with the v5 improved foundry export from `games/kawanakajima-foundry-samurai-proof/assets/generated/foundry/samurai/improved-20260620-v5/samurai_character_v5.glb`.
- Verified the destination file now matches the v5 export size: `1,285,892` bytes.
- Verified the local Mac Unity MCP listener at `http://host.docker.internal:27481/mcp` answered JSON-RPC `initialize`.
- Verified the opened Unity scene through MCP: `Kawanakajima`, loaded, valid, `RootCount=73`, path `Assets/Kawanakajima/Scenes/Kawanakajima.unity`.
- Verified `screenshot-camera` returned an image from `Kawanakajima Camera` at `1920x1080`.
- The autonomous worker wedged after receiving the huge screenshot payload and did not create a PR, so this branch was recovered manually from the canonical work-order checkout.
