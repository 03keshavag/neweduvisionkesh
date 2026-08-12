/**
 * End-to-End Manim Video Generation Pipeline.
 *
 * Architecture:
 *   User Request (topic, language, ageGroup)
 *     ↓
 *   Stage 1: Groq Educational Planner (pedagogical plan & scene narrations)
 *     ↓
 *   TTS Audio Generation & Duration Measurement
 *     ↓
 *   Stage 2: Groq Manim Python Generator (timed to measured narration durations)
 *     ↓
 *   Static Python AST & Timing Validation
 *     ↓
 *   Manim Subprocess Render (isolated execution to MP4)
 *     ↓
 *   Targeted Groq Repair (if runtime render error occurs)
 *     ↓
 *   FFmpeg Audio/Video Mux (pads final frame if needed, attaches audio)
 *     ↓
 *   Final Web-Ready MP4
 */
import path from 'node:path';
import {mkdir} from 'node:fs/promises';
import type {LessonInput} from '../lesson/lessonTypes';
import {generateEducationalPlan} from './planner/manimPlanner';
import {generateManimScript, repairManimScript} from './generator/manimCodeGenerator';
import {getMockManimScript} from './generator/mockManimScript';
import {renderManimScript} from './renderer/manimRenderer';
import {concatenateSceneAudios, muxAudioAndVideo} from './audio/audioMuxer';
import {generateNarrationAudioFromScenes} from '../audio/tts';
import {getMp3DurationSeconds} from '../audio/mp3Duration';
import type {ManimEducationalPlan} from './types';

export interface ManimPipelineOptions {
  input: LessonInput;
  outputDir: string;
  audioDir: string;
  baseUrl: string;
  jobId: string;
  onProgress?: (stage: string, progress: number) => void;
}

export interface ManimPipelineResult {
  title: string;
  videoUrl: string;
  duration: number;
  scriptCode: string;
  plan: ManimEducationalPlan;
  generationSource: 'groq' | 'fallback';
  isFallback: boolean;
  statusMessage: string;
}

export async function runManimPipeline(options: ManimPipelineOptions): Promise<ManimPipelineResult> {
  const {input, outputDir, audioDir, jobId, onProgress = () => {}} = options;

  // 1. Stage 1: Groq Educational Planner
  onProgress('plan', 0);
  console.log(`[manimPipeline] Stage 1: Planning lesson for topic "${input.topic}"...`);
  const plan = await generateEducationalPlan(input);
  onProgress('plan', 1);

  // 2. TTS Generation & Audio Duration Measurement
  onProgress('tts', 0);
  console.log(`[manimPipeline] Generating TTS narration audio for ${plan.scenes.length} scenes...`);
  const audioJobDir = path.join(audioDir, jobId);
  await mkdir(audioJobDir, {recursive: true});

  // Map Manim scenes to TTS format
  const ttsScenes = plan.scenes.map((s) => ({
    id: s.id,
    narration: s.narration,
    duration: s.estimatedDuration,
  }));

  const rawAudio = await generateNarrationAudioFromScenes(ttsScenes, plan.language, audioJobDir);

  const sceneAudioFiles: string[] = [];
  const measuredDurations: Record<string, number> = {};

  for (const scene of plan.scenes) {
    const fileName = rawAudio[scene.id];
    if (fileName) {
      const fullAudioPath = path.join(audioJobDir, fileName);
      sceneAudioFiles.push(fullAudioPath);
      try {
        const measured = await getMp3DurationSeconds(fullAudioPath);
        measuredDurations[scene.id] = measured;
      } catch {
        measuredDurations[scene.id] = scene.estimatedDuration || 10;
      }
    } else {
      measuredDurations[scene.id] = scene.estimatedDuration || 10;
    }
  }

  // Concatenate all scene audio files into one narration track
  const masterAudioPath = path.join(audioJobDir, `master_narration_${jobId}.mp3`);
  await concatenateSceneAudios(sceneAudioFiles, masterAudioPath);
  onProgress('tts', 1);

  // 3. Stage 2: Groq Manim Python Code Generator
  onProgress('manim-script', 0);
  console.log(`[manimPipeline] Stage 2: Generating Python Manim script...`);
  const scriptResult = await generateManimScript(plan, measuredDurations);
  onProgress('manim-script', 1);

  // 4. Manim CLI Subprocess Render with targeted error repair
  onProgress('manim-render', 0);
  console.log(`[manimPipeline] Rendering Manim video...`);
  let renderResult;
  let activeCode = scriptResult.code;
  let activeClassName = scriptResult.sceneClassName;
  let generationSource: 'groq' | 'fallback' = scriptResult.generationSource || 'groq';
  let isFallback = scriptResult.isFallback ?? false;
  let statusMessage = isFallback
    ? 'Generated using fallback demonstration.'
    : 'Topic-specific Manim generation succeeded.';

  try {
    renderResult = await renderManimScript(
      activeCode,
      {
        scriptPath: '',
        sceneClassName: activeClassName,
        outputDir,
        jobId,
        quality: 'm', // -qm for fast and high quality 720p 30fps / 1080p
      },
      (p) => onProgress('manim-render', p * 0.8),
    );
  } catch (renderErr: unknown) {
    const errorMsg = renderErr instanceof Error ? renderErr.message : String(renderErr);
    console.warn(`[manimPipeline] Initial render failed. Attempting targeted Groq repair...`);
    try {
      const repaired = await repairManimScript(activeCode, errorMsg, plan);
      activeCode = repaired.code;
      activeClassName = repaired.sceneClassName;
      generationSource = repaired.generationSource || 'groq';
      isFallback = repaired.isFallback ?? false;
      statusMessage = isFallback
        ? 'Generated using fallback demonstration.'
        : 'Topic-specific Manim generation succeeded after targeted repair.';

      renderResult = await renderManimScript(
        activeCode,
        {
          scriptPath: '',
          sceneClassName: activeClassName,
          outputDir,
          jobId,
          quality: 'm',
        },
        (p) => onProgress('manim-render', 0.8 + p * 0.2),
      );
    } catch (repairErr: unknown) {
      console.warn(`[manimPipeline] Topic-specific Manim generation failed (${repairErr}). Generated using fallback demonstration for: ${plan.topic}`);
      generationSource = 'fallback';
      isFallback = true;
      statusMessage = 'Generated using fallback demonstration.';

      activeCode = getMockManimScript(plan.topic);
      activeClassName = 'AutoTeach';
      renderResult = await renderManimScript(
        activeCode,
        {
          scriptPath: '',
          sceneClassName: activeClassName,
          outputDir,
          jobId,
          quality: 'm',
        },
        (p) => onProgress('manim-render', 0.9 + p * 0.1),
      );
    }
  }
  onProgress('manim-render', 1);

  // 5. FFmpeg Audio/Video Mux
  onProgress('mux', 0);
  console.log(`[manimPipeline] Muxing Manim video + TTS narration with FFmpeg...`);
  const finalVideoFileName = `generated-${jobId}.mp4`;
  const finalVideoPath = path.join(outputDir, finalVideoFileName);

  const muxResult = await muxAudioAndVideo({
    videoPath: renderResult.videoPath,
    audioPath: masterAudioPath,
    outputPath: finalVideoPath,
  });
  onProgress('mux', 1);

  console.log(`\n[manimPipeline] ${statusMessage.toUpperCase()}: Produced ${finalVideoFileName} (${muxResult.duration.toFixed(1)}s, source=${generationSource})\n`);

  return {
    title: plan.title,
    videoUrl: `/output/videos/${finalVideoFileName}`,
    duration: muxResult.duration,
    scriptCode: activeCode,
    plan,
    generationSource,
    isFallback,
    statusMessage,
  };
}
