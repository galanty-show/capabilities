import {spawn} from 'node:child_process';

export const VISUAL_THRESHOLD = .25;
export const VISUAL_METHOD = {
  name: 'contrast-component-region-coverage-v2',
  tileSize: 10,
  minimumContrastingPixelRatio: .18,
  minimumRgbDistance: 48,
  minimumLumaDifference: 24,
  minimumChromaDistance: 64,
  maximumTileGap: 2,
  minimumComponentTiles: 4,
  minimumComponentDensity: .2,
  limitations: 'Advisory heuristic, not semantic subject detection: estimates a dominant border background, groups nearby contrasting tiles, and measures the union of sufficiently populated component rectangles. Raw contrastingTileCoverage is retained separately. Strong decoration, gradients, connected outlines or a subject touching most borders can bias coverage; widely spaced text can split into smaller regions. Inspect the film and extracted frames.',
};

// The border mode avoids treating a small bright panel as the background.
// Quantization tolerates compression noise; near-background fills and sparse
// low-contrast decoration do not activate a tile merely because they are colored.
function borderBackground(rgb, width, height) {
  const bins = new Map();
  const band = Math.max(1, Math.round(Math.min(width, height) / 50));
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (x >= band && x < width - band && y >= band && y < height - band) continue;
      const i = (y * width + x) * 3;
      const key = ((rgb[i] >> 5) << 6) | ((rgb[i + 1] >> 5) << 3) | (rgb[i + 2] >> 5);
      const bin = bins.get(key) ?? {count: 0, sums: [0, 0, 0]};
      bin.count++;
      for (let c = 0; c < 3; c++) bin.sums[c] += rgb[i + c];
      bins.set(key, bin);
    }
  }
  const mode = [...bins.values()].reduce((best, bin) => bin.count > best.count ? bin : best);
  return mode.sums.map((sum) => Math.round(sum / mode.count));
}

function subjectRegions(active, columns, rows, width, height) {
  const {tileSize, maximumTileGap, minimumComponentTiles, minimumComponentDensity} = VISUAL_METHOD;
  const visited = new Uint8Array(active.length), covered = new Uint8Array(active.length);
  const regions = [];
  for (let seed = 0; seed < active.length; seed++) {
    if (!active[seed] || visited[seed]) continue;
    const queue = [seed];
    visited[seed] = 1;
    let left = columns, top = rows, right = 0, bottom = 0;
    for (let cursor = 0; cursor < queue.length; cursor++) {
      const cell = queue[cursor], x = cell % columns, y = Math.floor(cell / columns);
      left = Math.min(left, x); right = Math.max(right, x + 1);
      top = Math.min(top, y); bottom = Math.max(bottom, y + 1);
      // Bridge short glyph/word gaps, without filling all canvas negative space.
      const reach = maximumTileGap + 1;
      for (let ny = Math.max(0, y - reach); ny <= Math.min(rows - 1, y + reach); ny++) {
        for (let nx = Math.max(0, x - reach); nx <= Math.min(columns - 1, x + reach); nx++) {
          const neighbor = ny * columns + nx;
          if (active[neighbor] && !visited[neighbor]) { visited[neighbor] = 1; queue.push(neighbor); }
        }
      }
    }
    const density = queue.length / ((right - left) * (bottom - top));
    if (queue.length < minimumComponentTiles || density < minimumComponentDensity) continue;
    regions.push({x: left * tileSize, y: top * tileSize, width: Math.min(width, right * tileSize) - left * tileSize, height: Math.min(height, bottom * tileSize) - top * tileSize, activeTiles: queue.length, density});
    // Rasterize rectangle union, so overlapping component bounds count once.
    for (let y = top; y < bottom; y++) for (let x = left; x < right; x++) covered[y * columns + x] = 1;
  }
  let coveredPixels = 0;
  for (let cell = 0; cell < covered.length; cell++) {
    if (!covered[cell]) continue;
    const x = cell % columns, y = Math.floor(cell / columns);
    coveredPixels += Math.min(tileSize, width - x * tileSize) * Math.min(tileSize, height - y * tileSize);
  }
  return {coverage: coveredPixels / (width * height), regions};
}

export function frameCoverage(rgb, width, height) {
  if (!Number.isInteger(width) || !Number.isInteger(height) || width <= 0 || height <= 0 || rgb.length !== width * height * 3) throw new Error('Expected one complete RGB24 frame with positive integer dimensions');
  const backgroundRgb = borderBackground(rgb, width, height);
  const {tileSize, minimumContrastingPixelRatio, minimumRgbDistance, minimumLumaDifference, minimumChromaDistance} = VISUAL_METHOD;
  const columns = Math.ceil(width / tileSize), rows = Math.ceil(height / tileSize);
  const active = new Uint8Array(columns * rows);
  let coveredPixels = 0;
  for (let top = 0; top < height; top += tileSize) {
    for (let left = 0; left < width; left += tileSize) {
      const right = Math.min(width, left + tileSize), bottom = Math.min(height, top + tileSize);
      const area = (right - left) * (bottom - top);
      let contrasting = 0;
      for (let y = top; y < bottom; y++) {
        for (let x = left; x < right; x++) {
          const i = (y * width + x) * 3;
          const r = rgb[i] - backgroundRgb[0], g = rgb[i + 1] - backgroundRgb[1], b = rgb[i + 2] - backgroundRgb[2];
          const distance = Math.hypot(r, g, b), luma = Math.abs(.2126 * r + .7152 * g + .0722 * b);
          if (distance >= minimumRgbDistance && (luma >= minimumLumaDifference || distance >= minimumChromaDistance)) contrasting++;
        }
      }
      if (contrasting / area >= minimumContrastingPixelRatio) {
        coveredPixels += area;
        active[Math.floor(top / tileSize) * columns + Math.floor(left / tileSize)] = 1;
      }
    }
  }
  return {...subjectRegions(active, columns, rows, width, height), contrastingTileCoverage: coveredPixels / (width * height), backgroundRgb};
}

export function summarizeCoverage(frames, fps, threshold = VISUAL_THRESHOLD) {
  const ranges = [];
  let lowCoverageFrames = 0, total = 0, rawTotal = 0, rawFrames = 0, minimumCoverage = 1;
  for (const frame of frames) {
    total += frame.coverage;
    if (Number.isFinite(frame.contrastingTileCoverage)) { rawTotal += frame.contrastingTileCoverage; rawFrames++; }
    minimumCoverage = Math.min(minimumCoverage, frame.coverage);
    if (frame.coverage >= threshold) continue;
    lowCoverageFrames++;
    const last = ranges.at(-1);
    if (last && last.toFrame === frame.frame - 1) last.toFrame = frame.frame;
    else ranges.push({fromFrame: frame.frame, toFrame: frame.frame});
  }
  const rangeLimit = 12;
  const summary = {
    method: VISUAL_METHOD,
    threshold,
    analyzedFrames: frames.length,
    minimumCoverage: frames.length ? minimumCoverage : null,
    meanCoverage: frames.length ? total / frames.length : null,
    meanContrastingTileCoverage: rawFrames ? rawTotal / rawFrames : null,
    lowCoverageFrames,
    lowCoverageRangeCount: ranges.length,
    lowCoverageRanges: ranges.slice(0, rangeLimit).map((range) => ({...range, fromSeconds: range.fromFrame / fps, toSecondsExclusive: (range.toFrame + 1) / fps})),
    omittedRangeCount: Math.max(0, ranges.length - rangeLimit),
  };
  const warnings = lowCoverageFrames ? [{
    code: 'LOW_VISIBLE_SUBJECT_COVERAGE',
    severity: 'advisory',
    threshold,
    lowCoverageFrames,
    minimumCoverage: summary.minimumCoverage,
    message: `${lowCoverageFrames}/${frames.length} decoded frames have estimated subject-region coverage below ${threshold * 100}%. Enlarge readable content if appropriate; transitions and intentional negative space may be valid. This recommendation does not fail check.`,
  }] : [];
  return {summary, warnings};
}

export async function analyzeVisualCoverage(videoPath, {fps, sourceWidth, sourceHeight}) {
  if (!(fps > 0) || !(sourceWidth > 0) || !(sourceHeight > 0)) throw new Error('Visual analysis requires positive fps and source dimensions');
  const scale = Math.min(320 / sourceWidth, 180 / sourceHeight);
  const width = Math.max(1, Math.round(sourceWidth * scale)), height = Math.max(1, Math.round(sourceHeight * scale));
  const frameBytes = width * height * 3;
  const frames = [];
  const decoder = spawn('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-nostdin', '-i', videoPath, '-map', '0:v:0', '-vf', `scale=${width}:${height}:flags=area`, '-fps_mode', 'passthrough', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-threads', '1', 'pipe:1'], {stdio: ['ignore', 'pipe', 'pipe']});
  let stderr = '';
  decoder.stderr.on('data', (chunk) => { stderr = (stderr + chunk.toString()).slice(-8000); });
  // Listen before reading stdout, including spawn errors and early decoder exits.
  const completed = new Promise((resolve) => {
    decoder.once('error', (error) => resolve({error}));
    decoder.once('close', (code, signal) => resolve({code, signal}));
  });
  let pending = Buffer.alloc(0);
  try {
    for await (const chunk of decoder.stdout) {
      pending = pending.length ? Buffer.concat([pending, chunk]) : chunk;
      let offset = 0;
      while (pending.length - offset >= frameBytes) {
        const frame = frames.length;
        frames.push({frame, seconds: frame / fps, ...frameCoverage(pending.subarray(offset, offset + frameBytes), width, height)});
        offset += frameBytes;
      }
      pending = pending.subarray(offset);
    }
  } catch (error) {
    decoder.kill();
    await completed;
    throw error;
  }
  const result = await completed;
  if (result.error) throw result.error;
  if (result.code !== 0) throw new Error(`Visual frame decoding failed (${result.code ?? result.signal}): ${stderr.trim()}`);
  if (pending.length || !frames.length) throw new Error('Visual frame decoding returned incomplete or empty frames');
  const {summary, warnings} = summarizeCoverage(frames, fps);
  return {summary: {...summary, analysisWidth: width, analysisHeight: height}, warnings, frames};
}
