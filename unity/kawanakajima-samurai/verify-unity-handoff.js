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
mustSizeAtLeast('Assets/Resources/KawanakajimaAudio/battlefield_loop.wav', 'Foundry battlefield loop', 1000000);
mustExist('Assets/Resources/KawanakajimaAudio/charge_cue.wav', 'charge cue');
mustExist('Assets/Resources/KawanakajimaAudio/clash_accent.wav', 'clash accent');
mustExist('Assets/Resources/KawanakajimaAudio/formation_step.wav', 'formation step');
mustExist('Assets/Resources/KawanakajimaAudio/ui_confirm.wav', 'ui confirm');
mustExist('Assets/Kawanakajima/Review/samurai_character_contact_sheet.png', 'review contact sheet');
mustExist('Assets/Kawanakajima/Review/samurai_character_hero.png', 'review hero render');
mustContain('Assets/Kawanakajima/Scripts/KawanakajimaRuntimeBootstrap.cs', '20 actor bootstrap', /ActorCount\s*=\s*20/);
mustContain('Assets/Kawanakajima/Scripts/KawanakajimaRuntimeBootstrap.cs', 'runtime GLB loading', /new GltfImport\(\)|gltf\.Load\(url\)/);
mustContain('Assets/Kawanakajima/Scripts/KawanakajimaRuntimeBootstrap.cs', 'playable controls', /KeyCode\.C|KeyCode\.R|ToggleMusic|ApplyCameraPreset/);
mustContain('Assets/Kawanakajima/Scripts/KawanakajimaRuntimeBootstrap.cs', 'readiness marker', /KAWANAKAJIMA_UNITY_READY/);
mustContain('Assets/Kawanakajima/Editor/KawanakajimaUnityBuild.cs', 'scene creation menu', /Create Or Refresh Scene/);
mustContain('Assets/Kawanakajima/Editor/KawanakajimaUnityBuild.cs', 'WebGL build hook', /BuildTarget\.WebGL/);
mustContain('Assets/Kawanakajima/Editor/KawanakajimaUnityBuild.cs', 'Linux build hook', /BuildTarget\.StandaloneLinux64/);
mustContain('README.md', 'Unity blocker documented', /no installed Unity Editor|Unity-side MCP listener|18 GB/);

if (errors.length) {
  console.error('UNITY HANDOFF VERIFICATION FAILS:');
  for (const error of errors) console.error(' - ' + error);
  process.exit(1);
}

console.log('UNITY HANDOFF STRUCTURE: PASS');
