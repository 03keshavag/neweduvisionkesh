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

export type EntranceType =
  | 'fadeIn'
  | 'slideUp'
  | 'scale'
  | 'spring'
  | 'bounce'
  | 'blurIn'
  | 'flyIn';

export function useElementAnimation(
  startFrame: number,
  durationFrames: number,
  type: EntranceType = 'fadeIn',
): {opacity: number; transform: string} {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const local = frame - startFrame;

  if (local < 0) {
    return {opacity: 0, transform: 'translateY(28px)'};
  }

  if (type === 'spring' || type === 'bounce') {
    const progress = spring({
      frame: local,
      fps,
      config: {damping: type === 'bounce' ? 9 : 13, stiffness: type === 'bounce' ? 210 : 140},
    });
    return {
      opacity: progress,
      transform: `translateY(${interpolate(progress, [0, 1], [34, 0])}px) scale(${interpolate(progress, [0, 1], [0.7, 1])})`,
    };
  }

  if (type === 'blurIn') {
    const progress = interpolate(local, [0, Math.max(1, durationFrames)], [0, 1], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    });
    return {
      opacity: progress,
      transform: `scale(${interpolate(progress, [0, 1], [0.94, 1])})`,
      filter: `blur(${interpolate(progress, [0, 1], [10, 0])}px)`,
    } as unknown as {opacity: number; transform: string};
  }

  if (type === 'flyIn') {
    const progress = interpolate(local, [0, Math.max(1, durationFrames)], [0, 1], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
      easing: (t: number) => 1 - Math.pow(1 - t, 3),
    });
    return {
      opacity: progress,
      transform: `translateY(${interpolate(progress, [0, 1], [-70, 0])}px) rotate(${interpolate(progress, [0, 1], [-5, 0])}deg)`,
    };
  }

  const progress = interpolate(local, [0, Math.max(1, durationFrames)], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  if (type === 'scale') {
    return {
      opacity: progress,
      transform: `scale(${interpolate(progress, [0, 1], [0.55, 1], {easing: (t) => 1 - Math.pow(1 - t, 3)})})`,
    };
  }

  if (type === 'slideUp') {
    return {
      opacity: progress,
      transform: `translateY(${interpolate(progress, [0, 1], [42, 0])}px)`,
    };
  }

  return {opacity: progress, transform: 'none'};
}

/**
 * Continuous idle motion so elements never sit completely still:
 *  - 'float'  gentle vertical bob
 *  - 'breathe' subtle scale pulse
 *  - 'pulse'   glowing halo
 */
export function useIdleMotion(
  kind: 'float' | 'breathe' | 'pulse' | 'none' = 'none',
  strength = 1,
  phase = 0,
): {transform?: string; boxShadow?: string} {
  const frame = useCurrentFrame();
  const t = frame / 30;

  switch (kind) {
    case 'float':
      return {transform: `translateY(${Math.sin(t * 1.7 + phase) * 7 * strength}px)`};
    case 'breathe':
      return {transform: `scale(${1 + Math.sin(t * 2.2 + phase) * 0.016 * strength})`};
    case 'pulse': {
      const p = 0.5 + 0.5 * Math.sin(t * 3.2 + phase);
      return {
        boxShadow: `0 0 ${18 + p * 20}px rgba(244,163,0,${0.3 + p * 0.35})`,
      };
    }
    default:
      return {};
  }
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
