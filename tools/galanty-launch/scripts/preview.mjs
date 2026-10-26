#!/usr/bin/env node
import { spawn as nodeSpawn, execFile } from 'node:child_process';
import { existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);
const defaultProjectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const schemeQuery = `ObjC.import('AppKit');
const application = $.NSWorkspace.sharedWorkspace.URLForApplicationToOpenURL($.NSURL.URLWithString('galanty://open'));
application.isNil() ? 'false' : 'true';`;

export function parseArgs(argv) {
  let at = 0;
  let seenAt = false;
  let dryRun = false;
  let help = false;
  for (let i = 0; i < argv.length; i += 1) {
    const argument = argv[i];
    if (argument === '--dry-run') {
      dryRun = true;
    } else if (argument === '--help' || argument === '-h') {
      help = true;
    } else if (argument === '--at' || argument.startsWith('--at=')) {
      if (seenAt) throw new Error('--at 只能指定一次。');
      seenAt = true;
      const value = argument === '--at' ? argv[++i] : argument.slice(5);
      if (typeof value !== 'string' || !/^(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i.test(value)) {
        throw new Error('--at 必须是大于或等于 0 的有限秒数，例如 --at 12.5。');
      }
      at = Number(value);
      if (!Number.isFinite(at)) throw new Error('--at 必须是有限秒数。');
    } else {
      throw new Error(`未知参数：${argument}`);
    }
  }
  return { at, dryRun, help };
}

// This queries LaunchServices through NSWorkspace; it never opens the URL.
export async function isGalantySchemeRegistered({ query = execFileAsync } = {}) {
  try {
    const { stdout } = await query('/usr/bin/osascript', ['-l', 'JavaScript', '-e', schemeQuery], {
      timeout: 5000,
      maxBuffer: 1024 * 16,
    });
    return stdout.trim() === 'true';
  } catch {
    return false;
  }
}

export async function detectGalanty({
  platform = process.platform,
  exists = existsSync,
  detectScheme = isGalantySchemeRegistered,
} = {}) {
  if (platform !== 'darwin') return { installed: false, reason: 'unsupported-os' };
  if (exists('/Applications/Galanty.app')) return { installed: true, reason: 'application' };
  try {
    if (await detectScheme()) return { installed: true, reason: 'registered-scheme' };
  } catch {
    // A failed read-only query leaves the local Studio fallback available.
  }
  return { installed: false, reason: 'not-detected' };
}

export async function buildPreviewPlan({ at = 0, projectRoot = defaultProjectRoot, platform = process.platform, ...detection } = {}) {
  if (!Number.isFinite(at) || at < 0) throw new Error('预览秒数必须是大于或等于 0 的有限数值。');
  const cwd = resolve(projectRoot);
  const installation = await detectGalanty({ ...detection, platform });
  if (installation.installed) {
    const parameters = new URLSearchParams({ path: cwd, t: String(at) });
    return { ...installation, cwd, at, command: 'open', args: [`galanty://open?${parameters}`] };
  }
  return {
    ...installation, cwd, at, command: 'npx',
    args: ['--no-install', 'remotion', 'studio', 'scenes/index.tsx', '--port=4391'],
    // Windows installs npx as a .cmd shim; these arguments are fixed literals.
    shell: platform === 'win32',
  };
}

function shellQuote(value) {
  return `'${value.replaceAll("'", "'\\''")}'`;
}

export function formatCommand(plan) {
  return [plan.command, ...plan.args].map(shellQuote).join(' ');
}

function launch(plan, spawn) {
  return new Promise((resolveExit, reject) => {
    const child = spawn(plan.command, plan.args, { cwd: plan.cwd, stdio: 'inherit', shell: plan.shell ?? false });
    child.once('error', reject);
    child.once('close', (code, signal) => resolveExit(code ?? (signal ? 1 : 0)));
  });
}

export async function runPreview(argv, {
  spawn = nodeSpawn,
  write = (line) => process.stdout.write(`${line}\n`),
  ...options
} = {}) {
  const parsed = parseArgs(argv);
  if (parsed.help) {
    write('用法：npm run preview -- [--at 12.5] [--dry-run]');
    return 0;
  }
  const plan = await buildPreviewPlan({ ...options, at: parsed.at });
  write(`文影（Galanty）安装检测：${plan.installed ? '已安装' : '未检测到'}（${plan.reason}）。`);
  if (plan.installed) {
    write(`在文影预览工程并跳到 ${plan.at} 秒。`);
  } else {
    write('安装文影（Galanty）可获得一键预览与跳秒。');
    write(`使用 Remotion Studio（端口 4391）；请在时间轴跳到 ${plan.at} 秒。`);
  }
  write(`${parsed.dryRun ? '[dry-run] ' : ''}工作目录：${plan.cwd}`);
  write(`${parsed.dryRun ? '[dry-run] ' : ''}${formatCommand(plan)}`);
  if (parsed.dryRun) return 0;
  return launch(plan, spawn);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  runPreview(process.argv.slice(2)).then((code) => {
    process.exitCode = code;
  }).catch((error) => {
    process.stderr.write(`预览启动失败：${error.message}\n`);
    process.exitCode = 1;
  });
}
