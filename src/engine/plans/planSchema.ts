/**
 * Zod schemas + normalization for the flexible `AnimationPlan` output.
 *
 * Design goal: TOLERANCE. Groq output is noisy — numbers arrive as strings,
 * fields are missing, ids collide. Unlike the strict lesson schema, this
 * schema is deliberately lenient: it coerces, defaults and then `normalize`*
 * clamps/dedupes. Unknown element/action types are kept and silently skipped
 * at render time, so one bad element never kills the whole video.
 */
import {z} from 'zod';
import type {AnimationPlan, AnimationScene, Subject} from '../types';

const positionSchema = z
  .object({x: z.coerce.number().default(0), y: z.coerce.number().default(0)})
  .default({x: 0, y: 0});

const elementSchema = z.object({
  id: z.string().min(1),
  type: z.string().min(1),
  position: positionSchema,
  size: z
    .object({width: z.coerce.number(), height: z.coerce.number()})
    .optional(),
  props: z.record(z.string(), z.unknown()).default({}),
  zIndex: z.number().int().optional(),
});

const animationSchema = z.object({
  id: z.string().optional(),
  type: z.string().min(1),
  targetId: z.string().min(1),
  startTime: z.coerce.number().nonnegative().default(0),
  duration: z.coerce.number().nonnegative().default(0.5),
  params: z.record(z.string(), z.unknown()).optional(),
});

const transitionSchema = z
  .object({
    type: z.enum(['fade', 'slide', 'zoom', 'camera', 'none']).catch('fade'),
    duration: z.coerce.number().nonnegative().default(0.4),
  })
  .optional();

const sceneSchema = z.object({
  id: z.string().min(1),
  purpose: z.string().default(''),
  narration: z.string().min(1, 'scene narration must not be empty'),
  duration: z.coerce.number().positive('duration must be > 0').default(8),
  elements: z.array(elementSchema).default([]),
  animations: z.array(animationSchema).default([]),
  transition: transitionSchema,
  onScreenLabels: z.array(z.string()).default([]),
});

export const animationPlanSchema = z.object({
  id: z.string().min(1).catch('generated-plan'),
  title: z.string().min(1, 'plan title must not be empty'),
  topic: z.string().min(1, 'plan topic must not be empty'),
  subject: z
    .enum(['Mathematics', 'Computer Science', 'Physics', 'Chemistry', 'Biology', 'General'] as const)
    .catch('General'),
  language: z.string().min(1, 'plan language must not be empty'),
  objective: z.string().default(''),
  fps: z.coerce.number().positive().default(30),
  width: z.coerce.number().positive().default(1920),
  height: z.coerce.number().positive().default(1080),
  totalDuration: z.coerce.number().nonnegative().default(0),
  scenes: z.array(sceneSchema).min(1, 'at least one scene is required'),
});

const SUBJECTS: readonly Subject[] = [
  'Mathematics',
  'Computer Science',
  'Physics',
  'Chemistry',
  'Biology',
  'General',
];

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/** Clamp, dedupe and sanitize a parsed plan so rendering can never crash. */
export function normalizeAnimationPlan(input: AnimationPlan): AnimationPlan {
  const width = input.width || 1920;
  const height = input.height || 1080;

  const seen = new Set<string>();
  const scenes: AnimationScene[] = input.scenes.map((scene) => {
    let sceneId = scene.id?.trim();
    if (!sceneId || seen.has(sceneId)) {
      sceneId = `scene-${seen.size + 1}`;
    }
    seen.add(sceneId);

    const elements = scene.elements
      .map((element) => ({
        ...element,
        position: {
          x: clamp(element.position?.x ?? 0, 0, Math.max(1, width - 40)),
          y: clamp(element.position?.y ?? 0, 0, Math.max(1, height - 40)),
        },
      }))
      .filter((element, index, arr) => arr.findIndex((e) => e.id === element.id) === index);
    const validIds = new Set(elements.map((e) => e.id));

    const animations = (scene.animations ?? [])
      .filter((a) => a.targetId && validIds.has(a.targetId))
      .map((a) => ({
        ...a,
        startTime: clamp(Number(a.startTime) || 0, 0, 60),
        duration: clamp(Number(a.duration) || 0.5, 0.1, 20),
      }));

    return {
      ...scene,
      id: sceneId,
      purpose: scene.purpose ?? '',
      duration: clamp(Number(scene.duration) || 8, 2, 60),
      elements,
      animations,
      onScreenLabels: scene.onScreenLabels ?? [],
      transition: scene.transition ?? {type: 'fade' as const, duration: 0.4},
    };
  });

  const subject: Subject = SUBJECTS.includes(input.subject as Subject)
    ? (input.subject as Subject)
    : 'General';

  return {
    ...input,
    id: input.id || 'generated-plan',
    subject,
    fps: Number(input.fps) || 30,
    width,
    height,
    totalDuration: scenes.reduce((acc, s) => acc + s.duration, 0),
    scenes,
  };
}

/** Parse + validate + normalize raw model output into a usable AnimationPlan. */
export function parseAnimationPlanContent(content: string): AnimationPlan {
  const raw = extractPlanJson(content);
  const result = animationPlanSchema.safeParse(raw);
  if (!result.success) {
    const details = result.error.issues
      .map((i) => `${i.path.join('.') || 'plan'}: ${i.message}`)
      .join('; ');
    throw new Error(`Animation plan failed validation: ${details}`);
  }
  return normalizeAnimationPlan(result.data as unknown as AnimationPlan);
}

/** Extract the first JSON object from model output (code fences / prose safe). */
function extractPlanJson(raw: string): unknown {
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fenced ? fenced[1] : raw;
  try {
    return JSON.parse(candidate);
  } catch {
    const start = candidate.indexOf('{');
    const end = candidate.lastIndexOf('}');
    if (start !== -1 && end > start) {
      try {
        return JSON.parse(candidate.slice(start, end + 1));
      } catch {
        // fall through
      }
    }
    throw new Error('Groq response does not contain valid JSON');
  }
}