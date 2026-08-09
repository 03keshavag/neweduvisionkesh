/**
 * LessonVideo — the re-usable, data-driven Remotion composition.
 *
 * It renders ANY validated `Lesson` (Mysuru Dasara in Kannada, Indian
 * Constitution in Hindi, Silk Road in English, …) without any code change:
 * scene order, durations and content all come from the Lesson JSON.
 *
 * Layout:
 *   Background (persists for the whole video)
 *   └── one <Sequence> per lesson scene (durations converted from seconds→frames)
 *         └── the scene component selected by the scene registry
 *   ProgressBar (persists, spans the full video)
 *
 * A short overlap is added between adjacent scenes so the incoming scene
 * fades in over the outgoing one (smooth cross-fade).
 */
import React from 'react';
import {
  AbsoluteFill,
  Audio as RemotionAudio,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import type {Lesson, LessonScene} from '../lesson/lessonTypes';
import {Background} from './components/Background';
import {ProgressBar} from './components/ProgressBar';
import {sceneForType} from './sceneRegistry';
import {TRANSITION_FRAMES} from './scenes/types';
import {VIDEO} from './theme';

interface LessonVideoProps {
  lesson: Lesson;
  /** Optional map of scene id → narration audio file (under public/audio). */
  audio?: Record<number, string>;
}

/** Scoped narration <Audio> for one scene (played inside its <Sequence>). */
const SceneAudio: React.FC<{scene: LessonScene; audio?: Record<number, string>}> = ({
  scene,
  audio,
}) => {
  const url = audio?.[scene.id];
  if (!url) {
    return null;
  }
  // `url` is an absolute, server-hosted audio URL (e.g. http://localhost:4000/audio/…).
  // Remotion downloads it live at render time, so per-job audio files always
  // resolve even when the bundle itself is cached.
  return <RemotionAudio src={url} />;
};

export const LessonVideo: React.FC<LessonVideoProps> = ({lesson, audio}) => {
  const {fps, durationInFrames} = useVideoConfig();
  const frame = useCurrentFrame();

  // Build one Sequence per scene, converting per-scene seconds to frames.
  let cursor = 0;
  const scenes = lesson.scenes.map((scene) => {
    const duration = Math.max(1, Math.round(scene.duration * fps));
    const from = cursor;
    cursor = from + duration;
    return {scene, from, duration};
  });

  const sequences = scenes.map(({scene, from, duration}, index) => {
    const Component = sceneForType(scene.type);
    const isLast = index === scenes.length - 1;
    // Extend the tail by TRANSITION_FRAMES (except the last scene) so the
    // next scene's fade-in overlaps this one for a smooth cross-fade.
    const effectiveDuration = duration + (isLast ? 0 : TRANSITION_FRAMES);

    return (
      <Sequence key={scene.id} from={from} durationInFrames={effectiveDuration}>
        <Component scene={scene} index={index} total={scenes.length} />
        <SceneAudio scene={scene} audio={audio} />
      </Sequence>
    );
  });

  const progress = durationInFrames > 0 ? frame / durationInFrames : 0;

  return (
    <AbsoluteFill style={{backgroundColor: '#000000'}}>
      <Background />
      {sequences}
      <ProgressBar progress={progress} />
    </AbsoluteFill>
  );
};

// Re-export the shared dimension constant for registered compositions.
export const LESSON_VIDEO_CONFIG = {
  width: VIDEO.width,
  height: VIDEO.height,
  fps: VIDEO.fps,
} as const;

