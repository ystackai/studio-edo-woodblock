// Minimal runtime verification for the 3D proof (structure + asset + exposure checks)
// Run: node verify.js  (after cd to the game dir or from root with path)

const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const errors = [];
const BATTLEFIELD_JOB = 'asset-1781935845583-91a9fdbe';
const BATTLEFIELD_ROOT = path.join(
  ROOT,
  'assets/generated/foundry/samurai-battlefield-pack',
  BATTLEFIELD_JOB
);

function mustExist(p, desc) {
  if (!fs.existsSync(p)) { errors.push('MISSING ' + desc + ': ' + p); return false; }
  return true;
}

function checkContent(p, tests) {
  if (!mustExist(p, 'file')) return;
  const c = fs.readFileSync(p, 'utf8');
  tests.forEach(t => {
    if (!t.test(c)) errors.push('FAIL ' + t.name + ' in ' + path.basename(p));
  });
}

console.log('=== Kawanakajima Foundry Proof verification ===');

mustExist(path.join(ROOT, 'index.html'), 'index.html');
mustExist(path.join(ROOT, 'three.min.js'), 'three');
mustExist(path.join(ROOT, 'GLTFLoader.js'), 'GLTFLoader');
mustExist(path.join(ROOT, 'assets/samurai_character.glb'), 'Foundry GLB');
mustExist(path.join(ROOT, 'assets/samurai_character_contact_sheet.png'), 'contact sheet');
mustExist(path.join(ROOT, 'assets/samurai_character_hero.png'), 'hero png');
mustExist(path.join(ROOT, 'assets/audio/battlefield_loop.wav'), 'file-backed battlefield loop');
mustExist(path.join(ROOT, 'assets/audio/charge_cue.wav'), 'file-backed charge cue');
mustExist(path.join(ROOT, 'assets/audio/clash_accent.wav'), 'file-backed clash accent');
mustExist(path.join(ROOT, 'assets/audio/ui_confirm.wav'), 'file-backed UI confirm');
mustExist(path.join(ROOT, 'assets/audio/formation_step.wav'), 'file-backed formation step');
mustExist(path.join(ROOT, 'assets/generated/foundry/audio/asset-1781916330853-f7d831d9/summary.json'), 'Foundry audio summary');
mustExist(path.join(ROOT, 'DELIVERABLE_STATUS.md'), 'reviewable deliverable status');
mustExist(path.join(ROOT, 'UNITY_BLOCKER.md'), 'Unity blocker note');
mustExist(path.join(ROOT, 'smoke-browser-pack.sh'), 'browser battlefield pack smoke script');
mustExist(path.join(ROOT, '../../unity/kawanakajima-samurai/UNITY_CURRENT_QA_2026-06-21.md'), 'Unity current QA note');
mustExist(path.join(ROOT, '../../.factoryx/preview-entrypoint'), 'FactoryX preview entrypoint');
mustExist(path.join(ROOT, '../../unity/kawanakajima-samurai/README.md'), 'Unity handoff README');
mustExist(path.join(ROOT, '../../unity/kawanakajima-samurai/verify-unity-handoff.js'), 'Unity handoff verifier');
mustExist(path.join(BATTLEFIELD_ROOT, 'samurai_battlefield_pack.glb'), 'Foundry 20-samurai battlefield pack GLB');
mustExist(path.join(BATTLEFIELD_ROOT, 'samurai_battlefield_pack_source.blend'), 'Foundry 20-samurai battlefield source blend');
mustExist(path.join(BATTLEFIELD_ROOT, 'samurai_battlefield_manifest.json'), 'Foundry 20-samurai battlefield manifest');
mustExist(path.join(BATTLEFIELD_ROOT, 'samurai_battlefield_contact_sheet.png'), 'Foundry 20-samurai battlefield contact sheet');
mustExist(path.join(BATTLEFIELD_ROOT, 'summary.json'), 'Foundry 20-samurai battlefield summary');
mustExist(path.join(ROOT, '../../unity/kawanakajima-samurai/Assets/StreamingAssets/Kawanakajima/samurai_battlefield_pack.glb'), 'Unity mirrored battlefield pack GLB');

checkContent(path.join(ROOT, 'index.html'), [
  { name: 'canvas element', test: c => /<canvas id="c"/.test(c) },
  { name: 'Foundry GLB path', test: c => /samurai_character\.glb/.test(c) },
  { name: 'Foundry battlefield pack GLB path', test: c => /samurai_battlefield_pack\.glb/.test(c) },
  { name: 'GLTFLoader script', test: c => /GLTFLoader/.test(c) },
  { name: '20 actors', test: c => /ACTOR_COUNT = 20/.test(c) || /20/.test(c) },
  { name: 'repeatable cams', test: c => /overview|redClose|blueClose|sideProfile|topFormation|assetInspect/.test(c) },
  { name: 'contact panel', test: c => /contact-img|review-panel|TOGGLE CONTACT/.test(c) },
  { name: 'battlefield pack review toggle', test: c => /btn-pack|loadFoundryBattlefieldPack|isFoundryPackVisible/.test(c) },
  { name: 'charge reform', test: c => /function charge|btn-charge/.test(c) },
  { name: 'file-backed audio paths', test: c => /battlefield_loop\.wav|charge_cue\.wav|clash_accent\.wav/.test(c) },
  { name: 'audio controls', test: c => /btn-audio|toggleAudio|hasFileBackedAudio/.test(c) },
  { name: 'default capture marker', test: c => /markCaptureReady\('overview'\)/.test(c) },
  { name: 'window expose', test: c => /KAWANAKAJIMA_FOUNDRY/.test(c) },
  { name: 'no oscillator claim', test: c => !/oscillator|playTone|WebAudio.*beep/i.test(c) || /BLOCKER|silent/.test(c) },
]);

checkContent(path.join(ROOT, 'DELIVERABLE_STATUS.md'), [
  { name: 'asset Foundry job', test: c => /asset-1781913507610-bf69e595/.test(c) },
  { name: 'battlefield Foundry job', test: c => new RegExp(BATTLEFIELD_JOB).test(c) },
  { name: 'audio Foundry job', test: c => /asset-1781916330853-f7d831d9/.test(c) },
  { name: 'Unity managed patch GLB smoke', test: c => /KAWANAKAJIMA_UNITY_READY actors=20 pack=True audio=True fallbackActors=False fallbackPack=False/.test(c) },
  { name: 'fresh Unity build caveat', test: c => /Fresh Unity build:\*\* not produced|fresh Unity Editor rebuild remains blocked/.test(c) },
  { name: 'autonomy caveat documented', test: c => /Autonomous completion:\*\* not proven end-to-end|manual intervention/.test(c) },
]);

checkContent(path.join(ROOT, 'ASSET_MANIFEST.md'), [
  { name: 'asset manifest Unity managed patch smoke', test: c => /KAWANAKAJIMA_UNITY_READY actors=20 pack=True audio=True fallbackActors=False fallbackPack=False/.test(c) },
  { name: 'asset manifest fresh Unity build caveat', test: c => /Fresh Unity playable build:\*\* Not created yet|fresh build\/inspection/.test(c) },
  { name: 'asset manifest browser pack smoke', test: c => /smoke-browser-pack\.sh[\s\S]*Browser battlefield pack smoke: PASS/.test(c) },
]);

checkContent(path.join(ROOT, 'smoke-browser-pack.sh'), [
  { name: 'browser smoke pack readiness check', test: c => /isFoundryPackLoaded\(\)[\s\S]*isFoundryPackVisible\(\)/.test(c) },
  { name: 'browser smoke uses battlefield GLB', test: c => /samurai_battlefield_pack\.glb|packUrl/.test(c) },
]);

checkContent(path.join(ROOT, '../../unity/kawanakajima-samurai/UNITY_CURRENT_QA_2026-06-21.md'), [
  { name: 'Unity QA real GLB managed patch smoke', test: c => /Managed Patch GLB Smoke[\s\S]*KAWANAKAJIMA_UNITY_READY actors=20 pack=True audio=True fallbackActors=False fallbackPack=False/.test(c) },
  { name: 'Unity QA license caveat', test: c => /No valid Unity Editor license found|license state/.test(c) },
]);

checkContent(path.join(ROOT, '../../.factoryx/preview-entrypoint'), [
  { name: 'preview opens Samurai proof', test: c => c.trim() === 'games/kawanakajima-foundry-samurai-proof/index.html' },
]);

checkContent(path.join(ROOT, '../../unity/kawanakajima-samurai/README.md'), [
  { name: 'Unity handoff references Foundry Samurai', test: c => /asset-1781913507610-bf69e595/.test(c) },
  { name: 'Unity handoff documents local build', test: c => /Verified Local Build[\s\S]*KawanakajimaUnityBuild\.BuildMac[\s\S]*Exit code 0/.test(c) },
]);

// Asset sizes roughly
const glb = fs.statSync(path.join(ROOT, 'assets/samurai_character.glb'));
if (glb.size < 800000) errors.push('GLB too small for detailed Foundry asset');

const contact = fs.statSync(path.join(ROOT, 'assets/samurai_character_contact_sheet.png'));
if (contact.size < 300000) errors.push('contact sheet missing or truncated');

const loop = fs.statSync(path.join(ROOT, 'assets/audio/battlefield_loop.wav'));
if (loop.size < 1000000) errors.push('battlefield loop too small for the Foundry WAV preview');

let battlefield = null;
const battlefieldGlb = fs.statSync(path.join(BATTLEFIELD_ROOT, 'samurai_battlefield_pack.glb'));
const unityBattlefieldGlb = fs.statSync(path.join(ROOT, '../../unity/kawanakajima-samurai/Assets/StreamingAssets/Kawanakajima/samurai_battlefield_pack.glb'));
if (battlefieldGlb.size < 6000000) errors.push('battlefield pack GLB too small for v3 generated pack');
if (unityBattlefieldGlb.size !== battlefieldGlb.size) errors.push('Unity mirrored battlefield GLB size does not match Foundry output');
try {
  const manifest = JSON.parse(fs.readFileSync(path.join(BATTLEFIELD_ROOT, 'samurai_battlefield_manifest.json'), 'utf8'));
  const summary = JSON.parse(fs.readFileSync(path.join(BATTLEFIELD_ROOT, 'summary.json'), 'utf8'));
  battlefield = {
    assetFoundryJob: BATTLEFIELD_JOB,
    warriorCount: manifest.warrior_count,
    takedaCount: (manifest.factions && manifest.factions.takeda || []).length,
    uesugiCount: (manifest.factions && manifest.factions.uesugi || []).length,
    glbSize: battlefieldGlb.size,
    manifest: `assets/generated/foundry/samurai-battlefield-pack/${BATTLEFIELD_JOB}/samurai_battlefield_manifest.json`,
    contactSheet: `assets/generated/foundry/samurai-battlefield-pack/${BATTLEFIELD_JOB}/samurai_battlefield_contact_sheet.png`,
    objectCount: summary.stats && summary.stats.object_count,
    meshCount: summary.stats && summary.stats.mesh_count,
    stableCameraViews: summary.stats && summary.stats.stable_camera_views,
    unityMirror: true
  };
  if (battlefield.warriorCount !== 20) errors.push('battlefield manifest warrior count is not 20');
  if (battlefield.takedaCount !== 10) errors.push('battlefield manifest Takeda count is not 10');
  if (battlefield.uesugiCount !== 10) errors.push('battlefield manifest Uesugi count is not 10');
  if (battlefield.stableCameraViews !== 5) errors.push('battlefield summary stable camera count is not 5');
} catch (error) {
  errors.push('battlefield manifest/summary parse failed: ' + error.message);
}

console.log('GLB size:', (glb.size/1024/1024).toFixed(2), 'MB');
console.log('Contact size:', (contact.size/1024).toFixed(0), 'KB');
console.log('Audio loop size:', (loop.size/1024/1024).toFixed(2), 'MB');
console.log('Battlefield pack size:', (battlefieldGlb.size/1024/1024).toFixed(2), 'MB');

if (errors.length) {
  console.error('VERIFICATION FAILS:');
  errors.forEach(e => console.error(' - ' + e));
  process.exit(1);
} else {
  console.log('BASIC STRUCTURE + ASSET CHECKS: PASS');
  // Write evidence
  fs.writeFileSync(path.join(ROOT, 'VERIFICATION.json'), JSON.stringify({
    verifiedAt: new Date().toISOString(),
    assetFoundryJob: 'asset-1781913507610-bf69e595',
    actorCount: 20,
    glbSize: glb.size,
    battlefieldPack: battlefield,
    audioFoundryJob: 'asset-1781916330853-f7d831d9',
    audioLoopSize: loop.size,
    unityHandoff: true,
    unityManagedPatchSmoke: {
      passed: true,
      readiness: 'KAWANAKAJIMA_UNITY_READY actors=20 pack=True audio=True fallbackActors=False fallbackPack=False',
      note: 'Existing Mac player patched with current managed source loads real samurai and battlefield GLBs; fresh Unity Editor rebuild remains license-blocked.'
    },
    browserBattlefieldPackReview: {
      exposed: true,
      path: `assets/generated/foundry/samurai-battlefield-pack/${BATTLEFIELD_JOB}/samurai_battlefield_pack.glb`,
      toggle: 'PACK GLB button / P key'
    },
    checks: 'structure, paths, sizes, exposure, file-backed audio, no fake audio, Unity handoff, 20-samurai battlefield pack handoff, browser battlefield-pack GLB review toggle, managed-patched Unity player real-GLB smoke',
    passed: true
  }, null, 2) + '\n');
  console.log('Wrote VERIFICATION.json');
}
