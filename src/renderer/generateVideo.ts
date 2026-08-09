/**
 * generateVideo — the single end-to-end entry point for the module.
 *
 *   Lesson request → Groq (or mock when no key) → validated Lesson
 *                → per-scene narration TTS
 *                → Remotion render → MP4 (video + audio)
 *
 * Returns everything the website needs (title, video URL, duration).
 */
import path from 'node:path';
import {mkdir} from 'node:fs/promises';
import {generateLesson} from '../groq/lessonGenerator';
import {buildMockLesson} from '../groq/mockLesson';
import {GroqConfigError} from '../groq/groqClient';
import {generateNarrationAudio} from '../audio/tts';
import type {Lesson, LessonInput} from '../lesson/lessonTypes';
import {renderLessonVideo} from './renderLessonVideo';

export type PipelineStage = 'lesson' | 'tts' | 'render';

export interface GenerateVideoOptions {
  input: LessonInput;
  /** Where final MP4s are saved (output/videos). */
  outputDir: string;
  /** Where narration audio lives (output/audio) — served back to Remotion. */
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
  lesson: Lesson;
}

export async function generateVideo(options: GenerateVideoOptions): Promise<VideoResult> {
  const {input, outputDir, audioDir, baseUrl, jobId, onProgress = () => {}} = options;

  // 1. Lesson generation (Groq; mock fallback only when no API key present).
  onProgress('lesson', 0);
  let lesson: Lesson;
  try {
    lesson = await generateLesson(input);
  } catch (err) {
    if (err instanceof GroqConfigError) {
      console.warn('[pipeline] GROQ_API_KEY not set — using a mock lesson for local testing.');
      lesson = buildMockLesson(input);
    } else {
      throw err;
    }
  }
  onProgress('lesson', 1);

  // 2. TTS — one narration MP3 per scene, in a per-job folder under output/audio.
  //    The audio is served back to Remotion over HTTP (not embedded in the
  //    bundle), so newly generated files are always available at render time.
  onProgress('tts', 0);
  const audioDirPath = path.join(audioDir, jobId);
  await mkdir(audioDirPath, {recursive: true});
  const rawAudio = await generateNarrationAudio(lesson, audioDirPath);
  const audio: Record<number, string> = {};
  for (const [sceneId, fileName] of Object.entries(rawAudio)) {
    audio[Number(sceneId)] = `${baseUrl}/audio/${jobId}/${fileName}`;
  }
  onProgress('tts', 1);

  // 3. Remotion render → MP4 (video + embedded synchronized narration).
  onProgress('render', 0);
  const videoFileName = `generated-${jobId}.mp4`;
  const outputLocation = path.join(outputDir, videoFileName);
  await renderLessonVideo({
    lesson,
    audio,
    outputLocation,
    onProgress: (p) => onProgress('render', p),
  });

  return {
    title: lesson.title,
    videoUrl: `/output/videos/${videoFileName}`,
    duration: lesson.estimatedDuration,
    lesson,
  };
}
