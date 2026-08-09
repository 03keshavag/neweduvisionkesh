/**
 * Fade animation helpers — pure, deterministic functions driven by a frame
 * number so any component can use them without extra state.
 */
import {Easing, interpolate} from 'remotion';

export interface TimingProps {
  frame: number;
  delay?: number;
  duration?: number;
}

export const clamp = (value: number, min = 0, max = 1): number =>
  Math.min(max, Math.max(min, value));

/** Opacity animating 0 → 1 (fade-in). */
export const fadeIn = ({
  frame,
  delay = 0,
  duration = 12,
}: TimingProps): number =>
  interpolate(
    frame,
    [delay, delay + duration],
    [0, 1],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
      easing: Easing.out(Easing.cubic),
    },
  );

/** Opacity animating 1 → 0 (fade-out). */
export const fadeOut = ({
  frame,
  delay = 0,
  duration = 12,
}: TimingProps): number =>
  interpolate(
    frame,
    [delay, delay + duration],
    [1, 0],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
      easing: Easing.in(Easing.cubic),
    },
  );
