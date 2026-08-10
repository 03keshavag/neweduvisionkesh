/**
 * Stage 2: Groq Manim Python Code Generator with Subject-Aware Deterministic Primitives.
 *
 * Incorporates the canonical AutoTeach / EduVision Manim rules, NumPy array comparison safety,
 * explicit edge mapping, and layout-first positioning.
 */
import {getGroqClient, DEFAULT_GROQ_MODEL} from '../../groq/groqClient';
import type {ManimEducationalPlan, ManimScriptResult} from '../types';
import {validateManimScript} from '../validator/manimValidator';
import {getMockManimScript} from './mockManimScript';
import {PYTHON_PRIMITIVES_CODE} from './pythonPrimitives';

const MAX_MANIM_RETRIES = 2;

const MANIM_SYSTEM_PROMPT = `You are EduVision's master Manim Community Edition (v0.19+) Python animator (inspired by 3Blue1Brown).
Write a complete, working, bug-free Manim Community script that visually explains the requested topic.

CRITICAL REQUIREMENTS & MANIM RULES:

1. STRUCTURE & IMPORTS:
   - The script must start with:
     from manim import *
     import numpy as np
   - Must define a Scene class:
     class AutoTeach(Scene):
         def construct(self):
             self.camera.background_color = "#070b14"
             ...

2. DIRECT EXECUTION:
   - The code must be directly executable using:
     manim -pql filename.py AutoTeach
   - The code must finish rendering without requiring user interaction.

3. VISUAL ELEMENTS & PRIMITIVES:
   - Explain the concept visually using Text, Circles, Squares, Rectangles, Lines, Arrows, Nodes, Tables, Transitions, and Highlighting.
   - The script ALREADY has the EduVision Visual Primitives Library available:
     * LayoutManager: create_header(title, sub), create_status_bar(text), safe_scale(mob)
     * ArrayVisualizer(values, box_size=0.8, color=BLUE_D, font_size=22, show_indices=True)
       Methods: .get_group(), .get_element(i), .get_box(i), .get_val_mob(i), .create_pointer(i, label, is_upper=False)
     * LinkedListVisualizer(values) -> .get_group()
     * TreeVisualizer(root_val, tree_dict) -> .get_group()
     * GraphVisualizer(positions_dict, edge_pairs) -> .get_group(), .set_visited(name, color)
     * KinematicsVisualizer.create_canvas(x_max=10, y_max=6) -> axes, ground
     * MoleculeVisualizer.make_atom(symbol, color, radius), .make_bond(a1, a2)
     * CircuitVisualizer.create_rc_circuit(voltage=12, resistance=4) -> VGroup
     * MatrixVisualizer.create_matrix(matrix_vals) -> VGroup

4. TEXT & MATH RULES:
   - Do NOT use LaTeX for ordinary text. NEVER use MathTex(...) or Tex(...) because LaTeX is not installed.
   - ALWAYS use Text() with standard Unicode characters for all normal text, labels, and math formulas (e.g. Text("f'(x) = 2x", font_size=22, color=YELLOW)).
   - Do NOT use external files, images, or fonts.

5. IMPORTANT NUMPY / MANIM ARRAY COMPARISON RULE:
   - Never compare Manim point arrays using == or !=.
   - NEVER WRITE:
     if line.get_start() == point:
     if line.get_end() == point:
     line.get_start() == node.get_center()
   - Instead, if you need to compare points, use:
     np.allclose(line.get_start(), point)
     or:
     np.linalg.norm(line.get_start() - point) < 0.01

6. GRAPH ALGORITHMS EDGE MAPPING RULE:
   - For graph algorithms, DO NOT search through edges by comparing NumPy coordinate arrays.
   - Instead, create a dictionary or list that explicitly maps each edge to its corresponding line object:
     edge_lines = {}
     edge_lines[("A", "B")] = Line(nodes["A"].get_center(), nodes["B"].get_center())
   - Then access the edge directly:
     self.play(edge_lines[("A", "B")].animate.set_color(YELLOW))

7. ANIMATION LIST & MOBJECT RULES:
   - Do not create a list of Mobjects and then call .animate on the list.
     Wrong:
       edge_line = [line for line in edges if ...]
       self.play(edge_line.animate.set_color(YELLOW))
     Correct:
       edge_line = edge_lines[("A", "B")]
       self.play(edge_line.animate.set_color(YELLOW))
       or unpack individual animations: self.play(*[e.animate.set_color(YELLOW) for e in edge_list])
   - Valid Manim animation functions: Create(obj), Write(obj), FadeIn(obj), GrowArrow(arrow), Transform(a, b), ReplacementTransform(a, b), Indicate(obj), Circumscribe(obj).
   - For continuous dynamic updates: use ValueTracker and always_redraw(lambda: <constructor>). Do NOT use UpdateFromFunc with 0-arg lambdas.

8. LAYOUT & POINTER LANES:
   - Header Zone (y in [3.0, 3.5]): Short title & subtitle.
   - Main Stage (y in [-1.5, 1.5], x in [-6.0, 6.0]): Centered interactive models.
   - Status / Equation Band (y in [-3.5, -2.5]): Step status & complexity badges.
   - Searching / Sorting: LOW/HIGH pointers in lower lane (next_to(box, DOWN)), MID in upper lane (next_to(box, UP)). Never stack pointers!
   - Graph edges must be rendered BEHIND nodes.

9. PACING & OUTPUT FORMAT:
   - Return ONLY valid Python code. No markdown fences, no conversational commentary.
   - Keep the animation reasonably fast and short, timed to match the scene narration.
   - Use simple and reliable Manim constructs rather than complicated geometry calculations.`;

function cleanPythonCode(raw: string): string {
  let code = raw.trim();
  if (code.startsWith('```')) {
    code = code.replace(/^```(?:python)?\s*\n?/i, '');
    code = code.replace(/\n?```\s*$/i, '');
  }
  return code.trim();
}

function assembleFullScript(userCode: string): string {
  const cleaned = cleanPythonCode(userCode);
  let baseHeader = 'from manim import *\nimport numpy as np\n';
  if (!cleaned.includes('class LayoutManager:') && !cleaned.includes('class ArrayVisualizer:')) {
    return `${baseHeader}\n${PYTHON_PRIMITIVES_CODE}\n\n${cleaned}`;
  }
  return `${baseHeader}\n${cleaned}`;
}

export async function generateManimScript(
  plan: ManimEducationalPlan,
  sceneDurations?: Record<string, number>,
): Promise<ManimScriptResult> {
  const groq = getGroqClient();
  if (!groq) {
    console.warn('[manimGenerator] GROQ_API_KEY not configured — using canonical Manim script.');
    const code = getMockManimScript(plan.topic);
    return {code: assembleFullScript(code), sceneClassName: 'AutoTeach', plan};
  }

  const domain = plan.domainAnalysis?.domain || plan.subject || 'General Science';
  const concept = plan.domainAnalysis?.conceptType || 'concept';
  const visualizer = plan.domainAnalysis?.visualizerType || 'GenericVisualizer';
  const exampleDataStr = plan.domainAnalysis?.exampleData ? JSON.stringify(plan.domainAnalysis.exampleData, null, 2) : '';

  const scenesPrompt = plan.scenes
    .map((s, i) => {
      const dur = sceneDurations?.[s.id] ?? s.estimatedDuration ?? 10;
      return `Scene ${i + 1} (${s.id}) [Duration: ~${dur.toFixed(1)}s]:
- Purpose: ${s.purpose}
- Spoken Narration: "${s.narration}"
- Visual Objective: ${s.visualObjective}
- Key Entities: ${s.keyEntities?.join(', ') || 'Mathematical objects'}
- Transformations: ${s.transformations?.join(', ') || 'Create, Transform'}`;
    })
    .join('\n\n');

  const prompt = `TOPIC: ${plan.topic}
DOMAIN: ${domain} (Subdomain: ${plan.domainAnalysis?.subdomain || 'General'})
CONCEPT TYPE: ${concept}
RECOMMENDED VISUALIZER: ${visualizer}
CONCRETE EXAMPLE DATA TO USE:
${exampleDataStr}

LEARNING OBJECTIVE: ${plan.learningObjective}

SCENE STRUCTURE & TIMINGS:
${scenesPrompt}

Write a complete working Manim Community Edition v0.19+ Python script inside 'class AutoTeach(Scene)' explaining '${plan.topic}'.`;

  let currentCode = '';
  let lastError = '';

  for (let attempt = 1; attempt <= MAX_MANIM_RETRIES + 1; attempt++) {
    try {
      const messages: Array<{role: 'system' | 'user' | 'assistant'; content: string}> = [
        {role: 'system', content: MANIM_SYSTEM_PROMPT},
      ];

      if (attempt === 1) {
        messages.push({role: 'user', content: prompt});
      } else {
        messages.push({role: 'user', content: prompt});
        messages.push({role: 'assistant', content: currentCode});
        messages.push({
          role: 'user',
          content: `Your previous Manim Python script failed validation with this error:
${lastError}

Fix the error and return the complete corrected Python code inside 'class AutoTeach(Scene)'. Use Text(...) with Unicode instead of MathTex. Never compare point arrays with ==. Ensure all objects use the available visual primitives and stay within screen bounds.`,
        });
      }

      const response = await groq.chat.completions.create({
        model: DEFAULT_GROQ_MODEL,
        messages,
        temperature: 0.15,
      });

      currentCode = cleanPythonCode(response.choices[0]?.message?.content ?? '');
      const fullScript = assembleFullScript(currentCode);

      // Validate Python AST & API safety
      const validation = await validateManimScript(fullScript, 'AutoTeach');
      if (!validation.valid) {
        lastError = validation.error || 'Validation error';
        console.warn(`[manimGenerator] Validation failed on attempt ${attempt}: ${lastError}`);
        continue;
      }

      return {
        code: fullScript,
        sceneClassName: validation.sceneClassName || 'AutoTeach',
        plan,
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.warn(`[manimGenerator] Generation error on attempt ${attempt}: ${msg}`);
      lastError = msg;
    }
  }

  console.warn('[manimGenerator] Max retries reached — falling back to canonical script.');
  const fallback = getMockManimScript(plan.topic);
  return {
    code: assembleFullScript(fallback),
    sceneClassName: 'AutoTeach',
    plan,
  };
}

export async function repairManimScript(
  failedCode: string,
  runtimeError: string,
  plan: ManimEducationalPlan,
): Promise<ManimScriptResult> {
  const groq = getGroqClient();
  if (!groq) {
    return {
      code: assembleFullScript(getMockManimScript(plan.topic)),
      sceneClassName: 'AutoTeach',
      plan,
    };
  }

  // Strip injected primitives to keep repair prompt well under token limits
  let sceneOnlyCode = failedCode;
  const classIdx = sceneOnlyCode.indexOf('class AutoTeach');
  if (classIdx !== -1) {
    sceneOnlyCode = sceneOnlyCode.substring(classIdx);
  } else {
    const sceneIdx = sceneOnlyCode.indexOf('class ');
    if (sceneIdx !== -1) {
      sceneOnlyCode = sceneOnlyCode.substring(sceneIdx);
    }
  }

  const prompt = `The following Manim Community Python script for topic "${plan.topic}" failed during rendering with this error:

RUNTIME ERROR:
${runtimeError}

FAILED SCRIPT:
${sceneOnlyCode}

Fix the script so it renders cleanly. Remember:
1. ONLY use Text(...) with Unicode symbols (never MathTex or Tex).
2. Never compare point arrays using == or !=. Use np.allclose(...) or np.linalg.norm(...) < 0.01.
3. For graph algorithms, use an explicit dictionary for edges (e.g. edge_lines[("A", "B")]).
4. Do not call .animate on a list of Mobjects.
5. ONLY use Create(obj), Write(obj), GrowArrow(arrow), Transform(a, b), ReplacementTransform(a, b), Indicate(obj).
6. Return ONLY valid Python code inside 'class AutoTeach(Scene)'.`;

  try {
    const response = await groq.chat.completions.create({
      model: DEFAULT_GROQ_MODEL,
      messages: [
        {role: 'system', content: MANIM_SYSTEM_PROMPT},
        {role: 'user', content: prompt},
      ],
      temperature: 0.1,
    });

    const repaired = cleanPythonCode(response.choices[0]?.message?.content ?? '');
    const fullRepaired = assembleFullScript(repaired);
    const validation = await validateManimScript(fullRepaired, 'AutoTeach');
    if (!validation.valid) {
      throw new Error(`Repaired code validation failed: ${validation.error}`);
    }

    return {
      code: fullRepaired,
      sceneClassName: validation.sceneClassName || 'AutoTeach',
      plan,
    };
  } catch (err) {
    console.warn(`[manimGenerator] Automated repair failed (${err}). Falling back to canonical script.`);
    return {
      code: assembleFullScript(getMockManimScript(plan.topic)),
      sceneClassName: 'AutoTeach',
      plan,
    };
  }
}
