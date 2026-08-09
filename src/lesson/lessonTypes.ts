/**
 * Domain types for a validated EduVision lesson.
 *
 * These are the canonical shapes that the rest of the pipeline consumes:
 * lesson processing → TTS/narration → Remotion scene rendering.
 *
 * A `Lesson` is the STRICT, validated form of the model output — it is never
 * trusted until it passes `lessonSchema`.
 */

/** Input accepted by the lesson generator. */
export interface LessonInput {
  /** The subject to teach, e.g. "Mysuru Dasara". */
  topic: string;
  /** The language of narration / on-screen content, e.g. "Kannada". */
  language: string;
  /** Optional target age band, e.g. "13-18". */
  ageGroup?: string;
}

/** Semantic roles a scene can play. Drives the visual template in Remotion. */
export const SCENE_TYPES = [
  'intro',
  'content',
  'example',
  'activity',
  'conclusion',
  'summary',
] as const;

export type SceneType = (typeof SCENE_TYPES)[number];

/** A single visual/narration chunk of the animated educational video. */
export interface LessonScene {
  /** Unique, sequential positive scene id within the lesson. */
  id: number;
  /** Semantic role of the scene (selects the Remotion visual template). */
  type: SceneType;
  /** Scene length in seconds (> 0 and <= MAX_SCENE_DURATION_SECONDS). */
  duration: number;
  /** Fully-written spoken narration — the TTS source for this scene. */
  narration: string;
  /** Short lines shown on screen during the scene. May be empty. */
  onScreenText: string[];
  /** Prompt describing visuals/animation for this scene (not spoken). */
  visualDescription: string;
}

/** A quiz question with a single correct option (by `options` index). */
export interface LessonQuizQuestion {
  question: string;
  options: string[];
  /** Index into `options` of the correct answer (0-based). */
  correctAnswer: number;
  explanation: string;
}

/** A verifiable reference. `url` may be empty when only a title is known. */
export interface LessonSource {
  title: string;
  url: string;
}

/**
 * The complete validated educational lesson, ready to be consumed by
 * the lesson processing / Remotion stages.
 */
export interface Lesson {
  /** Human-friendly title. */
  title: string;
  /** Echoes the requested topic. */
  topic: string;
  /** The language the lesson is written in. */
  language: string;
  /** Target age band (defaults to '' when the AI omits it). */
  ageGroup: string;
  /** Total duration in seconds (should equal the sum of scene durations). */
  estimatedDuration: number;
  learningObjectives: string[];
  scenes: LessonScene[];
  quiz: LessonQuizQuestion[];
  sources: LessonSource[];
}

/** Upper bound (seconds) for a single scene, keeps durations sane for Remotion. */
export const MAX_SCENE_DURATION_SECONDS = 120;

/**
 * Languages this module currently supports for content generation.
 * Requests for anything else are rejected up-front with a clear error
 * instead of silently returning content in the wrong language.
 */
export const SUPPORTED_LANGUAGES: readonly string[] = [
  'English',
  'Kannada',
  'Hindi',
  'Tamil',
  'Telugu',
  'Malayalam',
  'Bengali',
  'Marathi',
  'Gujarati',
  'Punjabi',
];

/** Case-insensitive check against the supported language list. */
export function isSupportedLanguage(language: string): boolean {
  const needle = language.trim().toLowerCase();
  return SUPPORTED_LANGUAGES.some((l) => l.toLowerCase() === needle);
}
