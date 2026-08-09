/**
 * Legacy LessonVideo renderer wrapper.
 *
 * Renders the strict `LessonVideo` composition (the fallback engine) via the
 * shared programmatic renderer. The flexible engine renders through the same
 * code path with composition id 'EduVisionVideo'.
 */
import type {Lesson} from '../lesson/lessonTypes';
import {renderComposition} from './renderComposition';

export interface RenderLessonParams {
  lesson: Lesson;
  /** scene id → public/-relative audio path, e.g. "audio/<jobId>/x.mp3". */
  audio: Record<number, string>;
  /** Absolute output file path (must end in .mp4). */
  outputLocation: string;
  /** Called with overall render progress 0 → 1. */
  onProgress?: (progress: number) => void;
}

export async function renderLessonVideo(params: RenderLessonParams): Promise<void> {
  const {lesson, audio, outputLocation, onProgress} = params;

  await renderComposition({
    compositionId: 'LessonVideo',
    inputProps: {lesson, audio},
    outputLocation,
    onProgress,
  });
}
