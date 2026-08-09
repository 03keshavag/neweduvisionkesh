import React from 'react';
import {COLORS, FONTS} from '../../remotion/theme';
import type {ElementProps, Position} from '../types';
import {posStyle, useElementAnimation} from './shared';

interface CardProps {
  position: Position;
  props: ElementProps;
  startFrame?: number;
  durationFrames?: number;
}

const cardShell: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  borderRadius: 18,
  boxSizing: 'border-box',
};

/**
 * StepCard — the bottom "narration / step" callout used in explainers:
 * a small heading (step title) plus the on-screen step text.
 */
export const StepCard: React.FC<CardProps> = ({
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
        ...anim,
        ...cardShell,
        width: props.width ?? 780,
        padding: '16px 24px',
        background: 'rgba(7, 14, 24, 0.82)',
        border: `1px solid ${COLORS.divider}`,
      }}
    >
      {props.title ? (
        <div
          style={{
            fontSize: 28,
            fontWeight: 700,
            color: props.color ?? COLORS.primary,
            fontFamily: FONTS.body,
            marginBottom: 6,
          }}
        >
          {props.title}
        </div>
      ) : null}
      <div
        style={{
          fontSize: 22,
          lineHeight: 1.5,
          color: COLORS.text,
          fontFamily: FONTS.body,
        }}
      >
        {props.text ?? props.label}
      </div>
    </div>
  );
};

/**
 * InfoCard — a generic content block (heading + body), used as the base
 * "block" primitive for flexible explainer layouts.
 */
export const InfoCard: React.FC<CardProps> = ({
  position,
  props,
  startFrame = 0,
  durationFrames = 16,
}) => {
  const anim = useElementAnimation(startFrame, durationFrames, 'spring');
  const accent = (props.color as string) ?? COLORS.secondary;
  return (
    <div
      style={{
        ...posStyle(position),
        ...anim,
        ...cardShell,
        width: props.width ?? 420,
        minHeight: props.height ?? 120,
        padding: '20px 26px',
        background: COLORS.panel,
        border: `1px solid ${COLORS.divider}`,
        borderLeft: `6px solid ${accent}`,
      }}
    >
      {props.title ? (
        <div
          style={{
            fontSize: 30,
            fontWeight: 700,
            color: accent,
            fontFamily: FONTS.body,
            marginBottom: 10,
          }}
        >
          {props.title}
        </div>
      ) : null}
      <div
        style={{
          fontSize: 24,
          lineHeight: 1.45,
          color: COLORS.text,
          fontFamily: FONTS.body,
        }}
      >
        {props.text ?? props.label}
      </div>
    </div>
  );
};