import path from 'node:path';
import {readFile, readdir, mkdir, rm} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {bundle} from '@remotion/bundler';
import {openBrowser, selectComposition, renderMedia} from '@remotion/renderer';
import {ROOT, run, readJson, writeJson, briefArgument, isMain} from './common.mjs';
import {prepare} from './prepare.mjs';
import {contactSheet} from './contact-sheet.mjs';
import {muxMusic} from './mux.mjs';

export async function fingerprint(briefPath) {
  const files = ['package.json', 'package-lock.json', 'tsconfig.json', 'remotion.config.ts', 'public/generated/project.json', 'public/generated/music.wav'];
  for (const dir of ['scripts', 'scenes', 'public/fonts', 'public/brand']) {
    for (const name of (await readdir(path.join(ROOT, dir))).sort()) files.push(`${dir}/${name}`);
  }
  const hash = createHash('sha256');
  for (const file of files) { hash.update(file); hash.update(await readFile(path.join(ROOT, file))); }
  hash.update(await readFile(briefPath));
  return hash.digest('hex');
}

export function configuredRenderPort(value = process.env.GALANTY_RENDER_PORT ?? '4392') {
  if (!/^\d+$/.test(String(value)) || Number(value) < 1 || Number(value) > 65535) throw new Error('GALANTY_RENDER_PORT must be an integer from 1 to 65535');
  return Number(value);
}

export async function renderVideo(outputLocation) {
  const started = performance.now(), port = configuredRenderPort();
  const serveUrl = await bundle({entryPoint: path.join(ROOT, 'scenes/index.tsx'), publicDir: path.join(ROOT, 'public'), outDir: path.join(ROOT, 'build/bundle'), enableCaching: true});
  const browser = await openBrowser('chrome', {browserExecutable: process.env.REMOTION_BROWSER_EXECUTABLE});
  let fontsReady = false;
  const onBrowserLog = (log) => { if (log.text.includes('LAUNCH_FONTS_READY:2')) fontsReady = true; };
  try {
    const options = {serveUrl, puppeteerInstance: browser, port, onBrowserLog};
    const composition = await selectComposition({...options, id: 'Launch'});
    let lastProgress = -1;
    const silentPath = `${outputLocation}.silent.mp4`;
    await renderMedia({...options, composition, codec: 'h264', outputLocation: silentPath, muted: true, concurrency: 4, imageFormat: 'png', crf: 18,
      audioBitrate: '320k', pixelFormat: 'yuv420p', onProgress: ({progress}) => {
        const bucket = Math.floor(progress * 4);
        if (bucket !== lastProgress) { lastProgress = bucket; console.log(`Render ${Math.round(progress * 100)}%`); }
      }});
    if (!fontsReady) throw new Error('Missing browser evidence that both bundled fonts loaded');
    await muxMusic({videoPath: silentPath, audioPath: path.join(ROOT, 'public/generated/music.wav'), outputPath: outputLocation, durationSeconds: composition.durationInFrames / composition.fps});
    await rm(silentPath);
    return {pid: process.pid, port, seconds: (performance.now() - started) / 1000, fontsReady, durationInFrames: composition.durationInFrames, fps: composition.fps};
  } finally { await browser.close({silent: true}); }
}

export async function decodedFrameHashes(video) {
  const {stdout} = await run('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-nostdin', '-i', video, '-map', '0:v:0', '-an', '-pix_fmt', 'rgba', '-threads', '1', '-f', 'framehash', '-hash', 'sha256', 'pipe:1']);
  return stdout.split('\n').filter(line => line && !line.startsWith('#')).map(line => line.split(',').at(-1).trim());
}

export function sampleFrames(plan) {
  if (plan.scenes.length === 9 && plan.scenes.every(s => s.primitive === 'SelfProof')) return plan.scenes.map((s, i) => s.from + (i === 4 ? 15 : Math.floor(s.durationInFrames * .72)));
  const first = name => plan.scenes.find(s => s.primitive === name);
  const last = plan.scenes.at(-1);
  // Editorial contact sheet covers the vocabulary, then the high-energy Drop.
  const choices = [first('LaunchTerminal'), first('ImpactWord'), first('ToolCounter'), first('MilestoneTimeline'), first('FullCode'), first('ScaleGrid'), first('PixelLogo'), [...plan.scenes].reverse().find(s => s.primitive === 'ImpactWord'), last];
  return choices.map((s, i) => {
    const scene = s ?? plan.scenes[Math.round(i * (plan.scenes.length - 1) / 8)];
    return Math.min(plan.durationInFrames - 1, scene.from + Math.floor(scene.durationInFrames * .72));
  });
}
export async function extractFrames(video, plan, directory) {
  await mkdir(directory, {recursive: true});
  const samples = [];
  for (const [index, frame] of sampleFrames(plan).entries()) {
    const file = path.join(directory, `frame-${index + 1}.png`);
    await run('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-nostdin', '-y', '-i', video, '-vf', `select=eq(n\\,${frame})`, '-frames:v', '1', '-threads', '1', file]);
    const {stdout} = await run('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-nostdin', '-i', file, '-f', 'rawvideo', '-pix_fmt', 'rgba', '-threads', '1', 'pipe:1'], {encoding: 'buffer', maxBuffer: 8 * 1024 * 1024});
    samples.push({frame, seconds: frame / plan.fps, file: path.relative(ROOT, file), rgbaSha256: createHash('sha256').update(stdout).digest('hex')});
  }
  return samples;
}

if (isMain(import.meta.url)) {
  try {
    const started = performance.now(), briefPath = briefArgument();
    const plan = await prepare(briefPath);
    const rendering = await renderVideo(path.join(ROOT, 'build/promo.mp4'));
    const samples = await extractFrames(path.join(ROOT, 'build/promo.mp4'), plan, path.join(ROOT, 'build/frames'));
    await contactSheet(samples);
    const report = {briefPath, fingerprint: await fingerprint(briefPath), ...rendering, samples, totalSeconds: (performance.now() - started) / 1000};
    await writeJson(path.join(ROOT, 'build/render.json'), report);
    console.log(`Created build/promo.mp4 + 9 frames + build/contact-sheet.png in ${report.totalSeconds.toFixed(1)}s. Run npm run check; inspect the film and frames.`);
  } catch (error) { console.error(error); process.exitCode = 1; }
}
