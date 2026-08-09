/**
 * Slide animation helpers — deterministic transforms driven by frame.
 */
import {Easing, interpolate} from 'remotion';

export type SlideDirection = 'up' | 'down' | 'left' | 'right';

export interface SlideProps {
  frame: number;
  delay?: number;
  duration?: number;
  direction?: SlideDirection;
  distance?: number;
}

/** Raw pixel offset that animates toward 0 (element settles into place). */
export const slideOffset = ({
  frame,
  delay = 0,
  duration = 12,
  direction = 'up',
  distance = 60,
}: SlideProps): number =>
  interpolate(
    frame,
    [delay, delay + duration],
    [distance, 0],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
      easing: Easing.out(Easing.cubic),
    },
  );

/** CSS transform string for a slide entrance (compose with opacity yourself). */
export const slideTransform = (props: SlideProps): string => {
  const offset = slideOffset(props);
  const dir = props.direction ?? 'up';
  if (dir === 'left') return `translateX(${offset}px)`;
  if (dir === 'right') return `translateX(${-offset}px)`;
  if (dir === 'down') return `translateY(${-offset}px)`;
  return `translateY(${offset}px)`;
};
