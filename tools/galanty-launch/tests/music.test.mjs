import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { promisify } from 'node:util';
import { execFile } from 'node:child_process';
import { synthesize, analyzeAudio, inspectBeatOnsets, detectTransientOnsets, MUSIC_STYLES } from '../scripts/music.mjs';

import {planStoryboard, beatResiduals} from '../scripts/storyboard.mjs';
const brief = JSON.parse(await readFile(new URL('../brief.json', import.meta.url)));
const run = promisify(execFile);
const hash = bytes => createHash('sha256').update(bytes).digest('hex');

for (const style of MUSIC_STYLES) test(`${style}: deterministic samples, seed variation, measured loudness and legal grid`, { timeout: 120000 }, async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'galanty-music-test-'));
  try {
    const options = { style, seed: 'original-score-17', durationSeconds: 8 };
    const a = await synthesize({ ...options, outDir: path.join(root, 'a') });
    const b = await synthesize({ ...options, outDir: path.join(root, 'b') });
    const c = await synthesize({ ...options, seed: 'original-score-18', outDir: path.join(root, 'c') });
    const bytes = await Promise.all([a.audioPath, b.audioPath, c.audioPath].map(p => readFile(p)));
    assert.equal(hash(bytes[0]), hash(bytes[1]));
    assert.notEqual(hash(bytes[0]), hash(bytes[2]));
    assert.deepEqual(a.grid, b.grid);
    const measured = await analyzeAudio(a.audioPath);
    assert.ok(Math.abs(measured.integratedLufs + 14) <= .15, `${measured.integratedLufs} LUFS`);
    assert.ok(measured.truePeakDbtp <= -1, `${measured.truePeakDbtp} dBTP`);
    const { stdout } = await run('ffprobe', ['-v', 'error', '-show_entries', 'stream=sample_rate,channels:format=duration', '-of', 'json', a.audioPath]);
    const probe = JSON.parse(stdout);
    assert.equal(Number(probe.streams[0].sample_rate), 48000);
    assert.equal(probe.streams[0].channels, 2);
    assert.ok(Math.abs(Number(probe.format.duration) - 8) <= 1 / 48000);
    const grid = a.grid;
    assert.equal(grid.beats[0], 0);
    for (let i = 0; i < grid.beats.length; i++) {
      assert.ok(Math.abs(grid.beats[i] - i * 60 / grid.bpm) < 1e-9);
      assert.ok(grid.beats[i] < grid.durationSeconds);
    }
    const plan = planStoryboard({...brief, musicStyle: style, durationSeconds: 8}, grid);
    assert.ok(beatResiduals(plan).medianMs <= 10, `${style}: cuts must remain representable on the 30fps timeline`);
    assert.equal(grid.sections[0].start, 0);
    assert.equal(grid.sections.at(-1).end, 8);
    grid.sections.forEach((section, i) => {
      assert.ok(section.end > section.start);
      if (i) assert.equal(section.start, grid.sections[i - 1].end);
      assert.ok(Math.abs(section.start / grid.beatSeconds - Math.round(section.start / grid.beatSeconds)) < 1e-9);
    });
    if (style === 'electronic') {
      assert.equal(grid.bpm, 128); assert.ok(grid.sections.some(s => s.name === 'drop'));
      const onset = await inspectBeatOnsets(a.audioPath, grid);
      assert.ok(onset.onsetTimes.length > 0);
      assert.ok(onset.matchedBeatRatio >= .85, JSON.stringify(onset));
      assert.ok(onset.medianResidualSeconds <= .04, JSON.stringify(onset));
      const delayed = path.join(root, 'delayed.wav');
      await run('ffmpeg', ['-hide_banner', '-nostdin', '-v', 'error', '-i', a.audioPath,
        '-af', 'adelay=110:all=1', '-t', '8', '-c:a', 'pcm_s24le', delayed]);
      const shifted = await inspectBeatOnsets(delayed, grid);
      assert.ok(shifted.matchedBeatRatio < .5, 'Audio delay must fail despite unchanged grid metadata');
      assert.ok(shifted.medianResidualSeconds > .08, JSON.stringify(shifted));
    }
    assert.deepEqual(JSON.parse(await readFile(a.gridPath, 'utf8')), grid);
  } finally { await rm(root, { recursive: true, force: true }); }
});

test('reject invalid parameters before rendering', async () => {
  for (const input of [ { style: 'unknown' }, { seed: NaN }, { seed: {} }, { durationSeconds: 0 },
    { durationSeconds: Infinity }, { durationSeconds: 301 }, { outDir: '' } ]) {
    await assert.rejects(synthesize({ outDir: os.tmpdir(), ...input }));
  }
});

test('transient onset follows the leading attack across peak phases without hiding real delay', () => {
  const novelty = new Float64Array(500);
  // Identical attacks, different peak positions within a kick's first 20ms.
  for (const [start, shape] of [[50, [.65, .72, .94, 1, .25]], [150, [1, .8, .7, .85, .1]], [250, [.8, .7, .7, 1, .2]]]) {
    novelty.set(shape, start);
  }
  assert.deepEqual(detectTransientOnsets(novelty), [.25, .75, 1.25]);
  const delayed = new Float64Array(500); delayed.set(novelty.subarray(0, 478), 22);
  const times = detectTransientOnsets(delayed);
  assert.ok(times.every((time, i) => Math.abs(time - [.25, .75, 1.25][i] - .11) < 1e-9));
});

test('80 BPM bar sections avoid half-frame cut bias and short films retain ordered coverage', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'launch-section-test-'));
  try {
    for (const durationSeconds of [4, 8, 30]) {
      const {grid} = await synthesize({style: 'lofi', seed: 2101, durationSeconds, outDir: path.join(root, String(durationSeconds))});
      const plan = planStoryboard({...brief, musicStyle: 'lofi', durationSeconds}, grid);
      assert.ok(beatResiduals(plan).medianMs <= 10);
      assert.equal(plan.scenes.reduce((sum, scene) => sum + scene.durationInFrames, 0), durationSeconds * 30);
      for (const section of grid.sections) assert.ok(section.end > section.start);
      if (durationSeconds === 30) assert.deepEqual(grid.sections.map(section => section.start), [0, 6, 27]);
    }
  } finally { await rm(root, {recursive: true, force: true}); }
});
