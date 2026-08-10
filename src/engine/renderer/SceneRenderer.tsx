import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {COLORS, FONTS} from '../../remotion/theme';
import type {AnimationAction, AnimationScene, TimelineSceneEntry, VisualElement} from '../types';
import {renderPrimitive} from '../primitives';
import {computeTransition, DEFAULT_TRANSITION_FRAMES} from '../transitions';

interface SceneRendererProps {
  scene: AnimationScene;
  timelineEntry: TimelineSceneEntry;
  isFirst: boolean;
  isLast: boolean;
}

type IdleKind = 'float' | 'breathe' | 'none';

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
  'equation',
]);

/** Deterministic per-element idle motion — disabled for exact scientific/math diagrams. */
function idleForType(type: string): IdleKind {
  if (DIAGRAM_TYPES.has(type)) {
    return 'none';
  }
  if (['title', 'label', 'highlightedText', 'stepCard', 'infoCard', 'taskList', 'progressSteps', 'variable'].includes(type)) {
    return 'float';
  }
  if (['circle', 'rectangle', 'polygon', 'node'].includes(type)) {
    return 'breathe';
  }
  return 'none';
}

/** Pure (no-hook) idle transform, safe to call inside element loops. */
function idleStyle(kind: IdleKind, strength: number, phase: number, frame: number): React.CSSProperties {
  if (kind === 'none') return {};
  const t = frame / 30;
  if (kind === 'float') {
    return {transform: `translateY(${Math.sin(t * 1.7 + phase) * 5 * strength}px)`};
  }
  if (kind === 'breathe') {
    return {transform: `scale(${1 + Math.sin(t * 2.2 + phase) * 0.012 * strength})`};
  }
  return {};
}

function applyAnimationState(
  element: VisualElement,
  animations: AnimationAction[],
  localSeconds: number,
): VisualElement {
  let el: VisualElement = {...element, props: {...element.props}, motion: {...element.motion}};
  for (const action of animations) {
    if (action.targetId !== element.id) continue;
    const start = action.startTime;
    const end = start + action.duration;
    if (localSeconds < start) continue;

    const progress = interpolate(localSeconds, [start, end], [0, 1], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    });
    const p = action.params ?? {};

    switch (action.type) {
      case 'move':
      case 'transform': {
        const to = p.to as {x?: number; y?: number} | undefined;
        const from = p.from as {x?: number; y?: number} | undefined;
        if (to && from) {
          el.position = {
            x: interpolate(progress, [0, 1], [from.x ?? el.position.x, to.x ?? el.position.x]),
            y: interpolate(progress, [0, 1], [from.y ?? el.position.y, to.y ?? el.position.y]),
          };
        }
        break;
      }
      case 'pan': {
        const to = p.to as {x?: number; y?: number} | undefined;
        if (to) {
          el.motion = {
            ...el.motion,
            x: (el.motion?.x ?? 0) + (to.x ?? 0) * progress,
            y: (el.motion?.y ?? 0) + (to.y ?? 0) * progress,
          };
        }
        break;
      }
      case 'zoom':
      case 'scale': {
        el.motion = {
          ...el.motion,
          scale: interpolate(progress, [0, 1], [Number(p.from ?? 0.55), Number(p.to ?? p.scale ?? 1)]),
        };
        break;
      }
      case 'rotate':
      case 'morph': {
        el.motion = {
          ...el.motion,
          rotate: interpolate(progress, [0, 1], [Number(p.from ?? 0), Number(p.to ?? 360)]),
          ...(action.type === 'morph'
            ? {scale: interpolate(progress, [0, 1], [0.6, 1]), opacity: progress}
            : {}),
        };
        break;
      }
      case 'highlight':
      case 'changeColor':
        el.props = {
          ...el.props,
          color: p.color ?? COLORS.primary,
          highlightedIndex: p.value as number,
          highlightIndices: p.highlightIndices as number[],
          eliminatedIndices: p.eliminatedIndices as number[],
          lowIndex: p.lowIndex as number,
          midIndex: p.midIndex as number,
          highIndex: p.highIndex as number,
        };
        break;
      case 'updateValue':
        el.props = {
          ...el.props,
          value: p.value,
          values: p.values as (string | number)[],
          text: p.text as string,
        };
        break;
      case 'hide':
        el.props = {...el.props, opacity: 1 - progress};
        el.motion = {...(el.motion ?? {}), opacity: 1 - progress};
        break;
      case 'show':
      case 'fadeIn':
      case 'create':
        el.props = {...el.props, opacity: progress, _actionStart: 0};
        break;
      default:
        break;
    }
  }
  return el;
}

export const SceneRenderer: React.FC<SceneRendererProps> = ({
  scene,
  timelineEntry,
  isFirst,
  isLast,
}) => {
  // Scene-local frame: this component renders inside a <Sequence> that starts
  // at the scene's own timeline start, so frame 0 is the scene's first frame.
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const localSeconds = frame / fps;

  const transition = scene.transition?.type ?? 'fade';
  const transitionFrames = scene.transition?.duration
    ? Math.round(scene.transition.duration * fps)
    : DEFAULT_TRANSITION_FRAMES;

  let transitionIn = {opacity: 1, transform: 'none'};
  let transitionOut = {opacity: 1, transform: 'none'};

  if (!isFirst && frame < transitionFrames) {
    transitionIn = computeTransition(transition, frame, transitionFrames, 'in');
  }
  if (!isLast && frame > timelineEntry.durationFrames - transitionFrames) {
    transitionOut = computeTransition(
      transition,
      frame - (timelineEntry.durationFrames - transitionFrames),
      transitionFrames,
      'out',
    );
  }

  const opacity = transitionIn.opacity * transitionOut.opacity;
  const sorted = [...scene.elements].sort((a, b) => (a.zIndex ?? 0) - (b.zIndex ?? 0));

  // Subtle continuous camera drift — the whole scene slowly breathes and pans
  // so the video reads as "alive" and cinematic, never a frozen frame.
  const driftTransform = `scale(${1 + Math.sin(frame / 130) * 0.012}) translateY(${Math.sin(frame / 170) * 6}px)`;

  const hasStepCard = scene.elements.some(
    (e) => e.type === 'stepCard' || e.type === 'infoCard',
  );
  const subOpacity = interpolate(frame, [8, 20], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill style={{opacity, transform: transitionIn.transform, zIndex: 2}}>
      <AbsoluteFill style={{transform: driftTransform}}>
        {scene.onScreenLabels?.map((label, i) => (
          <div
            key={`label-${i}`}
            style={{
              position: 'absolute',
              top: 60 + i * 40,
              left: '50%',
              transform: 'translateX(-50%)',
              fontFamily: FONTS.body,
              fontSize: 28,
              color: COLORS.textMuted,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
            }}
          >
            {label}
          </div>
        ))}
        {sorted.map((element) => {
          // If this is not the intro scene and the element is a generic title, suppress it
          // so the entire 1920x1080 canvas belongs to the animated diagrams.
          if (!isFirst && element.type === 'title') {
            return null;
          }

          const animated = applyAnimationState(element, scene.animations, localSeconds);
          const createAnim = scene.animations.find(
            (a) => a.targetId === element.id && (a.type === 'create' || a.type === 'show' || a.type === 'fadeIn'),
          );
          const startSec = createAnim?.startTime ?? 0;
          const motion = animated.motion ?? {};
          const idle = idleStyle(
            idleForType(animated.type),
            0.7,
            (animated.id.length % 5) * 1.3,
            frame,
          );
          const startFrame = Math.round(startSec * fps);
          const durationFrames = Math.round((createAnim?.duration ?? 0.5) * fps);
          return (
            <div
              key={animated.id}
              style={{
                position: 'absolute',
                left: animated.position.x,
                top: animated.position.y,
                zIndex: animated.zIndex ?? 0,
                transform: `translate(${motion.x ?? 0}px, ${motion.y ?? 0}px) scale(${motion.scale ?? 1}) rotate(${motion.rotate ?? 0}deg)${
                  idle.transform ? ' ' + idle.transform : ''
                }`,
                opacity: motion.opacity ?? 1,
                transformOrigin: 'center',
                willChange: 'transform',
              }}
            >
              {renderPrimitive({
                element: {...animated, position: {x: 0, y: 0}},
                startFrame,
                durationFrames,
                sceneFrame: frame,
              })}
            </div>
          );
        })}
        {scene.narration ? (
          <div
            style={{
              position: 'absolute',
              left: '15%',
              bottom: 80,
              width: '70%',
              background: 'rgba(10, 18, 32, 0.88)',
              backdropFilter: 'blur(14px)',
              WebkitBackdropFilter: 'blur(14px)',
              border: `1.5px solid rgba(56, 182, 255, 0.3)`,
              borderRadius: 18,
              padding: '18px 32px',
              color: 'white',
              boxSizing: 'border-box',
              boxShadow: '0 12px 36px rgba(0, 0, 0, 0.55)',
              opacity: subOpacity,
              zIndex: 50,
            }}
          >
            {scene.onScreenLabels?.[0] || scene.purpose ? (
              <div
                style={{
                  fontSize: 24,
                  fontWeight: 'bold',
                  color: '#facc15',
                  fontFamily: FONTS.body,
                  marginBottom: 6,
                  letterSpacing: '0.02em',
                }}
              >
                {scene.onScreenLabels?.[0] || scene.purpose}
              </div>
            ) : null}
            <div
              style={{
                fontSize: 22,
                lineHeight: 1.45,
                color: '#f8fafc',
                fontFamily: FONTS.body,
              }}
            >
              {scene.narration}
            </div>
          </div>
        ) : null}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
