#!/usr/bin/env node
/**
 * Generate 20 minimal but valid file-backed samurai GLB models for Battles of Kawanakajima.
 * 10 Takeda + 10 Uesugi. Differentiated by helmet crest, weapon, slight proportions, vertex colors.
 * Pure JS, no external deps. Produces real geometry (not placeholders) under assets/models/.
 *
 * Each model is a low-poly standing armored figure (~300 tris) with:
 *  - torso, head, helmet+crest (variant), arms, legs, weapon (variant)
 *  - vertex colors for clan tint + figure variation
 *  - normals for basic shading
 *
 * Output: games/94-kawanakajima/assets/models/{takeda,uesugi}-NN.glb
 */

const fs = require('fs');
const path = require('path');

const OUT_DIR = path.join(__dirname, '..', 'games', '94-kawanakajima', 'assets', 'models');
fs.mkdirSync(OUT_DIR, { recursive: true });

const TAKEDA = 10;
const UESUGI = 10;

// glTF constants
const GLTF_VERSION = 2;
const MAGIC = 0x46546C67; // 'glTF'
const JSON_CHUNK = 0x4E4F534A; // 'JSON'
const BIN_CHUNK = 0x004E4942;  // 'BIN\0'
const FLOAT = 5126;
const USHORT = 5123;
const VEC3 = 'VEC3';
const SCALAR = 'SCALAR';
const ARRAY_BUFFER = 34962;
const ELEMENT_ARRAY_BUFFER = 34963;

// --- Geometry helpers ---

function push3(arr, x, y, z) { arr.push(x, y, z); }
function pushColor(arr, r, g, b) { arr.push(r, g, b); } // VEC3 colors

function makeIdentityMatrix() {
  return [1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1];
}

function transformPoint(m, p) {
  // m is 4x4 row-major-ish, simple affine for our use
  const x = p[0], y = p[1], z = p[2];
  return [
    m[0]*x + m[4]*y + m[8]*z + m[12],
    m[1]*x + m[5]*y + m[9]*z + m[13],
    m[2]*x + m[6]*y + m[10]*z + m[14]
  ];
}

function makeTranslate(x, y, z) {
  const m = makeIdentityMatrix();
  m[12] = x; m[13] = y; m[14] = z;
  return m;
}
function makeScale(sx, sy, sz) {
  const m = makeIdentityMatrix();
  m[0]=sx; m[5]=sy; m[10]=sz;
  return m;
}
function compose(m1, m2) {
  // m1 * m2 (apply m2 then m1)
  const o = new Array(16);
  for (let r=0; r<4; r++) for (let c=0; c<4; c++) {
    o[r*4+c] = m1[r*4+0]*m2[0*4+c] + m1[r*4+1]*m2[1*4+c] + m1[r*4+2]*m2[2*4+c] + m1[r*4+3]*m2[3*4+c];
  }
  return o;
}

function addBox(verts, norms, colors, indices, baseIdx, cx, cy, cz, sx, sy, sz, cr, cg, cb, rx=0, ry=0, rz=0) {
  // axis aligned box centered, simple; rx/ry/rz not full rot for minimal, we pre-rotate verts if needed
  const hx = sx/2, hy = sy/2, hz = sz/2;
  const corners = [
    [-hx,-hy,-hz], [ hx,-hy,-hz], [ hx, hy,-hz], [-hx, hy,-hz],
    [-hx,-hy, hz], [ hx,-hy, hz], [ hx, hy, hz], [-hx, hy, hz],
  ];
  const faceNorms = [
    [0,0,-1],[1,0,0],[0,0,1],[-1,0,0],[0,-1,0],[0,1,0]
  ];
  const faces = [
    [0,1,2,3], [1,5,6,2], [5,4,7,6], [4,0,3,7], [3,2,6,7], [4,5,1,0]
  ];
  const start = verts.length / 3;
  for (let i=0; i<8; i++) {
    let p = corners[i];
    // apply simple axis rot around center for crest etc (limited)
    if (rx) { const c=Math.cos(rx),s=Math.sin(rx); const y=p[1],z=p[2]; p[1]=y*c - z*s; p[2]=y*s + z*c; }
    if (ry) { const c=Math.cos(ry),s=Math.sin(ry); const x=p[0],z=p[2]; p[0]=x*c + z*s; p[2]=-x*s + z*c; }
    if (rz) { const c=Math.cos(rz),s=Math.sin(rz); const x=p[0],y=p[1]; p[0]=x*c - y*s; p[1]=x*s + y*c; }
    push3(verts, cx + p[0], cy + p[1], cz + p[2]);
    // crude normal from face later; we'll set per-face by duplicating verts for flat shading
  }
  // To keep simple and flat-shaded normals correct, duplicate per face (common for lowpoly)
  // Rebuild using per-face
  // Simpler: clear last 8, redo with 24 verts (4 per face *6)
  // For brevity in generator, use shared verts + averaged or face-dupe. We'll dupe for correctness.
  // Reset and dupe:
  verts.length = start*3; norms.length = start*3; colors.length = start*3; // revert shared
  let vidx = start;
  const faceIdxBase = [];
  for (let f=0; f<6; f++) {
    const n = faceNorms[f];
    const fv = faces[f];
    const faceStart = vidx;
    for (let k=0; k<4; k++) {
      let p = corners[fv[k]];
      if (rx) { const c=Math.cos(rx),s=Math.sin(rx); const y=p[1],z=p[2]; p[1]=y*c - z*s; p[2]=y*s + z*c; }
      if (ry) { const c=Math.cos(ry),s=Math.sin(ry); const x=p[0],z=p[2]; p[0]=x*c + z*s; p[2]=-x*s + z*c; }
      if (rz) { const c=Math.cos(rz),s=Math.sin(rz); const x=p[0],y=p[1]; p[0]=x*c - y*s; p[1]=x*s + y*c; }
      push3(verts, cx+p[0], cy+p[1], cz+p[2]);
      push3(norms, n[0], n[1], n[2]);
      pushColor(colors, cr, cg, cb);
      vidx++;
    }
    // two tris
    indices.push(faceStart+0, faceStart+1, faceStart+2);
    indices.push(faceStart+0, faceStart+2, faceStart+3);
  }
  return vidx;
}

function addWedge(verts, norms, colors, indices, cx, cy, cz, sx, sy, sz, cr,cg,cb, rotY=0) {
  // simple wedge/pyramid-ish for crest
  const hx=sx/2, hy=sy/2, hz=sz/2;
  const pts = [
    [-hx, -hy, -hz], [hx, -hy, -hz], [0, hy, 0], // front tri + base?
  ];
  // make a flat crest plate + spike
  // 3 sided spike on a bar
  const baseY = -hy*0.2;
  const p0 = [-hx, baseY, -hz], p1=[hx, baseY, -hz], p2=[hx, baseY, hz], p3=[-hx, baseY, hz];
  const tip = [0, hy, 0];
  const start = verts.length/3;
  // base quad
  for (const p of [p0,p1,p2,p3]) {
    let [x,y,z] = p; if (rotY){ const c=Math.cos(rotY),s=Math.sin(rotY); [x,z]=[x*c+z*s, -x*s + z*c]; }
    push3(verts, cx+x,cy+y,cz+z); push3(norms, 0, -1, 0); pushColor(colors, cr,cg,cb);
  }
  indices.push(start+0, start+1, start+2, start+0, start+2, start+3);
  // sides to tip (3 faces)
  const tipIdx = verts.length/3;
  let [tx,ty,tz] = tip; if(rotY){ const c=Math.cos(rotY),s=Math.sin(rotY); [tx,tz]=[tx*c+tz*s, -tx*s + tz*c]; }
  push3(verts, cx+tx, cy+ty, cz+tz); push3(norms, 0,1,0); pushColor(colors, cr,cg,cb);
  // tri sides
  indices.push(start+0, start+1, tipIdx);
  indices.push(start+1, start+2, tipIdx);
  indices.push(start+2, start+3, tipIdx);
  indices.push(start+3, start+0, tipIdx);
}

function addCylinder(verts, norms, colors, indices, cx,cy,cz, r, h, cr,cg,cb, segs=8, rotY=0) {
  const start = verts.length / 3;
  const top = [], bot = [];
  for (let i=0; i<segs; i++) {
    const a = (i / segs) * Math.PI * 2;
    let x = Math.cos(a) * r, z = Math.sin(a) * r;
    if (rotY) { const c=Math.cos(rotY),s=Math.sin(rotY); [x,z] = [x*c + z*s, -x*s + z*c]; }
    // bot
    push3(verts, cx+x, cy - h/2, cz+z); push3(norms, x/r, 0, z/r); pushColor(colors, cr,cg,cb);
    bot.push(start + i);
    // top
    const ti = start + segs + i;
    push3(verts, cx+x, cy + h/2, cz+z); push3(norms, x/r, 0, z/r); pushColor(colors, cr,cg,cb);
    top.push(ti);
  }
  // caps + walls
  const capC = verts.length/3;
  push3(verts, cx,cy-h/2,cz); push3(norms,0,-1,0); pushColor(colors,cr,cg,cb);
  const capT = verts.length/3;
  push3(verts, cx,cy+h/2,cz); push3(norms,0,1,0); pushColor(colors,cr,cg,cb);
  for (let i=0;i<segs;i++) {
    const j = (i+1)%segs;
    // wall
    indices.push(bot[i], bot[j], top[j]);
    indices.push(bot[i], top[j], top[i]);
    // bottom cap
    indices.push(capC, bot[i], bot[j]);
    // top cap
    indices.push(capT, top[j], top[i]);
  }
}

function buildSamuraiMesh(variant) {
  // variant: { clan:'t'|'u', id:1..10, crest:'horn'|'fan'|'plume'..., weapon:'yari'|'tachi'|'kanabo' }
  const verts = [], norms = [], colors = [], indices = [];

  const isTakeda = variant.clan === 't';
  const hue = isTakeda ? 0.02 : 0.62; // red vs indigo bias
  const sat = 0.65;
  const vbase = 0.45;

  function col(v) { // vary slightly
    const r = Math.min(1, Math.max(0, hue > 0.5 ? (0.15 + v*0.2) : (0.55 + v*0.35)));
    const g = Math.min(1, Math.max(0, 0.12 + (isTakeda ? v*0.08 : v*0.18)));
    const b = Math.min(1, Math.max(0, hue > 0.5 ? (0.35 + v*0.25) : (0.22 + v*0.1)));
    return [r, g, b];
  }

  const mainCol = col(0.7);
  const darkCol = col(0.2);
  const crestCol = isTakeda ? [0.75,0.22,0.08] : [0.18,0.25,0.55];
  const metalCol = [0.6,0.55,0.45];

  // TORSO armor (slightly tapered)
  addBox(verts, norms, colors, indices, 0, 0, 0.35, 0, 0.38, 0.55, 0.22, ...mainCol);

  // HEAD
  addBox(verts, norms, colors, indices, 0, 0, 0.85, 0, 0.22, 0.22, 0.22, ...mainCol);

  // HELMET base + variant crest
  addBox(verts, norms, colors, indices, 0, 0, 0.97, 0, 0.28, 0.12, 0.26, ...darkCol, 0, 0.1, 0); // slight tilt

  // Crest geometry (differentiated)
  const crestType = variant.crest;
  if (crestType === 'horn' || crestType === 'antler') {
    // two swept horns
    addWedge(verts, norms, colors, indices, -0.18, 1.12, 0, 0.06, 0.32, 0.04, ...crestCol, 0.3);
    addWedge(verts, norms, colors, indices,  0.18, 1.12, 0, 0.06, 0.32, 0.04, ...crestCol, -0.3);
  } else if (crestType === 'fan' || crestType === 'plume') {
    // wide fan plate
    addWedge(verts, norms, colors, indices, 0, 1.05, 0, 0.32, 0.28, 0.03, ...crestCol, 0);
  } else if (crestType === 'sun' || crestType === 'crescent') {
    // radial spikes or arc
    for (let k=-2; k<=2; k++) {
      addWedge(verts, norms, colors, indices, k*0.07, 1.08, 0, 0.04, 0.18, 0.02, ...crestCol, k*0.2);
    }
  } else {
    // default spike
    addWedge(verts, norms, colors, indices, 0, 1.15, 0, 0.05, 0.38, 0.03, ...crestCol);
  }

  // SHOULDERS / pauldrons
  addBox(verts, norms, colors, indices, 0, -0.32, 0.58, 0, 0.18, 0.16, 0.32, ...darkCol);
  addBox(verts, norms, colors, indices, 0,  0.32, 0.58, 0, 0.18, 0.16, 0.32, ...darkCol);

  // ARMS (simple)
  addBox(verts, norms, colors, indices, 0, -0.42, 0.22, 0, 0.11, 0.48, 0.11, ...mainCol, 0.2);
  addBox(verts, norms, colors, indices, 0,  0.42, 0.22, 0, 0.11, 0.48, 0.11, ...mainCol, -0.2);

  // LEGS
  addBox(verts, norms, colors, indices, 0, -0.14, -0.05, 0, 0.12, 0.42, 0.14, ...darkCol);
  addBox(verts, norms, colors, indices, 0,  0.14, -0.05, 0, 0.12, 0.42, 0.14, ...darkCol);

  // WEAPON (variant)
  const w = variant.weapon;
  if (w === 'yari' || w === 'spear') {
    // long shaft + blade tip
    addBox(verts, norms, colors, indices, 0, -0.55, 0.05, -0.02, 0.03, 0.82, 0.03, ...metalCol, 0.6);
    addWedge(verts, norms, colors, indices, -0.55, 0.52, -0.02, 0.04, 0.18, 0.02, ...[0.7,0.65,0.55], -0.4);
  } else if (w === 'tachi' || w === 'sword') {
    // curved-ish side sword (use rotated box + tip)
    addBox(verts, norms, colors, indices, 0, -0.48, 0.02, 0.18, 0.03, 0.42, 0.04, ...metalCol, 0, 1.2, 0);
    addWedge(verts, norms, colors, indices, -0.48, 0.28, 0.18, 0.03, 0.12, 0.02, ...[0.65,0.6,0.5], 1.1);
  } else if (w === 'kanabo' || w === 'club') {
    addCylinder(verts, norms, colors, indices, -0.52, 0.08, 0.12, 0.05, 0.55, ...[0.4,0.38,0.35], 6, 0.3);
  } else {
    // banner or naginata default
    addBox(verts, norms, colors, indices, 0, -0.58, 0.38, -0.04, 0.02, 0.65, 0.02, ...metalCol);
    addBox(verts, norms, colors, indices, 0, -0.58, 0.72, -0.04, 0.12, 0.18, 0.01, ...crestCol, 0,0,0.6);
  }

  // small mon / clan mark on chest (flat quad)
  const monR = isTakeda ? 0.82 : 0.25;
  const monG = isTakeda ? 0.18 : 0.32;
  const monB = isTakeda ? 0.08 : 0.48;
  const mstart = verts.length/3;
  const my = 0.42, mz = 0.12;
  const ms = 0.06;
  push3(verts, -ms, my, mz); push3(norms, 0,0,1); pushColor(colors, monR,monG,monB);
  push3(verts,  ms, my, mz); push3(norms, 0,0,1); pushColor(colors, monR,monG,monB);
  push3(verts,  ms, my+ms*1.6, mz); push3(norms, 0,0,1); pushColor(colors, monR,monG,monB);
  push3(verts, -ms, my+ms*1.6, mz); push3(norms, 0,0,1); pushColor(colors, monR,monG,monB);
  indices.push(mstart, mstart+1, mstart+2, mstart, mstart+2, mstart+3);

  // compute bounds for accessor
  let min = [Infinity,Infinity,Infinity], max = [-Infinity,-Infinity,-Infinity];
  for (let i=0; i<verts.length; i+=3) {
    min[0] = Math.min(min[0], verts[i]);
    min[1] = Math.min(min[1], verts[i+1]);
    min[2] = Math.min(min[2], verts[i+2]);
    max[0] = Math.max(max[0], verts[i]);
    max[1] = Math.max(max[1], verts[i+1]);
    max[2] = Math.max(max[2], verts[i+2]);
  }

  return { verts, norms, colors, indices, min, max, triCount: indices.length / 3 };
}

function buildGLB(meshData) {
  const { verts, norms, colors, indices, min, max, triCount } = meshData;

  const posBytes = verts.length * 4;
  const normBytes = norms.length * 4;
  const colBytes = colors.length * 4;
  const idxBytes = indices.length * 2;

  // layout: pos | norm | col | idx (align)
  let binOffset = 0;
  const posView = { offset: binOffset, len: posBytes }; binOffset += posBytes;
  const normView = { offset: binOffset, len: normBytes }; binOffset += normBytes;
  const colView = { offset: binOffset, len: colBytes }; binOffset += colBytes;
  // pad idx to 4
  const pad = (4 - (binOffset % 4)) % 4;
  binOffset += pad;
  const idxView = { offset: binOffset, len: idxBytes }; binOffset += idxBytes;
  const totalBin = binOffset;

  // Build JSON
  const bufferViews = [
    { buffer: 0, byteOffset: posView.offset, byteLength: posView.len, target: ARRAY_BUFFER },
    { buffer: 0, byteOffset: normView.offset, byteLength: normView.len, target: ARRAY_BUFFER },
    { buffer: 0, byteOffset: colView.offset, byteLength: colView.len, target: ARRAY_BUFFER },
    { buffer: 0, byteOffset: idxView.offset, byteLength: idxView.len, target: ELEMENT_ARRAY_BUFFER },
  ];
  const accessors = [
    { bufferView: 0, componentType: FLOAT, count: verts.length/3, type: VEC3, min, max },
    { bufferView: 1, componentType: FLOAT, count: norms.length/3, type: VEC3 },
    { bufferView: 2, componentType: FLOAT, count: colors.length/3, type: VEC3 },
    { bufferView: 3, componentType: USHORT, count: indices.length, type: SCALAR },
  ];
  const json = {
    asset: { version: '2.0', generator: 'edo-woodblock-kawanakajima-glbgen' },
    scene: 0,
    scenes: [ { nodes: [0] } ],
    nodes: [ { name: 'samurai', mesh: 0 } ],
    meshes: [ {
      name: 'samurai',
      primitives: [ {
        attributes: { POSITION: 0, NORMAL: 1, COLOR_0: 2 },
        indices: 3,
        material: 0
      } ]
    } ],
    materials: [ {
      name: 'ink-paper',
      pbrMetallicRoughness: { baseColorFactor: [0.96, 0.94, 0.90, 1.0], metallicFactor: 0.0, roughnessFactor: 0.9 },
      emissiveFactor: [0.0,0.0,0.0],
      doubleSided: true
    } ],
    buffers: [ { byteLength: totalBin } ],
    bufferViews,
    accessors
  };

  const jsonStr = JSON.stringify(json);
  const jsonPadded = jsonStr + ' '.repeat( (4 - (jsonStr.length % 4)) % 4 );
  const jsonLen = jsonPadded.length;

  // total length = 12 + 8 + jsonLen + 8 + totalBin
  const totalLen = 12 + 8 + jsonLen + 8 + totalBin;

  const buf = Buffer.alloc(totalLen);
  let o = 0;
  // header
  buf.writeUInt32LE(MAGIC, o); o+=4;
  buf.writeUInt32LE(GLTF_VERSION, o); o+=4;
  buf.writeUInt32LE(totalLen, o); o+=4;
  // json chunk
  buf.writeUInt32LE(jsonLen, o); o+=4;
  buf.writeUInt32LE(JSON_CHUNK, o); o+=4;
  buf.write(jsonPadded, o, 'utf8'); o += jsonLen;
  // bin chunk
  buf.writeUInt32LE(totalBin, o); o+=4;
  buf.writeUInt32LE(BIN_CHUNK, o); o+=4;

  // write binary data
  // pos
  for (let i=0; i<verts.length; i++) buf.writeFloatLE(verts[i], o + posView.offset + i*4);
  // norm
  for (let i=0; i<norms.length; i++) buf.writeFloatLE(norms[i], o + normView.offset + i*4);
  // color
  for (let i=0; i<colors.length; i++) buf.writeFloatLE(colors[i], o + colView.offset + i*4);
  // idx (after pad)
  const idxBase = o + idxView.offset;
  for (let i=0; i<indices.length; i++) buf.writeUInt16LE(indices[i], idxBase + i*2);

  return buf;
}

function variantFor(clan, id) {
  const isT = clan === 't';
  const crestPoolT = ['horn','antler','sun','fan','spike'];
  const crestPoolU = ['plume','crescent','fan','cross','spike'];
  const weaponPool = ['yari','tachi','kanabo','naginata','spear'];
  const crest = isT ? crestPoolT[(id-1) % crestPoolT.length] : crestPoolU[(id-1) % crestPoolU.length];
  const weapon = weaponPool[(id + (isT ? 1:2)) % weaponPool.length];
  return { clan, id, crest, weapon };
}

function generateAll() {
  const manifest = [];
  for (let i=1; i<=TAKEDA; i++) {
    const v = variantFor('t', i);
    const mesh = buildSamuraiMesh(v);
    const glb = buildGLB(mesh);
    const name = `takeda-${String(i).padStart(2,'0')}.glb`;
    fs.writeFileSync(path.join(OUT_DIR, name), glb);
    manifest.push({ name, clan:'Takeda', id:i, bytes: glb.length, tris: mesh.triCount, crest: v.crest, weapon: v.weapon });
    console.log('WROTE', name, glb.length, 'bytes', mesh.triCount, 'tris');
  }
  for (let i=1; i<=UESUGI; i++) {
    const v = variantFor('u', i);
    const mesh = buildSamuraiMesh(v);
    const glb = buildGLB(mesh);
    const name = `uesugi-${String(i).padStart(2,'0')}.glb`;
    fs.writeFileSync(path.join(OUT_DIR, name), glb);
    manifest.push({ name, clan:'Uesugi', id:i, bytes: glb.length, tris: mesh.triCount, crest: v.crest, weapon: v.weapon });
    console.log('WROTE', name, glb.length, 'bytes', mesh.triCount, 'tris');
  }
  return manifest;
}

const man = generateAll();
console.log('\n=== Generated', man.length, 'samurai GLB models ===');
console.log(JSON.stringify(man, null, 2));
