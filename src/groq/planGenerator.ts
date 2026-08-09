/**
 * Flexible animation-plan generator.
 *
 *   Topic + language → Groq → AnimationPlan (elements + timed animations)
 *
 * The raw model output goes through `parseAnimationPlanContent` (tolerant Zod
 * schema + normalization) before leaving this module. Unknown element types
 * are skipped at render time rather than rejecting the whole video.
 *
 * If the model returns fewer than MIN_PLAN_SCENES scenes or less than
 * MIN_PLAN_SECONDS total, the generator asks it ONCE to expand before giving
 * up, so generated videos reliably reach the 1-minute target.
 */
import type {AnimationPlan} from '../engine/types';
import {parseAnimationPlanContent} from '../engine/plans/planSchema';
import {lessonInputSchema} from '../lesson/lessonSchema';
import {isSupportedLanguage, SUPPORTED_LANGUAGES, type LessonInput} from '../lesson/lessonTypes';
import {getGroqClient, getGroqModel} from './groqClient';
import {UnsupportedLanguageError} from './lessonGenerator';
import {buildPlanSystemPrompt, buildPlanUserPrompt, MIN_PLAN_SCENES, MIN_PLAN_SECONDS} from './planPrompts';

/** Thrown for any failure of plan generation or validation. */
export class PlanGenerationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PlanGenerationError';
  }
}

const MAX_ATTEMPTS = 3;

function isTooShort(plan: AnimationPlan): boolean {
  const scenes = plan.scenes.length;
  const total = plan.totalDuration;
  if (scenes < MIN_PLAN_SCENES) {
    console.warn(`[groq] plan too short: ${scenes} scenes < ${MIN_PLAN_SCENES}`);
    return true;
  }
  if (total < MIN_PLAN_SECONDS) {
    console.warn(`[groq] plan too short: ${total}s < ${MIN_PLAN_SECONDS}s`);
    return true;
  }
  return false;
}

/** Generate the plan and parse + validate it into an AnimationPlan. */
async function requestPlan(
  input: LessonInput,
  model: string,
  attempt: number,
): Promise<AnimationPlan> {
  const {topic, language, ageGroup} = input;
  const user = buildPlanUserPrompt({topic, language, ageGroup});
  const expandHint =
    attempt > 0
      ? `\n\nIMPORTANT — the previous attempt was too short. You MUST output at least ${MIN_PLAN_SCENES} scenes and at least ${MIN_PLAN_SECONDS} seconds of narration in total (longer narrations per scene, more scenes). Add an intro, a worked example, a step-by-step process (progressSteps/taskList), a timeline, and a recap so the video genuinely explains the topic fully. Keep every scene's narration 2-4 sentences.`
      : '';

  const client = getGroqClient();
  const completion = await client.chat.completions.create({
    model,
    temperature: attempt > 0 ? 0.7 : 0.5,
    messages: [
      {role: 'system', content: buildPlanSystemPrompt()},
      {role: 'user', content: user + expandHint},
    ],
    response_format: {type: 'json_object'},
  });

  const content = completion.choices?.[0]?.message?.content;
  if (!content || content.trim() === '') {
    throw new Error('Groq returned an empty response');
  }
  return parseAnimationPlanContent(content);
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

  if (!isSupportedLanguage(inputResult.data.language)) {
    throw new UnsupportedLanguageError(inputResult.data.language, SUPPORTED_LANGUAGES);
  }

  const model = getGroqModel();
  let lastError: unknown = null;

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    try {
      const plan = await requestPlan(input, model, attempt);
      // If the first attempt is under-length, retry once with an expand hint.
      if (attempt === 0 && isTooShort(plan)) {
        continue;
      }
      if (attempt > 0 && isTooShort(plan)) {
        console.warn('[groq] giving up on expanding plan; using the best attempt.');
      }
      return plan;
    } catch (err) {
      lastError = err;
      if (err instanceof PlanGenerationError) throw err;
      console.warn(`[groq] attempt ${attempt + 1} failed: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  throw new PlanGenerationError(
    `Groq request failed after ${MAX_ATTEMPTS} attempts: ${
      lastError instanceof Error ? lastError.message : String(lastError)
    }`,
  );
}