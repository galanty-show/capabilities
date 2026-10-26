import path from 'node:path';
import {mkdir} from 'node:fs/promises';
import {ROOT, readJson, writeJson, briefArgument, isMain} from './common.mjs';
import {planStoryboard, pacingAdvice, validateBrief, FPS} from './storyboard.mjs';
import {synthesize} from './music.mjs';

export async function prepare(briefPath = path.join(ROOT, 'brief.json')) {
  const start = performance.now();
  const brief = validateBrief(await readJson(briefPath));
  // Frame-rounded duration is the single duration used by audio and picture.
  const durationSeconds = Math.round(brief.durationSeconds * FPS) / FPS;
  const music = await synthesize({style: brief.musicStyle, seed: brief.seed, durationSeconds, outDir: path.join(ROOT, 'public/generated')});
  const plan = planStoryboard({...brief, durationSeconds}, music.grid);
  await mkdir(path.join(ROOT, 'build'), {recursive: true});
  await writeJson(path.join(ROOT, 'public/generated/project.json'), plan);
  await writeJson(path.join(ROOT, 'build/storyboard.json'), plan);
  await writeJson(path.join(ROOT, 'build/prepare.json'), {seconds: (performance.now() - start) / 1000, audio: music.analysis, warnings: pacingAdvice(plan)});
  return plan;
}
if (isMain(import.meta.url)) {
  try { const plan = await prepare(briefArgument()); console.log(`Prepared ${plan.scenes.length} scenes, ${plan.durationInFrames / plan.fps}s. Sources retained in build/storyboard.json.`); }
  catch (error) { console.error(error.message); process.exitCode = 1; }
}
