import path from 'node:path';
import {ROOT, run, readJson, writeJson, isMain} from './common.mjs';

// Reference media stays local: never download or redistribute another film.
export async function referenceComparison(referencePath, output = path.join(ROOT, 'build/reference-comparison.png')) {
  const sheet = path.join(ROOT, 'build/contact-sheet.png');
  const dimensions = [];
  for (const file of [referencePath, sheet]) {
    const {stdout} = await run('ffprobe', ['-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=width,height', '-of', 'json', file]);
    dimensions.push(JSON.parse(stdout).streams[0]);
  }
  if (dimensions.some(size => size?.width !== 1932 || size?.height !== 1092)) throw new Error('Both contact sheets must use nine 640×360 cells with 6px gutters (1932×1092)');
  if (path.resolve(referencePath) === path.resolve(output)) throw new Error('Output must not overwrite the reference');
  await run('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-nostdin', '-y', '-i', referencePath, '-i', sheet, '-filter_complex', '[0:v][1:v]hstack=inputs=2[out]', '-map', '[out]', '-frames:v', '1', '-threads', '1', output]);
  const render = await readJson(path.join(ROOT, 'build/render.json'));
  await writeJson(path.join(ROOT, 'build/reference-comparison.json'), {layout: 'left: local study reference / right: current demo; not an endorsement', reference: path.basename(referencePath), output: path.relative(ROOT, output), renderFingerprint: render.fingerprint, samples: render.samples.map(s => ({frame: s.frame, seconds: s.seconds}))});
  return output;
}
if (isMain(import.meta.url)) {
  try {
    const index = process.argv.indexOf('--reference');
    if (index < 0 || !process.argv[index + 1]) throw new Error('Usage: npm run compare -- --reference <local nine-frame sheet.png>. Keep third-party reference media out of Git.');
    console.log(await referenceComparison(path.resolve(process.argv[index + 1])));
  } catch (error) { console.error(error.message); process.exitCode = 1; }
}
