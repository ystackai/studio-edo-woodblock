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

console.log('=== Kawanakajima Unity handoff verification ===');

mustContain('Packages/manifest.json', 'glTFast package dependency', /"com\.unity\.cloud\.gltfast"\s*:\s*"6\.1\.0"/);
mustContain('ProjectSettings/ProjectVersion.txt', 'Unity project version', /m_EditorVersion:/);
mustSizeAtLeast('Assets/StreamingAssets/Kawanakajima/samurai_character.glb', 'Foundry Samurai GLB', 800000);
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
mustContain('Assets/Kawanakajima/Scripts/KawanakajimaRuntimeBootstrap.cs', 'runtime GLB loading', /new GltfImport\(\)|gltf\.Load\(url\)|LoadGltf\(url\)|GLTFast\.GltfImport/);
mustContain('Assets/Kawanakajima/Scripts/KawanakajimaRuntimeBootstrap.cs', '20-samurai battlefield pack loading', /samurai_battlefield_pack\.glb|ToggleFoundryBattlefieldPack|KeyCode\.P/);
mustContain('Assets/Kawanakajima/Scripts/KawanakajimaRuntimeBootstrap.cs', 'playable controls', /KeyCode\.C|KeyCode\.R|ToggleMusic|ApplyCameraPreset/);
mustContain('Assets/Kawanakajima/Scripts/KawanakajimaRuntimeBootstrap.cs', 'readiness marker', /KAWANAKAJIMA_UNITY_READY/);
mustContain('Assets/Kawanakajima/Editor/KawanakajimaUnityBuild.cs', 'scene creation menu', /Create Or Refresh Scene/);
mustContain('Assets/Kawanakajima/Editor/KawanakajimaUnityBuild.cs', 'WebGL build hook', /BuildTarget\.WebGL/);
mustContain('Assets/Kawanakajima/Editor/KawanakajimaUnityBuild.cs', 'Linux build hook', /BuildTarget\.StandaloneLinux64/);
mustContain('Assets/Kawanakajima/Editor/KawanakajimaUnityBuild.cs', 'Mac build hook', /BuildTarget\.StandaloneOSX/);
mustContain('README.md', 'verified local Unity build documented', /Verified Local Build[\s\S]*KawanakajimaUnityBuild\.BuildMac[\s\S]*Exit code 0/);
mustContain('UNITY_BUILD_VERIFICATION.md', 'Mac build success documented', /Build result: succeeded[\s\S]*Builds\/Mac\/KawanakajimaSamurai\.app/);
mustContain('UNITY_LOCAL_STATUS.md', 'Mac Unity MCP routing documented', /Worker routed URL:\s*`http:\/\/172\.21\.0\.1:25666`[\s\S]*Worker preflight: passed/);

if (errors.length) {
  console.error('UNITY HANDOFF VERIFICATION FAILS:');
  for (const error of errors) console.error(' - ' + error);
  process.exit(1);
}

console.log('UNITY HANDOFF STRUCTURE: PASS');
