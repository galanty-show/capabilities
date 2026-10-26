import path from 'node:path';
import {mkdir, writeFile, stat} from 'node:fs/promises';
import {ROOT, writeJson, isMain} from './common.mjs';
import {DATA_ROOT, runId, parseOptions, loadCases, copyStarter, stageCase, installDependencies, fileManifest, withRenderLock, runLogged, optionalJson, measurements, markdownReport, ensureEvaluationBrowser} from './eval-support.mjs';

export async function evaluateCase(entry, {directory, deps = 'ci', execute = runLogged, browser}) {
  const started = performance.now(), project = path.join(directory, entry.id, 'project'), logs = path.join(directory, entry.id, 'logs');
  const data = path.join(directory, entry.id, 'data');
  const record = {id: entry.id, category: entry.category, fictional: entry.fictional, project, logs, ok: false, errors: [], processes: [], browser: browser ?? null};
  const run = async (command, args, options) => {
    const process = await execute(command, args, {...options, env: {...globalThis.process.env, DVS_DATA: data, ...(browser ? {REMOTION_BROWSER_EXECUTABLE: browser.path} : {})}, logDir: logs});
    record.processes.push(process); return process;
  };
  try {
    await mkdir(data, {recursive: true});
    await copyStarter(ROOT, project);
    record.input = await stageCase(entry, project);
    record.toolkit = await fileManifest(project);
    record.dependencies = await installDependencies(project, deps, run);
    const render = await run(globalThis.process.execPath, ['scripts/render.mjs'], {cwd: project, label: 'render'});
    if (render.code !== 0) record.errors.push(`Render failed: ${render.error ?? render.code ?? render.signal}`);
    else {
      const check = await run(globalThis.process.execPath, ['scripts/check.mjs'], {cwd: project, label: 'check'});
      if (check.code !== 0) record.errors.push(`Check command failed: ${check.error ?? check.code ?? check.signal}`);
    }
    const check = await optionalJson(path.join(project, 'build/check.json'));
    record.checkReport = check ? path.join(project, 'build/check.json') : null;
    record.measurements = measurements(check);
    record.errors.push(...(check?.errors ?? []));
    const film = await stat(path.join(project, 'build/promo.mp4')).catch(() => null);
    record.ok = render.code === 0 && record.processes.at(-1)?.code === 0 && check?.ok === true && film?.size > 0;
    if (!record.ok && record.errors.length === 0) record.errors.push('Missing successful check report or nonempty film');
  } catch (error) { record.errors.push(error.message); }
  record.measurements ??= measurements(null);
  record.seconds = (performance.now() - started) / 1000;
  await mkdir(path.dirname(project), {recursive: true});
  await writeJson(path.join(path.dirname(project), 'result.json'), record);
  return record;
}
export async function evaluate({filter, deps = 'ci', list = false} = {}) {
  const cases = await loadCases(filter);
  if (list) { console.log(cases.map(c => `${c.id}\t${c.category}\t${c.fictional ? 'DEMO' : 'REAL / INTERNAL EVAL'}`).join('\n')); return null; }
  if (!['ci', 'shared'].includes(deps)) throw new Error('--deps must be ci or shared');
  return withRenderLock(async () => {
    const id = runId(), directory = path.join(DATA_ROOT, 'eval', id);
    await mkdir(directory, {recursive: true});
    const report = {version: 1, runId: id, mode: 'template-automation', startedAt: new Date().toISOString(), node: process.version, platform: process.platform, port: 4392, serial: true, dependenciesRequested: deps, toolkit: await fileManifest(ROOT), cases: []};
    report.browser = await ensureEvaluationBrowser();
    await writeJson(path.join(directory, 'report.json'), report);
    for (const entry of cases) {
      console.log(`[${report.cases.length + 1}/${cases.length}] ${entry.id}: empty starter → render → check`);
      report.cases.push(await evaluateCase(entry, {directory, deps, browser: report.browser}));
      await writeJson(path.join(directory, 'report.json'), report);
      await writeFile(path.join(directory, 'report.md'), markdownReport(report));
    }
    report.endedAt = new Date().toISOString(); report.ok = report.cases.every(c => c.ok);
    await writeJson(path.join(directory, 'report.json'), report);
    await writeFile(path.join(directory, 'report.md'), markdownReport(report));
    await writeJson(path.join(DATA_ROOT, 'eval', 'latest.json'), {runId: id, report: path.join(directory, 'report.json'), markdown: path.join(directory, 'report.md'), ok: report.ok});
    console.log(`Evaluation ${report.ok ? 'PASS' : 'FAIL'}: ${path.join(directory, 'report.md')}`);
    return report;
  });
}
if (isMain(import.meta.url)) {
  try {
    const options = parseOptions(process.argv.slice(2), {filter: 'string', deps: 'string', list: 'boolean'});
    if (options.extra.length) throw new Error('eval does not accept passthrough arguments');
    const report = await evaluate(options); if (report && !report.ok) process.exitCode = 1;
  } catch (error) { console.error(error.message); process.exitCode = 1; }
}
