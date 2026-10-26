import {cp, readdir, readFile, rm} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

export const root = fileURLToPath(new URL('../../', import.meta.url));
const canonical = path.join(root, 'skills/galanty-launch');
const bundled = path.join(root, 'plugins/galanty-launch/skills/galanty-launch');

async function manifest(directory, prefix = '') {
  const result = {};
  for (const entry of await readdir(directory, {withFileTypes: true})) {
    const relative = path.join(prefix, entry.name);
    if (entry.isSymbolicLink()) throw new Error(`Skill must not contain symlinks: ${relative}`);
    if (entry.isDirectory()) Object.assign(result, await manifest(path.join(directory, entry.name), relative));
    else result[relative] = (await readFile(path.join(directory, entry.name))).toString('base64');
  }
  return Object.fromEntries(Object.entries(result).sort(([a], [b]) => a.localeCompare(b)));
}

export async function checkSkills() {
  if (JSON.stringify(await manifest(canonical)) !== JSON.stringify(await manifest(bundled))) {
    throw new Error('Plugin skill differs from canonical skill. Run node docs/distribution/sync-skills.mjs');
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  if (process.argv.includes('--check')) await checkSkills();
  else {
    await rm(bundled, {recursive: true, force: true});
    await cp(canonical, bundled, {recursive: true, dereference: false});
    await checkSkills();
  }
  console.log('Canonical and bundled skill match.');
}
