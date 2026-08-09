/**
 * Animation instruction types for the EduVision engine.
 *
 * AI produces structured instructions — never arbitrary React code.
 * The timeline renderer interprets these into Remotion animations.
 */

export type Subject =
  | 'Mathematics'
  | 'Computer Science'
  | 'Physics'
  | 'Chemistry'
  | 'Biology'
  | 'General';

/** Supported visual element kinds mapped to reusable primitives. */
export type ElementType =
  // Text
  | 'title'
  | 'label'
  | 'equation'
  | 'highlightedText'
  // Cards / callouts
  | 'stepCard'
  | 'infoCard'
  // Chemistry & Biology
  | 'atom'
  | 'dnaStrand'
  | 'tangentLine'
  // Shapes
  | 'circle'
  | 'rectangle'
  | 'arrow'
  | 'line'
  | 'grid'
  | 'polygon'
  // Process / tasks
  | 'progressSteps'
  | 'taskList'
  // Math
  | 'coordinatePlane'
  | 'graph'
  | 'functionCurve'
  | 'vector'
  | 'numberLine'
  | 'geometricShape'
  // CS
  | 'array'
  | 'arrayElement'
  | 'pointer'
  | 'variable'
  | 'stack'
  | 'queue'
  | 'linkedList'
  | 'tree'
  | 'graphVisual'
  | 'node'
  | 'edge'
  | 'codeBlock'
  | 'algorithmStep'
  // Physics
  | 'physicsObject'
  | 'forceArrow'
  | 'velocityArrow'
  | 'accelerationArrow'
  | 'trajectory'
  | 'wave'
  | 'particle'
  | 'spring'
  | 'circuitElement';

export type AnimationType =
  | 'create'
  | 'show'
  | 'hide'
  | 'move'
  | 'transform'
  | 'highlight'
  | 'compare'
  | 'drawArrow'
  | 'displayEquation'
  | 'updateValue'
  | 'changeColor'
  | 'zoom'
  | 'pan'
  | 'wait'
  | 'fadeIn'
  | 'fadeOut'
  | 'scale'
  | 'rotate'
  | 'morph';

export type TransitionType = 'fade' | 'slide' | 'zoom' | 'camera' | 'none';

export interface Position {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

/** Style and content props vary by element type — kept flexible but typed. */
export interface ElementProps {
  text?: string;
  title?: string;
  value?: string | number;
  values?: (string | number)[];
  color?: string;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  fontSize?: number;
  highlightIndices?: number[];
  highlightedIndex?: number;
  eliminatedIndices?: number[];
  target?: string | number;
  label?: string;
  expression?: string;
  code?: string;
  language?: string;
  points?: Position[];
  from?: Position;
  to?: Position;
  radius?: number;
  width?: number;
  height?: number;
  sides?: number;
  mass?: number;
  force?: number;
  velocity?: number;
  acceleration?: number;
  amplitude?: number;
  frequency?: number;
  nodes?: {id: string; label?: string; x?: number; y?: number}[];
  edges?: {from: string; to: string}[];
  children?: string[];
  direction?: 'up' | 'down' | 'left' | 'right';
  opacity?: number;
  // Enhanced Projectile & Physics props
  showProjectile?: boolean;
  showVelocity?: boolean;
  showVelocityComponents?: boolean;
  showGravity?: boolean;
  showApex?: boolean;
  showMaximumHeight?: boolean;
  showRange?: boolean;
  showLaunchAngle?: boolean;
  launchAngle?: number;
  initialVelocity?: number;
  gravity?: number;
  ground?: boolean;
  progress?: number;
  apexLabel?: string;
  rangeLabel?: string;
  heightLabel?: string;
  // Enhanced Chemistry & Biology props
  elementSymbol?: string;
  electronCount?: number;
  valenceElectrons?: number;
  charge?: number | string;
  isPositiveIon?: boolean;
  isNegativeIon?: boolean;
  showBonds?: boolean;
  strandSeparation?: number;
  basePairs?: string[];
  // Math & Calculus props
  slope?: number;
  tangentX?: number;
  showTangent?: boolean;
  showArea?: boolean;
  pinned?: boolean;
  [key: string]: unknown;
}

/** A visual element placed on the canvas. */
export interface VisualElement {
  id: string;
  type: ElementType;
  position: Position;
  size?: Size;
  props: ElementProps;
  zIndex?: number;
  /**
   * Live motion applied by the renderer on top of the element's own entrance
   * animation (populated by scale/rotate/zoom/pan/morph actions, plus the
   * enrich pass can request idle motion kinds).
   */
  motion?: ElementMotion;
  /** Idle animation applied continuously by primitives (float/breathe/pulse). */
  idle?: 'float' | 'breathe' | 'pulse' | 'none';
}

/** Composite transform applied around an element at render time. */
export interface ElementMotion {
  scale?: number;
  rotate?: number;
  x?: number;
  y?: number;
  opacity?: number;
}

/** A timed animation action targeting an element. */
export interface AnimationAction {
  id: string;
  type: AnimationType;
  targetId: string;
  /** Start time relative to scene start, in seconds. */
  startTime: number;
  /** Duration in seconds. */
  duration: number;
  params?: {
    from?: Position | number | string;
    to?: Position | number | string;
    color?: string;
    value?: string | number;
    scale?: number;
    opacity?: number;
    [key: string]: unknown;
  };
}

/** Scene transition between adjacent scenes. */
export interface SceneTransition {
  type: TransitionType;
  duration: number;
}

/** One scene in the animation plan. */
export interface AnimationScene {
  id: string;
  purpose: string;
  narration: string;
  /** Duration in seconds — set by audio sync when available. */
  duration: number;
  elements: VisualElement[];
  animations: AnimationAction[];
  transition?: SceneTransition;
  onScreenLabels?: string[];
}

/** Full animation plan consumed by the engine renderer. */
export interface AnimationPlan {
  id: string;
  title: string;
  topic: string;
  subject: Subject;
  language: string;
  objective: string;
  fps: number;
  width: number;
  height: number;
  /** Total duration in seconds (sum of scene durations minus transition overlaps). */
  totalDuration: number;
  scenes: AnimationScene[];
}

/** Stage-1 educational plan from Groq (before animation instructions). */
export interface EducationalPlan {
  title: string;
  topic: string;
  subject: Subject;
  language: string;
  ageGroup: string;
  objective: string;
  scenes: {
    id: string;
    purpose: string;
    visualDescription: string;
    narration: string;
    durationEstimate: number;
    onScreenLabels?: string[];
  }[];
}

/** Master timeline entry for one scene after audio sync. */
export interface TimelineSceneEntry {
  sceneId: string;
  startFrame: number;
  endFrame: number;
  durationFrames: number;
  audioStartFrame: number;
  audioEndFrame: number;
  audioUrl?: string;
  durationSeconds: number;
}

/** Master timeline spanning the full composition. */
export interface MasterTimeline {
  fps: number;
  totalFrames: number;
  totalSeconds: number;
  scenes: TimelineSceneEntry[];
}
