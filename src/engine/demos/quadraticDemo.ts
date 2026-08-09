import type {AnimationPlan} from '../types';

/** Quadratic equation demo — ~45 seconds, 5 scenes */
export const QUADRATIC_DEMO: AnimationPlan = {
  id: 'demo-quadratic',
  title: 'Solving Quadratic Equations',
  topic: 'Quadratic equation',
  subject: 'Mathematics',
  language: 'English',
  objective: 'Factor and solve x² - 5x + 6 = 0',
  fps: 30,
  width: 1920,
  height: 1080,
  totalDuration: 45,
  scenes: [
    {
      id: 'intro',
      purpose: 'Present the equation',
      narration:
        'We begin with a quadratic equation. Our goal is to find the values of x that make this equation true.',
      duration: 8,
      onScreenLabels: ['Quadratic'],
      elements: [
        {
          id: 'title',
          type: 'title',
          position: {x: 560, y: 200},
          props: {text: 'Quadratic Equation'},
        },
        {
          id: 'eq1',
          type: 'equation',
          position: {x: 660, y: 420},
          props: {expression: 'x² − 5x + 6 = 0'},
        },
      ],
      animations: [
        {id: 'a1', type: 'fadeIn', targetId: 'title', startTime: 0.3, duration: 0.8},
        {id: 'a2', type: 'fadeIn', targetId: 'eq1', startTime: 1.5, duration: 1},
      ],
      transition: {type: 'fade', duration: 0.4},
    },
    {
      id: 'factor',
      purpose: 'Show factoring',
      narration:
        'We look for two numbers that multiply to six and add to negative five. Those numbers are negative two and negative three.',
      duration: 10,
      elements: [
        {
          id: 'eq2',
          type: 'equation',
          position: {x: 580, y: 350},
          props: {expression: 'x² − 5x + 6 = 0'},
        },
        {
          id: 'arrow1',
          type: 'arrow',
          position: {x: 860, y: 500},
          props: {from: {x: 0, y: 0}, to: {x: 0, y: 80}, color: '#f4a300'},
        },
        {
          id: 'eq3',
          type: 'equation',
          position: {x: 620, y: 580},
          props: {expression: '(x − 2)(x − 3) = 0'},
        },
        {
          id: 'hl1',
          type: 'highlightedText',
          position: {x: 720, y: 720},
          props: {text: '−2 × −3 = 6  ·  −2 + −3 = −5'},
        },
      ],
      animations: [
        {id: 'b1', type: 'fadeIn', targetId: 'eq2', startTime: 0.2, duration: 0.6},
        {id: 'b2', type: 'fadeIn', targetId: 'eq3', startTime: 2.5, duration: 1},
        {id: 'b3', type: 'fadeIn', targetId: 'hl1', startTime: 4, duration: 0.8},
      ],
      transition: {type: 'slide', duration: 0.4},
    },
    {
      id: 'zero',
      purpose: 'Zero product property',
      narration:
        'If the product equals zero, at least one factor must be zero. So either x minus two equals zero, or x minus three equals zero.',
      duration: 10,
      elements: [
        {
          id: 'eq4',
          type: 'equation',
          position: {x: 640, y: 380},
          props: {expression: '(x − 2)(x − 3) = 0'},
        },
        {
          id: 'line1',
          type: 'line',
          position: {x: 760, y: 520},
          props: {from: {x: 0, y: 0}, to: {x: 400, y: 0}},
        },
        {
          id: 'eq5',
          type: 'equation',
          position: {x: 700, y: 560},
          props: {expression: 'x − 2 = 0   or   x − 3 = 0'},
        },
      ],
      animations: [
        {id: 'c1', type: 'fadeIn', targetId: 'eq4', startTime: 0.2, duration: 0.6},
        {id: 'c2', type: 'fadeIn', targetId: 'eq5', startTime: 2.8, duration: 1},
      ],
      transition: {type: 'fade', duration: 0.4},
    },
    {
      id: 'solutions',
      purpose: 'Show solutions',
      narration: 'Solving each equation gives us our two solutions: x equals two, and x equals three.',
      duration: 9,
      elements: [
        {
          id: 'sol1',
          type: 'highlightedText',
          position: {x: 780, y: 400},
          props: {text: 'x = 2', fontSize: 64},
        },
        {
          id: 'sol2',
          type: 'highlightedText',
          position: {x: 780, y: 540},
          props: {text: 'x = 3', fontSize: 64},
        },
        {
          id: 'nl',
          type: 'numberLine',
          position: {x: 560, y: 700},
          props: {values: [0, 1, 2, 3, 4, 5], highlightedIndex: 2},
        },
      ],
      animations: [
        {id: 'd1', type: 'fadeIn', targetId: 'sol1', startTime: 0.5, duration: 0.8},
        {id: 'd2', type: 'fadeIn', targetId: 'sol2', startTime: 2.5, duration: 0.8},
        {id: 'd3', type: 'highlight', targetId: 'nl', startTime: 4, duration: 1, params: {value: 3}},
      ],
      transition: {type: 'zoom', duration: 0.4},
    },
    {
      id: 'summary',
      purpose: 'Summary',
      narration: 'We factored the quadratic and found both roots. The solutions are x equals two and x equals three.',
      duration: 8,
      elements: [
        {
          id: 'sum-eq',
          type: 'equation',
          position: {x: 660, y: 420},
          props: {expression: 'x = 2,  x = 3'},
        },
        {
          id: 'check',
          type: 'label',
          position: {x: 720, y: 560},
          props: {text: '✓ Verified'},
        },
      ],
      animations: [
        {id: 'e1', type: 'fadeIn', targetId: 'sum-eq', startTime: 0.3, duration: 0.8},
        {id: 'e2', type: 'fadeIn', targetId: 'check', startTime: 2, duration: 0.6},
      ],
      transition: {type: 'fade', duration: 0.3},
    },
  ],
};
