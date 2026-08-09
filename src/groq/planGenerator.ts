/**
 * Flexible animation-plan generator.
 *
 *   Topic + language → Groq → AnimationPlan (elements + timed animations)
 *
 * The raw model output goes through `parseAnimationPlanContent` (tolerant Zod
 * schema + normalization) before leaving this module. Unknown element types
 * are skipped at render time rather than rejecting the whole video.
 */
import type {AnimationPlan} from '../engine/types';
import {parseAnimationPlanContent} from '../engine/plans/planSchema';
import {lessonInputSchema} from '../lesson/lessonSchema';
import {isSupportedLanguage, SUPPORTED_LANGUAGES, type LessonInput} from '../lesson/lessonTypes';
import {getGroqClient, getGroqModel} from './groqClient';
import {UnsupportedLanguageError} from './lessonGenerator';
import {buildPlanSystemPrompt, buildPlanUserPrompt} from './planPrompts';

/** Thrown for any failure of plan generation or validation. */
export class PlanGenerationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PlanGenerationError';
  }
}

/** Generate a validated, flexible AnimationPlan for a topic + language. */
export async function generateAnimationPlan(input: LessonInput): Promise<AnimationPlan> {
  const inputResult = lessonInputSchema.safeParse(input);
  if (!inputResult.success) {
    const details = inputResult.error.issues
      .map((i) => `${i.path.join('.') || 'input'}: ${i.message}`)
      .join('; ');
    throw new PlanGenerationError(`Invalid lesson input: ${details}`);
  }

  const {topic, language, ageGroup} = inputResult.data;

  if (!isSupportedLanguage(language)) {
    throw new UnsupportedLanguageError(language, SUPPORTED_LANGUAGES);
  }

  const client = getGroqClient();
  const model = getGroqModel();

  let completion;
  try {
    completion = await client.chat.completions.create({
      model,
      temperature: 0.5,
      messages: [
        {role: 'system', content: buildPlanSystemPrompt()},
        {role: 'user', content: buildPlanUserPrompt({topic, language, ageGroup})},
      ],
      response_format: {type: 'json_object'},
    });
  } catch (err) {
    throw new PlanGenerationError(
      `Groq request failed: ${err instanceof Error ? err.message : String(err)}`,
    );
  }

  const content = completion.choices?.[0]?.message?.content;
  if (!content || content.trim() === '') {
    throw new PlanGenerationError('Groq returned an empty response');
  }

  try {
    return parseAnimationPlanContent(content);
  } catch (err) {
    throw new PlanGenerationError(
      `Failed to parse animation plan: ${err instanceof Error ? err.message : String(err)}`,
    );
  }
}