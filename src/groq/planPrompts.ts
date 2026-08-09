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
  'progressSteps',
  'taskList',
  'coordinatePlane',
  'graph',
  'functionCurve',
  'vector',
  'numberLine',
  'geometricShape',
  'atom',
  'dnaStrand',
  'tangentLine',
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

/** Only a small sanity floor — video LENGTH is flexible and driven by topic. */
export const MIN_PLAN_SCENES = 4;
export const MIN_PLAN_SECONDS = 20;

const CONCEPT_FIRST_GUIDANCE = `CONCEPT-FIRST EDUCATIONAL VISUAL MODELING:
You are an expert scientific animator (in the visual explanation spirit of 3Blue1Brown). For every topic, derive the visualization through:
TOPIC → SUBJECT → CONCEPT → CONCEPTUAL MODEL → VARIABLES & RELATIONSHIPS → VISUAL DIAGRAM → ANIMATED TRANSFORMATION → EQUATIONS TIED TO PHENOMENON.

Every movement must represent a physical or mathematical relationship. Never add random decorative shapes or floating cards.

SUBJECT-SPECIFIC CANONICAL MODELS:

1. PHYSICS:
- Projectile Motion:
  * Entities: trajectory (props: width 750, height 380, launchAngle: 45, showProjectile: true, showVelocity: true, showVelocityComponents: true, showGravity: true, showApex: true, showRange: true, ground: true), equation, label.
  * Progression:
    Scene 1: Setup — ground line, launch point, projectile at origin, initial velocity v₀ at angle θ.
    Scene 2: Velocity decomposition — resolve v₀ into horizontal component vx (constant) and vertical component vy.
    Scene 3: Flight & Gravity — projectile moves along parabola; downward gravity vector g acts continuously; vy shrinks as it climbs.
    Scene 4: Maximum Height & Apex — at peak, vertical velocity vy = 0, maximum height H highlighted (equation: H = v₀y² / 2g).
    Scene 5: Descent & Range — projectile lands, horizontal range R highlighted (equation: R = v₀² sin(2θ) / g, x(t) = v₀x·t, y(t) = v₀y·t - ½gt²).
- Newton's 2nd Law (F = ma): physicsObject (mass m), forceArrow (F), accelerationArrow (a). Animate force applied → acceleration appears → object accelerates.
- Free Fall: physicsObject, downward accelerationArrow, velocity increasing with time (v = gt, y = ½gt²).
- Circular Motion: circle (orbit), physicsObject, radius vector, tangential velocityArrow, centripetal forceArrow pointing to center.
- Waves: wave (props: amplitude, frequency), wavelength marker, particle oscillation.

2. MATHEMATICS:
- Quadratic Functions & Parabolas: coordinatePlane, functionCurve (parabola y = ax² + bx + c), vertex point, roots/intercepts.
- Derivatives & Calculus: functionCurve, tangentLine (props: slope, label: "dy/dx = slope"), secant approaching tangent.
- Pythagorean Theorem: geometricShape / right triangle, squares on legs a² and b², hypotenuse square c², equation a² + b² = c².
- Vectors & Trigonometry: coordinatePlane, vector (props: from, to, label), component projections on x and y axes.

3. CHEMISTRY:
- Atomic Structure & Ions: atom (props: elementSymbol, electronCount, valenceElectrons, charge, isPositiveIon, isNegativeIon).
- Ionic Bonding: Metal atom (e.g. Na, 1 valence electron) transfers electron to Non-metal (e.g. Cl, 7 valence electrons); Na becomes Na⁺, Cl becomes Cl⁻; electrostatic attraction forms ionic bond.
- Covalent Bonding: Atoms share electron pairs in overlapping valence shells.
- Chemical Reactions: Reactant molecules transform into product molecules with conservation of atoms.

4. BIOLOGY:
- DNA Replication: dnaStrand (props: strandSeparation, basePairs: ["A-T","G-C",...]); double helix unwinds/separates; complementary nucleotides attach to form two identical daughter strands.
- Photosynthesis & Cellular Respiration: Chloroplast / leaf diagram, inputs (H₂O + CO₂ + sunlight) transforming into glucose (C₆H₁₂O₆) + O₂.
- Cell Structure & Transport: Cell membrane, nucleus, organelles, molecules diffusing through membrane channels.

5. COMPUTER SCIENCE:
- Binary Search: array (props: values, lowIndex, midIndex, highIndex, eliminatedIndices), pointer. Highlight mid element, compare with target, eliminate half the search interval (dim eliminatedIndices), repeat until found.
- Linked Lists / Trees / Graphs: node, edge, pointer, tree, graphVisual. Animate pointer traversals, node insertion/deletion.
- Stacks & Queues: stack / queue with push / pop / enqueue / dequeue operations.`;

/** Full system prompt (JSON template embedded). */
export function buildPlanSystemPrompt(): string {
  return `You are EduVision's expert scientific & mathematical motion-graphics storyboard engine. You produce a STRICT JSON "animation plan" that drives an educational Remotion explainer video.

RULES:
1. Respond with ONLY one JSON object. No markdown, no code fences, no commentary.
2. Write ALL learner-facing text (narration, props.text/title/label, stepCard/taskList text) in the requested language. Element and action "id" values stay simple ASCII like "title", "traj", "arr", "ptr", "atom1".
3. Canvas 1920 x 1080, fps 30. element.position is the TOP-LEFT corner and must stay inside the canvas. Keep the bottom ~140px clear for the narration subtitle.
4. Produce ${MIN_PLAN_SCENES} to 10 SCENES — let the concept dictate the length. Rich, well-paced narrations produce full, clear videos (8-14s per scene).
5. EDUCATIONAL RELEVANCE OVER DECORATIVE COMPLEXITY:
   - Every scene must center around the canonical mathematical/scientific visual model for the topic.
   - Animation MUST represent a relationship or physical process (e.g. ball moving along trajectory, electron transferring, interval shrinking, slope changing).
   - Never add random floating cards, disconnected arrows, or arbitrary moving shapes.
6. EQUATION ↔ VISUAL CONNECTION:
   - Introduce equations only in direct visual connection to the physical or geometric quantities they describe.
7. ${CONCEPT_FIRST_GUIDANCE}
8. Return ONLY the JSON object shaped exactly like this template:
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
      "purpose": "Physical/conceptual setup",
      "narration": "Spoken narration, in the target language.",
      "duration": 9,
      "onScreenLabels": ["Section label"],
      "elements": [
        {"id": "title", "type": "title", "position": {"x": 580, "y": 140}, "props": {"text": "..."}},
        {"id": "traj", "type": "trajectory", "position": {"x": 560, "y": 280}, "props": {"width": 800, "height": 400, "launchAngle": 45, "showProjectile": true, "showVelocity": true, "showVelocityComponents": true, "showGravity": true, "showApex": true, "showRange": true, "ground": true}},
        {"id": "eq1", "type": "equation", "position": {"x": 620, "y": 720}, "props": {"expression": "x(t) = v₀x · t"}}
      ],
      "animations": [
        {"id": "a1", "type": "fadeIn", "targetId": "title", "startTime": 0.3, "duration": 0.6},
        {"id": "a2", "type": "fadeIn", "targetId": "traj", "startTime": 1.0, "duration": 0.8},
        {"id": "a3", "type": "displayEquation", "targetId": "eq1", "startTime": 4.5, "duration": 0.7}
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
    `Design a concept-first educational animated explainer.\n\n` +
    `Topic: ${topic}\n` +
    `Language: ${language}\n` +
    (ageGroup ? `Target age group: ${ageGroup}\n` : 'Target age group: general audience\n') +
    `All learner-facing text must be in ${language}.\n\n` +
    `Output ONLY the JSON object shaped exactly like this template:\n\n` +
    PLAN_JSON_TEMPLATE
  );
}