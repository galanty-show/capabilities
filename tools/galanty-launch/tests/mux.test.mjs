import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp, rm} from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {run} from '../scripts/common.mjs';
import {synthesize, analyzeAudio, inspectBeatOnsets} from '../scripts/music.mjs';
import {muxMusic} from '../scripts/mux.mjs';

test('MP4 delivery preserves zero-based WAV timing, exact duration, loudness and true peak', {timeout: 120000}, async () => {
  const directory = await mkdtemp(path.join(os.tmpdir(), 'launch-mux-test-'));
  try {
    const videoPath = path.join(directory, 'silent.mp4'), outputPath = path.join(directory, 'promo.mp4');
    await run('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-nostdin', '-f', 'lavfi', '-i', 'color=c=black:s=160x90:r=30:d=24', '-an', '-c:v', 'libx264', '-threads', '1', videoPath]);
    for (const style of ['electronic', 'lofi', 'epic']) {
      const {audioPath, grid} = await synthesize({style, seed: 105, durationSeconds: 24, outDir: path.join(directory, style)});
      await muxMusic({videoPath, audioPath, outputPath, durationSeconds: 24});
      const {stdout} = await run('ffprobe', ['-v', 'error', '-show_format', '-show_streams', '-of', 'json', outputPath]);
      const media = JSON.parse(stdout);
      assert.equal(Number(media.format.duration), 24);
      assert.equal(Number(media.streams.find((s) => s.codec_type === 'video').nb_frames), 720);
      assert.equal(Number(media.streams.find((s) => s.codec_type === 'audio').start_time), 0);
      const audio = await analyzeAudio(outputPath);
      assert.ok(Math.abs(audio.integratedLufs + 14) <= .3, `${style}: ${audio.integratedLufs} LUFS`);
      assert.ok(audio.truePeakDbtp <= -1, `${style}: ${audio.truePeakDbtp} dBTP`);
      if (style === 'electronic') {
        const onsets = await inspectBeatOnsets(outputPath, grid);
        assert.ok(onsets.matchedBeatRatio >= .9);
        assert.ok(onsets.medianResidualSeconds <= .0100001, JSON.stringify(onsets));
      }
    }
  } finally { await rm(directory, {recursive: true, force: true}); }
});
