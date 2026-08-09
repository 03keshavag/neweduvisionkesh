/**
 * End-to-end check of the FLEXIBLE pipeline without the website:
 *   Groq/mock plan → TTS → audio-duration timeline → Remotion MP4
 * Run: node_modules\.bin\tsx.cmd scripts/e2e-flexible.ts
 */
import http from 'node:http';
import {createReadStream, existsSync} from 'node:fs';
import path from 'node:path';
import 'dotenv/config';
import {generateVideo} from '../src/renderer/generateVideo';

const ROOT = process.cwd();
const AUDIO_DIR = path.join(ROOT, 'output', 'audio');
const VIDEO_DIR = path.join(ROOT, 'output', 'videos');
const PORT = 4010;

const server = http.createServer((req, res) => {
  const url = req.url ?? '/';
  if (url.startsWith('/audio/')) {
    const file = path.join(AUDIO_DIR, url.replace(/^\/audio\//, ''));
    if (existsSync(file)) {
      res.setHeader('content-type', 'audio/mpeg');
      createReadStream(file).pipe(res);
    } else {
      res.statusCode = 404;
      res.end('not found');
    }
  } else {
    res.statusCode = 404;
    res.end('not found');
  }
});

async function main(): Promise<void> {
  await new Promise<void>((resolve) => server.listen(PORT, resolve));
  try {
    const result = await generateVideo({
      input: {topic: 'Binary Search', language: 'English', ageGroup: '13-18'},
      outputDir: VIDEO_DIR,
      audioDir: AUDIO_DIR,
      baseUrl: `http://localhost:${PORT}`,
      jobId: 'e2e-flexible',
      onProgress: (stage, p) => console.log(`  stage ${stage}: ${(p * 100).toFixed(0)}%`),
    });
    console.log(
      `\nDONE → "${result.title}" | ${result.videoUrl} | ${result.duration.toFixed(1)}s | ` +
        (result.plan ? `FLEXIBLE plan (${result.plan.scenes.length} scenes)` : 'legacy lesson'),
    );
    const out = path.join(VIDEO_DIR, 'generated-e2e-flexible.mp4');
    console.log(`output exists: ${existsSync(out)} (${(await stat(out)).size} bytes)`);
  } finally {
    server.close();
  }
}

async function stat(p: string) {
  return (await import('node:fs/promises')).stat(p);
}

main().catch((err) => {
  console.error('E2E FAILED:', err instanceof Error ? err.message : err);
  process.exitCode = 1;
});