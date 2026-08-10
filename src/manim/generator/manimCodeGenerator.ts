/**
 * Stage 2: Groq Manim Python Code Generator with Subject-Aware Deterministic Primitives.
 *
 * Enforces strict anti-overlap layout discipline, clean scene-to-scene transitions,
 * and exact per-scene audio-visual timing synchronization.
 */
import {getGroqClient, DEFAULT_GROQ_MODEL} from '../../groq/groqClient';
import type {ManimEducationalPlan, ManimScriptResult} from '../types';
import {validateManimScript} from '../validator/manimValidator';
import {getMockManimScript} from './mockManimScript';
import {PYTHON_PRIMITIVES_CODE} from './pythonPrimitives';

const MAX_MANIM_RETRIES = 2;

const MANIM_SYSTEM_PROMPT = `You are EduVision's master Manim Community Edition (v0.19+) Python animator (inspired by 3Blue1Brown).
Write a complete, working, bug-free Manim Community script that visually explains the requested topic.

================================================================================
CRITICAL ANTI-OVERLAP & AUDIO-SYNCHRONIZATION RULES:
================================================================================

1. EXACT PER-SCENE DURATION MATCHING (AUDIO SYNC):
   - You will be given the EXACT measured Audio Duration for each scene (e.g. Scene 1 = 7.5s, Scene 2 = 9.2s).
   - In Python, the sum of all self.play(..., run_time=X) and self.wait(Y) inside each Scene section MUST EQUAL that scene's Audio Duration (+/- 0.3s).
   - Example: If Scene 1 Audio is 7.5s:
     self.play(FadeIn(header), run_time=1.0)
     self.play(Create(graph.get_group()), run_time=2.0)
     self.play(Write(status1), run_time=1.5)
     self.wait(3.0)  # 1.0 + 2.0 + 1.5 + 3.0 = 7.5s exact match!
   - NEVER rush to the next scene before the current scene's narration duration is completed.

2. ZERO OVERLAPPING TEXTS & SHAPES:
   - NEVER create new Text / Shapes over existing ones!
   - When updating the bottom status bar, ALWAYS use:
     self.play(ReplacementTransform(status1, status2), run_time=1.2)
     or:
     self.play(FadeOut(status1), FadeIn(status2), run_time=1.2)
   - When changing equations or explanation cards, FadeOut the old ones before displaying new ones.
   - At the transition between scenes (e.g. Scene 1 -> Scene 2), clean up temporary objects:
     self.play(FadeOut(scene1_temp_group), run_time=0.8)

3. LAYOUT-FIRST SPATIAL ZONES (Screen bounds: x in [-7, 7], y in [-4, 4]):
   - Top Header Zone (y in [3.0, 3.5]): LayoutManager.create_header(title, subtitle). ONLY ONE header on screen!
   - Main Stage Zone (y in [-1.5, 1.8], x in [-5.8, 5.8]): Centered diagrams, graphs, arrays, or models.
   - Status / Equation Band (y in [-3.5, -2.5]): LayoutManager.create_status_bar(text). ONLY ONE status bar on screen!
   - Never place objects at the exact same coordinates. Use next_to(obj, DIRECTION, buff=0.2).

4. DETERMINISTIC VISUAL PRIMITIVES LIBRARY (Already available in scope):
   - LayoutManager: create_header(title, sub), create_status_bar(text), safe_scale(mob)
   - ArrayVisualizer(values, box_size=0.8, color=BLUE_D, font_size=22, show_indices=True)
     Methods: .get_group(), .get_element(i), .get_box(i), .get_val_mob(i), .create_pointer(i, label, is_upper=False)
   - LinkedListVisualizer(values) -> .get_group()
   - TreeVisualizer(root_val, tree_dict) -> .get_group()
   - GraphVisualizer(positions_dict, edge_pairs) -> .get_group(), .set_visited(name, color)
   - KinematicsVisualizer.create_canvas(x_max=10, y_max=6) -> axes, ground
   - MoleculeVisualizer.make_atom(symbol, color, radius), .make_bond(a1, a2)
   - CircuitVisualizer.create_rc_circuit(voltage=12, resistance=4) -> VGroup
   - MatrixVisualizer.create_matrix(matrix_vals) -> VGroup

5. NUMPY / MANIM ARRAY COMPARISON RULE:
   - Never compare Manim point arrays using == or !=.
   - Use np.allclose(line.get_start(), point) or np.linalg.norm(line.get_start() - point) < 0.01.

6. GRAPH ALGORITHMS EDGE MAPPING RULE:
   - DO NOT search through edges by comparing coordinates.
   - Use an explicit dictionary:
     edge_lines = {}
     edge_lines[("A", "B")] = Line(nodes["A"].get_center(), nodes["B"].get_center())
     self.play(edge_lines[("A", "B")].animate.set_color(YELLOW))

7. ANIMATION LIST & MOBJECT RULES:
   - Do not call .animate on Python lists. Unpack instead: self.play(*[e.animate.set_color(YELLOW) for e in edge_list])
   - Valid Manim animation functions: Create(obj), Write(obj), FadeIn(obj), GrowArrow(arrow), Transform(a, b), ReplacementTransform(a, b), Indicate(obj), Circumscribe(obj).
   - Dynamic updates: ValueTracker and always_redraw(lambda: <constructor>).

8. TEXT & MATH RULES:
   - NEVER use MathTex(...) or Tex(...) (LaTeX is not installed).
   - ALWAYS use Text() with Unicode characters for normal text, labels, and math formulas.
   - Do NOT use external files, images, or fonts.

9. OUTPUT FORMAT:
   - Return ONLY executable Python code inside 'class AutoTeach(Scene):'.
   - No markdown fences (\`\`\`python ... \`\`\`), no conversational commentary.`;

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
  let baseHeader = 'from manim import *\nimport numpy as np\nimport math\n';
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
      return `SCENE ${i + 1} (${s.id}) [AUDIO DURATION: EXACTLY ${dur.toFixed(1)}s]:
- Purpose: ${s.purpose}
- Spoken Narration: "${s.narration}"
- Visual Goal: ${s.visualObjective}
- Key Entities: ${s.keyEntities?.join(', ') || 'Mathematical objects'}
- REQUIRED MANIM RUNTIME: Sum of all self.play(..., run_time=X) and self.wait(Y) in Scene ${i + 1} MUST equal ${dur.toFixed(1)}s!
- CLEANUP REQUIREMENT: At the end of this scene, fade out temporary labels/cards before Scene ${i + 2} starts.`;
    })
    .join('\n\n');

  const prompt = `TOPIC: ${plan.topic}
DOMAIN: ${domain} (Subdomain: ${plan.domainAnalysis?.subdomain || 'General'})
CONCEPT TYPE: ${concept}
RECOMMENDED VISUALIZER: ${visualizer}
CONCRETE EXAMPLE DATA TO USE:
${exampleDataStr}

LEARNING OBJECTIVE: ${plan.learningObjective}

SCENE STRUCTURE & PRECISE TIMINGS:
${scenesPrompt}

Write the complete Python script inside 'class AutoTeach(Scene)'.
CRITICAL:
1. Ensure each Scene section's animation + wait timings EXACTLY match the specified Audio Duration.
2. Clean up temporary objects between scenes so nothing overlaps.
3. Use ReplacementTransform for status updates so text never stacks.`;

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

Fix the error and return the complete corrected Python code inside 'class AutoTeach(Scene)'.
Remember:
- Use Text(...) with Unicode instead of MathTex.
- Never compare point arrays with ==.
- Match each scene's total animation duration to its audio duration.
- Fade out previous objects so texts and shapes never overlap.`,
        });
      }

      const response = await groq.chat.completions.create({
        model: DEFAULT_GROQ_MODEL,
        messages,
        temperature: 0.15,
        max_tokens: 4096,
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
6. Clean up temporary scene elements and use ReplacementTransform for status bars to prevent overlapping objects.
7. Return ONLY valid Python code inside 'class AutoTeach(Scene)'.`;

  try {
    const response = await groq.chat.completions.create({
      model: DEFAULT_GROQ_MODEL,
      messages: [
        {role: 'system', content: MANIM_SYSTEM_PROMPT},
        {role: 'user', content: prompt},
      ],
      temperature: 0.1,
      max_tokens: 4096,
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
