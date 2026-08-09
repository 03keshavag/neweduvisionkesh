import React from 'react';
import {COLORS} from '../../remotion/theme';
import type {ElementProps, Position} from '../types';
import {baseTextStyle, highlightGlow, posStyle, useElementAnimation} from './shared';

interface TextPrimitiveProps {
  position: Position;
  props: ElementProps;
  startFrame?: number;
  durationFrames?: number;
}

export const Title: React.FC<TextPrimitiveProps> = ({
  position,
  props,
  startFrame = 0,
  durationFrames = 20,
}) => {
  const anim = useElementAnimation(startFrame, durationFrames, 'bounce');
  return (
    <div
      style={{
        ...posStyle(position),
        ...baseTextStyle,
        ...anim,
        fontSize: props.fontSize ?? 72,
        fontWeight: 700,
        color: props.color ?? COLORS.text,
      }}
    >
      {props.text}
    </div>
  );
};

export const Label: React.FC<TextPrimitiveProps> = ({
  position,
  props,
  startFrame = 0,
  durationFrames = 15,
}) => {
  const anim = useElementAnimation(startFrame, durationFrames, 'slideUp');
  return (
    <div
      style={{
        ...posStyle(position),
        ...baseTextStyle,
        ...anim,
        fontSize: props.fontSize ?? 36,
        color: props.color ?? COLORS.textMuted,
        letterSpacing: '0.04em',
      }}
    >
      {props.text ?? props.label}
    </div>
  );
};

export const Equation: React.FC<TextPrimitiveProps> = ({
  position,
  props,
  startFrame = 0,
  durationFrames = 18,
}) => {
  const anim = useElementAnimation(startFrame, durationFrames, 'blurIn');
  return (
    <div
      style={{
        ...posStyle(position),
        ...baseTextStyle,
        ...anim,
        fontSize: props.fontSize ?? 56,
        fontWeight: 600,
        fontFamily: "'Cambria Math', 'Times New Roman', serif",
        color: props.color ?? COLORS.secondary,
        padding: '12px 24px',
        borderRadius: 12,
        background: 'rgba(56, 182, 255, 0.08)',
        border: `1px solid rgba(56, 182, 255, 0.25)`,
      }}
    >
      {props.expression ?? props.text}
    </div>
  );
};

export const HighlightedText: React.FC<TextPrimitiveProps> = ({
  position,
  props,
  startFrame = 0,
  durationFrames = 15,
}) => {
  const anim = useElementAnimation(startFrame, durationFrames, 'spring');
  return (
    <div
      style={{
        ...posStyle(position),
        ...baseTextStyle,
        ...anim,
        fontSize: props.fontSize ?? 42,
        fontWeight: 600,
        color: props.color ?? COLORS.primary,
        ...highlightGlow(true),
        padding: '8px 20px',
        borderRadius: 8,
        border: `2px solid ${COLORS.primary}`,
        background: 'rgba(244, 163, 0, 0.12)',
      }}
    >
      {props.text}
    </div>
  );
};
