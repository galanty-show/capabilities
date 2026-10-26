import {briefArgument} from './common.mjs';
import {prepare} from './prepare.mjs';
import {parseArgs, runPreview} from './preview.mjs';

try {
  const args = process.argv.slice(2);
  const briefIndex = args.indexOf('--brief');
  const briefPath = briefArgument(args);
  const previewArgs = briefIndex < 0 ? args : args.filter((_, i) => i !== briefIndex && i !== briefIndex + 1);
  const parsed = parseArgs(previewArgs);
  if (!parsed.dryRun && !parsed.help) await prepare(briefPath);
  process.exitCode = await runPreview(previewArgs);
} catch (error) { console.error(error.message); process.exitCode = 1; }
