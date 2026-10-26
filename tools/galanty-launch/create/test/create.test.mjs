import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp, mkdir, readFile, rm, symlink, writeFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {createProject} from '../bin/create.mjs';

const lane = fileURLToPath(new URL('../../../../.lane-data/distribution/', import.meta.url));
async function fixture(t) {
  await mkdir(lane, {recursive: true});
  const cwd = await mkdtemp(path.join(lane, 'create-test-'));
  t.after(() => rm(cwd, {recursive: true, force: true}));
  const template = path.join(cwd, 'template');
  await mkdir(template); await writeFile(path.join(template, 'gitignore'), 'node_modules/\n');
  await writeFile(path.join(template, 'package.json'), '{"name":"fixture"}');
  return {cwd, template};
}

test('copies a self-contained starter and restores .gitignore', async t => {
  const options = await fixture(t);
  const target = await createProject('launch-1', options);
  assert.equal(await readFile(path.join(target, '.gitignore'), 'utf8'), 'node_modules/\n');
  await rm(options.template, {recursive: true});
  assert.equal(JSON.parse(await readFile(path.join(target, 'package.json'), 'utf8')).name, 'fixture');
});

test('refuses existing empty directory, populated directory, file and symlink', async t => {
  const options = await fixture(t);
  await mkdir(path.join(options.cwd, 'empty'));
  await mkdir(path.join(options.cwd, 'user'));
  await writeFile(path.join(options.cwd, 'user', 'keep.txt'), 'keep');
  await writeFile(path.join(options.cwd, 'file'), 'keep');
  await symlink(path.join(options.cwd, 'user'), path.join(options.cwd, 'link'));
  for (const name of ['empty', 'user', 'file', 'link']) await assert.rejects(createProject(name, options), {code: 'EEXIST'});
  assert.equal(await readFile(path.join(options.cwd, 'user', 'keep.txt'), 'utf8'), 'keep');
});

test('rejects traversal, shell syntax and extra path components', async t => {
  const options = await fixture(t);
  for (const name of ['', '.', '..', '../escape', '/tmp/escape', 'foo/bar', 'foo bar', '$(touch bad)', '-flag', 'a'.repeat(65)]) {
    await assert.rejects(createProject(name, options), /Use a project name/);
  }
});

test('missing template never creates the destination', async t => {
  const options = await fixture(t);
  await assert.rejects(createProject('missing', {...options, template: path.join(options.cwd, 'absent')}), {code: 'ENOENT'});
  await assert.rejects(readFile(path.join(options.cwd, 'missing')), {code: 'ENOENT'});
});

test('npm-style symlink entry actually executes the CLI', async t => {
  const options = await fixture(t);
  const link = path.join(options.cwd, 'create-galanty-launch');
  await symlink(fileURLToPath(new URL('../bin/create.mjs', import.meta.url)), link);
  const {stdout} = await promisify(execFile)(process.execPath, [link, '--help']);
  assert.match(stdout, /Usage: npx create-galanty-launch/);
});
