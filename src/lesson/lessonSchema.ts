/**
 * Zod schemas that enforce the STRICT structure of an EduVision lesson.
 *
 * The model output is never trusted: every field is validated here, with
 * sensible coercions (e.g. numeric durations) and cross-field checks
 * (correctAnswer range, scene-id uniqueness, duration consistency).
 */
import {z} from 'zod';
import {
  Lesson,
  LessonInput,
  LessonQuizQuestion,
  LessonScene,
  LessonSource,
  MAX_SCENE_DURATION_SECONDS,
  SCENE_TYPES,
} from './lessonTypes';

/** Validates the user-facing input to the lesson generator. */
export const lessonInputSchema: z.ZodType<LessonInput> = z.object({
  topic: z.string().trim().min(1, 'topic must not be empty'),
  language: z.string().trim().min(1, 'language must not be empty'),
  ageGroup: z.string().trim().min(1).optional(),
});

export const sourceSchema: z.ZodType<LessonSource> = z.object({
  title: z.string().trim().min(1, 'source title must not be empty'),
  url: z
    .union([z.string().url('source url must be a valid URL'), z.literal('')])
    .default(''),
});

export const quizSchema: z.ZodType<LessonQuizQuestion> = z
  .object({
    question: z.string().trim().min(1, 'quiz question must not be empty'),
    options: z
      .array(z.string().trim().min(1))
      .min(2, 'quiz must have at least 2 options'),
    correctAnswer: z.number().int('correctAnswer must be an integer').min(0),
    explanation: z.string().default(''),
  })
  .superRefine((value, ctx) => {
    if (value.correctAnswer >= value.options.length) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `correctAnswer (${value.correctAnswer}) is out of range for ${value.options.length} option(s)`,
        path: ['correctAnswer'],
      });
    }
  });

export const sceneSchema: z.ZodType<LessonScene> = z.object({
  id: z.number().int('scene id must be an integer').positive('scene id must be positive'),
  type: z.enum(SCENE_TYPES, {
    message: `scene type must be one of: ${SCENE_TYPES.join(', ')}`,
  }),
  // coerce lets the model send "8" instead of 8 without silently accepting junk.
  duration: z.coerce
    .number('scene duration must be numeric')
    .positive('scene duration must be greater than 0 seconds')
    .max(
      MAX_SCENE_DURATION_SECONDS,
      `scene duration cannot exceed ${MAX_SCENE_DURATION_SECONDS} seconds`,
    ),
  narration: z.string().trim().min(1, 'scene narration must not be empty'),
  onScreenText: z.array(z.string()).default([]),
  visualDescription: z
    .string()
    .trim()
    .min(1, 'scene visual description must not be empty'),
});

export const lessonSchema: z.ZodType<Lesson> = z
  .object({
    title: z.string().trim().min(1, 'lesson title must not be empty'),
    topic: z.string().trim().min(1, 'lesson topic must not be empty'),
    language: z.string().trim().min(1, 'lesson language must not be empty'),
    ageGroup: z.string().trim().default(''),
    estimatedDuration: z.coerce
      .number('estimatedDuration must be numeric')
      .positive('estimatedDuration must be greater than 0 seconds'),
    learningObjectives: z
      .array(z.string().trim().min(1))
      .min(1, 'at least one learning objective is required'),
    scenes: z.array(sceneSchema).min(1, 'at least one scene is required'),
    quiz: z.array(quizSchema).default([]),
    sources: z.array(sourceSchema).default([]),
  })
  .superRefine((value, ctx) => {
    // Scene ids must be unique (Remotion uses them as scene order).
    const ids = value.scenes.map((s) => s.id);
    if (new Set(ids).size !== ids.length) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'scene ids must be unique',
        path: ['scenes'],
      });
    }
    // NOTE: we deliberately do NOT hard-fail on estimatedDuration vs the sum
    // of scene durations — LLMs are unreliable at summing. The parser instead
    // normalizes estimatedDuration to the true scene sum (see lessonParser).
  });
