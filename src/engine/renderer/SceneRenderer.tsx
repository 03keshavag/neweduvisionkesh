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

function applyAnimationState(
  element: VisualElement,
  animations: AnimationAction[],
  localSeconds: number,
): VisualElement {
  let el = {...element, props: {...element.props}};
  for (const action of animations) {
    if (action.targetId !== element.id) continue;
    const start = action.startTime;
    const end = start + action.duration;
    if (localSeconds < start) continue;

    const progress = interpolate(localSeconds, [start, end], [0, 1], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    });

    switch (action.type) {
      case 'move':
      case 'transform': {
        const to = action.params?.to as {x?: number; y?: number} | undefined;
        const from = action.params?.from as {x?: number; y?: number} | undefined;
        if (to && from) {
          el = {
            ...el,
            position: {
              x: interpolate(progress, [0, 1], [from.x ?? el.position.x, to.x ?? el.position.x]),
              y: interpolate(progress, [0, 1], [from.y ?? el.position.y, to.y ?? el.position.y]),
            },
          };
        }
        break;
      }
      case 'highlight':
      case 'changeColor':
        el = {
          ...el,
          props: {
            ...el.props,
            color: action.params?.color ?? COLORS.primary,
            highlightedIndex: action.params?.value as number,
            highlightIndices: action.params?.highlightIndices as number[],
            eliminatedIndices: action.params?.eliminatedIndices as number[],
            lowIndex: action.params?.lowIndex as number,
            midIndex: action.params?.midIndex as number,
            highIndex: action.params?.highIndex as number,
          },
        };
        break;
      case 'updateValue':
        el = {
          ...el,
          props: {
            ...el.props,
            value: action.params?.value,
            values: action.params?.values as (string | number)[],
            text: action.params?.text as string,
          },
        };
        break;
      case 'hide':
        el = {...el, props: {...el.props, opacity: 1 - progress}};
        break;
      case 'show':
      case 'fadeIn':
      case 'create':
        el = {...el, props: {...el.props, opacity: progress, _actionStart: 0}};
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

  const hasStepCard = scene.elements.some(
    (e) => e.type === 'stepCard' || e.type === 'infoCard',
  );
  const subOpacity = interpolate(frame, [8, 20], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill style={{opacity, transform: transitionIn.transform}}>
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
        const animated = applyAnimationState(element, scene.animations, localSeconds);
        const createAnim = scene.animations.find(
          (a) => a.targetId === element.id && (a.type === 'create' || a.type === 'show' || a.type === 'fadeIn'),
        );
        const startSec = createAnim?.startTime ?? 0;
        return renderPrimitive({
          element: animated,
          startFrame: Math.round(startSec * fps),
          durationFrames: Math.round((createAnim?.duration ?? 0.5) * fps),
          sceneFrame: frame,
        });
      })}
      {!hasStepCard && scene.narration ? (
        <div
          style={{
            position: 'absolute',
            left: '50%',
            bottom: 56,
            transform: 'translateX(-50%)',
            opacity: subOpacity,
            maxWidth: 1500,
            background: 'rgba(7, 14, 24, 0.82)',
            border: `1px solid ${COLORS.divider}`,
            borderRadius: 16,
            padding: '16px 30px',
            fontFamily: FONTS.body,
            color: '#eaf0f8',
            fontSize: 28,
            lineHeight: 1.45,
            textAlign: 'center',
          }}
        >
          {scene.narration}
        </div>
      ) : null}
    </AbsoluteFill>
  );
};
