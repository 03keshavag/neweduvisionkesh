/**
 * FFmpeg Audio + Video Muxer.
 *
 * Combines the Manim MP4 animation with the complete TTS narration MP3,
 * ensuring no narration clipping (extends final frame if audio is longer),
 * and produces a faststart, web-compatible MP4 for the existing website player.
 */
import path from 'node:path';
import {stat, writeFile, unlink} from 'node:fs/promises';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import type {AudioMuxOptions} from '../types';

const execFileAsync = promisify(execFile);

export async function concatenateSceneAudios(
  sceneAudioFiles: string[],
  outputAudioPath: string,
): Promise<string> {
  if (sceneAudioFiles.length === 1) {
    return sceneAudioFiles[0];
  }

  // Create an FFmpeg concat list file
  const listPath = outputAudioPath + '.concat.txt';
  const listContent = sceneAudioFiles.map((f) => `file '${path.resolve(f)}'`).join('\n');
  await writeFile(listPath, listContent, 'utf-8');

  try {
    await execFileAsync('ffmpeg', [
      '-y',
      '-f',
      'concat',
      '-safe',
      '0',
      '-i',
      listPath,
      '-c',
      'copy',
      outputAudioPath,
    ]);
    return outputAudioPath;
  } finally {
    await unlink(listPath).catch(() => {});
  }
}

export async function muxAudioAndVideo(options: AudioMuxOptions): Promise<{outputPath: string; duration: number}> {
  const {videoPath, audioPath, outputPath} = options;

  // 1. Measure both durations
  const [videoDuration, audioDuration] = await Promise.all([
    getMediaDuration(videoPath),
    getMediaDuration(audioPath),
  ]);

  console.log(`[audioMuxer] Video duration: ${videoDuration.toFixed(2)}s | Audio duration: ${audioDuration.toFixed(2)}s`);

  // 2. If audio is longer than video, pad/extend the final frame of the video
  const args: string[] = ['-y', '-i', videoPath, '-i', audioPath];

  if (audioDuration > videoDuration) {
    const padSeconds = Math.max(0.5, audioDuration - videoDuration + 0.8);
    console.log(`[audioMuxer] Padding final frame by ${padSeconds.toFixed(2)}s to preserve complete narration.`);
    args.push('-vf', `tpad=stop_mode=clone:stop_duration=${padSeconds.toFixed(2)}`);
  }

  args.push(
    '-c:v',
    'libx264',
    '-preset',
    'fast',
    '-pix_fmt',
    'yuv420p',
    '-c:a',
    'aac',
    '-b:a',
    '192k',
    '-movflags',
    '+faststart',
    outputPath,
  );

  await execFileAsync('ffmpeg', args);

  const fileStat = await stat(outputPath);
  if (fileStat.size === 0) {
    throw new Error('Muxed final MP4 file is empty (0 bytes).');
  }

  const finalDuration = await getMediaDuration(outputPath);
  return {outputPath, duration: finalDuration};
}

async function getMediaDuration(filePath: string): Promise<number> {
  try {
    const {stdout} = await execFileAsync('ffprobe', [
      '-v',
      'error',
      '-show_entries',
      'format=duration',
      '-of',
      'default=noprint_wrappers=1:nokey=1',
      filePath,
    ]);
    const sec = parseFloat(stdout.trim());
    return Number.isFinite(sec) && sec > 0 ? sec : 10;
  } catch {
    return 10;
  }
}
