import path from 'node:path';
import {mkdir, cp, copyFile} from 'node:fs/promises';
import {ROOT, readJson, writeJson, isMain} from './common.mjs';
import {prepare} from './prepare.mjs';
import {selfProofPlan} from './self-proof-plan.mjs';
import {renderVideo, extractFrames, fingerprint} from './render.mjs';
import {contactSheet} from './contact-sheet.mjs';
import {check} from './check.mjs';
import {referenceComparison} from './reference-comparison.mjs';

// No App is launched. This lane is expressly prohibited from operating an App/QA instance.
export async function selfProof({language, output, reference, checkDelivery = true}) {
  if (!['zh', 'en'].includes(language)) throw new Error('--language must be zh or en');
  const started = performance.now(), briefPath = path.join(ROOT, `examples/galanty-${language}.json`);
  const brief = await readJson(briefPath);
  const base = await prepare(briefPath);
  const plan = selfProofPlan(brief, base.grid);
  await writeJson(path.join(ROOT, 'public/generated/project.json'), plan);
  await writeJson(path.join(ROOT, 'build/storyboard.json'), plan);
  const rendering = await renderVideo(path.join(ROOT, 'build/promo.mp4'));
  const samples = await extractFrames(path.join(ROOT, 'build/promo.mp4'), plan, path.join(ROOT, 'build/frames'));
  await contactSheet(samples);
  const report = {briefPath, fingerprint: await fingerprint(briefPath), ...rendering, samples, totalSeconds: (performance.now() - started) / 1000};
  await writeJson(path.join(ROOT, 'build/render.json'), report);
  if (checkDelivery && !(await check()).ok) throw new Error('Self-proof delivery checks failed; see build/check.json');
  if (reference) await referenceComparison(reference);
  if (output) {
    const target = path.resolve(output, language);
    await mkdir(target, {recursive: true});
    for (const name of ['promo.mp4', 'frames', 'contact-sheet.png', 'storyboard.json', 'render.json', ...(checkDelivery ? ['check.json', 'visual-coverage.json'] : []), ...(reference ? ['reference-comparison.png', 'reference-comparison.json'] : [])]) await cp(path.join(ROOT, 'build', name), path.join(target, name), {recursive: true});
    await copyFile(briefPath, path.join(target, 'brief.json'));
    await writeJson(path.join(target, 'production.json'), {language, seconds: (performance.now() - started) / 1000, renderSeconds: rendering.seconds, audio: 'local deterministic synthesis; no voice-over', aiUsage: {tokens: null, scope: 'No per-film AI token telemetry is available; development conversation excluded.'}, preview: {appOperated: false, reason: 'User prohibited operating installed App or QA; rendered frames inspected separately.'}, pid: process.pid});
    console.log(`Saved ${target}`);
  }
  return report;
}
if (isMain(import.meta.url)) {
  const value = key => process.argv[process.argv.indexOf(key) + 1];
  try {
    if (!process.argv.includes('--language') || !process.argv.includes('--output')) throw new Error('Usage: npm run film:self-proof -- --language zh|en --output <delivery-dir> [--reference <local-nine-frame-sheet>] [--render-only]');
    await selfProof({language: value('--language'), output: value('--output'), reference: process.argv.includes('--reference') ? value('--reference') : undefined, checkDelivery: !process.argv.includes('--render-only')});
  } catch (error) {console.error(error); process.exitCode = 1;}
}
