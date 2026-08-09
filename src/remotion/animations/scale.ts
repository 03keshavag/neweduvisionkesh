/**
 * Scale animation helpers — deterministic, driven by frame.
 */
import {Easing, interpolate} from 'remotion';
import type {TimingProps} from './fade';

export interface ScaleProps extends TimingProps {
  from?: number;
}

/** Multiplier animating `from` → 1 (grows/settles into full size). */
export const scaleIn = ({
  frame,
  delay = 0,
  duration = 14,
  from = 0.92,
}: ScaleProps): number =>
  interpolate(
    frame,
    [delay, delay + duration],
    [from, 1],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
      easing: Easing.out(Easing.cubic),
    },
  );
