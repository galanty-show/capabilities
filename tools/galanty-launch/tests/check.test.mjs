import test from 'node:test';
import assert from 'node:assert/strict';
import {checkLimits} from '../scripts/check.mjs';
import {frameCoverage, summarizeCoverage} from '../scripts/visual-check.mjs';

function passing() {
  return {plan: {durationInFrames: 720, fps: 30, width: 1280, height: 720}, audio: {integratedLufs: -14, truePeakDbtp: -1.5}, media: {format: {duration: '24'}, streams: [{codec_type: 'video', width: 1280, height: 720, nb_frames: '720'}, {codec_type: 'audio'}]}, residual: {medianMs: 8.33}, fontsReady: true, deterministic: true};
}
test('delivered media limits pass healthy film and reject each broken gate independently', () => {
  assert.deepEqual(checkLimits(passing()), []);
  for (const mutate of [
    (x) => {x.audio.integratedLufs = -20;}, (x) => {x.audio.truePeakDbtp = -.5;}, (x) => {x.audio.integratedLufs = NaN;},
    (x) => {x.media.format.duration = '23';}, (x) => {x.media.streams[0].nb_frames = '719';},
    (x) => {x.media.streams.pop();}, (x) => {x.residual.medianMs = 11;},
    (x) => {x.fontsReady = false;}, (x) => {x.deterministic = false;},
  ]) { const input = passing(); mutate(input); assert.ok(checkLimits(input).length > 0); }
});

function image(background, rectangles = [], width = 320, height = 180) {
  const rgb = Buffer.alloc(width * height * 3);
  for (let i = 0; i < rgb.length; i += 3) rgb.set(background, i);
  for (const {x, y, w, h, color} of rectangles) {
    for (let row = y; row < y + h; row++) {
      for (let col = x; col < x + w; col++) rgb.set(color, (row * width + col) * 3);
    }
  }
  return frameCoverage(rgb, width, height);
}

test('blank frames have zero coverage on dark and light backgrounds', () => {
  assert.equal(image([10, 15, 22]).coverage, 0);
  assert.equal(image([245, 245, 240]).coverage, 0);
});

test('small panels stay below 25% on dark and light backgrounds', () => {
  for (const [background, color] of [[[10, 15, 22], [230, 235, 245]], [[245, 245, 240], [25, 25, 35]]]) {
    const {coverage} = image(background, [{x: 120, y: 60, w: 80, h: 60, color}]);
    assert.ok(coverage > .08 && coverage < .25, `Small panel coverage ${coverage}`);
  }
});

test('content filling most of the canvas exceeds 25% on dark and light backgrounds', () => {
  for (const [background, color] of [[[10, 15, 22], [230, 235, 245]], [[245, 245, 240], [25, 25, 35]]]) {
    const {coverage} = image(background, [{x: 20, y: 20, w: 280, h: 140, color}]);
    assert.ok(coverage > .65, `Large content coverage ${coverage}`);
  }
});

test('near-background panels, faint decoration and sparse bright dots do not inflate coverage', () => {
  assert.equal(image([10, 15, 22], [{x: 20, y: 20, w: 280, h: 140, color: [23, 29, 40]}]).coverage, 0);
  assert.equal(image([240, 240, 235], [{x: 20, y: 20, w: 280, h: 140, color: [225, 225, 220]}]).coverage, 0);
  const dots = [];
  for (let y = 5; y < 180; y += 10) for (let x = 5; x < 320; x += 10) dots.push({x, y, w: 1, h: 1, color: [255, 255, 255]});
  assert.equal(image([10, 15, 22], dots).coverage, 0);
});

test('full-canvas sparse letterforms measure content regions rather than glyph ink on dark and light backgrounds', () => {
  const glyphs = {B: ['110', '101', '110', '101', '110'], U: ['101', '101', '101', '101', '111'], N: ['1001', '1101', '1011', '1001', '1001']};
  for (const [background, color] of [[[10, 15, 22], [230, 235, 245]], [[245, 245, 240], [25, 25, 35]]]) {
    const strokes = [], scale = 3;
    for (const top of [30, 70, 110]) {
      let left = 20;
      for (const letter of 'BUNBUNBUNBUN') {
        const glyph = glyphs[letter];
        for (let y = 0; y < glyph.length; y++) for (let x = 0; x < glyph[y].length; x++) {
          if (glyph[y][x] === '1') strokes.push({x: left + x * scale, y: top + y * scale, w: scale, h: scale, color});
        }
        left += (glyph[0].length + 3) * scale;
      }
    }
    const result = image(background, strokes);
    assert.ok(result.contrastingTileCoverage > .1 && result.contrastingTileCoverage < .25);
    assert.ok(result.coverage > .35 && result.coverage < .5);
    assert.deepEqual(summarizeCoverage([{frame: 0, ...result}], 30).warnings, []);
  }
});

test('isolated dot arrays that activate individual tiles do not turn their bounding box into a subject', () => {
  const dots = [];
  for (let y = 20; y <= 140; y += 30) for (let x = 20; x <= 290; x += 30) dots.push({x, y, w: 5, h: 5, color: [240, 240, 240]});
  const result = image([10, 15, 22], dots);
  assert.ok(result.contrastingTileCoverage > .05);
  assert.equal(result.coverage, 0);
  assert.deepEqual(result.regions, []);
});

test('distant small panels retain separate regions without counting the large gap', () => {
  const result = image([10, 15, 22], [{x: 10, y: 30, w: 60, h: 60, color: [240, 240, 240]}, {x: 250, y: 90, w: 60, h: 60, color: [240, 240, 240]}]);
  assert.equal(result.regions.length, 2);
  assert.equal(result.coverage, .125);
  assert.equal(result.contrastingTileCoverage, .125);
});

test('coverage warning is advisory for any low frame, with bounded range summary', () => {
  const frames = Array.from({length: 40}, (_, frame) => ({frame, coverage: frame % 2 ? .25 : .1}));
  const {summary, warnings} = summarizeCoverage(frames, 30);
  assert.equal(summary.lowCoverageFrames, 20);
  assert.equal(summary.lowCoverageRangeCount, 20);
  assert.equal(summary.lowCoverageRanges.length, 12);
  assert.equal(summary.omittedRangeCount, 8);
  assert.equal(warnings[0].severity, 'advisory');
  assert.equal(warnings.length, 1);
  assert.deepEqual(checkLimits(passing()), []);
  assert.deepEqual(summarizeCoverage([{frame: 0, coverage: .25}], 30).warnings, []);
});
