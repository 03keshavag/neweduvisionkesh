/**
 * Lesson generator — orchestrates the full pipeline:
 *
 *   Topic + language → Groq → structured JSON → validated Lesson
 *
 * The raw model output is always passed through `parseLessonContent` so that
 * only a STRICT, validated Lesson ever leaves this module. Invalid output is
 * rejected with a descriptive error — never silently accepted.
 */
import {lessonInputSchema} from '../lesson/lessonSchema';
import {parseLessonContent, LessonParseError} from '../lesson/lessonParser';
import {
  isSupportedLanguage,
  Lesson,
  LessonInput,
  SUPPORTED_LANGUAGES,
} from '../lesson/lessonTypes';
import {getGroqClient, getGroqModel} from './groqClient';
import {buildUserPrompt, SYSTEM_PROMPT} from './prompts';

/** Thrown when the requested language is not supported by this module. */
export class UnsupportedLanguageError extends Error {
  readonly requestedLanguage: string;

  constructor(language: string, supported: readonly string[]) {
    super(
      `Unsupported language "${language}". Supported languages: ${supported.join(', ')}.`,
    );
    this.name = 'UnsupportedLanguageError';
    this.requestedLanguage = language;
  }
}

/** Thrown for any failure during input validation or the Groq request. */
export class LessonGenerationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'LessonGenerationError';
  }
}

/**
 * Generate a fully validated lesson for a topic + language.
 * Rejects unsupported languages, missing API keys, and invalid model output.
 */
export async function generateLesson(input: LessonInput): Promise<Lesson> {
  // 1. Validate the input itself.
  const inputResult = lessonInputSchema.safeParse(input);
  if (!inputResult.success) {
    const details = inputResult.error.issues
      .map((i) => `${i.path.join('.') || 'input'}: ${i.message}`)
      .join('; ');
    throw new LessonGenerationError(`Invalid lesson input: ${details}`);
  }

  const {topic, language, ageGroup} = inputResult.data;

  // 2. Reject unsupported languages up-front (never generate wrong language).
  if (!isSupportedLanguage(language)) {
    throw new UnsupportedLanguageError(language, SUPPORTED_LANGUAGES);
  }

  const client = getGroqClient();
  const model = getGroqModel();

  // 3. Request STRICT JSON from the model.
  let completion;
  try {
    completion = await client.chat.completions.create({
      model,
      temperature: 0.4,
      messages: [
        {role: 'system', content: SYSTEM_PROMPT},
        {role: 'user', content: buildUserPrompt({topic, language, ageGroup})},
      ],
      response_format: {type: 'json_object'},
    });
  } catch (err) {
    throw new LessonGenerationError(
      `Groq request failed: ${err instanceof Error ? err.message : String(err)}`,
    );
  }

  const content = completion.choices?.[0]?.message?.content;
  if (!content || content.trim() === '') {
    throw new LessonGenerationError('Groq returned an empty response');
  }

  // 4. Validate model output — throw on anything malformed.
  try {
    return parseLessonContent(content);
  } catch (err) {
    if (err instanceof LessonParseError) {
      throw err; // already a precise, structured error
    }
    throw new LessonGenerationError(
      `Failed to parse lesson: ${err instanceof Error ? err.message : String(err)}`,
    );
  }
}
