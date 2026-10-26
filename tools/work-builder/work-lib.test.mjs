import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync, symlinkSync} from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {buildWork, secondsFor, placeholderId} from './work-lib.mjs';
const fixture = (fn) => {
  const dir = mkdtempSync(path.join(os.tmpdir(), 'work-builder-'));
  try { return fn(dir); } finally { rmSync(dir, {recursive:true, force:true}); }
};
const meta = {title:'Test', module:'promo', license:'CC0-1.0', credit:'Fixture author'};

test('fixed durations survive ceil conversion at typical frame rates and long durations', () => {
  for (const fps of [24,25,30,60]) for (const frames of [1,2,29,30,31,1001,108000]) {
    assert.equal(Math.ceil(secondsFor(frames,fps)*fps), frames);
  }
  assert.throws(() => secondsFor(0)); assert.throws(() => secondsFor(1,0));
});

test('builds contiguous scenes, deduplicates identical media, and writes reproducible inputs', () => fixture(dir => {
  mkdirSync(path.join(dir,'assets'));
  writeFileSync(path.join(dir,'assets','a.txt'),'same');
  writeFileSync(path.join(dir,'assets','b.txt'),'same');
  const scenes = [{id:'a',title:'A',from:0,to:31,assets:{image:'a.txt'}},
    {id:'b',title:'B',from:31,to:91,assets:{image:'b.txt'},props:{label:'B'}}];
  const result=buildWork(dir,meta,scenes,{}, {fps:30});
  assert.equal(result.totalFrames,91); assert.equal(result.assets.length,1);
  assert.equal(result.storyboard.scenes[1].component.params.props.t0,31/30);
  assert.equal(result.storyboard.scenes[0].assets[0].assetId,placeholderId(path.join(dir,'assets','b.txt')));
  const before=readFileSync(path.join(dir,'storyboard.json'),'utf8');
  buildWork(dir,meta,scenes); assert.equal(readFileSync(path.join(dir,'storyboard.json'),'utf8'),before);
  assert.equal(result.storyboard.scenes.reduce((n,s)=>n+Math.ceil(s.duration.seconds*30),0),91);
}));

test('rejects duplicate/gapped ranges and unknown licensing before replacing existing outputs', () => fixture(dir => {
  writeFileSync(path.join(dir,'storyboard.json'),'keep');
  assert.throws(()=>buildWork(dir,meta,[{id:'a',title:'A',from:1,to:30}]));
  assert.throws(()=>buildWork(dir,meta,[{id:'a',title:'A',from:0,to:30}],{}, {fps:60}));
  assert.throws(()=>buildWork(dir,meta,[{id:'a',title:'A',from:0,to:30},{id:'a',title:'A',from:30,to:60}]));
  mkdirSync(path.join(dir,'assets')); writeFileSync(path.join(dir,'assets','a.txt'),'test');
  assert.throws(()=>buildWork(dir,{title:'Test',module:'promo'},[{id:'a',title:'A',from:0,to:30,assets:{x:'a.txt'}}]));
  assert.equal(readFileSync(path.join(dir,'storyboard.json'),'utf8'),'keep');
}));

test('rejects path traversal and symlink escape from assets', () => fixture(dir => {
  mkdirSync(path.join(dir,'assets')); writeFileSync(path.join(dir,'outside.txt'),'outside');
  symlinkSync(path.join(dir,'outside.txt'),path.join(dir,'assets','escape.txt'));
  for (const file of ['../outside.txt','escape.txt','C:/outside.txt']) {
    assert.throws(()=>buildWork(dir,meta,[{id:'a',title:'A',from:0,to:30,assets:{x:file}}]));
  }
}));
