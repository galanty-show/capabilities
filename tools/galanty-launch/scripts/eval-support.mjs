import path from 'node:path';
import net from 'node:net';
import {spawn} from 'node:child_process';
import {createHash} from 'node:crypto';
import {createWriteStream, createReadStream, constants} from 'node:fs';
import {mkdir, readdir, cp, readFile, writeFile, open, rm, symlink, stat, realpath, access} from 'node:fs/promises';
import {ROOT, readJson, writeJson} from './common.mjs';

export const EVAL_ROOT = path.join(ROOT, 'eval');
export const DATA_ROOT = path.join(ROOT, '.lane-data');
export const sha256 = (data) => createHash('sha256').update(data).digest('hex');
export const runId = () => `${new Date().toISOString().replace(/[:.]/g, '-')}-${process.pid}`;
export const optionalJson = async (file) => { try { return await readJson(file); } catch (error) { if (error.code === 'ENOENT') return null; throw error; } };
// Remotion resolves its browser cache from cwd, so ensure it once in the primary toolkit.
// The returned executable is shared; each case still owns its npm dependency installation.
export async function ensureEvaluationBrowser({ensure, root = ROOT, executable = process.env.REMOTION_BROWSER_EXECUTABLE} = {}) {
  const ensureBrowser = ensure ?? (await import('@remotion/renderer')).ensureBrowser;
  const previousCwd = process.cwd();
  let status;
  try {
    process.chdir(root);
    status = await ensureBrowser({browserExecutable: executable ?? null});
  } finally { process.chdir(previousCwd); }
  if (!['local-puppeteer-browser', 'user-defined-path'].includes(status?.type) || typeof status.path !== 'string' || !status.path) throw new Error(`Remotion ensureBrowser did not return a usable executable (${status?.type ?? 'missing status'})`);
  const browserPath = await realpath(path.resolve(root, status.path));
  const details = await stat(browserPath);
  if (!details.isFile() || details.size <= 0) throw new Error('Remotion browser path is not a nonempty executable file');
  await access(browserPath, constants.X_OK);
  const hash = createHash('sha256');
  for await (const chunk of createReadStream(browserPath)) hash.update(chunk);
  return {path: browserPath, sha256: hash.digest('hex'), bytes: details.size, status: status.type, ensuredFrom: root, ensuredAt: new Date().toISOString()};
}
export function parseOptions(args, allowed) {
  const options = {}, extra = [];
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--') { extra.push(...args.slice(i + 1)); break; }
    const name = args[i].replace(/^--/, '');
    if (!args[i].startsWith('--') || !(name in allowed)) throw new Error(`Unknown option ${args[i]}`);
    if (allowed[name] === 'boolean') options[name] = true;
    else {
      if (!args[i + 1] || args[i + 1].startsWith('--')) throw new Error(`--${name} needs a value`);
      options[name] = args[++i];
    }
  }
  return {...options, extra};
}
export async function loadCases(filter) {
  const {cases} = await readJson(path.join(EVAL_ROOT, 'cases.json'));
  if (new Set(cases.map(c => c.id)).size !== cases.length) throw new Error('Duplicate evaluation case IDs');
  const requested = filter ? filter.split(',') : null;
  if (requested?.some(id => !cases.some(c => c.id === id))) throw new Error(`Unknown case in --filter ${filter}`);
  return cases.filter(c => !requested || requested.includes(c.id));
}
export async function loadCase(id) {
  const cases = await loadCases(id);
  if (cases.length !== 1) throw new Error('--case must name one fixed case');
  return cases[0];
}
// Never copy an earlier render, installed dependency tree, evaluation answer or runtime store.
export function includeStarter(relative) {
  const segments = relative.split(/[\\/]/);
  if (segments.some(s => ['node_modules', 'build', '.lane-data', '.remotion', '.git', 'eval'].includes(s))) return false;
  if (relative === 'brief.json' || relative === 'examples/product.md') return false;
  if (/^(scripts\/(eval(?:-support)?|agent-runner)\.mjs|tests\/eval\.test\.mjs)$/.test(relative)) return false;
  if (relative === 'public/generated' || relative.startsWith('public/generated/')) return false;
  return !segments.some(s => s.endsWith('.tsbuildinfo') || s === '.DS_Store');
}
export async function copyStarter(source, target) {
  await mkdir(target, {recursive: true});
  if ((await readdir(target)).length) throw new Error(`Starter target must be empty: ${target}`);
  // fs.cp rejects copying a directory into its descendant before invoking filter.
  // Copy allowed top-level entries individually so .lane-data can safely host isolated cases.
  for (const entry of await readdir(source)) {
    if (!includeStarter(entry)) continue;
    await cp(path.join(source, entry), path.join(target, entry), {recursive: true, dereference: false, filter: (file) => includeStarter(path.relative(source, file))});
  }
}
export async function stageCase(entry, target) {
  const brief = await readFile(path.join(EVAL_ROOT, entry.brief));
  await writeFile(path.join(target, 'brief.json'), brief);
  await cp(path.join(EVAL_ROOT, entry.source), path.join(target, 'eval-source.md'));
  // Replace the toolkit's unrelated default product documentation in this isolated copy.
  await mkdir(path.join(target, 'examples'), {recursive: true});
  await cp(path.join(EVAL_ROOT, entry.source), path.join(target, 'examples/product.md'));
  return {briefSha256: sha256(brief), sourceSha256: sha256(await readFile(path.join(EVAL_ROOT, entry.source)))};
}
export async function fileManifest(root) {
  const files = [];
  async function visit(dir) {
    for (const entry of (await readdir(dir, {withFileTypes: true})).sort((a, b) => a.name.localeCompare(b.name))) {
      const file = path.join(dir, entry.name), relative = path.relative(root, file);
      if (!includeStarter(relative)) continue;
      if (entry.isDirectory()) await visit(file);
      else if (entry.isFile()) files.push({file: relative, sha256: sha256(await readFile(file))});
    }
  }
  await visit(root);
  return {sha256: sha256(JSON.stringify(files)), files};
}
export async function installDependencies(project, mode, execute, source = ROOT) {
  const lockSha256 = sha256(await readFile(path.join(project, 'package-lock.json')));
  if (mode === 'shared') {
    if (sha256(await readFile(path.join(source, 'package-lock.json'))) !== lockSha256) throw new Error('Shared dependencies require the exact same package-lock.json');
    // npm ls verifies the installed tree against package.json rather than guessing from existence.
    await stat(path.join(source, 'node_modules'));
    const verified = await execute('npm', ['ls', '--all', '--json'], {cwd: source, label: 'shared-dependencies'});
    if (verified.code !== 0) throw new Error('Shared dependency validation failed; use --deps ci');
    await symlink(path.join(source, 'node_modules'), path.join(project, 'node_modules'), 'dir');
    return {mode: 'shared-symlink', source: path.join(source, 'node_modules'), lockSha256, validation: verified};
  }
  if (mode !== 'ci') throw new Error('--deps must be ci or shared');
  const installed = await execute('npm', ['ci', '--no-audit', '--no-fund'], {cwd: project, label: 'npm-ci'});
  if (installed.code !== 0) throw new Error('npm ci failed (see npm-ci log)');
  return {mode: 'npm-ci', lockSha256, command: installed};
}
export async function withRenderLock(action) {
  await mkdir(DATA_ROOT, {recursive: true});
  const file = path.join(DATA_ROOT, 'evaluation-port-4392.lock');
  let lock;
  try { lock = await open(file, 'wx'); }
  catch (error) { if (error.code === 'EEXIST') throw new Error(`Another evaluation owns port 4392, or left a lock: ${file}. Inspect its PID before removing a stale lock.`); throw error; }
  try {
    await lock.writeFile(JSON.stringify({pid: process.pid, startedAt: new Date().toISOString(), port: 4392}));
    await new Promise((resolve, reject) => {
      const server = net.createServer();
      server.once('error', reject);
      server.listen(4392, '127.0.0.1', () => server.close(resolve));
    });
    return await action();
  } finally { await lock.close(); await rm(file); }
}
export async function runLogged(command, args, {cwd, env = process.env, logDir, label}) {
  await mkdir(logDir, {recursive: true});
  const logPath = path.join(logDir, `${label}.log`), log = createWriteStream(logPath);
  const startedAt = new Date().toISOString(), started = performance.now();
  const child = spawn(command, args, {cwd, env, stdio: ['ignore', 'pipe', 'pipe']});
  child.stdout.pipe(log, {end: false}); child.stderr.pipe(log, {end: false});
  const onSignal = () => { child.kill('SIGTERM'); };
  process.once('SIGINT', onSignal); process.once('SIGTERM', onSignal);
  const result = await new Promise(resolve => {
    child.once('error', error => resolve({code: null, signal: null, error: error.message}));
    child.once('close', (code, signal) => resolve({code, signal}));
  });
  await new Promise(resolve => log.end(resolve));
  process.off('SIGINT', onSignal); process.off('SIGTERM', onSignal);
  const report = {command, args, cwd, pid: child.pid ?? null, startedAt, endedAt: new Date().toISOString(), seconds: (performance.now() - started) / 1000, ...result, normalExit: result.code === 0 && !result.signal && !result.error, log: logPath};
  await writeJson(path.join(logDir, `${label}.process.json`), report);
  return report;
}
export function measurements(check) {
  const c = check?.checks;
  const finite = value => Number.isFinite(value) ? value : null;
  return {durationSeconds: finite(c?.durationSeconds), integratedLufs: finite(c?.audio?.integratedLufs), truePeakDbtp: finite(c?.audio?.truePeakDbtp), cutResidualMedianMs: finite(c?.cutResidual?.medianMs), musicOnsetMedianMs: c?.decodedMusicOnsets?.medianResidualSeconds == null ? null : finite(c.decodedMusicOnsets.medianResidualSeconds * 1000), deterministic: typeof c?.deterministic === 'boolean' ? c.deterministic : null, matchedFullFrames: finite(c?.matchedFullFrames), decodedRgbaFrames: finite(c?.decodedRgbaFrames), lowCoverageFrames: finite(c?.visualCoverage?.lowCoverageFrames), analyzedFrames: finite(c?.visualCoverage?.analyzedFrames)};
}
export function markdownReport(report) {
  const n = v => v == null ? '—' : typeof v === 'number' ? Number(v.toFixed(3)) : v;
  const lines = ['# Galanty Launch template evaluation', '', `Run: ${report.runId}. Mode: ${report.mode}. Cases: ${report.cases.length}. Passed: ${report.cases.filter(c => c.ok).length}.`, '', `Browser: ${report.browser?.path ?? 'unavailable'}; SHA-256: ${report.browser?.sha256 ?? 'unavailable'}.`, '', 'This measures copied-starter render/check automation, not Agent skill adoption. Low coverage is advisory; no human audiovisual review is implied. Missing measurements are —, never zero.', '', '| Case | Film + check | Duration s | LUFS | dBTP | Cut residual ms | Onset ms | Double render | Low coverage frames | Wall s |', '| --- | --- | ---: | ---: | ---: | ---: | ---: | --- | ---: | ---: |'];
  for (const c of report.cases) {
    const m = c.measurements;
    lines.push(`| ${c.id} | ${c.ok ? 'PASS' : 'FAIL'} | ${n(m.durationSeconds)} | ${n(m.integratedLufs)} | ${n(m.truePeakDbtp)} | ${n(m.cutResidualMedianMs)} | ${n(m.musicOnsetMedianMs)} | ${m.deterministic == null ? '—' : m.deterministic ? `${m.matchedFullFrames}/${m.decodedRgbaFrames}` : 'FAIL'} | ${m.lowCoverageFrames == null ? '—' : `${m.lowCoverageFrames}/${m.analyzedFrames}`} | ${n(c.seconds)} |`);
  }
  for (const c of report.cases) lines.push('', `## ${c.id}`, '', `Project: \`${c.project}\``, '', `Dependency mode: ${c.dependencies?.mode ?? 'unavailable'}. Process logs: \`${c.logs}\`.`, '', ...(c.errors.length ? c.errors.map(e => `- ${String(e).replaceAll('\n', ' ')}`) : ['No hard check errors.']));
  return `${lines.join('\n')}\n`;
}
