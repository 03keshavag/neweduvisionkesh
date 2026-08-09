/**
 * Mock AnimationPlan builder — DEVELOPMENT/TESTING ONLY.
 *
 * Used by the pipeline only when GROQ_API_KEY is not configured. It builds a
 * topic-adaptive animated explainer (blocks + arrows + timeline + callout)
 * so the website → TTS → Remotion → MP4 flow still exercises the flexible
 * engine without an API key. Never used when a key is present.
 */
import type {AnimationPlan, AnimationScene} from '../engine/types';
import type {LessonInput} from '../lesson/lessonTypes';

export function buildMockPlan(input: LessonInput): AnimationPlan {
  const {topic, language, ageGroup} = input;
  const audience = ageGroup ? ` for ${ageGroup}` : '';

  const scenes: AnimationScene[] = [
    {
      id: 'intro',
      purpose: 'Title card that introduces the topic',
      narration: `Let us learn about ${topic}${audience}. This lesson explains the most important ideas with simple animated visuals.`,
      duration: 9,
      onScreenLabels: ['EduVision'],
      elements: [
        {id: 'title', type: 'title', position: {x: 500, y: 200}, props: {text: topic, fontSize: 84}},
        {id: 'sub', type: 'label', position: {x: 640, y: 340}, props: {text: 'An animated explainer', color: '#38b6ff'}},
        {id: 'orb', type: 'circle', position: {x: 880, y: 480}, props: {radius: 90, fill: 'rgba(56,182,255,0.30)', stroke: '#38b6ff'}},
      ],
      animations: [
        {id: 'a1', type: 'fadeIn', targetId: 'title', startTime: 0.4, duration: 0.8},
        {id: 'a2', type: 'fadeIn', targetId: 'sub', startTime: 1.8, duration: 0.7},
        {id: 'a3', type: 'create', targetId: 'orb', startTime: 2.6, duration: 1.2},
      ],
      transition: {type: 'fade', duration: 0.4},
    },
    {
      id: 'key-ideas',
      purpose: 'Three key idea blocks connected by arrows',
      narration: `Here are the key ideas about ${topic} that we will explore today.`,
      duration: 10,
      onScreenLabels: ['Key Ideas'],
      elements: [
        {id: 'b1', type: 'infoCard', position: {x: 300, y: 340}, props: {title: 'Idea 1', text: 'Core concept behind the topic', color: '#f4a300'}},
        {id: 'ar1', type: 'arrow', position: {x: 745, y: 380}, props: {from: {x: 0, y: 0}, to: {x: 120, y: 0}, color: '#f4a300'}},
        {id: 'b2', type: 'infoCard', position: {x: 900, y: 340}, props: {title: 'Idea 2', text: 'How it connects to everyday life', color: '#38b6ff'}},
        {id: 'ar2', type: 'arrow', position: {x: 1345, y: 380}, props: {from: {x: 0, y: 0}, to: {x: 120, y: 0}, color: '#38b6ff'}},
        {id: 'b3', type: 'infoCard', position: {x: 1500, y: 340}, props: {title: 'Idea 3', text: 'Why it matters for culture', color: '#3ddc97'}},
      ],
      animations: [
        {id: 'b1a', type: 'fadeIn', targetId: 'b1', startTime: 0.3, duration: 0.6},
        {id: 'b1b', type: 'drawArrow', targetId: 'ar1', startTime: 1.6, duration: 0.6},
        {id: 'b2a', type: 'fadeIn', targetId: 'b2', startTime: 2.2, duration: 0.6},
        {id: 'b2b', type: 'drawArrow', targetId: 'ar2', startTime: 3.5, duration: 0.6},
        {id: 'b3a', type: 'fadeIn', targetId: 'b3', startTime: 4.1, duration: 0.6},
      ],
      transition: {type: 'slide', duration: 0.4},
    },
  ];

  scenes.push(
    {
      id: 'timeline',
      purpose: 'Horizontal process timeline with three steps',
      narration: `We can understand ${topic} step by step, just like following a journey.`,
      duration: 10,
      onScreenLabels: ['Step by Step'],
      elements: [
        {id: 'tline', type: 'line', position: {x: 560, y: 520}, props: {from: {x: 0, y: 0}, to: {x: 800, y: 0}, stroke: 'rgba(255,255,255,0.35)'}},
        {id: 's1', type: 'rectangle', position: {x: 560, y: 400}, props: {width: 170, height: 90, fill: 'rgba(244,163,0,0.22)', stroke: '#f4a300'}},
        {id: 's2', type: 'rectangle', position: {x: 875, y: 400}, props: {width: 170, height: 90, fill: 'rgba(56,182,255,0.22)', stroke: '#38b6ff'}},
        {id: 's3', type: 'rectangle', position: {x: 1190, y: 400}, props: {width: 170, height: 90, fill: 'rgba(61,220,151,0.22)', stroke: '#3ddc97'}},
        {id: 'l1', type: 'label', position: {x: 605, y: 430}, props: {text: 'Start', color: '#f4a300'}},
        {id: 'l2', type: 'label', position: {x: 918, y: 430}, props: {text: 'Middle', color: '#38b6ff'}},
        {id: 'l3', type: 'label', position: {x: 1235, y: 430}, props: {text: 'End', color: '#3ddc97'}},
      ],
      animations: [
        {id: 't1', type: 'fadeIn', targetId: 'tline', startTime: 0.3, duration: 0.6},
        {id: 't2', type: 'create', targetId: 's1', startTime: 1.2, duration: 0.5},
        {id: 't3', type: 'create', targetId: 's2', startTime: 3.0, duration: 0.5},
        {id: 't4', type: 'create', targetId: 's3', startTime: 4.8, duration: 0.5},
        {id: 't5', type: 'highlight', targetId: 's1', startTime: 1.2, duration: 0.3, params: {color: '#f4a300'}},
      ],
      transition: {type: 'fade', duration: 0.4},
    },
    {
      id: 'summary',
      purpose: 'Highlighted takeaway callout',
      narration: `To summarise: ${topic} is a rich topic with simple, powerful ideas worth remembering.`,
      duration: 8,
      onScreenLabels: ['Takeaway'],
      elements: [
        {id: 'call', type: 'highlightedText', position: {x: 560, y: 430}, props: {text: `✓ ${topic} in a nutshell`, fontSize: 56}},
        {id: 'note', type: 'stepCard', position: {x: 420, y: 700}, props: {title: 'Remember', text: 'Explore one key idea at a time, then connect them.', color: '#3ddc97'}},
      ],
      animations: [
        {id: 's1a', type: 'fadeIn', targetId: 'call', startTime: 0.3, duration: 0.8},
        {id: 's2a', type: 'fadeIn', targetId: 'note', startTime: 2.0, duration: 0.7},
      ],
      transition: {type: 'zoom', duration: 0.4},
    },
  );

  return {
    id: 'mock-plan',
    title: `${topic} — EduVision`,
    topic,
    subject: 'General',
    language,
    objective: `Understand the key ideas of ${topic}`,
    fps: 30,
    width: 1920,
    height: 1080,
    totalDuration: scenes.reduce((acc, s) => acc + s.duration, 0),
    scenes,
  };
}