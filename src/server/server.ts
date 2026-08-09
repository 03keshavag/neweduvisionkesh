/**
 * EduVision video-generation server.
 *
 * Serves the vanilla website, exposes the generation API, and serves the
 * produced MP4s. The browser talks ONLY to this server — the Groq API key
 * never leaves the server.
 *
 * Endpoints:
 *   POST /api/generate        {topic, language, ageGroup} → {jobId}
 *   GET  /api/jobs/:id         → {status, stage, progress, result?, error?}
 *
 * Generation runs asynchronously; the website polls the job status for live
 * progress. Run with: npm run serve
 */
import express from 'express';
import path from 'node:path';
import {randomUUID} from 'node:crypto';
import {generateVideo, type PipelineStage} from '../renderer/generateVideo';
import type {LessonInput} from '../lesson/lessonTypes';

const ROOT = process.cwd();
// NOTE: avoid 3000 — Remotion's renderer uses it as its default port to serve
// the bundle; keeping this server elsewhere prevents a port collision.
const PORT = Number(process.env.PORT ?? 4000);
const OUTPUT_DIR = path.join(ROOT, 'output', 'videos');
const AUDIO_DIR = path.join(ROOT, 'output', 'audio');
const PUBLIC_DIR = path.join(ROOT, 'public');
const BASE_URL = `http://localhost:${PORT}`;

interface GenerateRequest {
  topic?: string;
  language?: string;
  ageGroup?: string;
}

interface Job {
  id: string;
  input: GenerateRequest;
  status: 'queued' | 'working' | 'done' | 'error';
  stage: PipelineStage | null;
  stageProgress: number;
  title?: string;
  videoUrl?: string;
  duration?: number;
  error?: string;
  createdAt: number;
}

const jobs = new Map<string, Job>();

function humanReadableError(err: unknown): string {
  const message = err instanceof Error ? err.message : String(err);
  // Strip verbose internal prefixes for a friendlier message.
  return message.replace(/^Error:\s*/i, '');
}

async function runJob(job: Job): Promise<void> {
  try {
    job.status = 'working';
    // topic/language are guaranteed by the request handler (non-empty).
    const input: LessonInput = {
      topic: job.input.topic ?? '',
      language: job.input.language ?? '',
      ageGroup: job.input.ageGroup || undefined,
    };
    const {lesson} = await generateVideo({
      input,
      outputDir: OUTPUT_DIR,
      audioDir: AUDIO_DIR,
      baseUrl: BASE_URL,
      jobId: job.id,
      onProgress: (stage, progress) => {
        job.stage = stage;
        job.stageProgress = progress;
      },
    });
    job.status = 'done';
    job.stage = null;
    job.title = lesson.title;
    job.videoUrl = `/output/videos/generated-${job.id}.mp4`;
    job.duration = lesson.estimatedDuration;
  } catch (err) {
    job.status = 'error';
    job.stage = null;
    job.error = humanReadableError(err);
    console.error(`[server] Job ${job.id} failed:`, err);
  }
}

const app = express();
app.use(express.json());

app.post('/api/generate', (req, res) => {
  const body = (req.body ?? {}) as GenerateRequest;
  const topic = (body.topic ?? '').trim();
  const language = (body.language ?? '').trim();

  if (!topic) {
    res.status(400).json({
      success: false,
      error: 'Topic is required — please enter what you want to learn about.',
    });
    return;
  }
  if (!language) {
    res.status(400).json({
      success: false,
      error: 'Language is required.',
    });
    return;
  }

  const id = randomUUID();
  const job: Job = {
    id,
    input: {topic, language, ageGroup: (body.ageGroup ?? '').trim()},
    status: 'queued',
    stage: null,
    stageProgress: 0,
    createdAt: Date.now(),
  };
  jobs.set(id, job);

  // Fire-and-forget; the client polls the job status.
  runJob(job).catch(() => {
    /* errors already captured on the job */
  });

  res.status(202).json({success: true, jobId: id});
});

app.get('/api/jobs/:id', (req, res) => {
  const job = jobs.get(req.params.id);
  if (!job) {
    res.status(404).json({success: false, error: 'Job not found.'});
    return;
  }
  res.json({
    success: job.status !== 'error',
    status: job.status,
    stage: job.stage,
    stageProgress: job.stageProgress,
    title: job.title,
    videoUrl: job.videoUrl,
    duration: job.duration,
    error: job.error ?? undefined,
  });
});

// Static website (index.html + CSS/JS + images).
app.use(express.static(PUBLIC_DIR));
// Generated narration audio (served to Remotion during rendering).
app.use('/audio', express.static(AUDIO_DIR));
// Generated videos.
app.use('/output/videos', express.static(OUTPUT_DIR));

app.listen(PORT, () => {
  console.log(`\n  EduVision video generator running`);
  console.log(`  ▶ Open: http://localhost:${PORT}\n`);
});
