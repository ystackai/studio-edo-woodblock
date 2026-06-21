import fs from "node:fs";
import path from "node:path";

const distRoot = "dist";
const entrypointFile = ".factoryx/preview-entrypoint";
const previewEntrypoint = fs.readFileSync(entrypointFile, "utf8").trim().split(/\r?\n/)[0];

if (!previewEntrypoint || path.isAbsolute(previewEntrypoint) || previewEntrypoint.includes("..")) {
  throw new Error(`Invalid FactoryX preview entrypoint: ${previewEntrypoint}`);
}

const gameDir = path.dirname(previewEntrypoint);
const requiredFiles = [
  previewEntrypoint,
  path.join(gameDir, "three.min.js"),
  path.join(gameDir, "GLTFLoader.js"),
  path.join(gameDir, "assets/samurai_character.glb"),
  path.join(gameDir, "assets/samurai_character_contact_sheet.png"),
  path.join(gameDir, "assets/samurai_character_hero.png"),
];
const requiredDirs = [
  path.join(gameDir, "assets/audio"),
];

function copyPath(source) {
  const target = path.join(distRoot, source);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.cpSync(source, target, { recursive: true });
}

fs.rmSync(distRoot, { recursive: true, force: true });
for (const source of requiredFiles) {
  copyPath(source);
}
for (const source of requiredDirs) {
  copyPath(source);
}

fs.mkdirSync(path.join(distRoot, ".factoryx"), { recursive: true });
fs.copyFileSync(entrypointFile, path.join(distRoot, entrypointFile));

console.log(`FactoryX preview package written to ${distRoot}/${gameDir}`);
