import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {selfProofPlan} from '../scripts/self-proof-plan.mjs';
import {beatResiduals} from '../scripts/storyboard.mjs';
import {sampleFrames, configuredRenderPort} from '../scripts/render.mjs';
const grid = {bpm: 128, beats: Array.from({length: 64}, (_, i) => i * 60 / 128)};
const source = await readFile(new URL('../examples/galanty-sources.md', import.meta.url), 'utf8');
const fontManifest = JSON.parse(await readFile(new URL('../public/fonts/manifest.json', import.meta.url)));
const coverage = new Set(Object.values(fontManifest).flatMap(font => font.codepoints));
for (const language of ['zh', 'en']) {
  const brief = JSON.parse(await readFile(new URL(`../examples/galanty-${language}.json`, import.meta.url)));
  test(`${language} self-proof retains all nine sourced claims with exact media coverage`, () => {
    const plan = selfProofPlan(brief, grid);
    assert.equal(plan.durationInFrames, 900);
    assert.equal(plan.width / plan.height, 16 / 9);
    assert.equal(plan.scenes.reduce((n,s) => n+s.durationInFrames,0),900);
    assert.equal(plan.scenes.length, 9);
    plan.scenes.forEach((scene, i) => {
      assert.equal(scene.source, brief.sellingPoints[i].source);
      assert.equal(scene.from+scene.durationInFrames, plan.scenes[i+1]?.from ?? 900);
      const heading = scene.source.split('#')[1];
      assert.ok(source.toLowerCase().includes(`## ${heading}`),scene.source);
    });
    assert.ok(beatResiduals(plan).medianMs <= 10);
    sampleFrames(plan).forEach((frame, i)=>assert.ok(frame>=plan.scenes[i].from && frame<plan.scenes[i].from+plan.scenes[i].durationInFrames));
  });
  test(`${language} all authored display copy is covered by bundled fonts`, () => {
    const text = [brief.productName,brief.tagline,...brief.onScreenCopy,...brief.sellingPoints.map(p=>p.text)].join('');
    const missing=[...new Set([...text].filter(c=>!coverage.has(c.codePointAt(0))&&!/\s/u.test(c)))];
    assert.deepEqual(missing,[]);
  });
}
test('authored film refuses mismatched language, missing sources or score timing',async()=>{
  const brief=JSON.parse(await readFile(new URL('../examples/galanty-en.json',import.meta.url)));
  assert.throws(()=>selfProofPlan({...brief,durationSeconds:24},grid),/30-second/);
  assert.throws(()=>selfProofPlan(brief,{...grid,bpm:100}),/128 BPM/);
  assert.throws(()=>selfProofPlan({...brief,language:'de'},grid),/zh\/en/);
  assert.throws(()=>selfProofPlan({...brief,sellingPoints:[{text:'claim',source:''}]},grid),/source/);
});

test('render port supports an isolated lane without silently accepting malformed values', () => {
  assert.equal(configuredRenderPort('4397'),4397);
  for (const value of ['', '0', '-1', '65536', '4397junk', '4.5', 'NaN']) assert.throws(()=>configuredRenderPort(value), /GALANTY_RENDER_PORT/);
});
