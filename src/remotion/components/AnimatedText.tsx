/**
 * AnimatedText — text with a smooth fade + slide entrance.
 * The single text primitive used by every scene, so typography stays consistent
 * and supports Indian regional scripts via the shared font stack.
 */
import React from 'react';
import {useCurrentFrame} from 'remotion';
import {fadeIn} from '../animations/fade';
import {slideTransform} from '../animations/slide';
import {COLORS, FONTS} from '../theme';

export type TextVariant = 'title' | 'heading' | 'subtitle' | 'label' | 'body';

const VARIANT_STYLES: Record<TextVariant, React.CSSProperties> = {
  title: {fontSize: 92, fontWeight: 700, letterSpacing: -1},
  heading: {fontSize: 56, fontWeight: 700, lineHeight: 1.25},
  subtitle: {fontSize: 36, fontWeight: 500, lineHeight: 1.4},
  label: {
    fontSize: 24,
    fontWeight: 700,
    letterSpacing: 3,
    textTransform: 'uppercase',
  },
  body: {fontSize: 30, fontWeight: 400, lineHeight: 1.55},
};

interface AnimatedTextProps {
  children?: React.ReactNode;
  variant?: TextVariant;
  delay?: number;
  color?: string;
  align?: 'left' | 'center' | 'right';
  style?: React.CSSProperties;
}

export const AnimatedText: React.FC<AnimatedTextProps> = ({
  children,
  variant = 'body',
  delay = 0,
  color,
  align = 'left',
  style,
}) => {
  const frame = useCurrentFrame();
  const opacity = fadeIn({frame, delay, duration: 14});
  const transform = slideTransform({
    frame,
    delay,
    duration: 14,
    direction: 'up',
    distance: 40,
  });

  return (
    <div
      style={{
        opacity,
        transform,
        ...VARIANT_STYLES[variant],
        fontFamily: FONTS.display,
        color: color ?? COLORS.text,
        textAlign: align,
        ...style,
      }}
    >
      {children}
    </div>
  );
};
