import type {AnimationPlan, AnimationScene, MasterTimeline, TimelineSceneEntry} from '../types';
import {DEFAULT_TRANSITION_FRAMES} from '../transitions';

/** Standard safety margin (seconds) added after narration to prevent any tail truncation. */
export const AUDIO_SAFETY_MARGIN_SECONDS = 0.35;

/** Convert seconds to frames with stable rounding. */
export function secondsToFrames(seconds: number, fps: number): number {
  return Math.max(1, Math.round(seconds * fps));
}

/** Convert frames to seconds. */
export function framesToSeconds(frames: number, fps: number): number {
  return frames / fps;
}

export interface AudioDurationMap {
  [sceneId: string]: number;
}

/**
 * Build a master timeline from measured audio durations.
 * Scene visual duration guarantees that the complete narration is audible with
 * zero clipping, clean visual transitions, and no speech overlap between scenes.
 */
export function buildMasterTimeline(
  plan: AnimationPlan,
  audioDurations: AudioDurationMap,
  audioUrls: Record<string, string>,
  fps: number,
  safetyMarginSeconds = AUDIO_SAFETY_MARGIN_SECONDS,
): MasterTimeline {
  const scenes: TimelineSceneEntry[] = [];
  const marginFrames = Math.max(2, Math.round(safetyMarginSeconds * fps));
  let cursorVisualFrame = 0;
  let cursorAudioFrame = 0;

  for (let i = 0; i < plan.scenes.length; i++) {
    const scene = plan.scenes[i];
    const isLast = i === plan.scenes.length - 1;
    const transitionFrames = scene.transition?.duration
      ? Math.round(scene.transition.duration * fps)
      : DEFAULT_TRANSITION_FRAMES;

    const rawAudioSec = audioDurations[scene.id] ?? scene.duration;
    const audioFrames = secondsToFrames(rawAudioSec, fps);

    // Audio starts cleanly after the previous scene's audio finishes
    const audioStartFrame = Math.max(cursorVisualFrame, cursorAudioFrame);
    const audioEndFrame = audioStartFrame + audioFrames;

    // Visual sequence begins at cursorVisualFrame and extends long enough for:
    // 1. Full audio duration
    // 2. Safety margin
    // 3. Visual transition overlap to next scene (if not last)
    const visualStartFrame = cursorVisualFrame;
    const minRequiredFrames = (audioEndFrame - visualStartFrame) + marginFrames + (isLast ? 0 : transitionFrames);
    const estimatedFrames = secondsToFrames(scene.duration, fps);
    const durationFrames = Math.max(minRequiredFrames, estimatedFrames);
    const visualEndFrame = visualStartFrame + durationFrames;

    const durationSeconds = framesToSeconds(durationFrames, fps);

    scenes.push({
      sceneId: scene.id,
      startFrame: visualStartFrame,
      endFrame: visualEndFrame,
      durationFrames,
      audioStartFrame,
      audioEndFrame,
      audioUrl: audioUrls[scene.id],
      durationSeconds,
    });

    // Advance cursors for the next scene:
    // Next scene visual starts during the current scene's transition tail
    cursorVisualFrame = visualEndFrame - (isLast ? 0 : transitionFrames);
    // Next scene audio starts after current audio ends + safety margin
    cursorAudioFrame = audioEndFrame + marginFrames;
  }

  const last = scenes[scenes.length - 1];
  const totalFrames = last ? Math.max(last.endFrame, last.audioEndFrame + marginFrames) : 1;

  return {
    fps,
    totalFrames,
    totalSeconds: framesToSeconds(totalFrames, fps),
    scenes,
  };
}

/**
 * Validate that every scene's timeline allocation accommodates its audio duration.
 * Returns an error list if any scene audio would be clipped.
 */
export function validateTimelineSync(
  timeline: MasterTimeline,
  audioDurations: AudioDurationMap,
): {valid: boolean; errors: string[]} {
  const errors: string[] = [];

  for (const entry of timeline.scenes) {
    const rawAudio = audioDurations[entry.sceneId];
    if (rawAudio !== undefined) {
      const audioFrames = Math.round(rawAudio * timeline.fps);
      const allocatedAudioFrames = entry.audioEndFrame - entry.audioStartFrame;
      if (allocatedAudioFrames < audioFrames) {
        errors.push(
          `Scene "${entry.sceneId}": allocated audio frames (${allocatedAudioFrames}) < required audio frames (${audioFrames})`,
        );
      }
      if (entry.audioEndFrame > timeline.totalFrames) {
        errors.push(
          `Scene "${entry.sceneId}": audio end frame (${entry.audioEndFrame}) exceeds composition total frames (${timeline.totalFrames})`,
        );
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/** Apply audio-driven durations back onto the animation plan scenes. */
export function syncPlanToTimeline(
  plan: AnimationPlan,
  timeline: MasterTimeline,
): AnimationPlan {
  const durationByScene = new Map(timeline.scenes.map((s) => [s.sceneId, s.durationSeconds]));
  return {
    ...plan,
    totalDuration: timeline.totalSeconds,
    scenes: plan.scenes.map((scene) => ({
      ...scene,
      duration: durationByScene.get(scene.id) ?? scene.duration,
    })),
  };
}

/** Get scene-local frame from global composition frame. */
export function getSceneLocalFrame(globalFrame: number, entry: TimelineSceneEntry): number {
  return globalFrame - entry.startFrame;
}

/**
 * Scale animation start times and durations when scene duration changes from estimate to actual.
 * Spreads animations evenly across the actual narration time while keeping entrance transitions
 * crisp and preserving final educational states until the scene completes.
 */
export function scaleSceneAnimations(
  scene: AnimationScene,
  estimatedDuration: number,
  actualDuration: number,
): AnimationScene {
  if (estimatedDuration <= 0 || Math.abs(estimatedDuration - actualDuration) < 0.05) {
    return {...scene, duration: actualDuration};
  }

  const scale = actualDuration / estimatedDuration;
  const maxActionEndTime = Math.max(0.5, actualDuration - 0.3);

  return {
    ...scene,
    duration: actualDuration,
    animations: scene.animations.map((a) => {
      // Scale start time so actions trigger proportionally through the narration
      const scaledStart = a.startTime * scale;
      // Keep entrance animations snappy (don't stretch a 0.5s fade into 3 seconds)
      const isEntrance = a.type === 'create' || a.type === 'show' || a.type === 'fadeIn';
      let scaledDuration = a.duration;
      if (isEntrance) {
        scaledDuration = Math.min(Math.max(a.duration, 0.3), 1.0);
      } else {
        scaledDuration = a.duration * (scale > 1 ? Math.min(scale, 1.4) : scale);
      }

      // Clamp so animation does not spill outside the scene
      const clampedStart = Math.min(scaledStart, Math.max(0, maxActionEndTime - 0.2));
      const clampedDuration = Math.max(0.1, Math.min(scaledDuration, actualDuration - clampedStart));

      return {
        ...a,
        startTime: clampedStart,
        duration: clampedDuration,
      };
    }),
  };
}
