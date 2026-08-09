/**
 * Subtitle — a re-usable narration caption shown near the bottom of the frame.
 * Displays `scene.narration` so the spoken text doubles as a subtitle.
 */
import React from 'react';
import {useCurrentFrame} from 'remotion';
import {fadeIn} from '../animations/fade';
import {slideTransform} from '../animations/slide';
import {COLORS, FONTS} from '../theme';

interface SubtitleProps {
  text: string;
  delay?: number;
}

export const Subtitle: React.FC<SubtitleProps> = ({text, delay = 0}) => {
  const frame = useCurrentFrame();
  const opacity = fadeIn({frame, delay, duration: 10});
  const transform = slideTransform({
    frame,
    delay,
    duration: 12,
    direction: 'up',
    distance: 16,
  });

  if (!text) {
    return null;
  }

  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 76,
        display: 'flex',
        justifyContent: 'center',
        padding: '0 180px',
        zIndex: 10,
      }}
    >
      <div
        style={{
          opacity,
          transform,
          maxWidth: 1360,
          background: 'rgba(7, 14, 24, 0.85)',
          border: `1px solid ${COLORS.divider}`,
          borderRadius: 16,
          padding: '20px 34px',
          fontFamily: FONTS.body,
          color: '#eaf0f8',
          fontSize: 30,
          lineHeight: 1.45,
          textAlign: 'center',
        }}
      >
        {text}
      </div>
    </div>
  );
};
