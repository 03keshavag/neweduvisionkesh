import {interpolate} from 'remotion';
import type {TransitionType} from '../types';

export interface TransitionState {
  opacity: number;
  transform: string;
}

export function computeTransition(
  type: TransitionType,
  localFrame: number,
  durationFrames: number,
  direction: 'in' | 'out',
): TransitionState {
  const progress = interpolate(localFrame, [0, durationFrames], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const p = direction === 'in' ? progress : 1 - progress;

  switch (type) {
    case 'fade':
      return {opacity: p, transform: 'none'};
    case 'slide':
      return {
        opacity: p,
        transform: `translateX(${interpolate(p, [0, 1], [direction === 'in' ? 60 : 0, direction === 'in' ? 0 : -60])}px)`,
      };
    case 'zoom':
      return {
        opacity: p,
        transform: `scale(${interpolate(p, [0, 1], [0.92, 1])})`,
      };
    case 'camera':
      return {
        opacity: p,
        transform: `scale(${interpolate(p, [0, 1], [1.05, 1])}) translateY(${interpolate(p, [0, 1], [20, 0])}px)`,
      };
    default:
      return {opacity: 1, transform: 'none'};
  }
}

export const DEFAULT_TRANSITION_FRAMES = 12;
