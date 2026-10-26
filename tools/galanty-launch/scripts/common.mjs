import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {readFile, writeFile} from 'node:fs/promises';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const run = promisify(execFile);
export const readJson = async (file) => JSON.parse(await readFile(file, 'utf8'));
export const writeJson = async (file, value) => writeFile(file, `${JSON.stringify(value, null, 2)}\n`);
export function briefArgument(args = process.argv.slice(2)) {
  const index = args.indexOf('--brief');
  if (index >= 0 && (!args[index + 1] || args[index + 1].startsWith('--'))) throw new Error('--brief requires a JSON path');
  return path.resolve(index >= 0 ? args[index + 1] : path.join(ROOT, 'brief.json'));
}
export function isMain(url) { return process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(url); }
