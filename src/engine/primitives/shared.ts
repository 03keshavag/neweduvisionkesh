import {interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {COLORS, FONTS} from '../../remotion/theme';
import type {Position} from '../types';

export interface PrimitiveStyle {
  opacity?: number;
  transform?: string;
  color?: string;
  fill?: string;
  stroke?: string;
  scale?: number;
  highlight?: boolean;
}

export function useElementAnimation(
  startFrame: number,
  durationFrames: number,
  type: 'fadeIn' | 'slideUp' | 'scale' | 'spring' = 'fadeIn',
): {opacity: number; transform: string} {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const local = frame - startFrame;

  if (local < 0) {
    return {opacity: 0, transform: 'translateY(20px)'};
  }

  if (type === 'spring') {
    const progress = spring({frame: local, fps, config: {damping: 14, stiffness: 120}});
    return {
      opacity: progress,
      transform: `translateY(${interpolate(progress, [0, 1], [30, 0])}px) scale(${interpolate(progress, [0, 1], [0.85, 1])})`,
    };
  }

  const progress = interpolate(local, [0, Math.max(1, durationFrames)], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  if (type === 'scale') {
    return {
      opacity: progress,
      transform: `scale(${interpolate(progress, [0, 1], [0.6, 1])})`,
    };
  }

  if (type === 'slideUp') {
    return {
      opacity: progress,
      transform: `translateY(${interpolate(progress, [0, 1], [40, 0])}px)`,
    };
  }

  return {opacity: progress, transform: 'none'};
}

export const baseTextStyle: React.CSSProperties = {
  fontFamily: FONTS.body,
  color: COLORS.text,
  margin: 0,
};

export function posStyle(position: Position): React.CSSProperties {
  return {
    position: 'absolute',
    left: position.x,
    top: position.y,
  };
}

export function highlightGlow(active: boolean): React.CSSProperties {
  return active
    ? {
        boxShadow: `0 0 24px ${COLORS.primary}, 0 0 8px ${COLORS.secondary}`,
        borderColor: COLORS.primary,
      }
    : {};
}
