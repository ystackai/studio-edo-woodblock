// Edo Inkblade Audio Asset Generator
// Generates WAV audio files for game soundtrack and SFX
// Uses mathematical synthesis with culturally-informed Edo instrument modeling

const fs = require('fs');
const path = require('path');

const SAMPLE_RATE = 44100;
const TARGET_DIR = path.join(__dirname, 'assets', 'audio');

function writeWav(filepath, samples) {
  const numChannels = 1;
  const bitsPerSample = 16;
  const data = new Int16Array(samples.length);
  for (let i = 0; i < samples.length; i++) {
    data[i] = Math.max(-32768, Math.min(32767, Math.floor(samples[i] * 32767)));
  }
  const dataSize = data.length * (bitsPerSample / 8);
  const headerSize = 44;
  const buf = Buffer.alloc(headerSize + dataSize);
  // RIFF header
  buf.write('RIFF', 0);
  buf.writeUInt32LE(headerSize + dataSize - 8, 4);
  buf.write('WAVE', 8);
  buf.write('fmt ', 12);
  buf.writeUInt32LE(16, 16); // chunk size
  buf.writeUInt16LE(1, 20); // PCM format
  buf.writeUInt16LE(numChannels, 22);
  buf.writeUInt32LE(SAMPLE_RATE, 24);
  buf.writeUInt32LE(SAMPLE_RATE * numChannels * (bitsPerSample / 8), 28);
  buf.writeUInt16LE(numChannels * (bitsPerSample / 8), 32);
  buf.writeUInt16LE(bitsPerSample, 34);
  buf.write('data', 36);
  buf.writeUInt32LE(dataSize, 40);
  // Write samples
  for (let i = 0; i < data.length; i++) {
    buf.writeInt16LE(data[i], headerSize + i * 2);
  }
  fs.writeFileSync(filepath, buf);
}

function generateSine(freq, dur, amp, phase) {
  const len = Math.floor(SAMPLE_RATE * dur);
  const out = new Float32Array(len);
  for (let i = 0; i < len; i++) {
    out[i] = amp * Math.sin(2 * Math.PI * freq * (i / SAMPLE_RATE) + (phase || 0));
  }
  return out;
}

function generateNoise(dur, amp) {
  const len = Math.floor(SAMPLE_RATE * dur);
  const out = new Float32Array(len);
  for (let i = 0; i < len; i++) {
    out[i] = amp * (Math.random() * 2 - 1);
  }
  return out;
}

function applyEnvelope(samples, attack, decay, sustainLevel, release) {
  const len = samples.length;
  const a = Math.floor(SAMPLE_RATE * attack);
  const d = Math.floor(SAMPLE_RATE * decay);
  const rStart = Math.floor(len - SAMPLE_RATE * release);
  const out = new Float32Array(len);
  for (let i = 0; i < len; i++) {
    let env = 0;
    if (i < a) env = i / a;
    else if (i < a + d) env = 1 - (1 - sustainLevel) * ((i - a) / d);
    else if (i < rStart) env = sustainLevel;
    else env = sustainLevel * (1 - (i - rStart) / (len - rStart));
    out[i] = samples[i] * env;
  }
  return out;
}

function applyLowpass(samples, cutoff, resonance) {
  const len = samples.length;
  const out = new Float32Array(len);
  const dt = 1 / SAMPLE_RATE;
  const w = 2 * Math.PI * cutoff * dt;
  const alpha = Math.sin(w) / (2 * resonance + Math.sin(w) / 2 || 0.5);
  let y0 = 0, y1 = 0, y2 = 0, y3 = 0, x0 = 0, x1 = 0, x2 = 0, x3 = 0;
  for (let i = 0; i < len; i++) {
    const input = samples[i] - resonance * y3;
    y0 = input * alpha + 2 * (y1 * (1 - alpha) - y2 * alpha) + y3 * (1 - alpha);
    y1 = y0; y2 = y1; y3 = y2;
    out[i] = y0 || 0;
  }
  return out;
}

function applyBandpass(samples, center, q) {
  const len = samples.length;
  const out = new Float32Array(len);
  const dt = 1 / SAMPLE_RATE;
  const w0 = 2 * Math.PI * center * dt;
  const bw = center / q;
  const alpha = Math.sin(w0) / (2 * (1 / q) + Math.sin(w0 / 2) || 0.5);
  let y0 = 0, y1 = 0, y2 = 0, y3 = 0, x0 = 0, x1 = 0, x2 = 0, x3 = 0;
  for (let i = 0; i < len; i++) {
    const input = samples[i];
    y0 = input * alpha + 2 * (y1 * (1 - alpha) - y2 * alpha) + y3 * (1 - alpha);
    y1 = y0; y2 = y1; y3 = y2;
    out[i] = y0 || 0;
  }
  return out;
}

function applyVibrato(samples, rate, depth) {
  const len = samples.length;
  const out = new Float32Array(len);
  for (let i = 0; i < len; i++) {
    const vibrato = 1 + depth * Math.sin(2 * Math.PI * rate * (i / SAMPLE_RATE));
    out[i] = samples[i] * vibrato;
  }
  return out;
}

// --- ASSET GENERATION ---

// 1. Shakuhachi (bamboo flute) — note samples for yo-scale pentatonic
function genShakuhachi(freq, dur) {
  const len = Math.floor(SAMPLE_RATE * dur);
  const out = new Float32Array(len);
  // Sawtooth-like waveform with partial harmonics
  for (let i = 0; i < len; i++) {
    let t = i / SAMPLE_RATE;
    let val = 0;
    // Fundamental + harmonics for rich bamboo timbre
    val += Math.sin(2 * Math.PI * freq * t);
    val += 0.45 * Math.sin(2 * Math.PI * freq * 2 * t);
    val += 0.25 * Math.sin(2 * Math.PI * freq * 3 * t);
    val += 0.12 * Math.sin(2 * Math.PI * freq * 4 * t);
    val += 0.06 * Math.sin(2 * Math.PI * freq * 5 * t);
    // Add breath noise component
    val += 0.03 * (Math.random() * 2 - 1);
    out[i] = val / 2;
  }
  // Bandpass filter for shakuhachi tone
  let filtered = applyBandpass(out, freq * 1.5, 8);
  // Vibrato
  filtered = applyVibrato(filtered, 5, 0.006 * freq);
  // Breath attack envelope
  filtered = applyEnvelope(filtered, 0.03, 0.1, 0.6, 0.4);
  return filtered;
}

// Generate all shakuhachi notes for yo-scale pentatonic
const yoNotes = [293.7, 329.6, 392, 440, 523.3]; // D E G A C

// 2. Koto (string instrument) — note samples
function genKoto(freq, dur) {
  const len = Math.floor(SAMPLE_RATE * dur);
  const out = new Float32Array(len);
  // Triangle-like waveform with resonance
  for (let i = 0; i < len; i++) {
    let t = i / SAMPLE_RATE;
    let val = 0;
    // Triangle wave approximation with harmonics
    const phase = (freq * t) % 1;
    val = phase < 0.5 ? 4 * phase - 1 : 3 - 4 * phase;
    val += 0.3 * Math.sin(2 * Math.PI * freq * 3 * t);
    val += 0.15 * Math.sin(2 * Math.PI * freq * 4 * t);
    out[i] = val / 1.5;
  }
  // Bandpass with high Q for string resonance
  let filtered = applyBandpass(out, freq * 2, 12);
  // Pluck attack — fast decay
  filtered = applyEnvelope(filtered, 0.004, 0.02, 0.5, 0.6);
  return filtered;
}

// 3. Taiko drum
function genTaiko(dur) {
  const len = Math.floor(SAMPLE_RATE * dur);
  const noise = generateNoise(dur, 0.5);
  // Lowpass to shape drum thud
  let filtered = applyLowpass(noise, 120, 0.5);
  // Bandpass for resonant body
  let bandpass = applyBandpass(noise, 80, 6);
  // Mix
  const out = new Float32Array(len);
  for (let i = 0; i < len; i++) {
    out[i] = filtered[i] * 0.6 + bandpass[i] * 0.4;
  }
  // Envelope — sharp attack, fast decay with pitch drop
  out[0] = 0; // DC offset
  return applyEnvelope(out, 0.003, 0.04, 0.3, 0.3);
}

// 4. Bass drone — deep D2 drone for entire journey
function genBassDrone(dur) {
  const len = Math.floor(SAMPLE_RATE * dur);
  const out = new Float32Array(len);
  for (let i = 0; i < len; i++) {
    let t = i / SAMPLE_RATE;
    let val = 0;
    val += Math.sin(2 * Math.PI * 73.4 * t); // D2
    val += 0.35 * Math.sin(2 * Math.PI * 73.4 * 2 * t);
    val += 0.15 * Math.sin(2 * Math.PI * 73.4 * 3 * t);
    out[i] = val * 0.3;
  }
  let filtered = applyLowpass(out, 120, 0.8);
  return applyEnvelope(filtered, 2, 0.5, 0.9, 1);
}

// 5. Ambient wind — filtered noise variations (4 zone-specific)
function genWindAmbience(dur, freq, gain) {
  const len = Math.floor(SAMPLE_RATE * dur);
  const noise = generateNoise(dur, gain);
  let filtered = applyLowpass(noise, freq, 0.5);
  // Add slow modulation for natural wind feel
  const out = new Float32Array(len);
  for (let i = 0; i < len; i++) {
    let t = i / SAMPLE_RATE;
    let mod = 1 + 0.15 * Math.sin(2 * Math.PI * 0.15 * t) + 0.1 * Math.sin(2 * Math.PI * 0.07 * t + 1);
    out[i] = filtered[i] * mod;
  }
  return applyEnvelope(out, 3, 0.5, 0.9, 1.5);
}

// 6. River ambience
function genRiver(dur) {
  const len = Math.floor(SAMPLE_RATE * dur);
  const noise = generateNoise(dur, 0.3);
  let filtered = applyLowpass(noise, 300, 0.7);
  // Add sine tone for river drone
  const out = new Float32Array(len);
  for (let i = 0; i < len; i++) {
    let t = i / SAMPLE_RATE;
    let sineDrone = Math.sin(2 * Math.PI * 95 * t);
    let mod = 1 + 0.1 * Math.sin(2 * Math.PI * 0.08 * t + 0.5);
    out[i] = filtered[i] * 0.4 * mod + sineDrone * 0.15;
  }
  return applyEnvelope(out, 2, 0.5, 0.8, 1);
}

// 7. Drizzle rain ambience
function genRain(dur) {
  return applyLowpass(generateNoise(dur, 0.4), 600, 0.6);
}

// 8. Duel tension drone
function genTensionDrone(dur) {
  const len = Math.floor(SAMPLE_RATE * dur);
  const out = new Float32Array(len);
  for (let i = 0; i < len; i++) {
    let t = i / SAMPLE_RATE;
    // Sawtooth-based drone at 55Hz
    let phase = (55 * t) % 1;
    let val = phase < 0.5 ? 2 * phase - 1 : 2 * (phase - 0.5) - 1;
    val += 0.3 * Math.sin(2 * Math.PI * 55 * 2 * t);
    out[i] = val * 0.15;
  }
  let filtered = applyLowpass(out, 120, 0.8);
  return applyEnvelope(filtered, 0.5, 0.3, 0.8, 0.5);
}

// 9. Ganryu approach drone — deep sine descending
function genGanryuDrone(dur) {
  const len = Math.floor(SAMPLE_RATE * dur);
  const out = new Float32Array(len);
  for (let i = 0; i < len; i++) {
    let t = i / SAMPLE_RATE;
    // Frequency descends from 60Hz to 24Hz over duration
    let freqStep = 60 - 36 * (i / len);
    let val = Math.sin(2 * Math.PI * freqStep * t);
    val += 0.25 * Math.sin(2 * Math.PI * freqStep * 3 * t);
    out[i] = val * 0.2;
  }
  let filtered = applyLowpass(out, 80, 0.9);
  return applyEnvelope(filtered, 2, 0.5, 0.8, 1);
}

// 10. Ganryu bright theme (triangles)
function genGanryuTheme(dur) {
  const len = Math.floor(SAMPLE_RATE * dur);
  const freqs = [440, 554, 659, 880];
  const out = new Float32Array(len);
  for (let i = 0; i < len; i++) {
    let t = i / SAMPLE_RATE;
    let val = 0;
    freqs.forEach((f, idx) => {
      let phase = (f * t) % 1;
      let tri = phase < 0.5 ? 4 * phase - 1 : 3 - 4 * phase;
      val += tri * (0.06 / (idx + 1));
    });
    out[i] = val;
  }
  let filtered = applyBandpass(out, 600, 3);
  return applyEnvelope(filtered, 0.5, 0.3, 0.7, 0.5);
}

// 11. Slash SFX
function genSlash(dur) {
  const len = Math.floor(SAMPLE_RATE * dur);
  const noise = generateNoise(dur, 0.3);
  let bandpass = applyBandpass(noise, 3000, 30);
  // Metal ring
  const ring = generateSine(1800, dur, 0.15);
  // Body resonance
  const body = generateSawtooth(120, dur, 0.1);
  const out = new Float32Array(len);
  for (let i = 0; i < len; i++) {
    out[i] = bandpass[i] * 0.6 + ring[i] * 0.8 + body[i] * 0.5;
  }
  return applyEnvelope(out, 0.003, 0.06, 0.4, 0.04);
}

function generateSawtooth(freq, dur, amp) {
  const len = Math.floor(SAMPLE_RATE * dur);
  const out = new Float32Array(len);
  for (let i = 0; i < len; i++) {
    let phase = (freq * (i / SAMPLE_RATE)) % 1;
    out[i] = amp * (2 * (phase < 0.5 ? phase : phase - 0.5));
  }
  return out;
}

// 12. Paint SFX
function genPaint(dur) {
  const len = Math.floor(SAMPLE_RATE * dur);
  const noise = generateNoise(dur, 0.3);
  let bandpass = applyBandpass(noise, 1200, 3);
  let filtered = applyLowpass(bandpass, 3000, 0.5);
  return applyEnvelope(filtered, 0.01, 0.05, 0.6, 0.1);
}

// 13. Block SFX
function genBlock(dur) {
  const taiko = genTaiko(dur);
  const ring = generateSine(360, dur, 0.1);
  const out = new Float32Array(taiko.length);
  for (let i = 0; i < taiko.length; i++) {
    out[i] = taiko[i] * 0.7 + (i < ring.length ? ring[i] : 0) * 0.8;
  }
  return out;
}

// 14. Hit SFX
function genHit(dur) {
  const taiko = genTaiko(dur);
  const body = generateSawtooth(80, dur, 0.1);
  let bodyFiltered = applyLowpass(body, 200, 0.5);
  const noise = applyLowpass(generateNoise(dur, 0.3), 300, 0.7);
  const out = new Float32Array(taiko.length);
  for (let i = 0; i < taiko.length; i++) {
    out[i] = taiko[i] * 0.8 + bodyFiltered[i] * 0.6 + noise[i] * 0.4;
  }
  return out;
}

// 15. Death SFX
function genDeath(dur) {
  const len = Math.floor(SAMPLE_RATE * dur);
  const out = new Float32Array(len);
  // Dm7 chord arpeggio
  const notes = [294, 349, 440, 523];
  for (let j = 0; j < notes.length; j++) {
    const noteSamples = genShakuhachi(notes[j], dur * 0.3);
    const offset = Math.floor(SAMPLE_RATE * 0.3 * j);
    for (let i = 0; i < noteSamples.length && (i + offset) < len; i++) {
      out[i + offset] += noteSamples[i] * 0.5;
    }
  }
  // Taiko pulse
  const taikoPulse = genTaiko(Math.min(dur, 0.5));
  for (let i = 0; i < taikoPulse.length && i < len; i++) {
    out[i] += taikoPulse[i] * 0.4;
  }
  return applyEnvelope(out, 0.2, 0.3, 0.5, 0.5);
}

// 16. Ink regen SFX
function genInkRegen(dur) {
  const len = Math.floor(SAMPLE_RATE * dur);
  const out = new Float32Array(len);
  const koto1 = genKoto(440, dur * 0.5);
  const koto2 = genKoto(554, dur * 0.5);
  for (let i = 0; i < koto1.length && i < len; i++) {
    out[i] = koto1[i] * 0.6 + koto2[i] * 0.4;
  }
  return out;
}

// 17. Mark SFX
function genMark(dur) {
  const len = Math.floor(SAMPLE_RATE * dur);
  const out = new Float32Array(len);
  const k1 = genKoto(350, dur * 0.3);
  const k2 = genKoto(440, dur * 0.4);
  const k3 = genKoto(550, dur * 0.45);
  for (let i = 0; i < k1.length && i < len; i++) {
    out[i] = k1[i] * 0.5 + k2[i] * 0.3 + k3[i] * 0.2;
  }
  return out;
}

// 18. Victory fanfare
function genVictory(dur) {
  const len = Math.floor(SAMPLE_RATE * dur);
  const out = new Float32Array(len);
  const notes = [440, 554, 659, 880, 1108, 1320];
  notes.forEach((f, idx) => {
    const noteSamples = genShakuhachi(f, dur * 0.15);
    const offset = Math.floor(SAMPLE_RATE * 0.09 * idx);
    for (let i = 0; i < noteSamples.length && (i + offset) < len; i++) {
      out[i + offset] += noteSamples[i] * 0.6 / (idx + 1);
    }
  });
  // Final long note
  const finalNote = genShakuhachi(880, dur * 0.2);
  const finalOffset = Math.floor(SAMPLE_RATE * 0.09 * 6);
  for (let i = 0; i < finalNote.length && (i + finalOffset) < len; i++) {
    out[i + finalOffset] += finalNote[i] * 0.5;
  }
  // Koto accompaniment
  const kotoNotes = [880, 1108, 1320];
  kotoNotes.forEach((f, idx) => {
    const kotoSamples = genKoto(f, dur * 0.2);
    const offset = Math.floor(SAMPLE_RATE * (0.09 * (idx + 7)));
    for (let i = 0; i < kotoSamples.length && (i + offset) < len; i++) {
      out[i + offset] += kotoSamples[i] * 0.4;
    }
  });
  return applyEnvelope(out, 0.1, 0.2, 0.6, 0.3);
}

// Generate all assets
console.log('Generating Edo Inkblade audio assets...');

const assets = {
  // Shakuhachi notes (yo-scale pentatonic: D E G A C)
  'shaku-d4': genShakuhachi(293.7, 2),
  'shaku-e4': genShakuhachi(329.6, 2),
  'shaku-g4': genShakuhachi(392, 2),
  'shaku-a4': genShakuhachi(440, 2),
  'shaku-c5': genShakuhachi(523.3, 2),
  // Koto notes
  'koto-d4': genKoto(293.7, 2),
  'koto-a4': genKoto(440, 2),
  'koto-c5': genKoto(523.3, 2),
  'koto-g4': genKoto(392, 2),
  // Taiko
  'taiko': genTaiko(0.6),
  // Ambient layers
  'wind-meadow': genWindAmbience(8, 180, 0.5),
  'wind-forest': genWindAmbience(8, 120, 0.5),
  'wind-mountain': genWindAmbience(8, 300, 0.5),
  'wind-coastal': genWindAmbience(8, 90, 0.5),
  'river-ambient': genRiver(8),
  'rain-ambient': genRain(3),
  'bass-drone': genBassDrone(8),
  'tension-drone': genTensionDrone(4),
  'ganryu-drone': genGanryuDrone(4),
  'ganryu-theme': genGanryuTheme(4),
  // SFX
  'sfx-slash': genSlash(0.1),
  'sfx-paint': genPaint(0.15),
  'sfx-block': genBlock(0.08),
  'sfx-hit': genHit(0.15),
  'sfx-death': genDeath(0.6),
  'sfx-ink-regen': genInkRegen(0.25),
  'sfx-mark': genMark(0.25),
  'sfx-victory': genVictory(1.2),
  // Zone ambient noise layers
  'amb-meadow': function() { return applyLowpass(genWindAmbience(4, 220, 0.4), 300, 0.6); }(),
  'amb-forest': function() { return applyLowpass(genWindAmbience(4, 150, 0.4), 200, 0.7); }(),
  'amb-mountain': function() { return applyLowpass(genWindAmbience(4, 350, 0.4), 500, 0.5); }(),
  'amb-coastal': function() { return applyLowpass(genWindAmbience(4, 100, 0.4), 250, 0.6); }(),
  // Melody motif samples (short melodic phrases)
  'motif-meadow': function() {
    const dur = 4;
    const len = Math.floor(SAMPLE_RATE * dur);
    const out = new Float32Array(len);
    const melody = [293.7, 392, 440, 329.6, 523.3]; // D G A E C ascending playful
    const noteDur = dur / melody.length;
    melody.forEach((f, idx) => {
      const noteSamples = genShakuhachi(f, noteDur * 0.8);
      const offset = Math.floor(SAMPLE_RATE * noteDur * idx);
      for (let i = 0; i < noteSamples.length && (i + offset) < len; i++) {
        out[i + offset] += noteSamples[i] * 0.5;
      }
    });
    return applyEnvelope(out, 0.1, 0.2, 0.6, 0.3);
  }(),
  'motif-forest': function() {
    const dur = 4;
    const len = Math.floor(SAMPLE_RATE * dur);
    const out = new Float32Array(len);
    const melody = [329.6, 440, 523.3, 392, 293.7]; // E A C G D wandering
    const noteDur = dur / melody.length;
    melody.forEach((f, idx) => {
      const noteSamples = genKoto(f, noteDur * 0.8);
      const offset = Math.floor(SAMPLE_RATE * noteDur * idx);
      for (let i = 0; i < noteSamples.length && (i + offset) < len; i++) {
        out[i + offset] += noteSamples[i] * 0.5;
      }
    });
    return applyEnvelope(out, 0.2, 0.3, 0.5, 0.4);
  }(),
  'motif-mountain': function() {
    const dur = 4;
    const len = Math.floor(SAMPLE_RATE * dur);
    const out = new Float32Array(len);
    const melody = [523.3, 392, 329.6, 440, 293.7]; // C G E A D descending
    const noteDur = dur / melody.length;
    melody.forEach((f, idx) => {
      const noteSamples = genShakuhachi(f, noteDur * 0.8);
      const offset = Math.floor(SAMPLE_RATE * noteDur * idx);
      for (let i = 0; i < noteSamples.length && (i + offset) < len; i++) {
        out[i + offset] += noteSamples[i] * 0.4;
      }
    });
    return applyEnvelope(out, 0.15, 0.25, 0.4, 0.5);
  }(),
  'motif-coastal': function() {
    const dur = 4;
    const len = Math.floor(SAMPLE_RATE * dur);
    const out = new Float32Array(len);
    const melody = [440, 523.3, 659.7, 329.6, 293.7]; // A C E5 E D hopeful
    const noteDur = dur / melody.length;
    melody.forEach((f, idx) => {
      const noteSamples = genShakuhachi(f, noteDur * 0.8);
      const offset = Math.floor(SAMPLE_RATE * noteDur * idx);
      for (let i = 0; i < noteSamples.length && (i + offset) < len; i++) {
        out[i + offset] += noteSamples[i] * 0.5;
      }
    });
    return applyEnvelope(out, 0.1, 0.2, 0.5, 0.4);
  }()
};

// Write all assets
Object.entries(assets).forEach(([name, samples]) => {
  const filepath = path.join(TARGET_DIR, name + '.wav');
  writeWav(filepath, samples);
  const size = fs.statSync(filepath).size;
  console.log(`  Wrote ${filepath} (${(size / 1024).toFixed(1)} KB)`);
});

// Generate manifest
const manifest = {
  description: "Edo Inkblade audio assets — WAV format, generated via mathematical synthesis",
  sampleRate: SAMPLE_RATE,
  bitsPerSample: 16,
  channels: 1,
  assets: Object.keys(assets).map(name => ({
    name: name + '.wav',
    description: describeAsset(name),
    duration: (assets[name].length / SAMPLE_RATE).toFixed(2) + 's'
  }))
};

function describeAsset(name) {
  const descriptions = {
    'shaku-d4': 'Shakuhachi bamboo flute — D4 note (yo-scale pentatonic tonic)',
    'shaku-e4': 'Shakuhachi bamboo flute — E4 note',
    'shaku-g4': 'Shakuhachi bamboo flute — G4 note',
    'shaku-a4': 'Shakuhachi bamboo flute — A4 note',
    'shaku-c5': 'Shakuhachi bamboo flute — C5 note',
    'koto-d4': 'Koto string instrument — D4 note',
    'koto-a4': 'Koto string instrument — A4 note',
    'koto-c5': 'Koto string instrument — C5 note',
    'koto-g4': 'Koto string instrument — G4 note',
    'taiko': 'Taiko drum impact — filtered noise burst with pitch drop',
    'wind-meadow': 'Meadow wind ambience — 180Hz gentle breeze',
    'wind-forest': 'Forest wind ambience — 120Hz deeper hum',
    'wind-mountain': 'Mountain wind ambience — 300Hz sharper wind',
    'wind-coastal': 'Coastal wind ambience — 90Hz sea wash',
    'river-ambient': 'River ambience — filtered noise with 95Hz sine drone',
    'rain-ambient': 'Rain ambience — filtered noise for drizzle zone',
    'bass-drone': 'Bass drone — D2 at 73.4Hz, deep filtered sine',
    'tension-drone': 'Duel tension drone — 55Hz sawtooth, lowpass filtered',
    'ganryu-drone': 'Ganryu approach drone — 60Hz→24Hz descending sine',
    'ganryu-theme': 'Ganryu bright theme — triangle chords at 440/554/659/880 Hz',
    'sfx-slash': 'Slash SFX — bandpass noise + metal ring + body resonance',
    'sfx-paint': 'Paint SFX — bandpass noise with koto pluck accent',
    'sfx-block': 'Block SFX — taiko impact + wood resonance ring',
    'sfx-hit': 'Hit SFX — taiko + low thud + filtered noise',
    'sfx-death': 'Death SFX — layered shakuhachi Dm7 chord + taiko pulse',
    'sfx-ink-regen': 'Ink regen SFX — koto plucks at 440/554 Hz',
    'sfx-mark': 'Mark SFX — koto arpeggio at 350/440/550 Hz',
    'sfx-victory': 'Victory fanfare — shakuhachi ascending notes + koto accompaniment',
    'amb-meadow': 'Meadow zone ambient noise layer — 220Hz gentle',
    'amb-forest': 'Forest zone ambient noise layer — 150Hz deep',
    'amb-mountain': 'Mountain zone ambient noise layer — 350Hz wind',
    'amb-coastal': 'Coastal zone ambient noise layer — 100Hz sea wash',
    'motif-meadow': 'Meadow motif — ascending playful shakuhachi (D G A E C)',
    'motif-forest': 'Forest motif — wandering koto harmony (E A C G D)',
    'motif-mountain': 'Mountain motif — descending shakuhachi (C G E A D)',
    'motif-coastal': 'Coastal motif — hopeful shakuhachi (A C E5 E D)'
  };
  return descriptions[name] || name;
}

fs.writeFileSync(path.join(TARGET_DIR, 'manifest.json'), JSON.stringify(manifest, null, 2));
console.log('  Wrote manifest.json');
console.log('Done.');
