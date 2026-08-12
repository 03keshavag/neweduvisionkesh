/**
 * generateVideo — the single end-to-end entry point for EduVision.
 *
 * Primary Visual Engine: Manim Community Edition (v0.19+)
 * Architecture:
 *   User Request (topic, language, ageGroup)
 *     ↓
 *   Stage 1: Groq Educational Planner (pedagogical plan & scene narrations)
 *     ↓
 *   TTS Audio Generation & Duration Measurement
 *     ↓
 *   Stage 2: Groq Manim Python Code Generator (timed to measured narration)
 *     ↓
 *   Manim Subprocess Render
 *     ↓
 *   FFmpeg Audio/Video Mux
 *     ↓
 *   Final Web-Ready MP4
 */
import type {LessonInput} from '../lesson/lessonTypes';
import {runManimPipeline} from '../manim/pipeline';

export type PipelineStage = 'plan' | 'lesson' | 'tts' | 'manim-script' | 'manim-render' | 'render' | 'mux';

export interface GenerateVideoOptions {
  input: LessonInput;
  /** Where final MP4s are saved (output/videos). */
  outputDir: string;
  /** Where narration audio lives (output/audio). */
  audioDir: string;
  /** Public origin (e.g. http://localhost:4000) used to build audio URLs. */
  baseUrl: string;
  /** Unique job identifier used for file names. */
  jobId: string;
  /** Optional progress callback: stage + per-stage progress 0→1. */
  onProgress?: (stage: PipelineStage, progress: number) => void;
}

export interface VideoResult {
  title: string;
  videoUrl: string;
  duration: number;
  generationSource?: 'groq' | 'fallback';
  isFallback?: boolean;
  statusMessage?: string;
}

export async function generateVideo(options: GenerateVideoOptions): Promise<VideoResult> {
  const {input, outputDir, audioDir, baseUrl, jobId, onProgress = () => {}} = options;

  console.log(`[generateVideo] Starting Manim generation for: "${input.topic}" (${input.language})`);

  // Execute primary Manim pipeline
  const result = await runManimPipeline({
    input,
    outputDir,
    audioDir,
    baseUrl,
    jobId,
    onProgress: (stage, progress) => {
      onProgress(stage as PipelineStage, progress);
    },
  });

  return {
    title: result.title,
    videoUrl: result.videoUrl,
    duration: result.duration,
    generationSource: result.generationSource,
    isFallback: result.isFallback,
    statusMessage: result.statusMessage,
  };
}
