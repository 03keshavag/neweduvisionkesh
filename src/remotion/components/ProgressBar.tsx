/**
 * ProgressBar — thin progress indicator pinned to the top of the frame.
 * Width is recomputed per frame from `progress`, so it stays in sync with
 * playback without relying on CSS transitions.
 */
import React from 'react';
import {COLORS} from '../theme';

interface ProgressBarProps {
  /** 0 → 1 overall video progress. */
  progress: number;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({progress}) => {
  const p = Math.min(1, Math.max(0, progress));

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 8,
        zIndex: 50,
        background: 'rgba(255,255,255,0.10)',
      }}
    >
      <div
        style={{
          height: '100%',
          width: `${p * 100}%`,
          background: `linear-gradient(90deg, ${COLORS.secondary}, ${COLORS.primary})`,
        }}
      />
    </div>
  );
};
