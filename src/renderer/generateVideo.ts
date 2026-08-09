/**
 * generateVideo — the single end-to-end entry point.
 *
 *   Lesson request → Groq AnimationPlan (or mock when no key) → validated plan
 *                → per-scene narration TTS → audio-duration synced timeline
 *                → Remotion render (flexible EduVisionVideo engine) → MP4
 *
 * If flexible plan generation fails (invalid model output), it falls back to
 * the legacy strict-lesson engine so a video is still produced.
 *
 * Returns everything the website needs (title, video URL, duration).
 */
import path from 'node:path';
import {mkdir} from 'node:fs/promises';
import {generateLesson} from '../groq/lessonGenerator';
import {generateAnimationPlan} from '../groq/planGenerator';
import {buildMockLesson} from '../groq/mockLesson';
import {buildMockPlan} from '../groq/mockPlan';
import {GroqConfigError} from '../groq/groqClient';
import {UnsupportedLanguageError} from '../groq/lessonGenerator';
import {enrichPlan} from '../engine/plans/enrichPlan';
import {generateNarrationAudio, generateNarrationAudioFromScenes} from '../audio/tts';
import {getMp3DurationSeconds} from '../audio/mp3Duration';
import {buildMasterTimeline, scaleSceneAnimations, validateTimelineSync} from '../engine/timeline';
import type {AnimationPlan, MasterTimeline} from '../engine/types';
import type {Lesson, LessonInput} from '../lesson/lessonTypes';
import {renderComposition} from './renderComposition';
import {renderLessonVideo} from './renderLessonVideo';

export type PipelineStage = 'plan' | 'lesson' | 'tts' | 'render';

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
  lesson?: Lesson;
  plan?: AnimationPlan;
}

export async function generateVideo(options: GenerateVideoOptions): Promise<VideoResult> {
  const {input, outputDir, audioDir, baseUrl, jobId, onProgress = () => {}} = options;

  // 1. Content generation — flexible AnimationPlan first, legacy Lesson fallback.
  let plan: AnimationPlan | null = null;
  let lesson: Lesson | null = null;

  onProgress('plan', 0);
  try {
    plan = await generateAnimationPlan(input);
  } catch (err) {
    if (err instanceof GroqConfigError) {
      console.warn('[pipeline] GROQ_API_KEY not set — using a mock plan for local testing.');
      plan = buildMockPlan(input);
    } else if (err instanceof UnsupportedLanguageError) {
      throw err;
    } else {
      console.warn(
        `[pipeline] Animation-plan generation failed (${
          err instanceof Error ? err.message : String(err)
        }); falling back to legacy lesson engine.`,
      );
      try {
        lesson = await generateLesson(input);
      } catch (err2) {
        if (err2 instanceof GroqConfigError) {
          console.warn('[pipeline] GROQ_API_KEY not set — using a mock lesson for local testing.');
          lesson = buildMockLesson(input);
        } else {
          throw err2;
        }
      }
    }
  }
  onProgress('plan', 1);

  // 1b. Guarantee a rich visual baseline regardless of the model's output:
  //     section labels, decorative shapes, entrance anims for every element.
  if (plan) {
    plan = enrichPlan(plan);
  }

  // 2. TTS — one narration MP3 per scene, in a per-job folder under output/audio.
  onProgress('tts', 0);
  const audioDirPath = path.join(audioDir, jobId);
  await mkdir(audioDirPath, {recursive: true});

  if (plan) {
    const rawAudio = await generateNarrationAudioFromScenes(plan.scenes, plan.language, audioDirPath);
    const audio: Record<string, string> = {};
    for (const [id, fileName] of Object.entries(rawAudio)) {
      audio[id] = `${baseUrl}/audio/${jobId}/${fileName}`;
    }
    onProgress('tts', 1);

    // 3. Audio-sync: measure each MP3, build the master timeline, and scale
    //    scene animation timings to match the real narration length.
    //    Video length is FLEXIBLE — it follows the topic: the timeline is driven
    //    by measured narration audio with AUDIO_SAFETY_MARGIN_SECONDS safety margin.
    onProgress('render', 0);
    const fps = plan.fps || 30;
    const rawAudioDurations: Record<string, number> = {};
    const durationByScene = new Map(plan.scenes.map((s) => [s.id, s.duration]));

    for (const [id, fileName] of Object.entries(rawAudio)) {
      try {
        const measured = await getMp3DurationSeconds(path.join(audioDirPath, fileName));
        rawAudioDurations[id] = measured;
      } catch (err) {
        const fallback = (durationByScene.get(id) ?? 8);
        rawAudioDurations[id] = fallback;
        console.warn(`[pipeline] could not measure audio for scene "${id}" (${err}) — using estimate ${fallback}s.`);
      }
    }

    const timeline: MasterTimeline = buildMasterTimeline(plan, rawAudioDurations, audio, fps);

    // Diagnostics & Validation: print per-scene [SYNC] tracing
    console.log('\n--- [AUDIO/VISUAL SYNC DIAGNOSTICS] ---');
    for (const entry of timeline.scenes) {
      const estimated = durationByScene.get(entry.sceneId) ?? 0;
      const audioSec = rawAudioDurations[entry.sceneId] ?? estimated;
      const marginSec = (entry.durationFrames - (entry.audioEndFrame - entry.audioStartFrame)) / fps;
      console.log(
        `[SYNC] scene=${entry.sceneId} estimated=${estimated.toFixed(2)}s audio=${audioSec.toFixed(2)}s ` +
        `margin=${marginSec.toFixed(2)}s final=${entry.durationSeconds.toFixed(2)}s ` +
        `start=${entry.startFrame} end=${entry.endFrame} audioStart=${entry.audioStartFrame} audioEnd=${entry.audioEndFrame}`,
      );
    }
    console.log(`[SYNC] totalDuration=${timeline.totalSeconds.toFixed(2)}s totalFrames=${timeline.totalFrames}\n`);

    // Validate sync: assert audioDuration <= visualDuration for every scene
    const validation = validateTimelineSync(timeline, rawAudioDurations);
    if (!validation.valid) {
      console.error('[SYNC WARNING/ERROR] Audio sync validation failed:', validation.errors);
    }

    const syncedPlan: AnimationPlan = {
      ...plan,
      totalDuration: timeline.totalSeconds,
      scenes: plan.scenes.map((scene, i) =>
        scaleSceneAnimations(scene, scene.duration, timeline.scenes[i]?.durationSeconds ?? scene.duration),
      ),
    };

    const videoFileName = `generated-${jobId}.mp4`;
    const outputLocation = path.join(outputDir, videoFileName);
    await renderComposition({
      compositionId: 'EduVisionVideo',
      inputProps: {plan: syncedPlan, timeline, audio},
      outputLocation,
      onProgress: (p) => onProgress('render', p),
    });

    return {
      title: plan.title,
      videoUrl: `/output/videos/${videoFileName}`,
      duration: timeline.totalSeconds,
      plan: syncedPlan,
    };
  }

  // Legacy fallback path (strict lesson engine).
  const finalLesson = lesson as Lesson;
  const rawAudio = await generateNarrationAudio(finalLesson, audioDirPath);
  const audio: Record<number, string> = {};
  for (const [sceneId, fileName] of Object.entries(rawAudio)) {
    audio[Number(sceneId)] = `${baseUrl}/audio/${jobId}/${fileName}`;
  }
  onProgress('tts', 1);

  onProgress('render', 0);
  const videoFileName = `generated-${jobId}.mp4`;
  const outputLocation = path.join(outputDir, videoFileName);
  await renderLessonVideo({
    lesson: finalLesson,
    audio,
    outputLocation,
    onProgress: (p) => onProgress('render', p),
  });

  return {
    title: finalLesson.title,
    videoUrl: `/output/videos/${videoFileName}`,
    duration: finalLesson.estimatedDuration,
    lesson: finalLesson,
  };
}
