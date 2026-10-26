import {cp, lstat, mkdir, readdir, rename, rm} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const directory = fileURLToPath(new URL('../', import.meta.url));
const toolkit = path.resolve(directory, '..');
const root = path.resolve(toolkit, '../..');
const destination = path.join(directory, 'template');
const excluded = new Set(['create', 'node_modules', 'build', '.remotion', '.lane-data', '.DS_Store']);
const included = new Set(['.gitignore', 'LICENSE', 'NOTICE.md', 'CREDITS.md', 'README.md', 'SKILL.md', 'brief.json', 'package.json', 'package-lock.json', 'remotion.config.ts', 'tsconfig.json', 'scenes', 'scripts', 'tests', 'examples', 'public', 'eval']);
await rm(destination, {recursive: true, force: true});
await mkdir(destination, {recursive: true});
for (const entry of await readdir(toolkit)) {
  if (!included.has(entry)) continue;
  await cp(path.join(toolkit, entry), path.join(destination, entry), {
    recursive: true,
    filter: async source => {
      const relative = path.relative(toolkit, source);
      if ((await lstat(source)).isSymbolicLink()) throw new Error(`Template symlink rejected: ${relative}`);
      return !relative.split(path.sep).some(part => excluded.has(part) || part.endsWith('.log') || part === '.env' || part.startsWith('.env.')) && relative !== 'public/generated' && !relative.startsWith(`public/generated${path.sep}`);
    },
  });
}
// npm excludes .gitignore from packed templates; restore it when scaffolding.
await rename(path.join(destination, '.gitignore'), path.join(destination, 'gitignore'));
await cp(path.join(root, 'skills/galanty-launch'), path.join(destination, '.agents/skills/galanty-launch'), {recursive: true});
await cp(path.join(root, 'LICENSE-CC-BY-4.0'), path.join(destination, 'LICENSE-SKILL-CC-BY-4.0'));
await cp(path.join(toolkit, 'LICENSE'), path.join(directory, 'LICENSE'));
console.error('Prepared self-contained template from current toolkit sources.');
