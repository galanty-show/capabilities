import path from 'node:path';
import {mkdir, readdir, readFile, writeFile, stat, cp} from 'node:fs/promises';
import {ROOT, readJson, writeJson, isMain} from './common.mjs';
import {DATA_ROOT, EVAL_ROOT, runId, sha256, parseOptions, loadCase, copyStarter, fileManifest, installDependencies, withRenderLock, runLogged, optionalJson, measurements, ensureEvaluationBrowser} from './eval-support.mjs';

export async function resolveAgentSkill(root = ROOT) {
  const candidates = [path.resolve(root, '../../skills/galanty-launch'), path.join(root, '.agents/skills/galanty-launch')];
  for (const candidate of candidates) {
    try {
      if ((await stat(path.join(candidate, 'SKILL.md'))).isFile()) return candidate;
    } catch (error) {
      if (error.code !== 'ENOENT' && error.code !== 'ENOTDIR') throw error;
    }
  }
  throw new Error('Galanty Launch skill is missing: use the complete repository or a creator template with .agents/skills/galanty-launch');
}

export function agentCommand(host, prompt, extra = []) {
  // Never supply a model, effort, context or compaction override. User CLI configuration wins.
  if (host === 'codex') return {command: 'codex', args: ['exec', '--skip-git-repo-check', '--json', ...extra, prompt]};
  if (host === 'claude') return {command: 'claude', args: ['-p', ...extra, prompt]};
  if (host === 'gemini') return {command: 'gemini', args: ['-p', prompt, ...extra]};
  throw new Error('--host must be codex, claude or gemini');
}
export function agentPrompt({project, skill, input, source, data, intervention}) {
  return `Use the Galanty Launch skill at ${skill} as your sole production guidance. Product brief: ${input}. Product sources: ${source}. Produce the complete launch-film project in the initially empty working directory ${project}, with the final film, contact sheet, nine frames and render/check evidence required by the skill. Preserve the supplied product, sourced claims, DEMO/EVAL label, duration and delivery limits. Report actual evidence and unresolved review gaps.\n\nLane boundaries: work only inside ${project}; supplied skill/toolkit resources are read-only. Inherit DVS_DATA=${data}. Do not open or operate any installed App, QA environment or other worktree. Do not commit or alter the CLI model, reasoning effort, context or compaction settings. Use the isolated rendering port 4392 serially and close owned processes normally.${intervention ? `\n\nOperator intervention (recorded): ${intervention}` : ''}`;
}
export function summarizeAgentRun(report) {
  const first = report.attempts[0];
  const success = report.attempts.find(a => a.filmSuccess);
  return {firstFilmSuccess: first ? first.filmSuccess : null, firstSuccessfulAttempt: success?.number ?? null, recordedHumanInterventions: report.interventions.length, humanInterventions: report.interventionAuditComplete ? report.interventions.length : null, interventionAuditComplete: report.interventionAuditComplete, totalAttempts: report.attempts.length};
}
async function auditFilm(project, logDir, env, attemptStart) {
  const renderPath = path.join(project, 'build/render.json'), checkPath = path.join(project, 'build/check.json');
  const [render, check] = await Promise.all([optionalJson(renderPath), optionalJson(checkPath)]);
  const files = ['build/promo.mp4', 'build/render.json', 'build/check.json', 'build/contact-sheet.png', ...Array.from({length: 9}, (_, i) => `build/frames/frame-${i + 1}.png`)];
  const evidence = [];
  for (const file of files) {
    const full = path.join(project, file), details = await stat(full).catch(() => null);
    evidence.push({file, bytes: details?.size ?? null, modifiedAt: details?.mtime.toISOString() ?? null, sha256: details?.isFile() ? sha256(await readFile(full)) : null});
  }
  const present = evidence.every(f => f.bytes > 0);
  // Freshness rejects a previous attempt's successful report left in place.
  const fresh = (await stat(checkPath).catch(() => null))?.mtimeMs >= attemptStart;
  let fingerprintProcess = null;
  if (present && render && check?.ok === true && fresh) {
    const code = 'import {fingerprint} from "./scripts/render.mjs"; import {readFile} from "node:fs/promises"; const r=JSON.parse(await readFile("build/render.json","utf8")); if(await fingerprint(r.briefPath)!==r.fingerprint)process.exitCode=1;';
    fingerprintProcess = await runLogged(process.execPath, ['--input-type=module', '-e', code], {cwd: project, env, logDir, label: 'evidence-fingerprint'});
  }
  return {ok: present && fresh && check?.ok === true && fingerprintProcess?.code === 0, present, fresh: !!fresh, checkOk: check?.ok ?? null, fingerprintProcess, measurements: measurements(check), evidence};
}
export async function runAgent(options) {
  // An Agent may copy this toolkit and run npm ci. A node_modules symlink could
  // let that operation erase the source dependency tree, so reject before any I/O.
  const deps = options.deps ?? 'ci';
  if (deps !== 'ci') throw new Error('Agent trials require --deps ci; shared node_modules links are unsafe for Agent-created copies');
  const entry = await loadCase(options.case), host = options.host ?? 'codex';
  agentCommand(host, '', options.extra);
  return withRenderLock(async () => {
    const base = path.join(DATA_ROOT, 'agent-eval');
    const directory = options.resume ? path.resolve(options.resume) : path.join(base, `${runId()}-${host}-${entry.id}`);
    if (!directory.startsWith(`${base}${path.sep}`)) throw new Error('--resume must be an existing run under .lane-data/agent-eval');
    const resources = path.join(directory, 'resources'), toolkit = path.join(resources, 'tools', 'galanty-launch'), skill = path.join(resources, 'skills', 'galanty-launch', 'SKILL.md');
    const project = path.join(directory, 'project'), input = path.join(directory, 'input', 'brief.json'), source = path.join(directory, 'input', 'source.md'), data = path.join(directory, 'data');
    const browser = await ensureEvaluationBrowser();
    const env = {...process.env, DVS_DATA: data, REMOTION_BROWSER_EXECUTABLE: browser.path};
    let report;
    if (options.resume) {
      if (!options.intervention) throw new Error('Continuation requires --intervention describing the manual retry/assistance');
      report = await readJson(path.join(directory, 'report.json'));
      if (report.dependencies?.mode !== 'npm-ci') throw new Error('Legacy shared-dependency Agent trials cannot resume; start a new isolated --deps ci trial');
      if (report.browser && report.browser.sha256 !== browser.sha256) throw new Error('Browser executable changed since the initial trial');
      if (report.case !== entry.id || report.host !== host) throw new Error('Continuation must keep the original --case and --host');
      if (report.toolkit.sha256 !== (await fileManifest(resources)).sha256) throw new Error('Toolkit changed since the initial trial');
    } else {
      if (options.intervention) throw new Error('--intervention is for --resume; initial attempt starts without case-specific help');
      await mkdir(project, {recursive: true});
      if ((await readdir(project)).length) throw new Error('Initial Agent project must be empty');
      await mkdir(path.dirname(input), {recursive: true}); await mkdir(data, {recursive: true});
      await writeFile(input, await readFile(path.join(EVAL_ROOT, entry.brief)));
      await writeFile(source, await readFile(path.join(EVAL_ROOT, entry.source)));
      await copyStarter(ROOT, toolkit);
      const skillSource = await resolveAgentSkill();
      await cp(skillSource, path.dirname(skill), {recursive: true});
      const dependencyRecords = [];
      const dependencies = await installDependencies(toolkit, deps, async (cmd, args, settings) => {
        const result = await runLogged(cmd, args, {...settings, env, logDir: path.join(directory, 'setup-logs')}); dependencyRecords.push(result); return result;
      });
      report = {version: 1, mode: 'agent-skill-adoption', runId: path.basename(directory), case: entry.id, host, startedAt: new Date().toISOString(), emptyTargetAtStart: true, project, toolkit: await fileManifest(resources), browser, inputSha256: sha256(await readFile(input)), sourceSha256: sha256(await readFile(source)), dependencies, dependencyRecords, modelPolicy: 'Inherited CLI configuration; runner supplies no model/effort/context/compaction overrides', port: 4392, attempts: [], interventions: [], interventionAuditComplete: false};
    }
    if (options.intervention) report.interventions.push({at: new Date().toISOString(), beforeAttempt: report.attempts.length + 1, description: options.intervention});
    // An affirmative operator declaration is required on every invocation, otherwise counts remain unknown.
    report.interventionAuditComplete = Boolean(options['audit-interventions']) && (report.attempts.length === 0 || report.interventionAuditComplete);
    const number = report.attempts.length + 1, logs = path.join(directory, `attempt-${number}`);
    const prompt = agentPrompt({project, skill, input, source, data, intervention: options.intervention});
    await mkdir(logs, {recursive: true}); await writeFile(path.join(logs, 'prompt.txt'), prompt);
    const command = agentCommand(host, prompt, options.extra);
    const attempt = {number, browser, startedAt: new Date().toISOString(), promptSha256: sha256(prompt), emptyTarget: (await readdir(project)).length === 0, cli: {command: command.command, args: command.args.map(arg => arg === prompt ? '<prompt: see prompt.txt>' : arg)}};
    report.attempts.push(attempt); await writeJson(path.join(directory, 'report.json'), report);
    console.log(`Agent trial ${host}/${entry.id}, attempt ${number}: ${directory}`);
    attempt.process = await runLogged(command.command, command.args, {cwd: project, env, logDir: logs, label: 'agent'});
    try { attempt.audit = await auditFilm(project, logs, env, Date.parse(attempt.startedAt)); }
    catch (error) { attempt.audit = {ok: false, error: error.message}; }
    attempt.filmSuccess = attempt.process.code === 0 && attempt.audit.ok;
    attempt.endedAt = new Date().toISOString(); report.summary = summarizeAgentRun(report);
    await writeJson(path.join(directory, 'report.json'), report);
    const s = report.summary;
    await writeFile(path.join(directory, 'report.md'), `# Agent skill-adoption trial\n\nHost: ${host}; case: ${entry.id}; attempts: ${s.totalAttempts}.\n\nShared browser: ${browser.path}; SHA-256: ${browser.sha256}.\n\nFirst invocation film success: ${s.firstFilmSuccess}. First successful invocation: ${s.firstSuccessfulAttempt ?? 'none'}. Recorded human interventions: ${s.recordedHumanInterventions}; total audited interventions: ${s.humanInterventions ?? 'unknown (no complete operator declaration)'}.\n\nThis is a real CLI invocation from an initially empty target. It is separate from template automation. First success means the first host invocation produced all required film artifacts, a fresh successful check, and an unchanged render-input fingerprint. It does not claim the first internal render command succeeded. Raw host logs and artifact hashes are retained per attempt; human audiovisual review is not inferred.\n`);
    console.log(`Agent trial ${attempt.filmSuccess ? 'PASS' : 'FAIL'}: ${path.join(directory, 'report.json')}`);
    return {report, ok: attempt.filmSuccess};
  });
}
if (isMain(import.meta.url)) {
  try {
    const options = parseOptions(process.argv.slice(2), {case: 'string', host: 'string', deps: 'string', resume: 'string', intervention: 'string', 'audit-interventions': 'boolean', help: 'boolean'});
    if (options.help) {
      console.log('Usage: node scripts/agent-runner.mjs --case <id> [--host codex|claude|gemini] [--deps ci] [--audit-interventions] [--resume <run-directory> --intervention <description>] [-- <explicit host CLI arguments>]');
      process.exit(0);
    }
    if (!options.case) throw new Error('--case is required');
    const result = await runAgent(options); if (!result.ok) process.exitCode = 1;
  } catch (error) { console.error(error.message); process.exitCode = 1; }
}
