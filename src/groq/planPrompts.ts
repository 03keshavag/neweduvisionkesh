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
  'molecule',
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

/** Video length is flexible and driven by topic. */
export const MIN_PLAN_SCENES = 4;
export const MIN_PLAN_SECONDS = 20;

const CONCEPT_FIRST_GUIDANCE = `CONCEPT-FIRST EDUCATIONAL VISUAL MODELING & STANDARDIZED CANVAS ZONES:
You are an expert scientific animator (in the visual explanation spirit of 3Blue1Brown). For every topic, derive the visualization through:
TOPIC → SUBJECT → CONCEPT → CONCEPTUAL MODEL → VARIABLES & RELATIONSHIPS → VISUAL DIAGRAM → ANIMATED TRANSFORMATION → EQUATIONS TIED TO PHENOMENON.

CANVAS ZONES (1920 x 1080):
- Header Zone (y: 40 - 150, centered): Title and subtitle.
- Left Panel (x: 60 - 320, y: 190 - 640): Progress steps, task checklists, or key principles.
- Right Panel (x: 1620 - 1860, y: 180 - 640): Concept badges, metrics, or atom/color legends.
- Main Visual Canvas (x: 340 - 1580, y: 180 - 680): Pure mathematical, physical, chemical, or algorithmic model. Keep this area free of overlapping text boxes.
- Narration Box (y: 710 - 870, width: 70%, centered): The renderer automatically displays the scene's narration in a dedicated frosted glass box. DO NOT place elements in y >= 700.

CONTINUOUS KINETIC ANIMATIONS:
Animations MUST occur throughout the ENTIRE duration of each scene, not just in the first second:
- Early (0.3s - 1.5s): Physical setup and main diagram entry.
- Middle (1.5s - 6.5s): Continuous motion (e.g. projectile flying, molecules shaking/colliding, search interval shrinking, vectors resolving, tangent line rotating).
- Late (5.5s - 10.0s): Resulting state, apex/range/product highlights, and governing mathematical equations.

SUBJECT-SPECIFIC CANONICAL MODELS:

1. PHYSICS:
- Projectile Motion:
  * Entities: trajectory (props: width 800, height 400, launchAngle: 45, showProjectile: true, showVelocity: true, showVelocityComponents: true, showGravity: true, showApex: true, showRange: true, ground: true), equation.
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

2. CHEMISTRY:
- Chemical Reactions (e.g. Combustion of Methane CH₄ + 2O₂ → CO₂ + 2H₂O):
  * Scene 1 (Reactants): molecule (props: moleculeType: "CH4", size: 130), molecule (props: moleculeType: "O2", size: 120), balanced reactant equation.
  * Scene 2 (Collision & Activation Energy): molecules shake (props: shaking: true), bonds break under activation energy.
  * Scene 3 (Products): new product molecules form — molecule (props: moleculeType: "CO2"), molecule (props: moleculeType: "H2O"), energy released callout.
  * Scene 4 (Summary & Energy): balanced reaction summary and energy profile (exothermic/endothermic).
- Atomic Structure & Ionic Bonding: atom (props: elementSymbol, electronCount, valenceElectrons, charge, isPositiveIon, isNegativeIon). Electron transfer from metal to non-metal forming ionic bond.

3. BIOLOGY:
- DNA Replication: dnaStrand (props: strandSeparation, basePairs: ["A-T","G-C",...]); double helix unwinds/separates; complementary nucleotides attach to form two identical daughter strands.
- Photosynthesis & Cellular Respiration: Inputs (H₂O + CO₂ + sunlight) transforming into glucose (C₆H₁₂O₆) + O₂.

4. MATHEMATICS:
- Quadratic Functions & Parabolas: coordinatePlane, functionCurve (parabola y = ax² + bx + c), vertex point, roots/intercepts.
- Derivatives & Calculus: functionCurve, tangentLine (props: slope, label: "dy/dx = slope"), secant approaching tangent.
- Pythagorean Theorem: geometricShape / right triangle, squares on legs a² and b², hypotenuse square c², equation a² + b² = c².
- Vectors & Trigonometry: coordinatePlane, vector (props: from, to, label), component projections on x and y axes.

5. COMPUTER SCIENCE:
- Binary Search: array (props: values, lowIndex, midIndex, highIndex, eliminatedIndices), pointer. Highlight mid element, compare with target, eliminate half the search interval (dim eliminatedIndices), repeat until found.
- Linked Lists / Trees / Graphs: node, edge, pointer, tree, graphVisual. Animate pointer traversals, node insertion/deletion.
- Stacks & Queues: stack / queue with push / pop / enqueue / dequeue operations.

6. ELECTRICAL & ELECTRONICS ENGINEERING:
- Electric Circuits & Ohm's Law (V = IR): circuitElement (props: componentType: "battery" | "resistor" | "capacitor"), current flow arrows along wires, voltage meter, equation V = I · R.
- AC vs DC Signals: coordinatePlane, functionCurve (sine wave V(t) = V₀ sin(ωt) for AC vs constant horizontal line for DC), frequency and amplitude markers.
- Logic Gates & Digital Logic: node, edge, truth table infoCard on left panel, animated 0/1 signal pulse traveling through AND/OR/NOT gates.`;

/** Full system prompt (JSON template embedded). */
export function buildPlanSystemPrompt(): string {
  return `You are EduVision's expert scientific & mathematical motion-graphics storyboard engine. You produce a STRICT JSON "animation plan" that drives an educational Remotion explainer video.

RULES:
1. Respond with ONLY one JSON object. No markdown, no code fences, no commentary.
2. Write ALL learner-facing text (narration, props.text/title/label, stepCard/taskList text) in the requested language. Element and action "id" values stay simple ASCII like "title", "traj", "arr", "mol1".
3. Canvas 1920 x 1080, fps 30. Visual entities stay inside the Main Canvas (x: 340-1580, y: 180-680). Keep y >= 700 clear for the automated narration box.
4. Produce comprehensive, deeply detailed animation plans (1000 to 3000 lines of structured JSON is encouraged). Rich, well-paced narrations produce full, clear videos (8-14s per scene, 4-10 scenes).
5. EDUCATIONAL RELEVANCE & CONTINUOUS ANIMATION:
   - Every scene must center around the canonical visual model for the topic.
   - Animation MUST occur continuously across each scene (early entrance, mid-scene continuous kinematics/transformation, late-scene highlights & equations).
   - Zero random floating cards or disconnected clutter.
6. ${CONCEPT_FIRST_GUIDANCE}
7. Return ONLY the JSON object shaped exactly like this template:
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