import path from 'node:path';
import {ROOT, run, isMain} from './common.mjs';

// Same 3×3, 640×360 cells and 6px gutters as the supplied nine-frame reference.
export async function contactSheet(samples, output = path.join(ROOT, 'build/contact-sheet.png')) {
  if (samples.length !== 9) throw new Error('Contact sheet requires nine representative frames');
  const layout = samples.map((_, i) => `${i % 3 * 646}_${Math.floor(i / 3) * 366}`).join('|');
  const inputs = samples.flatMap(s => ['-i', path.resolve(ROOT, s.file)]);
  const filters = samples.map((_, i) => `[${i}:v]scale=640:360:flags=lanczos[v${i}]`).join(';') + ';' + samples.map((_, i) => `[v${i}]`).join('') + `xstack=inputs=9:layout=${layout}:fill=0x222222[out]`;
  await run('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-nostdin', '-y', ...inputs, '-filter_complex', filters, '-map', '[out]', '-frames:v', '1', '-threads', '1', output]);
  return output;
}
if (isMain(import.meta.url)) {
  const {readJson} = await import('./common.mjs');
  await contactSheet((await readJson(path.join(ROOT, 'build/render.json'))).samples);
}
