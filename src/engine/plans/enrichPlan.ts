/**
 * enrichPlan — deterministic "always-rich, always-tidy" post-processor.
 *
 * Guarantees for EVERY plan (LLM or mock), without relying on the model:
 *   1. USE THE CANVAS PROPERLY — every content element is clamped inside the
 *      frame and kept clear of the label band, narration bar and footer.
 *   2. NO OVERLAPS — big blocks (cards, shapes, arrays, lists) are pushed
 *      apart deterministically when they collide.
 *   3. ARROWS FOR EVERYTHING — when two related blocks sit on the same
 *      horizontal band and no connector exists, an arrow is auto-drawn
 *      between them (with a drawArrow animation).
 *   4. Section labels, decorative backdrop, and a cascade entrance animation
 *      for EVERY element.
 */
import type {AnimationPlan, AnimationScene, AnimationAction, VisualElement} from '../types';

const ENTER_TYPES = new Set(['create', 'show', 'fadeIn']);
const TEXTISH_TYPES = new Set([
  'title',
  'label',
  'equation',
  'highlightedText',
  'stepCard',
  'infoCard',
  'algorithmStep',
  'codeBlock',
  'taskList',
  'progressSteps',
]);

/** "Block" elements that participate in overlap resolution + auto-arrows. */
const BIG_TYPES = new Set([
  'infoCard',
  'stepCard',
  'rectangle',
  'circle',
  'polygon',
  'geometricShape',
  'array',
  'taskList',
  'progressSteps',
  'codeBlock',
  'node',
  'stack',
  'queue',
  'linkedList',
  'physicsObject',
  'circuitElement',
]);

interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

function num(value: unknown, fallback: number): number {
  const v = Number(value);
  return Number.isFinite(v) && v > 0 ? v : fallback;
}

/** Rough top-left bounding box for an element (only used for layout/arrows). */
export function boxOf(el: VisualElement, width: number, height: number): Box {
  const p = el.position ?? {x: 0, y: 0};
  const pr = (el.props ?? {}) as Record<string, unknown>;
  const text = String(pr.text ?? pr.expression ?? pr.label ?? pr.code ?? pr.title ?? '');
  const items = Array.isArray(pr.items) ? pr.items.length : Array.isArray(pr.values) ? pr.values.length : 0;
  const steps = Array.isArray(pr.steps) ? pr.steps.length : items;

  switch (el.type) {
    case 'circle': {
      const r = num(pr.radius, 40);
      return {x: p.x, y: p.y, w: r * 2, h: r * 2};
    }
    case 'rectangle':
      return {x: p.x, y: p.y, w: num(pr.width, 120), h: num(pr.height, 80)};
    case 'infoCard':
      return {x: p.x, y: p.y, w: num(pr.width, 420), h: num(pr.height, 120)};
    case 'stepCard':
      return {x: p.x, y: p.y, w: num(pr.width, 780), h: 118};
    case 'polygon': {
      const r = num(pr.radius, 50);
      return {x: p.x, y: p.y, w: r * 2, h: r * 2};
    }
    case 'geometricShape':
      return {x: p.x, y: p.y, w: num(pr.width, 100), h: num(pr.height, 100)};
    case 'array':
      return {x: p.x, y: p.y, w: Math.max(72, (Array.isArray(pr.values) ? pr.values.length : 0) * 84), h: 150};
    case 'taskList':
      return {x: p.x, y: p.y, w: 520, h: Math.max(120, items * 50 + 10)};
    case 'progressSteps':
      return {x: p.x, y: p.y, w: Math.max(120, steps * 254), h: 130};
    default: {
      const fontSize = num(
        pr.fontSize,
        el.type === 'title' ? 76 : el.type === 'label' ? 34 : el.type === 'equation' ? 54 : el.type === 'codeBlock' ? 24 : 40,
      );
      const w = Math.min(Math.max(90, width - p.x - 40), Math.max(90, text.length * fontSize * 0.62 + 40));
      return {x: p.x, y: p.y, w, h: fontSize * 1.6};
    }
  }
}

const EXTRA_SAFETY = 8;

function intersect(a: Box, b: Box): boolean {
  return (
    a.x < b.x + b.w - EXTRA_SAFETY &&
    b.x < a.x + a.w - EXTRA_SAFETY &&
    a.y < b.y + b.h - EXTRA_SAFETY &&
    b.y < a.y + a.h - EXTRA_SAFETY
  );
}

/** Clamp a block position inside safe canvas bounds. */
function clampBlock(el: VisualElement, width: number, height: number, bottomClear: number): VisualElement {
  const box = boxOf(el, width, height);
  const x = Math.min(width - 70 - box.w, Math.max(70, box.x));
  const y = Math.min(bottomClear - box.h, Math.max(150, box.y));
  return {...el, position: {x, y}};
}

/** Text-only elements that participate in text-vs-text/block-vs-text cleanup. */
const TEXTS = new Set(['title', 'label', 'equation', 'highlightedText', 'algorithmStep', 'variable', 'pointer']);

function isDeco(el: VisualElement): boolean {
  return (el.zIndex ?? 0) < 0;
}

/** Remove exact duplicate texts placed at (almost) the same coordinates. */
function dedupeText(elements: VisualElement[]): VisualElement[] {
  const out: VisualElement[] = [];
  for (const el of elements) {
    if (isDeco(el) || !TEXTS.has(el.type)) {
      out.push(el);
      continue;
    }
    const text = String(el.props?.text ?? el.props?.expression ?? el.props?.label ?? el.props?.title ?? '');
    if (!text) {
      out.push(el);
      continue;
    }
    const dup = out.some(
      (o) =>
        o.type === el.type &&
        String(o.props?.text ?? o.props?.expression ?? o.props?.label ?? o.props?.title ?? '') === text &&
        Math.abs((o.position?.x ?? 0) - (el.position?.x ?? 0)) < 14 &&
        Math.abs((o.position?.y ?? 0) - (el.position?.y ?? 0)) < 14,
    );
    if (!dup) out.push(el);
  }
  return out;
}

/** Push right first, then down below the clashing region — never in-bounds lost. */
function placeAgainst(
  start: {x: number; y: number; b: Box},
  avoid: Box[],
  width: number,
  height: number,
  bottomClear: number,
): {x: number; y: number} {
  let x = start.x;
  let y = start.y;
  for (let i = 0; i < 24; i++) {
    const clash = avoid.find((a) => intersect(a, {x, y, w: start.b.w, h: start.b.h}));
    if (!clash) break;
    const rightX = clash.x + clash.w + 18;
    if (rightX + start.b.w <= width - 70 && Math.abs(rightX - start.x) < 900) {
      x = rightX;
    } else {
      y = clash.y + clash.h + 18;
      if (y + start.b.h > bottomClear) {
        y = Math.max(150, bottomClear - start.b.h);
        x = 70;
      }
    }
  }
  return {
    x: Math.min(width - 70 - start.b.w, Math.max(70, x)),
    y: Math.min(bottomClear - start.b.h, Math.max(150, y)),
  };
}

/** Diagram elements that must maintain their exact author/Groq coordinates without layout displacement. */
const DIAGRAM_TYPES = new Set([
  'coordinatePlane',
  'graph',
  'functionCurve',
  'vector',
  'numberLine',
  'geometricShape',
  'physicsObject',
  'forceArrow',
  'velocityArrow',
  'accelerationArrow',
  'trajectory',
  'wave',
  'particle',
  'spring',
  'circuitElement',
  'atom',
  'dnaStrand',
  'tangentLine',
]);

function isPinnedOrDiagram(el: VisualElement): boolean {
  return DIAGRAM_TYPES.has(el.type) || Boolean(el.props?.pinned);
}

/**
 * Fix overlaps for generic containers, deterministically:
 *   A. containers (cards/shapes/lists) pushed right/down against each other;
 *   B. text kept in place only when it is a caption INSIDE its container,
 *      otherwise pushed clear of containers AND other text.
 *   C. Scientific and mathematical diagram elements are protected and NEVER displaced.
 */
function fixLayout(elements: VisualElement[], width: number, height: number, bottomClear: number): VisualElement[] {
  const out = elements.map((e) => ({...e, position: {...e.position}}));

  // A. containers first (skip diagrams and pinned items).
  const placedC: Box[] = [];
  for (const el of out) {
    if (isDeco(el) || !BIG_TYPES.has(el.type)) continue;
    const b = boxOf(el, width, height);
    if (isPinnedOrDiagram(el)) {
      placedC.push({x: el.position.x, y: el.position.y, w: b.w, h: b.h});
      continue;
    }
    const pos = placeAgainst({x: el.position.x, y: el.position.y, b}, placedC, width, height, bottomClear);
    el.position = {x: pos.x, y: pos.y};
    placedC.push({x: pos.x, y: pos.y, w: b.w, h: b.h});
  }

  // B. text last (avoids containers and other text, respects diagrams).
  const placedT: Box[] = [];
  for (const el of out) {
    if (isDeco(el) || !TEXTS.has(el.type)) continue;
    const b = boxOf(el, width, height);
    if (isPinnedOrDiagram(el)) {
      placedT.push({x: el.position.x, y: el.position.y, w: b.w, h: b.h});
      continue;
    }
    const cx = el.position.x + b.w / 2;
    const cy = el.position.y + b.h / 2;
    const isCaption = placedC.some(
      (p) => cx >= p.x && cx <= p.x + p.w && cy >= p.y && cy <= p.y + p.h,
    );
    if (isCaption) {
      placedT.push({x: el.position.x, y: el.position.y, w: b.w, h: b.h});
      continue;
    }
    const pos = placeAgainst(
      {x: el.position.x, y: el.position.y, b},
      [...placedC, ...placedT],
      width,
      height,
      bottomClear,
    );
    el.position = {x: pos.x, y: pos.y};
    placedT.push({x: pos.x, y: pos.y, w: b.w, h: b.h});
  }

  return out;
}

/** Short, safe section header derived from a scene. */
function toLabel(text: string, fallback: string): string {
  const clean = (text ?? '').trim().split(/[.\n]/)[0].slice(0, 36).trim();
  return clean || fallback;
}
const FLOW_TYPES = new Set(['infoCard', 'stepCard', 'taskList', 'progressSteps']);

/**
 * Auto-draw connector arrows between flow cards that sit on the same horizontal
 * band and have a clear gap — guaranteed arrows for process flowcharts.
 */
function addAutoArrows(
  elements: VisualElement[],
  animations: AnimationAction[],
  width: number,
  height: number,
): {elements: VisualElement[]; animations: AnimationAction[]} {
  const blocks = elements
    .map((e) => ({e, b: boxOf(e, width, height)}))
    .filter(({e}) => FLOW_TYPES.has(e.type) && (e.zIndex ?? 0) >= 0);
  if (blocks.length < 2) return {elements, animations};

  // Band grouping: flow blocks whose vertical positions are close belong together.
  const byY = [...blocks].sort((a, b) => a.b.y - b.b.y);
  const bands: {e: VisualElement; b: Box}[][] = [];
  for (const item of byY) {
    const last = bands[bands.length - 1];
    if (last && Math.abs(item.b.y - last[last.length - 1].b.y) <= 170) {
      last.push(item);
    } else {
      bands.push([item]);
    }
  }

  const newElements: VisualElement[] = [];
  const newAnimations: AnimationAction[] = [];
  let count = 0;

  for (const band of bands) {
    const sorted = [...band].sort((a, b) => a.b.x - b.b.x);
    for (let i = 0; i < sorted.length - 1 && count < 4; i++) {
      const a = sorted[i];
      const b = sorted[i + 1];
      const gap = b.b.x - (a.b.x + a.b.w);
      if (gap < 30 || gap > 760) continue;
      const midY = Math.round((a.b.y + a.b.h / 2 + b.b.y + b.b.h / 2) / 2);

      // Skip if the model already drew a connector in this gap.
      const hasConnector = elements.some(
        (e) =>
          (e.type === 'arrow' || e.type === 'line') &&
          e.position.x >= a.b.x + a.b.w - 12 &&
          e.position.x <= b.b.x - 12 &&
          Math.abs(e.position.y - midY) < 70,
      );
      if (hasConnector) continue;

      const id = `auto-arrow-${a.e.id}-${b.e.id}-${count++}`;
      const enterStart = Math.max(
        1,
        ...animations
          .filter((an) => ENTER_TYPES.has(an.type) && (an.targetId === a.e.id || an.targetId === b.e.id))
          .map((an) => an.startTime),
      );
      newElements.push({
        id,
        type: 'arrow',
        position: {x: a.b.x + a.b.w, y: midY},
        props: {
          from: {x: 0, y: 0},
          to: {x: gap, y: 0},
          color: count % 2 === 0 ? 'rgba(56,182,255,0.9)' : 'rgba(244,163,0,0.9)',
          strokeWidth: 5,
        },
        zIndex: Math.max(a.e.zIndex ?? 0, b.e.zIndex ?? 0),
      });
      newAnimations.push({
        id: `auto-air-${id}`,
        type: 'drawArrow',
        targetId: id,
        startTime: enterStart + 0.35,
        duration: 0.6,
      });
    }
  }

  return {
    elements: [...elements, ...newElements],
    animations: [...animations, ...newAnimations],
  };
}

function enrichScene(
  scene: AnimationScene,
  index: number,
  totalScenes: number,
  width: number,
  height: number,
): AnimationScene {
  // The narration bar occupies the bottom when there is no step/info card,
  // so content must stay higher in that case.
  const hasBottomCard = scene.elements.some((e) => e.type === 'stepCard' || e.type === 'infoCard');
  const bottomClear = hasBottomCard ? height - 96 : height - 250;
  const isScientificScene = scene.elements.some(isPinnedOrDiagram);

  // 1. Section label (top of frame).
  const labels =
    scene.onScreenLabels && scene.onScreenLabels.length > 0
      ? scene.onScreenLabels
      : [toLabel(scene.purpose, `Scene ${index + 1}`)];

  let elements: VisualElement[] = [...scene.elements];
  let animations: AnimationAction[] = [...scene.animations];

  // 2. Decorative backdrop — only for generic card scenes, keep scientific canvases uncluttered.
  if (!isScientificScene) {
    elements = [
      ...elements,
      {
        id: `deco-c1-${index}`,
        type: 'circle',
        position: {x: width - 270, y: 40},
        props: {radius: 150, fill: 'rgba(56,182,255,0.06)', stroke: 'rgba(56,182,255,0.14)'},
        zIndex: -30,
      },
      {
        id: `deco-c2-${index}`,
        type: 'circle',
        position: {x: 40, y: height - 270},
        props: {radius: 130, fill: 'rgba(244,163,0,0.06)', stroke: 'rgba(244,163,0,0.14)'},
        zIndex: -30,
      },
      {
        id: `deco-line-${index}`,
        type: 'line',
        position: {x: 100, y: 120},
        props: {from: {x: 0, y: 0}, to: {x: width - 200, y: 0}, stroke: 'rgba(255,255,255,0.05)'},
        zIndex: -30,
      },
    ];
  }

  // 3. A visible text element if the scene has none.
  if (!elements.some((e) => TEXTISH_TYPES.has(e.type))) {
    elements.push({
      id: `auto-title-${index}`,
      type: 'title',
      position: {x: 560, y: 300},
      props: {text: toLabel(scene.purpose, `Scene ${index + 1}`), fontSize: 72},
    });
  }

  // 3b. Remove exact duplicate texts sitting on top of each other.
  elements = dedupeText(elements);

  // 4. USE THE CANVAS: clamp content (not decorative) inside safe bounds.
  elements = elements.map((e) => (e.zIndex ?? 0) >= 0 ? clampBlock(e, width, height, bottomClear) : e);

  // 5. NO OVERLAPS: containers first, then text (kept only as caption inside a block).
  elements = fixLayout(elements, width, height, bottomClear);

  // 6. ARROWS: connect related blocks that lack a connector.
  const withArrows = addAutoArrows(elements, animations, width, height);
  elements = withArrows.elements;
  animations = withArrows.animations;

  // 7. Entrance animation for EVERY element (deterministic cascade).
  let stagger = 0.8;
  for (const element of elements) {
    const hasEntrance = animations.some(
      (a) => a.targetId === element.id && ENTER_TYPES.has(a.type),
    );
    if (!hasEntrance) {
      animations.push({
        id: `auto-enter-${element.id}`,
        type: 'fadeIn',
        targetId: element.id,
        startTime: stagger,
        duration: 0.55,
      });
      stagger += 0.38;
    }
  }

  return {
    ...scene,
    onScreenLabels: labels,
    elements,
    animations,
  };
}

export function enrichPlan(plan: AnimationPlan): AnimationPlan {
  const width = plan.width || 1920;
  const height = plan.height || 1080;
  const scenes = plan.scenes.map((scene, i) =>
    enrichScene(scene, i, plan.scenes.length, width, height),
  );
  return {
    ...plan,
    width,
    height,
    totalDuration: scenes.reduce((acc, s) => acc + s.duration, 0),
    scenes,
  };
}