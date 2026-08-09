/**
 * Spring animation helpers — physics-based motion via Remotion's spring().
 * These are hooks because spring() needs the composition's fps.
 */
import {spring, useVideoConfig, type SpringConfig} from 'remotion';
import {clamp} from './fade';

export interface SpringHookProps {
  frame: number;
  delay?: number;
  config?: Partial<SpringConfig>;
}

/** Normalised spring progress (0 → ~1) for a given frame. */
export function useSpringProgress({
  frame,
  delay = 0,
  config,
}: SpringHookProps): number {
  const {fps} = useVideoConfig();
  return spring({
    frame: frame - delay,
    fps,
    config: {damping: 12, stiffness: 120, ...config},
  });
}

/** Opacity driven by a spring (starts invisible, springs in). */
export function useSpringOpacity({
  frame,
  delay = 0,
  config,
}: SpringHookProps): number {
  return clamp(useSpringProgress({frame, delay, config}));
}

/** Scale driven by a spring (grows from `from` to 1). */
export function useSpringScale({
  frame,
  delay = 0,
  from = 0.86,
  config,
}: SpringHookProps & {from?: number}): number {
  const progress = useSpringProgress({frame, delay, config});
  return from + (1 - from) * progress;
}
