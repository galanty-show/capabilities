// No App launch or Agent inference. All mutable CLI state lives under .lane-data.
import {spawn} from 'node:child_process';
import {mkdir, readFile, readdir, writeFile} from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import {root, checkSkills} from './sync-skills.mjs';

const run = new Date().toISOString().replaceAll(/[:.]/g, '-');
const base = path.join(root, '.lane-data/distribution', run);
await mkdir(base, {recursive: true});
const report = {startedAt: new Date().toISOString(), commands: [], noAppLaunch: true, noLogin: true};
const creatorOnly = process.argv.includes('--creator-only');
async function execute(label, command, args, {home = label, cwd = base, timeout = 120000} = {}) {
  const isolated = path.join(base, home);
  await mkdir(isolated, {recursive: true});
  const env = {PATH: process.env.PATH, HOME: isolated, TMPDIR: path.join(isolated, 'tmp'),
    CODEX_HOME: path.join(isolated, '.codex'), CLAUDE_CONFIG_DIR: path.join(isolated, '.claude'),
    XDG_CONFIG_HOME: path.join(isolated, '.config'), XDG_CACHE_HOME: path.join(isolated, '.cache'),
    npm_config_cache: path.join(isolated, '.npm'), npm_config_update_notifier: 'false',
    DISABLE_TELEMETRY: '1', DO_NOT_TRACK: '1', GIT_TERMINAL_PROMPT: '0',
    GIT_CONFIG_NOSYSTEM: '1', GIT_CONFIG_GLOBAL: '/dev/null', CI: '1', TERM: 'dumb'};
  await mkdir(env.TMPDIR, {recursive: true});
  await mkdir(env.CODEX_HOME, {recursive: true});
  const startedAt = new Date().toISOString();
  console.log(`START ${label}`);
  const child = spawn(command, args, {cwd, env, stdio: ['ignore', 'pipe', 'pipe']});
  const completion = new Promise(resolve => {
    child.once('error', error => resolve({code: null, error: error.message}));
    child.once('exit', (code, signal) => resolve({code, signal}));
  });
  await writeFile(path.join(base, `${label}.pid`), String(child.pid ?? 'not-started'));
  let stdout = '', stderr = '', timedOut = false;
  child.stdout.on('data', data => stdout += data);
  child.stderr.on('data', data => stderr += data);
  const timer = setTimeout(() => {timedOut = true; child.kill('SIGTERM');}, timeout);
  const outcome = await completion;
  clearTimeout(timer);
  const record = {label, command, args, cwd, home: isolated, pid: child.pid, startedAt, finishedAt: new Date().toISOString(), ...outcome, timedOut};
  await writeFile(path.join(base, `${label}.log`), `${stdout}\n${stderr}`);
  report.commands.push(record);
  await writeFile(path.join(base, 'report.json'), JSON.stringify(report, null, 2));
  console.log(`END ${label}: ${outcome.code}${timedOut ? ' TIMEOUT' : ''}`);
  return {record, stdout, stderr};
}

await checkSkills();
if (!creatorOnly) {
await execute('skills-remote-list', 'npx', ['--yes', 'skills', 'add', 'galanty-show/capabilities', '--list'], {timeout: 90000});
await execute('skills-local-list', 'npx', ['--yes', 'skills', 'add', root, '--list'], {home: 'skills'});
await execute('skills-local-install', 'npx', ['--yes', 'skills', 'add', root, '--skill', 'galanty-launch', '--agent', 'claude-code', '--global', '--yes', '--copy'], {home: 'skills'});
for (const target of [root, path.join(root, 'plugins/galanty-launch')]) {
  await execute(target === root ? 'claude-validate-marketplace' : 'claude-validate-plugin', 'claude', ['plugin', 'validate', target], {home: 'claude'});
}
await execute('claude-marketplace-add', 'claude', ['plugin', 'marketplace', 'add', root], {home: 'claude'});
await execute('claude-install', 'claude', ['plugin', 'install', 'galanty-launch@galanty-capabilities'], {home: 'claude'});
await execute('claude-list', 'claude', ['plugin', 'list'], {home: 'claude'});
await execute('claude-details', 'claude', ['plugin', 'details', 'galanty-launch'], {home: 'claude'});
await execute('codex-marketplace-add', 'codex', ['plugin', 'marketplace', 'add', root, '--json'], {home: 'codex'});
await execute('codex-install', 'codex', ['plugin', 'add', 'galanty-launch@galanty-capabilities', '--json'], {home: 'codex'});
await execute('codex-list', 'codex', ['plugin', 'list', '--json'], {home: 'codex'});
  const canonical = await readFile(path.join(root, 'skills/galanty-launch/SKILL.md'), 'utf8');
  for (const installed of [
    'skills/.claude/skills/galanty-launch/SKILL.md',
    'claude/.claude/plugins/cache/galanty-capabilities/galanty-launch/0.1.0/skills/galanty-launch/SKILL.md',
    'codex/.codex/plugins/cache/galanty-capabilities/galanty-launch/0.1.0/skills/galanty-launch/SKILL.md',
  ]) assert.equal(await readFile(path.join(base, installed), 'utf8'), canonical, installed);
  const remote = (await readFile(path.join(base, 'skills-remote-list.log'), 'utf8')).replace(/\x1b\[[0-9;?]*[A-Za-z]/g, '');
  report.remoteSkillListed = /\bgalanty-launch\b/.test(remote);
  report.remoteStatus = report.remoteSkillListed ? 'Listed; actual remote installation still needs verification' : 'BLOCKED: remote catalog does not list galanty-launch; no push was authorized';
  report.installedSkillCopiesMatch = true;
}
const tarball = path.join(root, '.lane-data/distribution/packages/create-galanty-launch-0.1.0.tgz');
const packed = await execute('tarball-manifest', 'tar', ['-tzf', tarball]);
assert.equal(packed.record.code, 0);
const entries = packed.stdout.split('\n');
for (const required of ['package/bin/create.mjs', 'package/template/package-lock.json', 'package/template/public/fonts/NotoSansSC-OFL.txt', 'package/template/public/fonts/noto-sans-sc-common.woff2', 'package/template/LICENSE-SKILL-CC-BY-4.0', 'package/template/.agents/skills/galanty-launch/SKILL.md', 'package/template/scripts/agent-runner.mjs', 'package/template/gitignore']) assert.ok(entries.includes(required), required);
assert.ok(!entries.some(entry => /\/(node_modules|build|generated|\.lane-data|create)\/|\.log$|\/\.env/.test(entry)), 'Packed output must exclude caches, generated media, logs and environment files');
await execute('creator-npx', 'npx', ['--yes', '--package', tarball, 'create-galanty-launch', 'fresh-launch'], {home: 'creator'});
const project = path.join(base, 'fresh-launch');
await execute('starter-npm-ci', 'npm', ['ci', '--no-audit', '--no-fund'], {home: 'creator', cwd: project});
await execute('starter-plan', 'npm', ['run', 'plan'], {home: 'creator', cwd: project});
await execute('starter-typecheck', 'npm', ['run', 'typecheck'], {home: 'creator', cwd: project});
await execute('starter-preview-dry-run', 'npm', ['run', 'preview', '--', '--at', '12.5', '--dry-run'], {home: 'creator', cwd: project});
await execute('starter-agent-skill-resolution', process.execPath, ['--input-type=module', '-e', 'import {resolveAgentSkill} from "./scripts/agent-runner.mjs"; import assert from "node:assert/strict"; import path from "node:path"; assert.equal(await resolveAgentSkill(), path.join(process.cwd(), ".agents/skills/galanty-launch")); console.log("Standalone skill resolved inside created project.");'], {home: 'creator', cwd: project});
await execute('creator-refuse-existing', 'npx', ['--yes', '--package', tarball, 'create-galanty-launch', 'fresh-launch'], {home: 'creator'});
report.finishedAt = new Date().toISOString();
report.tarball = {path: tarball, size: (await readFile(tarball)).length};
report.createdFiles = await readdir(project);
report.localPassed = report.commands.every(command => command.label === 'creator-refuse-existing' ? command.code === 1 : command.code === 0);
report.packedBoundariesVerified = true;
await writeFile(path.join(base, 'report.json'), JSON.stringify(report, null, 2));
await writeFile(path.join(root, '.lane-data/distribution/latest.json'), JSON.stringify({report: path.relative(root, path.join(base, 'report.json'))}, null, 2));
console.log(`REPORT ${path.relative(root, path.join(base, 'report.json'))}`);
if (!report.localPassed) process.exitCode = 1;
