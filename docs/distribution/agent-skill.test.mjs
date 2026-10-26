import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp, mkdir, rm, writeFile} from 'node:fs/promises';
import path from 'node:path';
import {root} from './sync-skills.mjs';
import {resolveAgentSkill} from '../../tools/galanty-launch/scripts/agent-runner.mjs';

test('Agent trials prefer repository skill and support standalone packed skill', async t => {
  const lane = path.join(root, '.lane-data/distribution');
  await mkdir(lane, {recursive: true});
  const base = await mkdtemp(path.join(lane, 'skill-resolution-'));
  t.after(() => rm(base, {recursive: true, force: true}));
  const toolkit = path.join(base, 'repo/tools/galanty-launch');
  const canonical = path.join(base, 'repo/skills/galanty-launch');
  const bundled = path.join(toolkit, '.agents/skills/galanty-launch');
  await mkdir(bundled, {recursive: true});
  await writeFile(path.join(bundled, 'SKILL.md'), 'standalone');
  assert.equal(await resolveAgentSkill(toolkit), bundled);
  await mkdir(canonical, {recursive: true});
  await writeFile(path.join(canonical, 'SKILL.md'), 'canonical');
  assert.equal(await resolveAgentSkill(toolkit), canonical);
  await rm(canonical, {recursive: true}); await rm(bundled, {recursive: true});
  await assert.rejects(resolveAgentSkill(toolkit), /skill is missing/);
});
