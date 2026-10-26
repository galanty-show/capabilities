import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import os from 'node:os';
import {mkdtemp, mkdir, writeFile, readFile, readdir, rm, realpath} from 'node:fs/promises';
import {loadCases, EVAL_ROOT, includeStarter, copyStarter, stageCase, measurements, markdownReport, parseOptions, installDependencies, ensureEvaluationBrowser, sha256} from '../scripts/eval-support.mjs';
import {evaluateCase} from '../scripts/eval.mjs';
import {agentCommand, agentPrompt, summarizeAgentRun, runAgent} from '../scripts/agent-runner.mjs';
import {validateBrief} from '../scripts/storyboard.mjs';

async function temporary(t) {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'galanty-eval-'));
  t.after(() => rm(dir, {recursive: true, force: true})); return dir;
}
test('fixed corpus has 15 validated, separately sourced cross-category briefs', async () => {
  const cases = await loadCases(); assert.equal(cases.length, 15);
  for (const category of ['CLI', 'SaaS', 'mobile', 'hardware', 'OSS', 'data']) assert.ok(cases.some(c => c.category === category));
  for (const entry of cases) {
    const brief = validateBrief(JSON.parse(await readFile(path.join(EVAL_ROOT, entry.brief), 'utf8')));
    const source = await readFile(path.join(EVAL_ROOT, entry.source), 'utf8');
    if (entry.fictional) {
      assert.match(source, /DEMO/); assert.match(brief.demoLabel, /DEMO/);
      for (const point of brief.sellingPoints) assert.match(point.source, /^eval-source\.md#claim-\d+$/);
    } else {
      assert.equal(entry.id, 'bun'); assert.match(brief.demoLabel, /EVAL/);
      for (const point of brief.sellingPoints) assert.match(point.source, /^https:\/\/bun\.sh\//);
    }
  }
});
test('filter is exact and rejects mistyped or unknown IDs', async () => {
  assert.deepEqual((await loadCases('bun,cli')).map(c => c.id), ['cli', 'bun']);
  await assert.rejects(loadCases('cl'), /Unknown case/);
});
test('starter copy excludes dependencies, generated output, corpus and previous answers', async t => {
  const dir = await temporary(t), source = path.join(dir, 'source'), target = path.join(dir, 'target');
  for (const file of ['package.json', 'package-lock.json', 'scenes/main.tsx', 'public/fonts/font.woff2', 'scripts/render.mjs', 'brief.json', 'examples/product.md', 'node_modules/leak', 'build/promo.mp4', 'public/generated/music.wav', '.lane-data/eval/prior/report.json', 'eval/cases/answer.json', 'scripts/eval.mjs', 'tests/eval.test.mjs']) {
    await mkdir(path.dirname(path.join(source, file)), {recursive: true}); await writeFile(path.join(source, file), file);
  }
  await copyStarter(source, target);
  assert.equal(await readFile(path.join(target, 'scenes/main.tsx'), 'utf8'), 'scenes/main.tsx');
  for (const file of ['node_modules/leak', 'build/promo.mp4', 'public/generated/music.wav', '.lane-data/eval/prior/report.json', 'eval/cases/answer.json', 'brief.json', 'examples/product.md', 'scripts/eval.mjs', 'tests/eval.test.mjs']) assert.equal(includeStarter(file), false, file);
  assert.deepEqual((await readdir(target)).sort(), ['examples', 'package-lock.json', 'package.json', 'public', 'scenes', 'scripts', 'tests']);
  await assert.rejects(copyStarter(source, target), /must be empty/);
  const entry = (await loadCases('mobile'))[0]; await stageCase(entry, target);
  assert.match(await readFile(path.join(target, 'eval-source.md'), 'utf8'), /Pocket Trail/);
  assert.equal(await readFile(path.join(target, 'eval-source.md'), 'utf8'), await readFile(path.join(target, 'examples/product.md'), 'utf8'));
});
test('starter target may be nested in source .lane-data without recursive self-copy', async t => {
  const source = await temporary(t), target = path.join(source, '.lane-data', 'eval', 'case', 'project');
  await writeFile(path.join(source, 'package.json'), '{}');
  await mkdir(path.join(source, 'scripts')); await writeFile(path.join(source, 'scripts', 'render.mjs'), '// starter');
  await copyStarter(source, target);
  assert.deepEqual((await readdir(target)).sort(), ['package.json', 'scripts']);
  assert.equal(await readFile(path.join(target, 'scripts/render.mjs'), 'utf8'), '// starter');
});
test('browser preflight resolves from toolkit, validates executable and restores cwd', async t => {
  const root = await realpath(await temporary(t)), executable = path.join(root, 'chrome');
  await writeFile(executable, 'fixture browser binary', {mode: 0o755});
  const previous = process.cwd(); let calls = 0;
  const browser = await ensureEvaluationBrowser({root, executable, ensure: async options => {
    calls++; assert.equal(process.cwd(), root); assert.equal(options.browserExecutable, executable);
    return {type: 'user-defined-path', path: executable};
  }});
  assert.equal(calls, 1); assert.equal(process.cwd(), previous);
  assert.equal(browser.path, executable); assert.equal(browser.sha256, sha256('fixture browser binary'));
  assert.equal(browser.bytes, 22);
  await assert.rejects(ensureEvaluationBrowser({root, ensure: async () => { throw new Error('download failed'); }}), /download failed/);
  assert.equal(process.cwd(), previous);
  await assert.rejects(ensureEvaluationBrowser({root, ensure: async () => ({type: 'no-browser'})}), /usable executable/);
});
test('shared dependencies reject mismatched lock before linking any tree', async t => {
  const dir = await temporary(t), project = path.join(dir, 'project'), source = path.join(dir, 'source');
  await mkdir(project); await mkdir(source);
  await writeFile(path.join(project, 'package-lock.json'), 'one'); await writeFile(path.join(source, 'package-lock.json'), 'two');
  await assert.rejects(installDependencies(project, 'shared', () => assert.fail('must not execute'), source), /exact same/);
});
test('missing measurements stay null and reports never promote missing output to zero/pass', () => {
  const m = measurements(null);
  assert.ok(Object.values(m).every(v => v === null));
  const text = markdownReport({runId: 'fixture', mode: 'template-automation', cases: [{id: 'missing', ok: false, project: 'x', logs: 'x', errors: ['missing output'], measurements: m, seconds: 1}]});
  assert.match(text, /missing \| FAIL \| —/); assert.match(text, /not Agent/);
});
test('a failed render returns a failed row, retains process evidence, and allows next case', async t => {
  const dir = await temporary(t), cases = await loadCases('cli,saas');
  const execute = async (command, args, options) => {
    assert.equal(options.env.REMOTION_BROWSER_EXECUTABLE, '/fixture/chrome');
    return {command, args, code: options.label === 'render' ? 1 : 0, pid: 123, normalExit: options.label !== 'render'};
  };
  const results = [];
  for (const entry of cases) results.push(await evaluateCase(entry, {directory: dir, execute, browser: {path: '/fixture/chrome', sha256: 'fixture'}}));
  assert.deepEqual(results.map(r => r.ok), [false, false]);
  assert.ok(results.every(r => r.processes.some(p => p.code === 1)));
  assert.ok(results.every(r => r.measurements.durationSeconds === null));
  assert.ok(results.every(r => r.errors.some(e => e.includes('Render failed'))));
});
test('Agent shared dependencies reject before case lookup or any path creation', async () => {
  // Even an invalid case must not reach lookup, lock creation, browser or npm setup.
  await assert.rejects(runAgent({case: 'not-a-case', deps: 'shared'}), /Agent trials require --deps ci/);
  await assert.rejects(runAgent({case: 'not-a-case', deps: 'other'}), /Agent trials require --deps ci/);
});
test('host CLI construction preserves configured model, effort and context', () => {
  for (const host of ['codex', 'claude', 'gemini']) {
    const command = agentCommand(host, 'fixture prompt');
    assert.ok(command.args.includes('fixture prompt'));
    assert.ok(!command.args.some(a => /model|effort|context|compaction|dangerously|ignore-user-config/.test(a)));
  }
  assert.deepEqual(agentCommand('codex', 'x').args, ['exec', '--skip-git-repo-check', '--json', 'x']);
  assert.throws(() => agentCommand('other', 'x'), /--host/);
});
test('intervention totals require explicit audit; first success is distinct from eventual success', () => {
  const report = {attempts: [{number: 1, filmSuccess: false}, {number: 2, filmSuccess: true}], interventions: [{description: 'operator fix'}], interventionAuditComplete: false};
  assert.deepEqual(summarizeAgentRun(report), {firstFilmSuccess: false, firstSuccessfulAttempt: 2, recordedHumanInterventions: 1, humanInterventions: null, interventionAuditComplete: false, totalAttempts: 2});
  report.interventionAuditComplete = true; assert.equal(summarizeAgentRun(report).humanInterventions, 1);
});
test('prompt provides source guidance and empty-project goal without a case solution', () => {
  const prompt = agentPrompt({project: '/trial/project', skill: '/trial/resources/skills/galanty-launch/SKILL.md', input: '/trial/input.json', source: '/trial/source.md', data: '/trial/data'});
  assert.match(prompt, /SKILL\.md/); assert.match(prompt, /sole production guidance/);
  assert.match(prompt, /Do not open or operate any installed App/); assert.ok(!prompt.includes('sellingPoints'));
});
test('options reject missing values and preserve explicit host passthrough only after --', () => {
  assert.throws(() => parseOptions(['--filter'], {filter: 'string'}), /needs a value/);
  assert.throws(() => parseOptions(['--typo'], {}), /Unknown option/);
  assert.deepEqual(parseOptions(['--host', 'codex', '--', '--profile', 'my-profile'], {host: 'string'}), {host: 'codex', extra: ['--profile', 'my-profile']});
});
