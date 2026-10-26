#!/usr/bin/env node
import {cp, lstat, mkdir, readdir, realpath, rename, rm} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

export async function createProject(name, {cwd = process.cwd(), template = fileURLToPath(new URL('../template/', import.meta.url))} = {}) {
  // A single directory name keeps the output inside the caller-selected directory.
  if (!/^[a-zA-Z0-9][a-zA-Z0-9_-]{0,63}$/.test(name ?? '')) throw new Error('Use a project name of 1–64 letters, numbers, hyphens or underscores; start with a letter or number.');
  const target = path.join(cwd, name);
  await lstat(template);
  // mkdir without recursive is an atomic refusal to overwrite any existing target.
  await mkdir(target);
  try {
    for (const entry of await readdir(template)) {
      await cp(path.join(template, entry), path.join(target, entry), {recursive: true, force: false, errorOnExist: true});
    }
    await rename(path.join(target, 'gitignore'), path.join(target, '.gitignore'));
  } catch (error) {
    await rm(target, {recursive: true, force: true});
    throw error;
  }
  return target;
}

if (process.argv[1] && await realpath(process.argv[1]).catch(() => '') === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  if (args.length === 1 && ['--help', '-h'].includes(args[0])) {
    console.log('Usage: npx create-galanty-launch <name>\nCreates a new directory; never overwrites an existing target. No dependencies or apps are installed automatically.');
  } else {
    try {
      if (args.length !== 1) throw new Error('Usage: npx create-galanty-launch <name>');
      const target = await createProject(args[0]);
      console.log(`Created ${target}\n\nNext:\n  cd ${args[0]}\n  npm ci\n  npm run preview -- --at 12.5\n\nRequires Node 22+, FFmpeg 6+ and ffprobe. Installs no App and performs no rendering until you run the commands.\nRemotion has separate license terms: https://www.remotion.dev/docs/license`);
    } catch (error) {
      console.error(`Cannot create project: ${error.message}`);
      process.exitCode = 1;
    }
  }
}
