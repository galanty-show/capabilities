/** Original, local procedural composition. No samples, downloaded assets or Python.
 * Node synthesizes every sample; system FFmpeg only measures/masters the mix.
 * Reproducibility is sample-exact for identical parameters and FFmpeg version.
 */
import { mkdir, mkdtemp, rename, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { promisify } from 'node:util';
import { execFile } from 'node:child_process';

const run = promisify(execFile);
const SR = 48000;
const TAU = Math.PI * 2;
export const MUSIC_STYLES = Object.freeze(['electronic', 'lofi', 'epic']);
const TEMPOS = { electronic: 128, lofi: 80, epic: 100 };
const TARGET = -14;
const PEAK = -3; // AAC overshot the -2 dBTP WAV by 1.23 dB on a full-bar score; reserve measured encoding headroom.
const LOUDNESS_TOLERANCE = 0.15;

function randomFor(seed) {
  let state = 2166136261;
  for (const c of `${typeof seed}:${seed}`) state = Math.imul(state ^ c.charCodeAt(0), 16777619) >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = Math.imul(state ^ state >>> 15, state | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

function makeGrid(style, seed, durationSeconds) {
  const bpm = TEMPOS[style], beatSeconds = 60 / bpm;
  const beats = Array.from({ length: Math.ceil(durationSeconds / beatSeconds) }, (_, i) => i * beatSeconds)
    .filter(t => t < durationSeconds);
  const plan = style === 'electronic'
    ? [['intro', 0], ['build', .18], ['drop', .4], ['outro', .88]]
    : style === 'lofi' ? [['intro', 0], ['groove', .18], ['outro', .88]]
      : [['intro', 0], ['rise', .18], ['climax', .46], ['outro', .88]];
  // Phrase boundaries normally land on bars. Besides following the composition,
  // this avoids permanently half-frame cuts at 80 BPM / 30fps. Reserve one bar
  // for every remaining section; genuinely short films retain beat boundaries.
  const internalBars = Math.ceil(durationSeconds / (beatSeconds * 4)) - 1;
  let previousBar = 0;
  const starts = plan.map(([name, fraction], i) => {
    if (i === 0) return {name, start: 0};
    if (internalBars >= plan.length - 1) {
      const maximum = internalBars - (plan.length - 1 - i);
      const bar = Math.min(maximum, Math.max(previousBar + 1, Math.round(beats.length * fraction / 4)));
      previousBar = bar;
      return {name, start: bar * 4 * beatSeconds};
    }
    return {name, start: Math.min(beats.length - (plan.length - i), Math.max(i, Math.floor(beats.length * fraction))) * beatSeconds};
  });
  const sections = starts.map((s, i) => ({ ...s, end: starts[i + 1]?.start ?? durationSeconds }));
  return { version: 1, style, seed, sampleRate: SR, channels: 2, bpm, timeSignature: [4, 4],
    beat0: 0, beatSeconds, durationSeconds, beats, bars: beats.filter((_, i) => i % 4 === 0), sections,
    provenance: 'Original local Node synthesis; no samples or third-party music.',
    timing: 'Composed beat grid, not onset detection; final bar may be partial.' };
}

function compose(grid, rng) {
  const n = Math.round(grid.durationSeconds * SR);
  const left = new Float32Array(n), right = new Float32Array(n);
  const drums = new Float32Array(n), duck = new Float32Array(n).fill(1);
  const beat = grid.beatSeconds, style = grid.style;
  const sectionAt = t => grid.sections.find(s => t >= s.start && t < s.end)?.name ?? 'outro';
  const midi = m => 440 * 2 ** ((m - 69) / 12);
  const transpose = Math.floor(rng() * 5) - 2;
  const chords = style === 'lofi' ? [[48, 55, 58, 63], [53, 57, 60, 64], [46, 53, 57, 60], [51, 55, 58, 62]]
    : style === 'epic' ? [[45, 52, 57, 60], [41, 48, 53, 57], [48, 55, 60, 64], [43, 50, 55, 59]]
      : [[48, 55, 60, 63], [44, 51, 56, 60], [51, 58, 63, 67], [46, 53, 58, 62]];

  function tone(start, seconds, note, gain, kind = 'pluck', pan = 0) {
    const first = Math.round(start * SR), len = Math.min(Math.round(seconds * SR), n - first);
    const freq = midi(note + transpose), phase = rng() * TAU;
    const gl = Math.cos((pan + 1) * Math.PI / 4), gr = Math.sin((pan + 1) * Math.PI / 4);
    for (let j = 0; j < len; j++) {
      const t = j / SR, end = Math.min(1, (len - j) / (SR * .045));
      const attack = Math.min(1, t / (kind === 'pad' ? .14 : .006));
      const sine = Math.sin(TAU * freq * t + phase);
      let sound, env;
      if (kind === 'bass') { sound = sine + .18 * Math.sin(TAU * freq * 2 * t); env = Math.exp(-t * 2); }
      else if (kind === 'pad' || kind === 'brass') {
        sound = (sine + .38 * Math.sin(TAU * freq * 1.003 * t + phase) +
          .22 * Math.sin(TAU * freq * 2 * t + phase) + .09 * Math.sin(TAU * freq * 3 * t)) / 1.69;
        env = kind === 'brass' ? .7 + .3 * Math.exp(-t * 5) : .8;
      } else {
        sound = sine + .28 * Math.sin(TAU * freq * 2 * t) * Math.exp(-t * 14) +
          .12 * Math.sin(TAU * freq * 3 * t) * Math.exp(-t * 22);
        env = Math.exp(-t * (style === 'lofi' ? 4.5 : 7));
      }
      const sample = sound * env * attack * end * gain;
      left[first + j] += sample * gl; right[first + j] += sample * gr;
    }
  }

  function drum(start, kind, gain = 1) {
    const first = Math.round(start * SR), seconds = kind === 'kick' ? .42 : kind === 'snare' ? .22 : .07;
    const len = Math.min(Math.round(seconds * SR), n - first);
    let phase = 0, lastNoise = 0;
    for (let j = 0; j < len; j++) {
      const t = j / SR, noise = rng() * 2 - 1;
      let sample;
      if (kind === 'kick') {
        phase += TAU * (43 + 115 * Math.exp(-t * 35)) / SR;
        sample = Math.sin(phase) * Math.exp(-t * 10) + noise * .13 * Math.exp(-t * 230);
      } else if (kind === 'snare') sample = noise * .36 * Math.exp(-t * 23) + Math.sin(TAU * 185 * t) * .22 * Math.exp(-t * 28);
      else sample = (noise - lastNoise) * .1 * Math.exp(-t * 65);
      lastNoise = noise;
      drums[first + j] += sample * gain * Math.min(1, (len - j) / 100);
      if (kind === 'kick' && style === 'electronic') duck[first + j] = Math.min(duck[first + j], 1 - .66 * Math.exp(-t * 15));
    }
  }

  for (let bar = 0; bar * 4 * beat < grid.durationSeconds; bar++) {
    const start = bar * 4 * beat, chord = chords[bar % chords.length];
    const section = sectionAt(start), dense = ['drop', 'groove', 'climax'].includes(section);
    for (let i = 0; i < chord.length; i++) tone(start, 4 * beat + .1, chord[i], style === 'epic' ? .14 : .10, 'pad', (i % 2 ? .45 : -.45));
    const step = style === 'electronic' && dense ? .25 : .5;
    for (let position = 0, k = 0; position < 4; position += step, k++) {
      const t = start + position * beat;
      if (t >= grid.durationSeconds) break;
      const sec = sectionAt(t), active = !['intro', 'outro'].includes(sec);
      const swing = style === 'lofi' && k % 2 ? beat * .08 : 0;
      tone(t + swing, beat * (style === 'lofi' ? 1.2 : .65), chord[(k + bar) % chord.length] + 12,
        active ? .12 : .065, 'pluck', k % 2 ? .36 : -.36);
      if (style === 'epic') tone(t, beat * .40, chord[k % 3], active ? .13 : .055, 'brass', 0);
    }
    for (let b = 0; b < 4; b++) {
      const t = start + b * beat;
      if (t >= grid.durationSeconds) break;
      const sec = sectionAt(t), active = !['intro', 'outro'].includes(sec);
      if (style === 'electronic') {
        if (active) drum(t, 'kick', sec === 'drop' ? .65 : .42);
        if (active && b % 2) drum(t, 'snare', .55);
        drum(t + beat * .5, 'hat', active ? .85 : .35);
        if (sec === 'drop') tone(t + beat * .5, beat * .42, chord[0] - 12, .25, 'bass');
        else if (b === 0) tone(t, beat * 3.8, chord[0] - 12, .12, 'bass');
        if (sec === 'build') { drum(t + beat * .5, 'snare', .18); drum(t + beat * .75, 'snare', .12); }
        if (sec === 'drop' && b % 2 === 0) for (const m of chord) tone(t, beat * .6, m + 12, .10, 'brass', .1);
      } else if (style === 'lofi') {
        if (b === 0 || b === 2) drum(t + (b === 2 ? beat * .08 : 0), 'kick', active ? .43 : .22);
        if (b % 2) drum(t + beat * .035, 'snare', active ? .38 : .15);
        drum(t + beat * .58, 'hat', .38);
        if (b % 2 === 0) tone(t, beat * 1.8, chord[0] - 12, .18, 'bass');
      } else {
        if (b % 2 === 0 || sec === 'climax') drum(t, 'kick', active ? .72 : .3);
        if (b === 3 && active) drum(t, 'snare', .42);
        if (b === 0) tone(t, beat * 3.7, chord[0] - 12, .22, 'bass');
        if (sec === 'climax') tone(t, beat * .9, chord[(bar + b) % chord.length] + 24, .16, 'brass', -.15);
      }
    }
  }
  // Fixed stereo echoes add space without sampled impulse responses or platform randomness.
  const delay = Math.round(beat * .75 * SR);
  let previousLeft = 0, previousRight = 0;
  const smoothing = style === 'lofi' ? .24 : .72;
  for (let i = 0; i < n; i++) {
    if (i >= delay) { left[i] += right[i - delay] * .14; right[i] += left[i - delay] * .14; }
    previousLeft += smoothing * (left[i] - previousLeft);
    previousRight += smoothing * (right[i] - previousRight);
    const fade = Math.min(1, i / (SR * .012)) * Math.min(1, (n - 1 - i) / (SR * Math.min(.5, grid.durationSeconds / 8)));
    left[i] = Math.tanh((previousLeft * duck[i] + drums[i]) * 1.1) * fade;
    right[i] = Math.tanh((previousRight * duck[i] + drums[i]) * 1.1) * fade;
  }
  return [left, right];
}

function wavFloat([left, right]) {
  const size = left.length * 8, buffer = Buffer.alloc(44 + size);
  buffer.write('RIFF', 0); buffer.writeUInt32LE(36 + size, 4); buffer.write('WAVEfmt ', 8);
  buffer.writeUInt32LE(16, 16); buffer.writeUInt16LE(3, 20); buffer.writeUInt16LE(2, 22);
  buffer.writeUInt32LE(SR, 24); buffer.writeUInt32LE(SR * 8, 28); buffer.writeUInt16LE(8, 32);
  buffer.writeUInt16LE(32, 34); buffer.write('data', 36); buffer.writeUInt32LE(size, 40);
  for (let i = 0; i < left.length; i++) { buffer.writeFloatLE(left[i], 44 + i * 8); buffer.writeFloatLE(right[i], 48 + i * 8); }
  return buffer;
}

async function ffmpeg(args) {
  try { return await run('ffmpeg', ['-hide_banner', '-nostdin', '-threads', '1', ...args], { maxBuffer: 4 * 1024 * 1024 }); }
  catch (error) { throw new Error(`FFmpeg audio processing failed: ${error.stderr || error.message}`, { cause: error }); }
}

/** EBU R128 integrated loudness and oversampled true peak, measured from delivered audio. */
export async function analyzeAudio(audioPath) {
  const { stderr } = await ffmpeg(['-i', audioPath, '-af', `loudnorm=I=${TARGET}:TP=${PEAK}:LRA=7:print_format=json`, '-f', 'null', '-']);
  const block = stderr.match(/\{\s*"input_i"[\s\S]*?\}/)?.[0];
  if (!block) throw new Error('FFmpeg did not return EBU R128 loudness measurements');
  const raw = JSON.parse(block);
  const analysis = { integratedLufs: Number(raw.input_i), truePeakDbtp: Number(raw.input_tp),
    loudnessRangeLu: Number(raw.input_lra), thresholdLufs: Number(raw.input_thresh), raw };
  if (![analysis.integratedLufs, analysis.truePeakDbtp, analysis.loudnessRangeLu, analysis.thresholdLufs].every(Number.isFinite)) {
    throw new Error('Audio is silent or too short for finite EBU R128 measurements');
  }
  return analysis;
}

/** Detect attack times from a 5ms positive-energy-flux envelope, independently of any grid. */
export function detectTransientOnsets(novelty) {
  let maximum = 0;
  for (const value of novelty) maximum = Math.max(maximum, value);
  const candidates = [];
  for (let k = 4; k < novelty.length - 4; k++) {
    if (novelty[k] < Math.max(.000003, maximum * .12)) continue;
    let peak = true;
    for (let offset = -3; offset <= 3; offset++) if (offset && novelty[k + offset] > novelty[k]) peak = false;
    if (peak) candidates.push({ time: k * .005, strength: novelty[k] });
  }
  const selected = [];
  for (const candidate of candidates.sort((a, b) => b.strength - a.strength)) {
    if (selected.every(s => Math.abs(s.time - candidate.time) >= .16)) selected.push(candidate);
  }
  // Peak strength locates a transient, not its attack. Timbre/phase can put the
  // low-pass energy peak 15–20ms after an exactly aligned kick. Backtrack only
  // its contiguous rising region, without consulting expected beat times.
  return selected.map(s => {
    let index = Math.round(s.time / .005);
    const earliest = Math.max(0, index - 4), threshold = s.strength * .2;
    while (index > earliest && novelty[index - 1] >= threshold) index--;
    return index * .005;
  }).sort((a, b) => a - b);

}

/** Detect low-frequency transients from decoded audio, independently of grid metadata.
 * Timing is measured in 5 ms energy windows. Grid matching evaluates the Drop kicks
 * when present; other sections/styles may intentionally omit quarter-note kicks.
 */
export async function inspectBeatOnsets(audioPath, grid) {
  const { stdout } = await run('ffmpeg', ['-hide_banner', '-nostdin', '-v', 'error', '-i', audioPath,
    '-af', 'lowpass=f=150', '-ac', '1', '-ar', '8000', '-f', 'f32le', 'pipe:1'],
  { encoding: 'buffer', maxBuffer: 12 * 1024 * 1024 });
  const windowSamples = 40, count = Math.floor(stdout.length / 4 / windowSamples);
  const energy = new Float64Array(count), novelty = new Float64Array(count);
  for (let k = 0; k < count; k++) {
    for (let j = 0; j < windowSamples; j++) {
      const value = stdout.readFloatLE((k * windowSamples + j) * 4);
      energy[k] += value * value / windowSamples;
    }
    novelty[k] = Math.max(0, energy[k] - (energy[Math.max(0, k - 4)] || 0));
  }
  const onsetTimes = detectTransientOnsets(novelty);
  const drops = grid?.sections?.filter(s => s.name.toLowerCase().startsWith('drop')) ?? [];
  const expected = grid?.beats?.filter(t => drops.some(s => t >= s.start && t < s.end)) ?? [];
  const matches = expected.map(beat => {
    const nearest = onsetTimes.reduce((best, time) => best === null || Math.abs(time - beat) < Math.abs(best - beat) ? time : best, null);
    return { beat, onset: nearest, residualSeconds: nearest === null ? null : nearest - beat };
  });
  const residuals = matches.filter(m => m.residualSeconds !== null).map(m => Math.abs(m.residualSeconds)).sort((a, b) => a - b);
  return { method: 'decoded 150 Hz low-pass positive energy flux; 5 ms windows; 160 ms peak separation; contiguous 20%-peak leading edge, up to 20 ms backtrack',
    onsetTimes, evaluatedSection: drops.length ? 'drop' : null, matches,
    toleranceSeconds: .08,
    matchedBeatRatio: expected.length ? matches.filter(m => m.residualSeconds !== null && Math.abs(m.residualSeconds) <= .08).length / expected.length : null,
    medianResidualSeconds: residuals.length ? residuals[Math.floor(residuals.length / 2)] : null,
    maxResidualSeconds: residuals.length ? residuals.at(-1) : null };
}

export async function synthesize({ style = 'electronic', seed = 1, durationSeconds = 30, outDir } = {}) {
  if (!MUSIC_STYLES.includes(style)) throw new TypeError(`style must be one of: ${MUSIC_STYLES.join(', ')}`);
  if (!['string', 'number'].includes(typeof seed) || (typeof seed === 'number' && !Number.isFinite(seed)) || String(seed).length > 256) {
    throw new TypeError('seed must be a finite number or a string of at most 256 characters');
  }
  if (!Number.isFinite(durationSeconds) || durationSeconds < 4 || durationSeconds > 300) throw new RangeError('durationSeconds must be between 4 and 300');
  if (typeof outDir !== 'string' || !outDir.trim()) throw new TypeError('outDir must be a non-empty path');
  const destination = path.resolve(outDir);
  await mkdir(destination, { recursive: true });
  const temporary = await mkdtemp(path.join(destination, '.music-'));
  const grid = makeGrid(style, seed, Math.round(durationSeconds * SR) / SR);
  const audioPath = path.join(destination, 'music.wav'), gridPath = path.join(destination, 'beat-grid.json');
  try {
    let source = path.join(temporary, 'source.wav');
    await writeFile(source, wavFloat(compose(grid, randomFor(seed))));
    let analysis = await analyzeAudio(source), mastered;
    for (let attempt = 0; attempt < 3; attempt++) {
      mastered = path.join(temporary, `master-${attempt}.wav`);
      const m = analysis.raw;
      const filter = `loudnorm=I=${TARGET}:TP=${PEAK}:LRA=7:measured_I=${m.input_i}:measured_TP=${m.input_tp}:measured_LRA=${m.input_lra}:measured_thresh=${m.input_thresh}:offset=${m.target_offset}:linear=true`;
      await ffmpeg(['-y', '-i', source, '-map_metadata', '-1', '-af', filter, '-ar', String(SR), '-c:a', 'pcm_s24le', '-fflags', '+bitexact', '-flags:a', '+bitexact', mastered]);
      analysis = await analyzeAudio(mastered);
      // R128 gating can move after normalization, especially on short intros.
      // Correct measured loudness directly when the decoded true-peak headroom permits.
      const correction = TARGET - analysis.integratedLufs;
      if (Math.abs(correction) > .03 && analysis.truePeakDbtp + correction <= -1.5) {
        const corrected = path.join(temporary, `corrected-${attempt}.wav`);
        await ffmpeg(['-y', '-i', mastered, '-map_metadata', '-1', '-af', `volume=${correction}dB`,
          '-c:a', 'pcm_s24le', '-fflags', '+bitexact', '-flags:a', '+bitexact', corrected]);
        mastered = corrected;
        analysis = await analyzeAudio(mastered);
      }
      if (Math.abs(analysis.integratedLufs - TARGET) <= LOUDNESS_TOLERANCE && analysis.truePeakDbtp <= -1) break;
      source = mastered;
    }
    if (Math.abs(analysis.integratedLufs - TARGET) > LOUDNESS_TOLERANCE || analysis.truePeakDbtp > -1) {
      throw new Error(`Mastering failed delivery limits: ${analysis.integratedLufs} LUFS, ${analysis.truePeakDbtp} dBTP`);
    }
    const { raw, ...measured } = analysis;
    grid.analysis = { ...measured, targetLufs: TARGET, maxTruePeakDbtp: -1, toleranceLu: LOUDNESS_TOLERANCE };
    const pendingGrid = path.join(temporary, 'beat-grid.json');
    await writeFile(pendingGrid, `${JSON.stringify(grid, null, 2)}\n`);
    await rename(mastered, audioPath);
    await rename(pendingGrid, gridPath);
    return { audioPath, gridPath, grid, analysis: grid.analysis };
  } finally { await rm(temporary, { recursive: true, force: true }); }
}
