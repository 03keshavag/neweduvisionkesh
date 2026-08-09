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

/**
 * Semantic validation: ensures the generated plan actually contains the visual
 * entities and relationships necessary to teach the topic.
 */
export function validatePlanSemantics(plan: AnimationPlan, topic: string): {valid: boolean; reason?: string} {
  const t = topic.toLowerCase();
  const allElements = plan.scenes.flatMap((s) => s.elements);
  const elementTypes = new Set(allElements.map((e) => e.type));

  if (t.includes('projectile') || t.includes('trajectory')) {
    const hasTrajectory = elementTypes.has('trajectory') || elementTypes.has('physicsObject') || elementTypes.has('particle');
    const hasPhysicsArrows = elementTypes.has('velocityArrow') || elementTypes.has('forceArrow') || elementTypes.has('arrow') || allElements.some((e) => e.props?.showVelocity || e.props?.showGravity);
    if (!hasTrajectory && !hasPhysicsArrows) {
      return {valid: false, reason: 'Projectile motion plan must contain a trajectory or physics object with velocity/gravity vectors.'};
    }
  } else if (t.includes('binary search') || t.includes('algorithm')) {
    const hasArrayOrStructure = elementTypes.has('array') || elementTypes.has('arrayElement') || elementTypes.has('pointer') || elementTypes.has('algorithmStep');
    if (!hasArrayOrStructure) {
      return {valid: false, reason: 'Binary search plan must contain an array or pointer visualization.'};
    }
  } else if (t.includes('atom') || t.includes('bond') || t.includes('chemical')) {
    const hasChem = elementTypes.has('atom') || elementTypes.has('particle') || elementTypes.has('circle') || elementTypes.has('node');
    if (!hasChem) {
      return {valid: false, reason: 'Chemistry plan must contain atomic, molecular, or particle models.'};
    }
  } else if (t.includes('dna') || t.includes('cell') || t.includes('biology')) {
    const hasBio = elementTypes.has('dnaStrand') || elementTypes.has('geometricShape') || elementTypes.has('circle') || elementTypes.has('node');
    if (!hasBio) {
      return {valid: false, reason: 'Biology plan must contain DNA or anatomical/cellular visual structures.'};
    }
  }

  return {valid: true};
}

/** Generate the plan and parse + validate it into an AnimationPlan. */
async function requestPlan(
  input: LessonInput,
  model: string,
  attempt: number,
  semanticHint?: string,
): Promise<AnimationPlan> {
  const {topic, language, ageGroup} = input;
  const user = buildPlanUserPrompt({topic, language, ageGroup});
  let promptSuffix = '';
  if (attempt > 0) {
    promptSuffix = `\n\nIMPORTANT REVISION REQUIRED:\n`;
    if (semanticHint) {
      promptSuffix += `- ${semanticHint}\n`;
    }
    promptSuffix += `- You MUST output at least ${MIN_PLAN_SCENES} scenes and at least ${MIN_PLAN_SECONDS} seconds of narration in total.\n`;
    promptSuffix += `- Focus on the core mathematical/physical/scientific visual model (moving parts, vectors, equations tied to visuals) rather than generic text cards.`;
  }

  const client = getGroqClient();
  const completion = await client.chat.completions.create({
    model,
    temperature: attempt > 0 ? 0.7 : 0.5,
    messages: [
      {role: 'system', content: buildPlanSystemPrompt()},
      {role: 'user', content: user + promptSuffix},
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
  let lastSemanticReason: string | undefined;

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    try {
      const plan = await requestPlan(input, model, attempt, lastSemanticReason);

      // Check semantic model validity (e.g. projectile motion must have trajectory/vectors)
      const semanticCheck = validatePlanSemantics(plan, input.topic);
      if (!semanticCheck.valid && attempt < MAX_ATTEMPTS - 1) {
        console.warn(`[groq] semantic validation failed on attempt ${attempt + 1}: ${semanticCheck.reason}`);
        lastSemanticReason = semanticCheck.reason;
        continue;
      }

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