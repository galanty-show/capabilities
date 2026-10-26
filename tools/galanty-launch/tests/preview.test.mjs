import assert from 'node:assert/strict';
import { EventEmitter } from 'node:events';
import test from 'node:test';
import {
  buildPreviewPlan, detectGalanty, formatCommand,
  isGalantySchemeRegistered, parseArgs, runPreview,
} from '../scripts/preview.mjs';

function fakeSpawn(calls, { code = 0, error } = {}) {
  return (...args) => {
    calls.push(args);
    const child = new EventEmitter();
    queueMicrotask(() => error ? child.emit('error', error) : child.emit('close', code, null));
    return child;
  };
}

test('parses seconds and dry-run, rejecting malformed or non-finite arguments', () => {
  assert.deepEqual(parseArgs(['--at', '12.5', '--dry-run']), { at: 12.5, dryRun: true, help: false });
  assert.equal(parseArgs(['--at=0']).at, 0);
  assert.equal(parseArgs(['--at', '.5']).at, 0.5);
  assert.equal(parseArgs([]).at, 0);
  for (const args of [
    ['--at'], ['--at', '-1'], ['--at', 'NaN'], ['--at', 'Infinity'],
    ['--at', '1e999'], ['--at='], ['--at', ' '], ['--at', '0x10'],
    ['--at', '12s'], ['--at', '1', '--at', '2'], ['--unknown'], ['12.5'],
  ]) assert.throws(() => parseArgs(args), undefined, JSON.stringify(args));
});

test('macOS application detection skips scheme query when app exists', async () => {
  const paths = [];
  const result = await detectGalanty({
    platform: 'darwin',
    exists: (path) => { paths.push(path); return true; },
    detectScheme: () => { throw new Error('must not query'); },
  });
  assert.deepEqual(paths, ['/Applications/Galanty.app']);
  assert.deepEqual(result, { installed: true, reason: 'application' });
});

test('registered scheme supports installations outside /Applications', async () => {
  let queries = 0;
  assert.deepEqual(await detectGalanty({
    platform: 'darwin', exists: () => false,
    detectScheme: () => { queries += 1; return true; },
  }), { installed: true, reason: 'registered-scheme' });
  assert.equal(queries, 1);
});

test('scheme detection only queries NSWorkspace, without opening a URL', async () => {
  const calls = [];
  const query = async (...args) => { calls.push(args); return { stdout: 'true\n' }; };
  assert.equal(await isGalantySchemeRegistered({ query }), true);
  assert.equal(calls[0][0], '/usr/bin/osascript');
  assert.deepEqual(calls[0][1].slice(0, 3), ['-l', 'JavaScript', '-e']);
  assert.match(calls[0][1][3], /URLForApplicationToOpenURL/);
  assert.doesNotMatch(calls[0][1][3], /openURL\s*\(/);
  assert.equal(await isGalantySchemeRegistered({ query: async () => ({ stdout: 'false\n' }) }), false);
  assert.equal(await isGalantySchemeRegistered({ query: async () => { throw new Error('unavailable'); } }), false);
});

test('deep link encodes absolute project path and seconds with URLSearchParams', async () => {
  const projectRoot = '/tmp/文影 demo & #? project';
  const plan = await buildPreviewPlan({
    platform: 'darwin', projectRoot, at: 12.5, exists: () => true,
  });
  assert.equal(plan.command, 'open');
  const url = new URL(plan.args[0]);
  assert.equal(url.protocol, 'galanty:');
  assert.equal(url.hostname, 'open');
  assert.equal(url.searchParams.get('path'), projectRoot);
  assert.equal(url.searchParams.get('t'), '12.5');
  assert.match(plan.args[0], /%26/);
  assert.equal(plan.cwd, projectRoot);
});

test('unsupported OS bypasses macOS detection and selects independent Studio port', async () => {
  for (const platform of ['linux', 'win32']) {
    const plan = await buildPreviewPlan({
      platform, projectRoot: '/tmp/preview',
      exists: () => { throw new Error('must not check'); },
      detectScheme: () => { throw new Error('must not query'); },
    });
    assert.equal(plan.installed, false);
    assert.equal(plan.reason, 'unsupported-os');
    assert.equal(plan.command, 'npx');
    assert.deepEqual(plan.args, ['--no-install', 'remotion', 'studio', 'scenes/index.tsx', '--port=4391']);
  }
});

test('macOS missing app and unsuccessful registration query fall back to Studio', async () => {
  for (const detectScheme of [async () => false, async () => { throw new Error('query failed'); }]) {
    const plan = await buildPreviewPlan({ platform: 'darwin', exists: () => false, detectScheme });
    assert.equal(plan.installed, false);
    assert.equal(plan.command, 'npx');
  }
});

test('dry-run reports installation, cwd, decision command, and seek tip without launching', async () => {
  for (const installed of [true, false]) {
    const lines = [];
    const calls = [];
    const code = await runPreview(['--at', '12.5', '--dry-run'], {
      platform: 'darwin', projectRoot: '/tmp/project', exists: () => installed,
      detectScheme: async () => false, spawn: fakeSpawn(calls), write: (line) => lines.push(line),
    });
    assert.equal(code, 0);
    assert.equal(calls.length, 0);
    assert.match(lines.join('\n'), installed ? /已安装/ : /未检测到/);
    assert.match(lines.join('\n'), /12\.5 秒/);
    assert.match(lines.join('\n'), installed ? /galanty:\/\/open\?/ : /--port=4391/);
    assert.match(lines.join('\n'), /\[dry-run\] 工作目录：\/tmp\/project/);
  }
});

test('launches selected command through injected spawn and propagates exit status', async () => {
  for (const installed of [true, false]) {
    const calls = [];
    const code = await runPreview(['--at', '12.5'], {
      platform: 'darwin', projectRoot: '/tmp/project', exists: () => installed,
      detectScheme: async () => false, spawn: fakeSpawn(calls, { code: 7 }), write: () => {},
    });
    assert.equal(code, 7);
    assert.equal(calls.length, 1);
    assert.equal(calls[0][0], installed ? 'open' : 'npx');
    assert.deepEqual(calls[0][2], { cwd: '/tmp/project', stdio: 'inherit', shell: false });
  }
});

test('invalid args never detect or launch; spawn errors remain failures', async () => {
  await assert.rejects(runPreview(['--at', '-1'], {
    exists: () => { throw new Error('must not detect'); },
    spawn: () => { throw new Error('must not launch'); },
  }), /--at/);
  await assert.rejects(runPreview([], {
    platform: 'linux', spawn: fakeSpawn([], { error: new Error('npx unavailable') }), write: () => {},
  }), /npx unavailable/);
});

test('Windows fallback permits the npx.cmd shim with fixed arguments', async () => {
  const calls = [];
  assert.equal(await runPreview([], {
    platform: 'win32', spawn: fakeSpawn(calls), write: () => {},
  }), 0);
  assert.equal(calls[0][0], 'npx');
  assert.equal(calls[0][2].shell, true);
});

test('printed commands quote shell metacharacters safely', () => {
  assert.equal(formatCommand({ command: 'open', args: ["galanty://open?path=Bob's&x=1"] }),
    "'open' 'galanty://open?path=Bob'\\''s&x=1'");
});
