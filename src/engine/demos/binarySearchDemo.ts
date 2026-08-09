import type {AnimationPlan} from '../types';

/**
 * Binary search explainer — mirrors the classic "finding 23 in a sorted
 * array" visualization: a horizontal ARRAY of cells, LOW/MID/HIGH search
 * pointers, dimmed/crossed-out eliminated cells, and step narration cards.
 * ~37 seconds, 4 scenes.
 */
export const BINARY_SEARCH_DEMO: AnimationPlan = {
  id: 'demo-binary-search',
  title: 'Binary Search',
  topic: 'Binary search',
  subject: 'Computer Science',
  language: 'English',
  objective: 'Find target 23 in a sorted array',
  fps: 30,
  width: 1920,
  height: 1080,
  totalDuration: 37,
  scenes: [
    {
      id: 'intro',
      purpose: 'Show sorted array and target',
      narration:
        'Binary search works on a sorted array. Our target is twenty three, and the array holds nine sorted values. We will eliminate half of the array at each step.',
      duration: 9,
      onScreenLabels: ['Binary Search'],
      elements: [
        {
          id: 'title',
          type: 'title',
          position: {x: 700, y: 170},
          props: {text: 'Binary Search', fontSize: 76},
        },
        {
          id: 'sub',
          type: 'label',
          position: {x: 620, y: 280},
          props: {text: 'Finding 23 in a Sorted Array', color: '#94a3b8'},
        },
        {
          id: 'arr',
          type: 'array',
          position: {x: 580, y: 450},
          props: {
            values: [2, 5, 8, 12, 16, 23, 38, 56, 72],
            lowIndex: 0,
            midIndex: 4,
            highIndex: 8,
          },
        },
        {
          id: 'target',
          type: 'variable',
          position: {x: 1450, y: 300},
          props: {text: 'target', value: 23},
        },
        {
          id: 'step',
          type: 'stepCard',
          position: {x: 570, y: 900},
          props: {title: 'Step 1', text: 'We begin with the complete sorted array.'},
        },
      ],
      animations: [
        {id: 'a1', type: 'fadeIn', targetId: 'title', startTime: 0.3, duration: 0.7},
        {id: 'a2', type: 'fadeIn', targetId: 'sub', startTime: 1.3, duration: 0.6},
        {id: 'a3', type: 'fadeIn', targetId: 'arr', startTime: 2.2, duration: 1.0},
        {id: 'a4', type: 'fadeIn', targetId: 'target', startTime: 3.6, duration: 0.7},
        {id: 'a5', type: 'fadeIn', targetId: 'step', startTime: 5.0, duration: 0.6},
      ],
      transition: {type: 'fade', duration: 0.4},
    },
    {
      id: 'eliminate',
      purpose: 'Compare mid and eliminate the right half',
      narration:
        'The middle of the remaining range is thirty eight. Twenty three is smaller than thirty eight, so we eliminate the right half and continue with the left part.',
      duration: 10,
      onScreenLabels: ['Two Comparisons So Far'],
      elements: [
        {
          id: 'arr',
          type: 'array',
          position: {x: 580, y: 430},
          props: {
            values: [2, 5, 8, 12, 16, 23, 38, 56, 72],
            lowIndex: 5,
            midIndex: 6,
            highIndex: 8,
            eliminatedIndices: [0, 1, 2, 3, 4],
          },
        },
        {
          id: 'cmp',
          type: 'highlightedText',
          position: {x: 640, y: 640},
          props: {text: '23 < 38 → search the left half', fontSize: 40},
        },
        {
          id: 'range',
          type: 'label',
          position: {x: 700, y: 730},
          props: {text: 'Current range: [5 ... 8]', color: '#f4a300'},
        },
        {
          id: 'step',
          type: 'stepCard',
          position: {x: 570, y: 900},
          props: {title: 'Step 2', text: '23 < 38 → eliminate the right half.'},
        },
      ],
      animations: [
        {id: 'b1', type: 'fadeIn', targetId: 'arr', startTime: 0.3, duration: 0.8},
        {id: 'b2', type: 'highlight', targetId: 'arr', startTime: 1.4, duration: 0.8, params: {lowIndex: 5, midIndex: 6, highIndex: 8, eliminatedIndices: [0, 1, 2, 3, 4]}},
        {id: 'b3', type: 'fadeIn', targetId: 'cmp', startTime: 3.0, duration: 0.7},
        {id: 'b4', type: 'fadeIn', targetId: 'range', startTime: 4.4, duration: 0.6},
        {id: 'b5', type: 'fadeIn', targetId: 'step', startTime: 6.0, duration: 0.6},
      ],
      transition: {type: 'slide', duration: 0.4},
    },
  {
      id: 'found',
      purpose: 'Target is found',
      narration:
        'Only twenty three remains in our range. It matches our target, so binary search finds the value in just three comparisons.',
      duration: 9,
      onScreenLabels: ['Three Comparisons'],
      elements: [
        {
          id: 'arr',
          type: 'array',
          position: {x: 580, y: 430},
          props: {
            values: [2, 5, 8, 12, 16, 23, 38, 56, 72],
            lowIndex: 5,
            midIndex: 5,
            highIndex: 5,
            eliminatedIndices: [0, 1, 2, 3, 4, 6, 7, 8],
          },
        },
        {
          id: 'found',
          type: 'highlightedText',
          position: {x: 700, y: 640},
          props: {text: '✔ Target Found — 23 at index 5', fontSize: 44, color: '#3ddc97'},
        },
        {
          id: 'step',
          type: 'stepCard',
          position: {x: 570, y: 900},
          props: {title: 'Step 3', text: 'The target has been found successfully.'},
        },
      ],
      animations: [
        {id: 'c1', type: 'fadeIn', targetId: 'arr', startTime: 0.3, duration: 0.8},
        {id: 'c2', type: 'highlight', targetId: 'arr', startTime: 1.5, duration: 0.8, params: {lowIndex: 5, midIndex: 5, highIndex: 5, eliminatedIndices: [0, 1, 2, 3, 4, 6, 7, 8]}},
        {id: 'c3', type: 'fadeIn', targetId: 'found', startTime: 3.2, duration: 0.7},
        {id: 'c4', type: 'fadeIn', targetId: 'step', startTime: 5.0, duration: 0.6},
      ],
      transition: {type: 'zoom', duration: 0.4},
    },
    {
      id: 'summary',
      purpose: 'Complexity summary',
      narration:
        'Binary search runs in logarithmic time. With every step the search space is cut in half, making it very efficient for large sorted arrays.',
      duration: 9,
      onScreenLabels: ['Why It Matters'],
      elements: [
        {
          id: 'code',
          type: 'codeBlock',
          position: {x: 700, y: 360},
          props: {code: 'Time: O(log n)    Space: O(1)'},
        },
        {
          id: 'card',
          type: 'infoCard',
          position: {x: 620, y: 520},
          props: {title: 'Efficient', text: 'Halves the search space every step — sorted arrays only.', color: '#3ddc97'},
        },
      ],
      animations: [
        {id: 'd1', type: 'fadeIn', targetId: 'code', startTime: 0.3, duration: 0.8},
        {id: 'd2', type: 'fadeIn', targetId: 'card', startTime: 2.2, duration: 0.7},
      ],
      transition: {type: 'fade', duration: 0.3},
    },
  ],
};