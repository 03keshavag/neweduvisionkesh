/**
 * Stage 1: Groq Educational Planner for Subject-Aware Manim Animations.
 *
 * Classifies topic into a visual domain, selects deterministic example data,
 * and generates a progressive 3-4 scene storyboard with explicit visual operations.
 */
import {getGroqClient, DEFAULT_GROQ_MODEL} from '../../groq/groqClient';
import type {LessonInput} from '../../lesson/lessonTypes';
import type {ManimEducationalPlan} from '../types';
import {classifyTopicDomain} from './domainClassifier';
import {getMockManimPlan} from '../generator/mockManimScript';

const PLANNER_SYSTEM_PROMPT = `You are EduVision's master mathematical and scientific storyboard director (in the educational spirit of 3Blue1Brown).
Your goal is to produce a structured JSON educational plan that will guide a Python Manim animation script.

GUIDELINES:
1. Return ONLY a single valid JSON object. No markdown fences, no explanatory text.
2. Structure the lesson into 3-4 concise, progressive scenes (TOTAL DURATION: 30-40 seconds).
3. Use the provided Domain Classification and Example Data to ensure concrete visual operations.
4. Keep the lesson punchy and not overly lengthy:
   - "narration": Learner-facing spoken explanation in the requested language (20-30 words per scene, ~6-9 seconds of natural speech).
   - "visualObjective": Concrete visual operations using the specified example values (e.g. "Create ArrayVisualizer([3, 8, 12, 17, 23]) and point MID at index 3").
   - "keyEntities": List of specific visual objects.
   - "transformations": Active animations (Create, Write, FadeIn, ReplacementTransform, MoveAlongPath, ValueTracker, etc.).
5. The visual model must genuinely demonstrate the mechanism (no abstract empty placeholders or static slides).

JSON SCHEMA:
{
  "id": "plan-id",
  "title": "Lesson Title",
  "topic": "The Topic",
  "subject": "Physics | Mathematics | Chemistry | Biology | Computer Science | Electronics | Statistics | Data Structures | Algorithms | Engineering | General Science",
  "language": "English",
  "learningObjective": "Core understanding to achieve",
  "totalEstimatedDuration": 35,
  "scenes": [
    {
      "id": "scene-1",
      "purpose": "Setup & Frame of Reference",
      "narration": "Spoken narration in target language (20-30 words)...",
      "estimatedDuration": 8,
      "visualObjective": "Clear description of visual scene using concrete numbers/entities",
      "keyEntities": ["ArrayVisualizer", "PointerLaneManager"],
      "transformations": ["Create", "Write"]
    }
  ]
}`;

export async function generateEducationalPlan(input: LessonInput): Promise<ManimEducationalPlan> {
  const domainAnalysis = classifyTopicDomain(input.topic);

  const groq = getGroqClient();
  if (!groq) {
    console.warn('[manimPlanner] GROQ_API_KEY not configured — using mock educational plan.');
    return getMockManimPlan(input.topic, input.language);
  }

  const prompt = `Topic: ${input.topic}
Language: ${input.language}
Target Audience: ${input.ageGroup || 'High school / undergraduate'}

DOMAIN CLASSIFICATION:
- Domain: ${domainAnalysis.domain}
- Subdomain: ${domainAnalysis.subdomain}
- Concept Type: ${domainAnalysis.conceptType}
- Recommended Visualizer: ${domainAnalysis.visualizerType}
- Concrete Example Data: ${JSON.stringify(domainAnalysis.exampleData, null, 2)}
- Key Entities: ${domainAnalysis.entities.join(', ')}
- Transformations: ${domainAnalysis.transformations.join(' -> ')}

Generate the structured educational plan for Manim using these concrete values.`;

  try {
    const response = await groq.chat.completions.create({
      model: DEFAULT_GROQ_MODEL,
      messages: [
        {role: 'system', content: PLANNER_SYSTEM_PROMPT},
        {role: 'user', content: prompt},
      ],
      temperature: 0.2,
      max_tokens: 3000,
      response_format: {type: 'json_object'},
      // @ts-ignore - Groq reasoning parameter for Qwen / reasoning models
      reasoning_format: 'hidden',
    });

    let raw = response.choices[0]?.message?.content ?? '';
    // Strip reasoning / think tags if emitted
    raw = raw.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
    if (raw.startsWith('```')) {
      raw = raw.replace(/^```(?:json)?\s*\n?/i, '').replace(/\n?```\s*$/i, '').trim();
    }
    const parsed = JSON.parse(raw) as ManimEducationalPlan;
    if (!parsed.scenes || parsed.scenes.length === 0) {
      throw new Error('Educational plan has no scenes.');
    }
    return {
      id: parsed.id || `plan-${Date.now()}`,
      title: parsed.title || input.topic,
      topic: input.topic,
      subject: parsed.subject || domainAnalysis.domain,
      domainAnalysis,
      language: input.language,
      ageGroup: input.ageGroup,
      learningObjective: parsed.learningObjective || `Understand ${input.topic}`,
      scenes: parsed.scenes,
      totalEstimatedDuration: parsed.scenes.reduce((acc, s) => acc + (s.estimatedDuration || 10), 0),
    };
  } catch (err) {
    console.warn(`[manimPlanner] Groq planner call or parsing failed (${err}) — falling back to canonical plan.`);
    const mock = getMockManimPlan(input.topic, input.language);
    mock.domainAnalysis = domainAnalysis;
    return mock;
  }
}
