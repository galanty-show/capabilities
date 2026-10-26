// SPDX-License-Identifier: MIT
// Adapted from the lab promo work-lib helper. See NOTICE.md for provenance.
import {createHash} from 'node:crypto';
import {readFileSync, writeFileSync, mkdirSync, realpathSync, statSync} from 'node:fs';
import path from 'node:path';

export const FPS = 30;
const positiveInteger = (value, label) => {
  if (!Number.isSafeInteger(value) || value <= 0) throw new TypeError(`${label} must be a positive safe integer`);
  return value;
};
const requiredText = (value, label) => {
  if (typeof value !== 'string' || !value.trim()) throw new TypeError(`${label} is required`);
  return value;
};

/** For renderers using ceil(seconds * fps); not a universal duration conversion. */
export function secondsFor(frames, fps = FPS) {
  positiveInteger(frames, 'frames');
  positiveInteger(fps, 'fps');
  return (frames - 0.02) / fps;
}

/** Temporary id; import_asset must replace it with the App's actual assetId. */
export function placeholderId(file) {
  const hash = createHash('sha256').update(readFileSync(file)).digest('hex');
  return `${hash.slice(0, 24)}-${hash.slice(24, 36)}`;
}

function assetFile(root, file) {
  requiredText(file, 'asset file');
  if (path.isAbsolute(file) || /^[A-Za-z]:/.test(file) || file.includes('\\') || file.split('/').includes('..')) {
    throw new TypeError('asset file must stay inside assets/');
  }
  const base = realpathSync(root);
  const target = realpathSync(path.join(base, file));
  const relative = path.relative(base, target);
  if (relative.startsWith(`..${path.sep}`) || relative === '..' || path.isAbsolute(relative) || !statSync(target).isFile()) {
    throw new TypeError('asset file must stay inside assets/');
  }
  return target;
}

export const writeJson = (file, value) => writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);

/**
 * scenes: [{id, title, part?, from, to, assets?: {slot: relativeFile}, props?}]
 * meta: {title, subtitle?, sourceTitle?, module, grid?, license?, credit?, describe?}
 * license and credit are required if assets are present; this does not audit rights.
 * Writes input files only. It never imports assets, invokes AI, renders or exports.
 */
export function buildWork(workDir, meta, scenes, settings = {}, {fps = FPS} = {}) {
  positiveInteger(fps, 'fps');
  if (![24, 25, 30].includes(fps)) throw new TypeError('v3-lite settings support fps 24, 25 or 30');
  requiredText(meta?.title, 'title');
  requiredText(meta?.module, 'module');
  if (!Array.isArray(scenes) || !scenes.length) throw new TypeError('scenes must not be empty');
  const manifest = new Map(), ids = new Set();
  let end = 0;
  const boardScenes = scenes.map((scene, index) => {
    const id = requiredText(scene.id, 'scene id');
    if (ids.has(id)) throw new TypeError('scene ids must be unique');
    ids.add(id);
    if (!Number.isSafeInteger(scene.from) || scene.from !== end || !Number.isSafeInteger(scene.to) || scene.to <= scene.from) {
      throw new TypeError('scenes must be contiguous positive integer frame ranges starting at 0');
    }
    end = scene.to;
    requiredText(scene.title, 'scene title');
    const assets = Object.entries(scene.assets ?? {}).map(([slot, file]) => {
      requiredText(slot, 'asset slot');
      requiredText(meta.license, 'asset license');
      requiredText(meta.credit, 'asset credit');
      const assetId = placeholderId(assetFile(path.join(workDir, 'assets'), file));
      if (!manifest.has(assetId)) manifest.set(assetId, {
        id: assetId, file, title: path.basename(file, path.extname(file)),
        license: meta.license, credit: meta.credit, sourceUrl: '',
        description: meta.describe?.(file) ?? '',
      });
      return {slot, assetId, fit: 'contain'};
    });
    return {
      id, title: scene.title, narration: '',
      duration: {mode: 'fixed', seconds: secondsFor(scene.to - scene.from, fps)},
      ...(index < scenes.length - 1 ? {transition: {kind: 'cut', duration: 0}} : {}),
      component: {id: 'scene.code', params: {module: meta.module, props: {
        ...(scene.props ?? {}), ...(scene.part === undefined ? {} : {part: scene.part}),
        t0: scene.from / fps, ...(meta.grid === undefined ? {} : {grid: meta.grid}),
      }}},
      ...(assets.length ? {assets} : {}),
    };
  });
  const storyboard = {contractVersion: 3, title: meta.title,
    ...(meta.subtitle === undefined ? {} : {subtitle: meta.subtitle}),
    ...(meta.sourceTitle === undefined ? {} : {sourceTitle: meta.sourceTitle}), scenes: boardScenes};
  // Validate everything above before writing. Use a separate generated-work directory.
  mkdirSync(workDir, {recursive: true});
  writeJson(path.join(workDir, 'storyboard.json'), storyboard);
  writeJson(path.join(workDir, 'settings.json'), {...settings, fps});
  writeJson(path.join(workDir, 'assets.json'), [...manifest.values()]);
  return {storyboard, assets: [...manifest.values()], totalFrames: end, seconds: end / fps};
}
