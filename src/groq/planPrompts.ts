/**
 * Prompt builders for the flexible AnimationPlan generator.
 *
 * Produces a STRUCTURED animation plan (elements + timed animations per
 * scene) that the engine renderer interprets — the LLM never writes React.
 * The element/animation types here exactly mirror `src/engine/types` and
 * `src/engine/primitives`, so any type named in the prompt has a primitive.
 */

export const PLAN_ELEMENT_TYPES = [
  'title',
  'label',
  'equation',
  'highlightedText',
  'stepCard',
  'infoCard',
  'circle',
  'rectangle',
  'arrow',
  'line',
  'grid',
  'polygon',
  'coordinatePlane',
  'graph',
  'functionCurve',
  'vector',
  'numberLine',
  'geometricShape',
  'array',
  'arrayElement',
  'pointer',
  'variable',
  'stack',
  'queue',
  'linkedList',
  'tree',
  'graphVisual',
  'node',
  'edge',
  'codeBlock',
  'algorithmStep',
  'physicsObject',
  'forceArrow',
  'velocityArrow',
  'accelerationArrow',
  'trajectory',
  'wave',
  'particle',
  'spring',
  'circuitElement',
] as const;

export const PLAN_ANIMATION_TYPES = [
  'create',
  'show',
  'hide',
  'move',
  'transform',
  'highlight',
  'compare',
  'drawArrow',
  'displayEquation',
  'updateValue',
  'changeColor',
  'zoom',
  'pan',
  'wait',
  'fadeIn',
  'fadeOut',
  'scale',
  'rotate',
  'morph',
] as const;

const SUBJECT_GUIDANCE = `Subject-specific visual guidance:
- Computer Science: use array, arrayElement, pointer, variable, stack, queue, linkedList, tree, graphVisual, node, edge, codeBlock, algorithmStep. Example for binary search: a horizontal ARRAY of cells, LOW/MID/HIGH search pointers via props.lowIndex/midIndex/highIndex, dim or cross out eliminated cells (props.eliminatedIndices), then highlight the found cell.
- Mathematics: use equation, coordinatePlane, functionCurve, graph, numberLine, vector, geometricShape, infoCard. Animate equations appearing step by step.
- Physics: use physicsObject, forceArrow, velocityArrow, accelerationArrow, trajectory, wave, particle, spring, circle, arrow.
- Chemistry / Biology / culture / general: use infoCard blocks joined by arrow "flow" diagrams, rectangle process steps, circle diagrams, timelines (rectangles along a line), and highlightedText callouts.`;

/** Full system prompt (JSON template embedded). */
export function buildPlanSystemPrompt(): string {
  return `You are EduVision's motion-graphics storyboard engine. You produce a STRICT JSON "animation plan" that drives a Remotion explainer video with animated BLOCKS, shapes, arrays, pointers, arrows and callouts.

RULES:
1. Respond with ONLY one JSON object. No markdown, no code fences, no commentary.
2. Write ALL learner-facing text (narration, props.text/title/label, stepCard text) in the requested language. Element and action "id" values stay simple ASCII like "title", "arr", "ptr", "box1".
3. Canvas 1920 x 1080, fps 30. element.position is the TOP-LEFT corner and must stay inside the canvas. Keep the bottom ~150px clear for the narration bar.
4. Produce 3 to 7 scenes. Each scene has 2-6 elements, 1-5 timed animations and a short narration (2-3 sentences, exactly what TTS speaks — never stage directions).
5. element "type" and animation "type" may ONLY be drawn from these lists:
   Elements: ${PLAN_ELEMENT_TYPES.join(', ')}.
   Animations: ${PLAN_ANIMATION_TYPES.join(', ')}.
   An animation targetId must exist in the SAME scene's elements.
6. scene "duration" is a best estimate in seconds (~2.6 words spoken per second); the renderer re-syncs timing to the real narration audio later. Keep durations 6-12s.
7. DO NOT make a slideshow of static cards. Scenes must EVOLVE: elements appear at different startTime, highlight, move, swap, update values, draw arrows.
8. Use a stepCard element near the bottom for process narration (e.g. {"title":"Step 2","text":"23 < 38 → eliminate the right half"}).
9. ${SUBJECT_GUIDANCE}
10. Prefer educational clarity. Never invent facts; tie visuals tightly to narration.
11. ids are unique strings; numbers are plain JSON numbers.

Return ONLY the JSON object shaped exactly like this template:
${PLAN_JSON_TEMPLATE}`;
}

/** Compact JSON template the model must follow exactly. */
export const PLAN_JSON_TEMPLATE = `{
  "id": "lesson-1",
  "title": "Lesson title (in target language)",
  "topic": "the topic",
  "subject": "Mathematics | Computer Science | Physics | Chemistry | Biology | General",
  "language": "the requested language",
  "objective": "one-line learning goal",
  "fps": 30,
  "width": 1920,
  "height": 1080,
  "totalDuration": 40,
  "scenes": [
    {
      "id": "intro",
      "purpose": "what this scene teaches visually",
      "narration": "Spoken narration, in the target language.",
      "duration": 9,
      "onScreenLabels": ["Section label"],
      "elements": [
        {"id": "title", "type": "title", "position": {"x": 620, "y": 180}, "props": {"text": "..."}},
        {"id": "arr", "type": "array", "position": {"x": 380, "y": 430}, "props": {"values": [2, 5, 8], "lowIndex": 0, "midIndex": 1, "highIndex": 2}},
        {"id": "step1", "type": "stepCard", "position": {"x": 570, "y": 920}, "props": {"title": "Step 1", "text": "..."}}
      ],
      "animations": [
        {"id": "a1", "type": "fadeIn", "targetId": "title", "startTime": 0.3, "duration": 0.7},
        {"id": "a2", "type": "highlight", "targetId": "arr", "startTime": 2.0, "duration": 1.0, "params": {"lowIndex": 0, "midIndex": 1, "highIndex": 2}}
      ],
      "transition": {"type": "fade", "duration": 0.4}
    }
  ]
}`;

/** Builds the user message for a topic → plan request. */
export function buildPlanUserPrompt(input: {
  topic: string;
  language: string;
  ageGroup?: string;
}): string {
  const {topic, language, ageGroup} = input;
  return (
    `Design an animated educational explainer.\n\n` +
    `Topic: ${topic}\n` +
    `Language: ${language}\n` +
    (ageGroup ? `Target age group: ${ageGroup}\n` : 'Target age group: general audience\n') +
    `All learner-facing text must be in ${language}.\n\n` +
    `Output ONLY the JSON object shaped exactly like this template:\n\n` +
    PLAN_JSON_TEMPLATE
  );
}