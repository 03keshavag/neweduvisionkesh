import React from 'react';
import type {ElementType, VisualElement} from '../types';
import * as Text from './text';
import * as Shapes from './shapes';
import * as Cards from './cards';
import * as MathP from './math';
import * as Cs from './cs';
import * as Physics from './physics';

export interface ElementRenderContext {
  element: VisualElement;
  startFrame: number;
  durationFrames: number;
  sceneFrame: number;
}

type PrimitiveComponent = React.FC<{
  position: {x: number; y: number};
  props: VisualElement['props'];
  startFrame?: number;
  durationFrames?: number;
}>;

const REGISTRY: Record<ElementType, PrimitiveComponent> = {
  title: Text.Title,
  label: Text.Label,
  equation: Text.Equation,
  highlightedText: Text.HighlightedText,
  stepCard: Cards.StepCard,
  infoCard: Cards.InfoCard,
  circle: Shapes.Circle,
  rectangle: Shapes.Rectangle,
  arrow: Shapes.ArrowShape,
  line: Shapes.LineShape,
  grid: Shapes.Grid,
  polygon: Shapes.Polygon,
  coordinatePlane: MathP.CoordinatePlane,
  graph: MathP.GraphVisual,
  functionCurve: MathP.FunctionCurve,
  vector: MathP.Vector,
  numberLine: MathP.NumberLine,
  geometricShape: MathP.GeometricShape,
  array: Cs.ArrayVisual,
  arrayElement: Cs.ArrayElement,
  pointer: Cs.Pointer,
  variable: Cs.Variable,
  stack: Cs.StackVisual,
  queue: Cs.QueueVisual,
  linkedList: Cs.LinkedListVisual,
  tree: Cs.TreeVisual,
  graphVisual: Cs.GraphVisualCs,
  node: Cs.GraphNode,
  edge: Cs.GraphEdge,
  codeBlock: Cs.CodeBlock,
  algorithmStep: Cs.AlgorithmStep,
  physicsObject: Physics.PhysicsObject,
  forceArrow: Physics.ForceArrow,
  velocityArrow: Physics.VelocityArrow,
  accelerationArrow: Physics.AccelerationArrow,
  trajectory: Physics.Trajectory,
  wave: Physics.Wave,
  particle: Physics.Particle,
  spring: Physics.Spring,
  circuitElement: Physics.CircuitElement,
};

export function renderPrimitive(ctx: ElementRenderContext): React.ReactNode {
  const Component = REGISTRY[ctx.element.type];
  if (!Component) {
    return null;
  }
  const actionStart = Math.round(ctx.element.props._actionStart as number ?? 0);
  return (
    <Component
      key={ctx.element.id}
      position={ctx.element.position}
      props={ctx.element.props}
      startFrame={actionStart}
      durationFrames={ctx.durationFrames}
    />
  );
}

export {REGISTRY};
