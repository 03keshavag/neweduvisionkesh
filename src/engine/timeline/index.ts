import type {AnimationPlan, AnimationScene, MasterTimeline, TimelineSceneEntry} from '../types';
import {DEFAULT_TRANSITION_FRAMES} from '../transitions';

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
 * Scene visual duration matches audio duration exactly — no gaps.
 */
export function buildMasterTimeline(
  plan: AnimationPlan,
  audioDurations: AudioDurationMap,
  audioUrls: Record<string, string>,
  fps: number,
): MasterTimeline {
  const scenes: TimelineSceneEntry[] = [];
  let cursorFrame = 0;

  for (const scene of plan.scenes) {
    const durationSeconds = audioDurations[scene.id] ?? scene.duration;
    const durationFrames = secondsToFrames(durationSeconds, fps);
    const startFrame = cursorFrame;
    const endFrame = startFrame + durationFrames;

    scenes.push({
      sceneId: scene.id,
      startFrame,
      endFrame,
      durationFrames,
      audioStartFrame: startFrame,
      audioEndFrame: endFrame,
      audioUrl: audioUrls[scene.id],
      durationSeconds,
    });

    const isLast = scene === plan.scenes[plan.scenes.length - 1];
    cursorFrame = endFrame - (isLast ? 0 : DEFAULT_TRANSITION_FRAMES);
  }

  const last = scenes[scenes.length - 1];
  const totalFrames = last ? last.endFrame : 1;

  return {
    fps,
    totalFrames,
    totalSeconds: framesToSeconds(totalFrames, fps),
    scenes,
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

/** Scale animation start times when scene duration changes from estimate to actual. */
export function scaleSceneAnimations(
  scene: AnimationScene,
  estimatedDuration: number,
  actualDuration: number,
): AnimationScene {
  if (estimatedDuration <= 0 || Math.abs(estimatedDuration - actualDuration) < 0.1) {
    return scene;
  }
  const scale = actualDuration / estimatedDuration;
  return {
    ...scene,
    duration: actualDuration,
    animations: scene.animations.map((a) => ({
      ...a,
      startTime: a.startTime * scale,
      duration: a.duration * scale,
    })),
  };
}
