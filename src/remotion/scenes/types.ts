/**
 * Shared props handed to every scene component, plus the global transition
 * length used by LessonVideo to cross-fade between scenes.
 */
import type {LessonScene} from '../../lesson/lessonTypes';

export interface SceneProps {
  /** The validated scene data driving this component (never hardcoded). */
  scene: LessonScene;
  /** Zero-based position of this scene within the lesson. */
  index: number;
  /** Total number of scenes in the lesson. */
  total: number;
}

/** Extra frames appended to a scene so the next scene fades in over it. */
export const TRANSITION_FRAMES = 14;
