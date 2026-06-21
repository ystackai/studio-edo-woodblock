const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const errors = [];

function mustExist(rel, desc) {
  const full = path.join(ROOT, rel);
  if (!fs.existsSync(full)) {
    errors.push(`MISSING ${desc}: ${rel}`);
    return false;
  }
  return true;
}

function mustContain(rel, desc, pattern) {
  const full = path.join(ROOT, rel);
  if (!mustExist(rel, desc)) return;
  const text = fs.readFileSync(full, 'utf8');
  if (!pattern.test(text)) errors.push(`FAIL ${desc}: ${rel}`);
}

function mustSizeAtLeast(rel, desc, bytes) {
  const full = path.join(ROOT, rel);
  if (!mustExist(rel, desc)) return;
  const size = fs.statSync(full).size;
  if (size < bytes) errors.push(`FAIL ${desc} too small: ${rel} (${size} bytes)`);
}

function readGlbStats(rel) {
  const full = path.join(ROOT, rel);
  if (!mustExist(rel, 'GLB file')) return null;
  const buffer = fs.readFileSync(full);
  if (buffer.toString('ascii', 0, 4) !== 'glTF') {
    errors.push(`FAIL GLB magic: ${rel}`);
    return null;
  }
  let offset = 12;
  let json = null;
  while (offset + 8 <= buffer.length) {
    const chunkLength = buffer.readUInt32LE(offset);
    const chunkType = buffer.toString('ascii', offset + 4, offset + 8);
    offset += 8;
    if (chunkType === 'JSON') {
      json = JSON.parse(buffer.slice(offset, offset + chunkLength).toString('utf8').trim());
    }
    offset += chunkLength;
  }
  if (!json) {
    errors.push(`FAIL missing GLB JSON chunk: ${rel}`);
    return null;
  }

  let primitiveCount = 0;
  let vertexCount = 0;
  for (const mesh of json.meshes || []) {
    for (const primitive of mesh.primitives || []) {
      primitiveCount += 1;
      const positionAccessor = primitive.attributes && primitive.attributes.POSITION;
      if (Number.isInteger(positionAccessor) && json.accessors && json.accessors[positionAccessor]) {
        vertexCount += json.accessors[positionAccessor].count || 0;
      }
    }
  }

  return {
    bytes: buffer.length,
    nodes: (json.nodes || []).length,
    meshes: (json.meshes || []).length,
    materials: (json.materials || []).length,
    primitiveCount,
    vertexCount,
    materialNames: (json.materials || []).map(material => material.name || ''),
  };
}

function mustSamuraiGlbStats(rel) {
  const stats = readGlbStats(rel);
  if (!stats) return;
  if (stats.bytes < 500000) errors.push(`FAIL Foundry Samurai GLB too small for compressed v6 asset: ${rel} (${stats.bytes} bytes)`);
  if (stats.nodes < 150) errors.push(`FAIL Foundry Samurai GLB node count too low: ${rel} (${stats.nodes})`);
  if (stats.meshes < 120) errors.push(`FAIL Foundry Samurai GLB mesh count too low: ${rel} (${stats.meshes})`);
  if (stats.materials < 13) errors.push(`FAIL Foundry Samurai GLB material count too low: ${rel} (${stats.materials})`);
  if (stats.vertexCount < 10000) errors.push(`FAIL Foundry Samurai GLB vertex count too low: ${rel} (${stats.vertexCount})`);
  for (const requiredMaterial of ['russet_mempo_mask', 'brushed_steel_blade', 'aged_crimson_sashimono']) {
    if (!stats.materialNames.some(name => name.startsWith(requiredMaterial))) {
      errors.push(`FAIL Foundry Samurai GLB missing material ${requiredMaterial}: ${rel}`);
    }
  }
}

console.log('=== Kawanakajima Unity handoff verification ===');

mustContain('Packages/manifest.json', 'glTFast package dependency', /"com\.unity\.cloud\.gltfast"\s*:\s*"6\.1\.0"/);
mustContain('ProjectSettings/ProjectVersion.txt', 'Unity project version', /m_EditorVersion:/);
mustSamuraiGlbStats('Assets/StreamingAssets/Kawanakajima/samurai_character.glb');
mustSizeAtLeast('Assets/StreamingAssets/Kawanakajima/samurai_battlefield_pack.glb', 'Foundry 20-samurai battlefield pack GLB', 3000000);
mustContain('Assets/StreamingAssets/Kawanakajima/samurai_battlefield_manifest.json', 'Foundry 20-samurai battlefield manifest', /"warrior_count"\s*:\s*20/);
mustSizeAtLeast('Assets/Resources/KawanakajimaAudio/battlefield_loop.wav', 'Foundry battlefield loop', 1000000);
mustExist('Assets/Resources/KawanakajimaAudio/charge_cue.wav', 'charge cue');
mustExist('Assets/Resources/KawanakajimaAudio/clash_accent.wav', 'clash accent');
mustExist('Assets/Resources/KawanakajimaAudio/formation_step.wav', 'formation step');
mustExist('Assets/Resources/KawanakajimaAudio/ui_confirm.wav', 'ui confirm');
mustExist('Assets/Kawanakajima/Review/samurai_character_contact_sheet.png', 'review contact sheet');
mustExist('Assets/Kawanakajima/Review/samurai_character_hero.png', 'review hero render');
mustExist('Assets/Kawanakajima/Review/samurai_battlefield_contact_sheet.png', '20-samurai battlefield contact sheet');
mustExist('Assets/Kawanakajima/Review/samurai_battlefield_wide_clash.png', '20-samurai battlefield wide render');
mustContain('Assets/Kawanakajima/Scripts/KawanakajimaRuntimeBootstrap.cs', '20 actor bootstrap', /ActorCount\s*=\s*20/);
mustContain('Assets/Kawanakajima/Scripts/KawanakajimaRuntimeBootstrap.cs', 'runtime GLB loading', /new GltfImport\(\)|gltf\.Load\(url\)/);
mustContain('Assets/Kawanakajima/Scripts/KawanakajimaRuntimeBootstrap.cs', '20-samurai battlefield pack loading', /samurai_battlefield_pack\.glb|ToggleFoundryBattlefieldPack|KeyCode\.P/);
mustContain('Assets/Kawanakajima/Scripts/KawanakajimaRuntimeBootstrap.cs', 'playable controls', /KeyCode\.C|KeyCode\.R|ToggleMusic|ApplyCameraPreset/);
mustContain('Assets/Kawanakajima/Scripts/KawanakajimaRuntimeBootstrap.cs', 'readiness marker', /KAWANAKAJIMA_UNITY_READY/);
mustContain('Assets/Kawanakajima/Editor/KawanakajimaUnityBuild.cs', 'scene creation menu', /Create Or Refresh Scene/);
mustContain('Assets/Kawanakajima/Editor/KawanakajimaUnityBuild.cs', 'WebGL build hook', /BuildTarget\.WebGL/);
mustContain('Assets/Kawanakajima/Editor/KawanakajimaUnityBuild.cs', 'Linux build hook', /BuildTarget\.StandaloneLinux64/);
mustContain('Assets/Kawanakajima/Editor/KawanakajimaUnityBuild.cs', 'Mac build hook', /BuildTarget\.StandaloneOSX/);
mustContain('README.md', 'verified local Unity build documented', /Verified Local Build[\s\S]*KawanakajimaUnityBuild\.BuildMac[\s\S]*Exit code 0/);
mustContain('UNITY_BUILD_VERIFICATION.md', 'Mac build success documented', /Build result: succeeded[\s\S]*Builds\/Mac\/KawanakajimaSamurai\.app/);
mustContain('UNITY_LOCAL_STATUS.md', 'Mac Unity MCP routing documented', /Worker routed URL:\s*`http:\/\/(?:172\.21\.0\.1:25666|host\.docker\.internal:27481\/mcp)`[\s\S]*Worker preflight: passed/);

if (errors.length) {
  console.error('UNITY HANDOFF VERIFICATION FAILS:');
  for (const error of errors) console.error(' - ' + error);
  process.exit(1);
}

console.log('UNITY HANDOFF STRUCTURE: PASS');
