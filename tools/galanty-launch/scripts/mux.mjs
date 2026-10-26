import path from 'node:path';
import {mkdtemp, rename, rm} from 'node:fs/promises';
import {run} from './common.mjs';

// Remotion 4.0.523's chunked ADTS path loses the first two AAC frames' priming
// metadata. Encode the original zero-based WAV directly into MP4 instead. FFmpeg
// retains AAC skip_samples/edit-list timing; never guess a delay or shift a song.
export async function muxMusic({videoPath, audioPath, outputPath, durationSeconds}) {
  const temporary = await mkdtemp(path.join(path.dirname(outputPath), '.mux-'));
  try {
    const pending = path.join(temporary, 'master.mp4');
    await run('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-nostdin', '-y',
      '-i', videoPath, '-i', audioPath, '-map', '0:v:0', '-map', '1:a:0',
      '-c:v', 'copy', '-c:a', 'aac', '-b:a', '320k', '-cutoff', '18000', '-ar', '48000',
      '-t', String(durationSeconds), '-map_metadata', '-1', '-movflags', '+faststart', pending]);
    await rename(pending, outputPath);
  } finally { await rm(temporary, {recursive: true, force: true}); }
}
