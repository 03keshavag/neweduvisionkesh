/**
 * Executes Manim in an isolated subprocess, captures stdout/stderr,
 * locates the rendered MP4 file, and validates output integrity.
 */
import path from 'node:path';
import {mkdir, writeFile, stat, readdir} from 'node:fs/promises';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import type {ManimRenderOptions, ManimRenderResult} from '../types';

const execFileAsync = promisify(execFile);

export async function renderManimScript(
  scriptContent: string,
  options: ManimRenderOptions,
  onProgress?: (progress: number) => void,
): Promise<ManimRenderResult> {
  const {outputDir, jobId, sceneClassName, quality = 'h', timeoutMs = 180000} = options;

  // 1. Prepare isolated job workspace
  const jobDir = path.join(outputDir, 'jobs', jobId);
  await mkdir(jobDir, {recursive: true});

  const scriptPath = path.join(jobDir, 'scene.py');
  await writeFile(scriptPath, scriptContent, 'utf-8');

  onProgress?.(0.1);

  // 2. Execute Manim Community CLI in controlled subprocess
  // Flag -qh: 1080p 60fps (or -qm: 720p 30fps)
  const qualityFlag = quality === 'l' ? '-ql' : quality === 'm' ? '-qm' : quality === 'k' ? '-qk' : '-qh';
  const args = [
    'render',
    qualityFlag,
    '--media_dir',
    jobDir,
    '--flush_cache',
    scriptPath,
    sceneClassName,
  ];

  console.log(`[manimRenderer] Executing: manim ${args.join(' ')}`);

  try {
    const {stdout, stderr} = await execFileAsync('manim', args, {
      cwd: jobDir,
      timeout: timeoutMs,
      env: {
        ...process.env,
        PYTHONUNBUFFERED: '1',
      },
    });

    onProgress?.(0.85);

    // 3. Recursively find generated MP4 inside media_dir
    const foundMp4 = await findFirstMp4(jobDir);
    if (!foundMp4) {
      throw new Error(`Manim execution finished but no MP4 was produced.\nStdout: ${stdout}\nStderr: ${stderr}`);
    }

    const fileStat = await stat(foundMp4);
    if (fileStat.size === 0) {
      throw new Error(`Produced MP4 file is empty (0 bytes).`);
    }

    // 4. Measure video duration using ffprobe
    const durationSeconds = await getMediaDuration(foundMp4);
    onProgress?.(1.0);

    return {
      videoPath: foundMp4,
      durationSeconds,
      width: quality === 'l' ? 854 : quality === 'm' ? 1280 : 1920,
      height: quality === 'l' ? 480 : quality === 'm' ? 720 : 1080,
      fps: quality === 'l' ? 15 : quality === 'm' ? 30 : 60,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    throw new Error(`Manim render failed: ${message}`);
  }
}

async function findFirstMp4(dir: string): Promise<string | null> {
  const entries = await readdir(dir, {withFileTypes: true});
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      const nested = await findFirstMp4(fullPath);
      if (nested) return nested;
    } else if (entry.isFile() && entry.name.endsWith('.mp4') && !entry.name.includes('partial_movie_files')) {
      return fullPath;
    }
  }
  return null;
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
    return Number.isFinite(sec) && sec > 0 ? sec : 30;
  } catch {
    return 30;
  }
}
