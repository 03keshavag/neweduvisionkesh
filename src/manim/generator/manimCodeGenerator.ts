/**
 * Stage 2: Groq Manim Python Code Generator with 3Blue1Brown-inspired visual quality,
 * dynamic API contract injection, zero-break generalization, and spatial zoning.
 */
import {getGroqClient, DEFAULT_GROQ_MODEL} from '../../groq/groqClient';
import type {ManimEducationalPlan, ManimScriptResult} from '../types';
import {validateManimScript} from '../validator/manimValidator';
import {getMockManimScript} from './mockManimScript';
import {PYTHON_PRIMITIVES_CODE} from './pythonPrimitives';
import {CUSTOM_API_CONTRACT} from './apiRegistry';

const MAX_MANIM_RETRIES = 2;

const MANIM_SYSTEM_PROMPT = `You are EduVision's master Manim Community Edition (v0.19+) Python animator, producing 3Blue1Brown-style educational visualizations for ANY scientific, mathematical, or algorithmic concept.
Write a complete, working, bug-free Manim Community script that visually explains the requested topic.

================================================================================
3BLUE1BROWN VISUAL PHILOSOPHY & SPATIAL ZONING:
================================================================================

1. SPATIAL ZONES ON 1920x1080 CANVAS (x in [-6.5, 6.5], y in [-3.6, 3.6]):
   - TOP HEADER ZONE (y in [3.0, 3.5]): Short title & concept badge (LayoutManager.create_header).
   - MAIN STAGE ZONE (y in [-1.6, 1.8], x in [-5.8, 5.8]): Centered, dominant interactive visual model.
   - BOTTOM STATUS & EQUATION ZONE (y in [-3.4, -2.4]): Step explanations & formula badges (LayoutManager.create_status_bar, LayoutManager.create_equation_card).
   - 100px Safe Margins: Never position elements against the frame edges.

2. ONE MAIN IDEA PER SCENE & CLEAN CANVAS TRANSITIONS:
   - Introduce concepts sequentially. Never display all concepts at once.
   - At the beginning of Scene 2, Scene 3, and Scene 4, ALWAYS clean the stage using:
     self.clear_stage(preserve=header)
   - When updating the bottom status bar, ALWAYS use:
     self.play(ReplacementTransform(status1, status2), run_time=1.0)
     or:
     self.play(FadeOut(status1), FadeIn(status2), run_time=1.0)

3. UNIVERSAL VISUALIZATION STRATEGY (STANDARD MANIM + OPTIONAL HELPERS):
   - Custom helper classes below are OPTIONAL conveniences.
   - If a topic does NOT have a dedicated helper (e.g. Doppler Effect, Fourier Transform, Bayes Theorem, AVL Trees, Carnot Cycle, TCP Handshake, Chemical Reactions, Geometry), build the visual directly using STANDARD MANIM PRIMITIVES:
     Scene, VGroup, Circle, Square, Rectangle, RoundedRectangle, Line, Arrow, DoubleArrow, CurvedArrow, Dot, Arc, Axes, NumberPlane, Text, SurroundingRectangle, Brace, etc.
   - NEVER hallucinate non-existent methods on custom classes. Only use methods documented in the API Contract below.

${CUSTOM_API_CONTRACT}

4. ZERO OBJECT / LABEL / EQUATION OVERLAP:
   - Labels must never collide with diagrams, arrows, vectors, or equations.
   - Use standard Manim positioning: next_to(obj, direction, buff=0.25). (Always 'buff', NEVER 'buffer').
   - Wrap complex groups in VGroup and position as a single unit.

5. EXACT DURATION & TIMING SYNCHRONIZATION:
   - Sum of all self.play(..., run_time=X) and self.wait(Y) inside each Scene section MUST EQUAL that scene's Audio Duration (+/- 0.3s).
   - NEVER write subtraction expressions in wait: self.wait(total - (a + b)) is forbidden.
   - ALWAYS use positive constant durations: self.wait(2.5). Every duration must be > 0.

6. 3D COORDINATES ONLY:
   - ALL points, positions, and shift vectors MUST BE 3-ELEMENT 3D ARRAYS: np.array([x, y, 0]) or vec3(x, y) or deg_to_vec(deg, length).
   - NEVER create 2-element arrays like np.array([math.cos(...), math.sin(...)])!

7. TEXT & MATH RULES:
   - NEVER use MathTex(...) or Tex(...) (LaTeX is not installed).
   - ALWAYS use Text() with Unicode characters for normal text, labels, and math formulas.

8. RAW PYTHON OUTPUT:
   - Start directly with:
     class AutoTeach(Scene):
         def construct(self):
             self.camera.background_color = "#070b14"
   - Output ONLY valid Python code. No markdown fences, no commentary.`;

const REPAIR_SYSTEM_PROMPT = `You are an expert Python and Manim Community (v0.19+) debugger.
Fix the specific error in the user's Python script.
Return ONLY valid Python code inside 'class AutoTeach(Scene):'.
All code must be directly inside construct(self).
Ensure all expressions are complete, all vectors are 3D np.array([x, y, 0]), and all self.wait(duration) durations are strictly positive constants.
Do NOT output reasoning, markdown fences, or conversational text.

${CUSTOM_API_CONTRACT}`;

function cleanPythonCode(raw: string): string {
  let code = raw.trim();

  // 1. Strip reasoning / think tags if present
  code = code.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();

  // 2. Strip markdown code fences
  if (code.includes('```')) {
    const match = code.match(/```(?:python)?\s*([\s\S]*?)```/i);
    if (match) {
      code = match[1].trim();
    } else {
      code = code.replace(/^```(?:python)?\s*\n?/i, '');
      code = code.replace(/\n?```\s*$/i, '');
    }
  }

  // 3. Strip any conversational preamble before Python code begins
  const codeStartMatch = code.match(/(from manim import|import numpy|import math|class AutoTeach|class \w+\(Scene\):)/);
  if (codeStartMatch && codeStartMatch.index !== undefined && codeStartMatch.index > 0) {
    code = code.substring(codeStartMatch.index);
  }

  return code.trim();
}

function assembleFullScript(userCode: string): string {
  let cleaned = cleanPythonCode(userCode);
  // Strip redundant re-imports from user code so SafeText is never overwritten
  cleaned = cleaned.replace(/^\s*(?:from manim import \*|import numpy as np|import math)\s*\n?/gm, '').trim();
  let baseHeader = 'from manim import *\nimport numpy as np\nimport math\n';
  if (!cleaned.includes('class LayoutManager:') && !cleaned.includes('class ArrayVisualizer:')) {
    return `${baseHeader}\n${PYTHON_PRIMITIVES_CODE}\n\n${cleaned}`;
  }
  return `${baseHeader}\n${cleaned}`;
}

function extractCleanError(rawError: string): string {
  const clean = rawError.replace(/\x1B\[[0-9;]*[a-zA-Z]/g, '');
  const lines = clean.split('\n');
  const relevant: string[] = [];
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    if (
      trimmed.includes('Error:') ||
      trimmed.includes('SyntaxError') ||
      trimmed.includes('NameError') ||
      trimmed.includes('TypeError') ||
      trimmed.includes('ValueError') ||
      trimmed.includes('AttributeError') ||
      trimmed.includes('Invalid timing') ||
      trimmed.includes('line ') ||
      trimmed.startsWith('self.')
    ) {
      relevant.push(trimmed);
    }
  }
  return relevant.slice(-6).join('\n') || clean.slice(0, 300);
}

export async function generateManimScript(
  plan: ManimEducationalPlan,
  sceneDurations?: Record<string, number>,
): Promise<ManimScriptResult> {
  const groq = getGroqClient();
  if (!groq) {
    console.warn('[manimGenerator] GROQ_API_KEY not configured — using canonical Manim script.');
    const code = getMockManimScript(plan.topic);
    return {
      code: assembleFullScript(code),
      sceneClassName: 'AutoTeach',
      plan,
      generationSource: 'fallback',
      isFallback: true,
    };
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
- REQUIRED RUNTIME: Sum of all self.play run_times + self.wait in this scene MUST equal ${dur.toFixed(1)}s!
- CLEANUP: At start of this scene (if i > 0), call self.clear_stage(preserve=header) to clear previous scene shapes.`;
    })
    .join('\n\n');

  const prompt = `TOPIC: ${plan.topic}
DOMAIN: ${domain} (Subdomain: ${plan.domainAnalysis?.subdomain || 'General'})
CONCEPT TYPE: ${concept}
RECOMMENDED VISUALIZER: ${visualizer}
CONCRETE EXAMPLE DATA TO USE:
${exampleDataStr}

LEARNING OBJECTIVE: ${plan.learningObjective}

SCENE STRUCTURE & EXACT TIMINGS:
${scenesPrompt}

Write the complete Python script inside 'class AutoTeach(Scene)' explaining '${plan.topic}'.
Write all code directly inside 'def construct(self):'. Use self.clear_stage(preserve=header) between scenes so text and shapes never overlap.
Ensure all mathematical expressions are complete and all self.wait() durations are positive constants.`;

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
        messages.push({
          role: 'user',
          content: `${prompt}

IMPORTANT CORRECTION FOR PREVIOUS ATTEMPT:
Your previous code had this validation error:
${lastError}

Fix this error and return the complete corrected Python code inside 'class AutoTeach(Scene):'.
Ensure all mathematical expressions are complete (e.g. t_apex = v0y / g), all wait durations are positive constants, and all vectors are 3D np.array([x, y, 0]).`,
        });
      }

      const response = await groq.chat.completions.create({
        model: DEFAULT_GROQ_MODEL,
        messages,
        temperature: 0.2,
        max_tokens: 4096,
        // @ts-ignore - Groq reasoning parameter for Qwen / reasoning models
        reasoning_format: 'hidden',
      });

      currentCode = cleanPythonCode(response.choices[0]?.message?.content ?? '');
      const fullScript = assembleFullScript(currentCode);

      // Validate Python AST, timing & API safety
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
        generationSource: 'groq',
        isFallback: false,
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
    generationSource: 'fallback',
    isFallback: true,
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
      generationSource: 'fallback',
      isFallback: true,
    };
  }

  // Strip injected primitives to keep repair prompt well under token limits (< 1200 tokens)
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

  const cleanErr = extractCleanError(runtimeError);

  // Identify failure type for targeted instructions
  let specificDirective = 'Fix the error so the script runs cleanly.';
  if (cleanErr.includes('SyntaxError')) {
    specificDirective = 'Fix incomplete mathematical statements (e.g. complete t_apex = v0y / g) or unclosed parentheses.';
  } else if (cleanErr.includes('wait') || cleanErr.includes('Invalid timing') || cleanErr.includes('duration')) {
    specificDirective = 'Fix timing: ensure all self.wait(...) calls use positive constant numbers (e.g. self.wait(2.0)). Never use negative values or complex subtraction.';
  } else if (cleanErr.includes('broadcast') || cleanErr.includes('shape')) {
    specificDirective = 'Fix coordinate vectors: ensure all vectors are 3D (np.array([x, y, 0])).';
  } else if (cleanErr.includes('AttributeError')) {
    specificDirective = 'Fix attribute error: write all animation code directly inside construct(self) using only real Manim or API contract methods.';
  } else if (cleanErr.includes('NameError')) {
    specificDirective = 'Fix undefined variable: define or import the required symbol.';
  }

  const prompt = `TOPIC: "${plan.topic}"

ERROR:
${cleanErr}

FAILED SCRIPT:
${sceneOnlyCode}

INSTRUCTION:
${specificDirective}
Return ONLY the complete corrected Python code inside 'class AutoTeach(Scene):'.`;

  try {
    const response = await groq.chat.completions.create({
      model: DEFAULT_GROQ_MODEL,
      messages: [
        {role: 'system', content: REPAIR_SYSTEM_PROMPT},
        {role: 'user', content: prompt},
      ],
      temperature: 0.2,
      max_tokens: 4096,
      // @ts-ignore - Groq reasoning parameter for Qwen / reasoning models
      reasoning_format: 'hidden',
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
      generationSource: 'groq',
      isFallback: false,
    };
  } catch (err) {
    console.warn(`[manimGenerator] Automated repair failed (${err}). Falling back to canonical script.`);
    return {
      code: assembleFullScript(getMockManimScript(plan.topic)),
      sceneClassName: 'AutoTeach',
      plan,
      generationSource: 'fallback',
      isFallback: true,
    };
  }
}
