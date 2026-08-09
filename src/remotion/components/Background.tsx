/**
 * Background — full-frame animated gradient backdrop shared by all scenes.
 * Persistent decorative blobs + a subtle grid read as "educational studio".
 */
import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {COLORS} from '../theme';

export const Background: React.FC = () => {
  const frame = useCurrentFrame();
  const driftX = 30 * Math.sin(frame / 60);
  const driftY = 22 * Math.cos(frame / 80);

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(160deg, ${COLORS.backgroundDeep} 0%, ${COLORS.background} 45%, #16233a 100%)`,
      }}
    >
      <div
        style={{
          position: 'absolute',
          width: 760,
          height: 760,
          borderRadius: '50%',
          top: -240 + driftY,
          left: -160 + driftX,
          background:
            'radial-gradient(circle, rgba(56,182,255,0.20), transparent 70%)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          width: 980,
          height: 980,
          borderRadius: '50%',
          bottom: -340 - driftY,
          right: -280 - driftX,
          background:
            'radial-gradient(circle, rgba(244,163,0,0.13), transparent 70%)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          opacity: 0.05,
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
          backgroundSize: '90px 90px',
        }}
      />
    </AbsoluteFill>
  );
};
