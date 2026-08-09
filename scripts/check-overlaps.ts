/**
 * Adversarial overlap test for the layout fixer.
 * Run: node_modules\.bin\tsx.cmd scripts/check-overlaps.ts
 */
import {normalizeAnimationPlan} from '../src/engine/plans/planSchema';
import {enrichPlan, boxOf} from '../src/engine/plans/enrichPlan';
import type {AnimationPlan, VisualElement} from '../src/engine/types';

const CONTAINERS = new Set(['infoCard', 'stepCard', 'rectangle', 'circle', 'polygon', 'geometricShape', 'array', 'taskList', 'progressSteps', 'codeBlock', 'stack', 'queue', 'linkedList', 'physicsObject', 'circuitElement']);
const TEXTS = new Set(['title', 'label', 'equation', 'highlightedText', 'algorithmStep', 'variable', 'pointer']);

function intersect(a: {x: number; y: number; w: number; h: number}, b: {x: number; y: number; w: number; h: number}): boolean {
  return a.x < b.x + b.w - 8 && b.x < a.x + a.w - 8 && a.y < b.y + b.h - 8 && b.y < a.y + a.h - 8;
}

// Deliberately broken plan: cards stacked on top of each other and 3 identical
// labels at the exact same point (LLM-style output).
const BAD_PLAN: AnimationPlan = {
  id: 'x', title: 'X', topic: 'X', subject: 'General', language: 'English',
  objective: 'x', fps: 30, width: 1920, height: 1080, totalDuration: 30,
  scenes: [{
    id: 's1', purpose: 'Stress test', narration: 'Narration here.',
    duration: 10,
    elements: [
      {id: 'c1', type: 'infoCard', position: {x: 600, y: 400}, props: {width: 400, height: 140, title: 'A', text: 'A'}},
      {id: 'c2', type: 'infoCard', position: {x: 600, y: 400}, props: {width: 400, height: 140, title: 'B', text: 'B'}},
      {id: 'c3', type: 'rectangle', position: {x: 610, y: 410}, props: {width: 380, height: 120}},
      {id: 't1', type: 'label', position: {x: 200, y: 620}, props: {text: 'SAME', fontSize: 34}},
      {id: 't2', type: 'label', position: {x: 200, y: 620}, props: {text: 'SAME', fontSize: 34}},
      {id: 't3', type: 'highlightedText', position: {x: 200, y: 620}, props: {text: 'SAME', fontSize: 34}},
      {id: 'cap', type: 'label', position: {x: 640, y: 420}, props: {text: 'Caption inside card', fontSize: 26}},
    ],
    animations: [],
  }],
};

const plan = enrichPlan(normalizeAnimationPlan(BAD_PLAN));
const scene = plan.scenes[0];
const els = scene.elements.filter((e) => (e.zIndex ?? 0) >= 0);
const boxes = els.map((e) => ({e, b: boxOf(e, plan.width, plan.height)}));

let problems = 0;
for (let i = 0; i < boxes.length; i++) {
  for (let j = i + 1; j < boxes.length; j++) {
    const {e: a, b: ba} = boxes[i];
    const {e: b, b: bb} = boxes[j];
    if (!intersect(ba, bb)) continue;
    const ca = CONTAINERS.has(a.type);
    const cb = CONTAINERS.has(b.type);
    const ta = TEXTS.has(a.type);
    const tb = TEXTS.has(b.type);
    const caption =
      (ta && cb) || (tb && ca)
        ? (() => {
            const txt = ta ? a : b;
            const box = ta ? ba : bb;
            const con = ta ? b : a;
            const cBox = ta ? bb : ba;
            const cx = box.x + box.w / 2;
            const cy = box.y + box.h / 2;
            return cx >= con.position.x && cx <= con.position.x + cBox.w && cy >= con.position.y && cy <= con.position.y + cBox.h;
          })()
        : false;
    if (ca && cb) { console.log(`OVERLAP containers ${a.id} x ${b.id}`); problems++; }
    if (ta && tb && !caption) { console.log(`OVERLAP text ${a.id} x ${b.id}`); problems++; }
    if ((ca && tb) || (cb && ta)) {
      const textInOwnCaption = ta ? b.type : a.type; // other is container
      if (!caption) { console.log(`OVERLAP text-over-block ${a.id} x ${b.id} (${a.type}/${b.type})`); problems++; }
    }
  }
}

// Show final positions
for (const {e} of boxes) {
  console.log(`${e.id.padEnd(12)} ${e.type.padEnd(16)} x=${e.position.x} y=${e.position.y}`);
}
console.log(problems === 0 ? '✓ NO plain overlaps — every problem pair was resolved (captions allowed inside their own block).' : `✗ ${problems} overlaps remain`);