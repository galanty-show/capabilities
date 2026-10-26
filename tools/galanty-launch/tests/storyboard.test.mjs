import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {validateBrief, planStoryboard, beatResiduals, pacingAdvice, readingUnits} from '../scripts/storyboard.mjs';
import {sampleFrames} from '../scripts/render.mjs';

const brief = JSON.parse(await readFile(new URL('fixtures/sourced-brief.json', import.meta.url)));
const authoredBrief = JSON.parse(await readFile(new URL('../brief.json', import.meta.url)));
function grid(bpm = 128, durationSeconds = 30) {
  const beat = 60 / bpm, n = Math.ceil(durationSeconds / beat);
  return {bpm, beats: Array.from({length: n}, (_, i) => i * beat).filter(t => t < durationSeconds), sections: [{name: 'intro', start: 0}, {name: 'build', start: Math.floor(n * .18) * beat}, {name: 'drop', start: Math.floor(n * .4) * beat}, {name: 'outro', start: Math.floor(n * .88) * beat}]};
}
test('claims without sources fail before synthesis', () => {
  for (const source of [undefined, null, '', '  ', 42]) {
    const value = structuredClone(brief); value.sellingPoints[0].source = source;
    assert.throws(() => validateBrief(value), /sellingPoints\[0\].source/);
  }
});
test('custom screen copy survives planning and malformed optional copy fails early', () => {
  const value = {...brief, demoLabel: 'DEMO / 示例', terminalLines: ['Local inputs', 'Keep the trace'], codeCaption: 'A review bundle', gridItemLabel: 'trace', revealCaption: 'One workflow', timelineCaption: 'Steps, not history'};
  assert.deepEqual(planStoryboard(value, grid()).brief, value);
  for (const key of ['demoLabel', 'codeCaption', 'gridItemLabel', 'revealCaption', 'timelineCaption']) {
    for (const invalid of ['', 5, null]) assert.throws(() => validateBrief({...value, [key]: invalid}), new RegExp(key));
  }
  for (const terminalLines of ['text', [null], ['a', 'b', 'c']]) assert.throws(() => validateBrief({...value, terminalLines}), /terminalLines/);
});
test('authored local source references resolve to actual document sections', async () => {
  const sources = [...authoredBrief.sellingPoints.flatMap(point => [point.source, point.metric?.source].filter(Boolean)), ...(authoredBrief.milestones ?? []).map(m => m.source)];
  for (const source of sources.filter(ref => !/^https?:\/\//.test(ref))) {
    const [file, anchor] = source.split('#');
    const document = await readFile(new URL(`../${file}`, import.meta.url), 'utf8');
    const headings = [...document.matchAll(/^## (.+)$/gm)].map(match => match[1].toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-'));
    if (anchor) assert.ok(headings.includes(anchor), source);
  }
});
test('brief rejects invalid renderer and structured evidence fields', () => {
  for (const [key, value, error] of [['seed', NaN, /seed/], ['durationSeconds', Infinity, /duration/], ['durationSeconds', 3, /duration/], ['musicStyle', 'unknown', /musicStyle/]]) assert.throws(() => validateBrief({...brief, [key]: value}), error);
  assert.throws(() => validateBrief({...brief, palette: {...brief.palette, accent: 'oops'}}), /accent/);
  const bad = structuredClone(brief); bad.sellingPoints[0].metric.source = '';
  assert.throws(() => validateBrief(bad), /metric/);
  for (const value of [NaN, 0, -1]) {bad.sellingPoints[0].metric.source = 'ref'; bad.sellingPoints[0].metric.value = value; assert.throws(() => validateBrief(bad), /metric/);}
  assert.throws(() => validateBrief({...brief, milestones: [{date: '2025', label: 'Release'}]}), /milestones/);
});
test('1080p editorial plan fills exact duration and preserves every claim and evidence', () => {
  const plan = planStoryboard(brief, grid());
  assert.equal(plan.width, 1920); assert.equal(plan.height, 1080);
  assert.equal(plan.durationInFrames, 900); assert.equal(plan.scenes[0].from, 0);
  plan.scenes.forEach((scene, i) => {
    assert.ok(scene.durationInFrames > 0);
    assert.equal(scene.from + scene.durationInFrames, plan.scenes[i + 1]?.from ?? plan.durationInFrames);
  });
  brief.sellingPoints.forEach(point => assert.ok(plan.scenes.some(s => s.text === point.text && s.source === point.source)));
  assert.ok(beatResiduals(plan).medianMs <= 10);
  assert.ok(plan.scenes.some(s => s.primitive === 'ToolCounter' && s.metric.source));
  assert.ok(plan.scenes.some(s => s.primitive === 'MilestoneTimeline'));
  assert.equal(plan.scenes.at(-1).ending, true);
  assert.deepEqual(sampleFrames(plan).length, 9);
  assert.ok(sampleFrames(plan).every(f => f >= 0 && f < 900));
});
test('Drop uses the three strongest screen types at twice the build cadence', () => {
  const plan = planStoryboard(brief, grid());
  const drop = plan.scenes.filter(s => s.section === 'drop');
  assert.deepEqual(new Set(drop.map(s => s.primitive)), new Set(['PixelLogo', 'ScaleGrid', 'ImpactWord']));
  assert.ok(drop.every(s => s.cadenceBeats === 2));
  assert.ok(plan.scenes.filter(s => s.section === 'build').every(s => s.cadenceBeats === 4));
  assert.ok(drop[0].from / 30 - grid().sections[2].start <= 1 / 30);
});
test('a plain sourced brief never acquires invented metrics, scale or history', () => {
  const value = {...brief, milestones: undefined, sellingPoints: [{text: 'A clear idea', source: 'brief.md'}]};
  const plan = planStoryboard(value, grid());
  assert.ok(plan.scenes.every(s => !['ToolCounter', 'MilestoneTimeline', 'ScaleGrid', 'GrowthChart'].includes(s.primitive)));
});
test('three tempos and varied durations retain exact coverage and aligned cuts', () => {
  for (const bpm of [80, 100, 128]) for (const durationSeconds of [4, 20, 24, 30, 45]) {
    const plan = planStoryboard({...brief, durationSeconds}, grid(bpm, durationSeconds));
    assert.equal(plan.scenes.reduce((n, s) => n + s.durationInFrames, 0), durationSeconds * 30);
    assert.ok(beatResiduals(plan).medianMs <= 10);
  }
});
test('long copy is retained with advisory reading budget rather than truncated', () => {
  const value = structuredClone(brief); value.durationSeconds = 4; value.sellingPoints[0].text = '字'.repeat(60);
  const plan = planStoryboard(value, grid(128, 4));
  assert.ok(plan.scenes.some(s => s.text === value.sellingPoints[0].text));
  assert.ok(pacingAdvice(plan).some(w => w.code === 'HOLD_BUDGET'));
  assert.ok(pacingAdvice(plan).some(w => w.code === 'DURATION_RECOMMENDATION'));
  assert.equal(readingUnits('中文 128 BPM next step'), 6);
});
