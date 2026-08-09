/**
 * Mock lesson builder — DEVELOPMENT/TESTING ONLY.
 *
 * Used by the pipeline only when GROQ_API_KEY is not configured, so the full
 * website → TTS → Remotion → MP4 flow can be exercised without an API key.
 * Content is generic/templated; swap the key and real Groq lessons are used
 * automatically. Never used when a key is present.
 */
import type {Lesson, LessonInput, LessonScene} from '../lesson/lessonTypes';

export function buildMockLesson(input: LessonInput): Lesson {
  const {topic, language, ageGroup} = input;

  const scenes: LessonScene[] = [
    {
      id: 1,
      type: 'intro',
      duration: 10,
      narration: `This lesson introduces ${topic}.`,
      onScreenText: [topic, 'Lesson introduction'],
      visualDescription: `Title card showing the topic "${topic}" with a book icon.`,
    },
    {
      id: 2,
      type: 'content',
      duration: 18,
      narration: `Let us explore the key ideas of ${topic} step by step, in ${language}.`,
      onScreenText: [`About ${topic}`, 'Key points', 'Simple explanations'],
      visualDescription:
        'Animated chalkboard with a few bullet points appearing one by one.',
    },
    {
      id: 3,
      type: 'example',
      duration: 14,
      narration: `Here is an interesting example connected to ${topic}.`,
      onScreenText: [`Example: ${topic}`],
      visualDescription: 'Illustration panel showing a relevant example visual.',
    },
    {
      id: 4,
      type: 'activity',
      duration: 14,
      narration: `Let us look at the timeline for ${topic}.`,
      onScreenText: ['Step one', 'Step two', 'Step three'],
      visualDescription: 'Horizontal timeline revealing three steps one by one.',
    },
    {
      id: 5,
      type: 'summary',
      duration: 10,
      narration: `To summarise, ${topic} is a rich and important subject to learn.`,
      onScreenText: [`Summary of ${topic}`],
      visualDescription: 'A highlighted key-fact callout box.',
    },
    {
      id: 6,
      type: 'conclusion',
      duration: 8,
      narration: `Thank you for learning about ${topic} with EduVision.`,
      onScreenText: ['Thank you', 'Keep learning'],
      visualDescription: 'Closing splash with the EduVision brand.',
    },
  ];

  const estimatedDuration = scenes.reduce((sum, s) => sum + s.duration, 0);

  return {
    title: `${topic} — EduVision Lesson`,
    topic,
    language,
    ageGroup: ageGroup ?? '',
    estimatedDuration,
    learningObjectives: [
      `Understand the basics of ${topic}`,
      `Recall the main points about ${topic}`,
    ],
    scenes,
    quiz: [],
    sources: [],
  };
}
