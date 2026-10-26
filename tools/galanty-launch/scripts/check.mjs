import path from 'node:path';
import {rm} from 'node:fs/promises';
import {ROOT, run, readJson, writeJson, isMain} from './common.mjs';
import {beatResiduals, pacingAdvice} from './storyboard.mjs';
import {renderVideo, fingerprint, extractFrames, decodedFrameHashes} from './render.mjs';
import {analyzeAudio, inspectBeatOnsets} from './music.mjs';
import {analyzeVisualCoverage} from './visual-check.mjs';

export function checkLimits({plan, audio, media, residual, fontsReady, deterministic}) {
  const errors = [];
  if (![audio.integratedLufs, audio.truePeakDbtp, Number(media.format.duration), residual.medianMs].every(Number.isFinite)) errors.push('Non-finite delivery measurements');
  if (Math.abs(audio.integratedLufs + 14) > .3) errors.push(`Delivered audio: ${audio.integratedLufs} LUFS; target -14 +/-0.3 LU`);
  if (audio.truePeakDbtp > -1) errors.push(`Delivered true peak: ${audio.truePeakDbtp} dBTP; ceiling -1 dBTP`);
  if (Math.abs(Number(media.format.duration) - plan.durationInFrames / plan.fps) > 1 / plan.fps + .001) errors.push('Delivered duration differs by more than one frame');
  const video = media.streams.find((s) => s.codec_type === 'video');
  if (video?.width !== plan.width || video?.height !== plan.height || Number(video?.nb_frames) !== plan.durationInFrames) errors.push('Video size/frame count mismatch');
  if (!media.streams.some((s) => s.codec_type === 'audio')) errors.push('Delivered film has no audio track');
  if (residual.medianMs > 10) errors.push(`Cut/grid median residual ${residual.medianMs.toFixed(2)}ms > 10ms`);
  if (!fontsReady) errors.push('Bundled font load evidence missing');
  if (!deterministic) errors.push('Two independent full renders differ in decoded RGBA frames');
  return errors;
}

export async function check() {
  const started = performance.now();
  const plan = await readJson(path.join(ROOT, 'build/storyboard.json'));
  const first = await readJson(path.join(ROOT, 'build/render.json'));
  if (await fingerprint(first.briefPath) !== first.fingerprint) throw new Error('Inputs or toolkit changed after rendering. Run npm run demo again before checking.');
  // Independently render the entire movie with a fresh Chromium process.
  const secondPath = path.join(ROOT, 'build/check-second.mp4');
  const second = await renderVideo(secondPath);
  const a = await extractFrames(path.join(ROOT, 'build/promo.mp4'), plan, path.join(ROOT, 'build/frames'));
  const b = await extractFrames(secondPath, plan, path.join(ROOT, 'build/check-frames'));
  const [fullA, fullB] = await Promise.all([decodedFrameHashes(path.join(ROOT, 'build/promo.mp4')), decodedFrameHashes(secondPath)]);
  const matchedFullFrames = fullA.filter((hash, i) => hash === fullB[i]).length;
  const deterministic = fullA.length === plan.durationInFrames && fullB.length === fullA.length && matchedFullFrames === fullA.length && a.every((sample, index) => sample.rgbaSha256 === b[index].rgbaSha256);
  const {stdout} = await run('ffprobe', ['-v', 'error', '-show_format', '-show_streams', '-of', 'json', path.join(ROOT, 'build/promo.mp4')]);
  const media = JSON.parse(stdout), residual = beatResiduals(plan);
  const audio = await analyzeAudio(path.join(ROOT, 'build/promo.mp4'));
  const onsets = await inspectBeatOnsets(path.join(ROOT, 'build/promo.mp4'), plan.grid);
  const errors = checkLimits({plan, media, audio, residual, fontsReady: first.fontsReady && second.fontsReady, deterministic});
  if (onsets.evaluatedSection && (onsets.matchedBeatRatio < .9 || onsets.medianResidualSeconds === null || onsets.medianResidualSeconds > .0100001)) {
    errors.push('Decoded Drop transients do not match the music grid (>=90% matches, median <=10ms required)');
  }
  const manifest = await readJson(path.join(ROOT, 'public/fonts/manifest.json'));
  const coverage = new Set(Object.values(manifest).flatMap((font) => font.codepoints));
  const words = [...(plan.brief.onScreenCopy ?? []), ...plan.scenes.flatMap(s => [s.text, s.detail ?? '']), plan.brief.productName, plan.brief.tagline, plan.brief.installCommand ?? '', plan.brief.demoLabel ?? '', ...(plan.brief.terminalLines ?? []), plan.brief.codeCaption ?? '', plan.brief.gridItemLabel ?? '', plan.brief.revealCaption ?? '', plan.brief.timelineCaption ?? '', ...plan.brief.sellingPoints.flatMap(s => [s.text, s.detail ?? '', s.command ?? '', s.metric?.label ?? '', ...(s.metric?.items ?? []), s.scale?.label ?? '']), ...(plan.brief.milestones ?? []).flatMap(m => [m.date, m.label])].join('');
  const missing = [...new Set([...words].filter((c) => !coverage.has(c.codePointAt(0)) && !/\s/u.test(c)))];
  if (missing.length) errors.push(`Bundled fonts lack glyphs: ${missing.join(' ')}. Bundle an appropriately licensed face before delivery.`);
  const visual = await analyzeVisualCoverage(path.join(ROOT, 'build/promo.mp4'), {fps: plan.fps, sourceWidth: plan.width, sourceHeight: plan.height});
  const visualResultsFile = 'build/visual-coverage.json';
  await writeJson(path.join(ROOT, visualResultsFile), {summary: visual.summary, warnings: visual.warnings, frames: visual.frames});
  if (await fingerprint(first.briefPath) !== first.fingerprint) errors.push('Inputs or toolkit changed during checking; regenerate delivery evidence.');
  const report = {ok: errors.length === 0, checks: {durationSeconds: Number(media.format.duration), frames: plan.durationInFrames, audio: {integratedLufs: audio.integratedLufs, truePeakDbtp: audio.truePeakDbtp}, cutResidual: residual, decodedMusicOnsets: onsets, deterministic, decodedRgbaFrames: fullA.length, matchedFullFrames, matchedFrames: a.filter((s, i) => s.rgbaSha256 === b[i].rgbaSha256).length, fontsLoaded: first.fontsReady && second.fontsReady, missingGlyphs: missing, visualCoverage: {...visual.summary, resultsFile: visualResultsFile}}, warnings: [...pacingAdvice(plan), ...visual.warnings], errors, samples: a, secondSamples: b, seconds: (performance.now() - started) / 1000};
  await writeJson(path.join(ROOT, 'build/check.json'), report);
  if (report.ok) await rm(secondPath);
  console.log(JSON.stringify(report, null, 2));
  return report;
}
if (isMain(import.meta.url)) {
  try { const report = await check(); if (!report.ok) process.exitCode = 1; }
  catch (error) { console.error(`Check failed: ${error.message}`); process.exitCode = 1; }
}
