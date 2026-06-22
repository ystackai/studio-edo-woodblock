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
mustContain('Assets/Kawanakajima/Scripts/KawanakajimaRuntimeBootstrap.cs', 'runtime GLB loading', /new GltfImport\(\)|gltf\.Load\(url\)/);
mustContain('Assets/Kawanakajima/Scripts/KawanakajimaRuntimeBootstrap.cs', 'shader-safe glTF material generator', /ShaderSafeGltfMaterialGenerator[\s\S]*IMaterialGenerator/);
mustContain('Assets/Kawanakajima/Scripts/KawanakajimaRuntimeBootstrap.cs', 'shader-safe GLB import wiring', /new GltfImport\(null,\s*null,\s*GltfMaterialGenerator,\s*null\)/);
mustContain('Assets/Kawanakajima/Scripts/KawanakajimaRuntimeBootstrap.cs', '20-samurai battlefield pack loading', /samurai_battlefield_pack\.glb|ToggleFoundryBattlefieldPack|KeyCode\.P/);
mustContain('Assets/Kawanakajima/Scripts/KawanakajimaRuntimeBootstrap.cs', 'playable controls', /KeyCode\.C|KeyCode\.R|ToggleMusic|ApplyCameraPreset/);
mustContain('Assets/Kawanakajima/Scripts/KawanakajimaRuntimeBootstrap.cs', 'readiness marker', /KAWANAKAJIMA_UNITY_READY/);
mustContain('Assets/Kawanakajima/Scripts/KawanakajimaRuntimeBootstrap.cs', 'headless shader fallback', /KAWANAKAJIMA_SHADER_FALLBACK[\s\S]*ApplySharedMaterial/);
mustContain('Assets/Kawanakajima/Scripts/KawanakajimaRuntimeBootstrap.cs', 'runtime actor fallback marker', /KAWANAKAJIMA_UNITY_READY_FALLBACK[\s\S]*KAWANAKAJIMA_GLTF_ACTOR_FALLBACK[\s\S]*KAWANAKAJIMA_GLTF_PACK_FALLBACK/);
mustContain('Assets/Kawanakajima/Editor/KawanakajimaUnityBuild.cs', 'scene creation menu', /Create Or Refresh Scene/);
mustContain('Assets/Kawanakajima/Editor/KawanakajimaUnityBuild.cs', 'WebGL build hook', /BuildTarget\.WebGL/);
mustContain('Assets/Kawanakajima/Editor/KawanakajimaUnityBuild.cs', 'Linux build hook', /BuildTarget\.StandaloneLinux64/);
mustContain('Assets/Kawanakajima/Editor/KawanakajimaUnityBuild.cs', 'Mac build hook', /BuildTarget\.StandaloneOSX/);
mustContain('smoke-built-player.sh', 'built player readiness smoke test', /KAWANAKAJIMA_UNITY_READY[\s\S]*actors=20[\s\S]*Built player smoke: PASS/);
mustContain('patch-existing-mac-player-managed.sh', 'managed patch smoke helper', /Assembly-CSharp\.dll[\s\S]*Roslyn[\s\S]*smoke-built-player\.sh/);
mustContain('UNITY_CURRENT_QA_2026-06-21.md', 'real GLB managed patch smoke evidence', /KAWANAKAJIMA_UNITY_READY actors=20 pack=True audio=True fallbackActors=False fallbackPack=False/);
mustContain('README.md', 'verified local Unity build documented', /Verified Local Build[\s\S]*KawanakajimaUnityBuild\.BuildMac[\s\S]*Exit code 0/);
mustContain('UNITY_BUILD_VERIFICATION.md', 'Mac build success documented', /Build result: succeeded[\s\S]*Builds\/Mac\/KawanakajimaSamurai\.app/);
mustContain('UNITY_LOCAL_STATUS.md', 'Mac Unity MCP routing documented', /Worker routed URL:\s*`http:\/\/172\.21\.0\.1:25666`[\s\S]*Worker preflight: passed/);

if (errors.length) {
  console.error('UNITY HANDOFF VERIFICATION FAILS:');
  for (const error of errors) console.error(' - ' + error);
  process.exit(1);
}

console.log('UNITY HANDOFF STRUCTURE: PASS');
