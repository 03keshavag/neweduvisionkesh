/**
 * Parser that turns raw Groq output into a validated Lesson.
 *
 * Responsibilities:
 *  - Extract JSON from the raw text (strips prose / markdown code fences).
 *  - Validate against `lessonSchema` with strict failure semantics.
 *  - Never silently accept malformed or invalid AI output.
 */
import type {ZodIssue} from 'zod';
import {lessonSchema} from './lessonSchema';
import type {Lesson} from './lessonTypes';

/** Thrown when the model response cannot be parsed as a valid lesson. */
export class LessonParseError extends Error {
  readonly issues: ZodIssue[];

  constructor(message: string, issues: ZodIssue[] = []) {
    super(message);
    this.name = 'LessonParseError';
    this.issues = issues;
  }
}

/**
 * Extract the first JSON object from a model response. Handles the common
 * cases where the model wraps the JSON in markdown code fences or adds prose.
 * Throws a descriptive error if no valid JSON can be found.
 */
export function extractJson(raw: string): unknown {
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fenced ? fenced[1] : raw;

  try {
    return JSON.parse(candidate);
  } catch {
    // Fall back to the first {...} block in the text (robust to leading prose).
    const start = candidate.indexOf('{');
    const end = candidate.lastIndexOf('}');
    if (start !== -1 && end > start) {
      try {
        return JSON.parse(candidate.slice(start, end + 1));
      } catch {
        // fall through to the error below
      }
    }
    throw new Error('Groq response does not contain valid JSON');
  }
}

/** Parse + validate a single string of model output into a Lesson. */
export function parseLessonContent(content: string): Lesson {
  const rawJson = extractJson(content);
  const result = lessonSchema.safeParse(rawJson);

  if (!result.success) {
    throw new LessonParseError(
      'Groq returned a lesson that failed validation',
      result.error.issues,
    );
  }

  const lesson = result.data;

  // Normalize estimatedDuration to the true sum of scene durations so the
  // Remotion composition length always matches actual scene content (LLMs are
  // unreliable at summing; we still validated every other field strictly).
  const sceneSum = lesson.scenes.reduce((acc, s) => acc + s.duration, 0);
  if (Math.abs(sceneSum - lesson.estimatedDuration) > 0.01) {
    lesson.estimatedDuration = sceneSum;
  }

  return lesson;
}

/** Parse + validate raw model output (string or already-parsed object). */
export function parseLesson(raw: unknown): Lesson {
  const content = typeof raw === 'string' ? raw : JSON.stringify(raw);
  return parseLessonContent(content);
}
