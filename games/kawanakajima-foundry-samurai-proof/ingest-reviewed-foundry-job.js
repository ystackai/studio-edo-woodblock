#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const GAME_DIR = __dirname;
const ROOT = path.resolve(GAME_DIR, '../..');
const UNITY_DIR = path.join(ROOT, 'unity/kawanakajima-samurai');
const BATTLEFIELD_DIR = path.join(GAME_DIR, 'assets/generated/foundry/samurai-battlefield-pack');

function fail(message) {
  console.error(message);
  process.exit(1);
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function copyFile(src, dest) {
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(src, dest);
}

function copyTree(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyTree(srcPath, destPath);
    } else if (entry.isFile()) {
      copyFile(srcPath, destPath);
    }
  }
}

function mustFile(file, description) {
  if (!fs.existsSync(file) || !fs.statSync(file).isFile() || fs.statSync(file).size < 1024) {
    fail(`Missing or tiny ${description}: ${file}`);
  }
}

function extractCurrentBattlefieldJob() {
  const verifyPath = path.join(GAME_DIR, 'verify.js');
  const match = fs.readFileSync(verifyPath, 'utf8').match(/const BATTLEFIELD_JOB = '([^']+)'/);
  if (!match) fail('Could not find BATTLEFIELD_JOB in verify.js');
  return match[1];
}

function replaceInFile(file, oldJobId, newJobId) {
  if (!fs.existsSync(file)) return;
  const before = fs.readFileSync(file, 'utf8');
  const after = before.split(oldJobId).join(newJobId);
  if (after !== before) fs.writeFileSync(file, after);
}

function main() {
  const jobDir = process.argv[2] ? path.resolve(process.argv[2]) : '';
  if (!jobDir) fail('Usage: node ingest-reviewed-foundry-job.js /path/to/asset-foundry/outputs/asset-...');
  if (!fs.existsSync(jobDir)) fail(`Job directory does not exist: ${jobDir}`);

  const spec = readJson(path.join(jobDir, 'spec.json'));
  const summary = readJson(path.join(jobDir, 'summary.json'));
  const status = readJson(path.join(jobDir, 'status.json'));
  const reviewPath = path.join(jobDir, 'review.json');
  const review = fs.existsSync(reviewPath) ? readJson(reviewPath) : status.review;

  if (!review || review.state !== 'passed') fail(`Refusing to ingest job without passed review state: ${jobDir}`);
  if (spec.recipe !== 'samurai_battlefield_pack') fail(`Expected samurai_battlefield_pack recipe, got: ${spec.recipe}`);
  if (status.state !== 'completed') fail(`Expected completed job, got: ${status.state}`);

  const jobId = spec.job_id || status.job_id || path.basename(jobDir);
  const stats = summary.stats || {};
  if (stats.warrior_count !== 20 || stats.takeda_count !== 10 || stats.uesugi_count !== 10) {
    fail(`Refusing battlefield job without 20-warrior 10/10 stats: ${JSON.stringify(stats)}`);
  }
  if (stats.stable_camera_views !== 5) {
    fail(`Refusing battlefield job without 5 stable camera views: ${JSON.stringify(stats)}`);
  }

  const required = [
    ['samurai_battlefield_pack.glb', 'battlefield GLB'],
    ['samurai_battlefield_pack_source.blend', 'source blend'],
    ['samurai_battlefield_manifest.json', 'manifest'],
    ['samurai_battlefield_contact_sheet.png', 'contact sheet'],
    ['samurai_battlefield_wide_clash.png', 'wide clash render'],
    ['samurai_battlefield_overhead_layout.png', 'overhead layout render'],
    ['samurai_battlefield_takeda_line.png', 'Takeda line render'],
    ['samurai_battlefield_uesugi_line.png', 'Uesugi line render'],
    ['samurai_battlefield_center_meeting.png', 'center meeting render'],
    ['review.json', 'review gate result'],
  ];
  for (const [name, description] of required) mustFile(path.join(jobDir, name), description);

  const oldJobId = extractCurrentBattlefieldJob();
  const destDir = path.join(BATTLEFIELD_DIR, jobId);
  copyTree(jobDir, destDir);

  copyFile(
    path.join(jobDir, 'samurai_battlefield_pack.glb'),
    path.join(UNITY_DIR, 'Assets/StreamingAssets/Kawanakajima/samurai_battlefield_pack.glb')
  );
  copyFile(
    path.join(jobDir, 'samurai_battlefield_manifest.json'),
    path.join(UNITY_DIR, 'Assets/StreamingAssets/Kawanakajima/samurai_battlefield_manifest.json')
  );
  copyFile(
    path.join(jobDir, 'samurai_battlefield_contact_sheet.png'),
    path.join(UNITY_DIR, 'Assets/Kawanakajima/Review/samurai_battlefield_contact_sheet.png')
  );
  copyFile(
    path.join(jobDir, 'samurai_battlefield_wide_clash.png'),
    path.join(UNITY_DIR, 'Assets/Kawanakajima/Review/samurai_battlefield_wide_clash.png')
  );

  const current = {
    jobId,
    ingestedAt: new Date().toISOString(),
    sourceJobDir: jobDir,
    reviewState: review.state,
    stats,
    browserPackUrl: `assets/generated/foundry/samurai-battlefield-pack/${jobId}/samurai_battlefield_pack.glb`,
    unityStreamingAssets: 'unity/kawanakajima-samurai/Assets/StreamingAssets/Kawanakajima/samurai_battlefield_pack.glb',
  };
  fs.writeFileSync(path.join(BATTLEFIELD_DIR, 'current-reviewed.json'), JSON.stringify(current, null, 2) + '\n');

  [
    path.join(GAME_DIR, 'index.html'),
    path.join(GAME_DIR, 'verify.js'),
    path.join(GAME_DIR, 'ASSET_MANIFEST.md'),
    path.join(GAME_DIR, 'DELIVERABLE_STATUS.md'),
    path.join(UNITY_DIR, 'README.md'),
  ].forEach(file => replaceInFile(file, oldJobId, jobId));

  console.log(JSON.stringify({ ingested: jobId, replaced: oldJobId, review: review.state, stats }, null, 2));
}

main();
