import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import {COLORS} from '../../remotion/theme';
import type {ElementProps, Position} from '../types';
import {posStyle, useElementAnimation} from './shared';

interface ShapeProps {
  position: Position;
  props: ElementProps;
  startFrame?: number;
  durationFrames?: number;
}

export const Circle: React.FC<ShapeProps> = ({
  position,
  props,
  startFrame = 0,
  durationFrames = 15,
}) => {
  const anim = useElementAnimation(startFrame, durationFrames, 'spring');
  const r = props.radius ?? 40;
  return (
    <div
      style={{
        ...posStyle(position),
        ...anim,
        width: r * 2,
        height: r * 2,
        borderRadius: '50%',
        background: props.fill ?? COLORS.secondary,
        border: `${props.strokeWidth ?? 2}px solid ${props.stroke ?? COLORS.text}`,
      }}
    />
  );
};

export const Rectangle: React.FC<ShapeProps> = ({
  position,
  props,
  startFrame = 0,
  durationFrames = 15,
}) => {
  const anim = useElementAnimation(startFrame, durationFrames, 'scale');
  return (
    <div
      style={{
        ...posStyle(position),
        ...anim,
        width: props.width ?? 120,
        height: props.height ?? 80,
        borderRadius: 8,
        background: props.fill ?? COLORS.panel,
        border: `${props.strokeWidth ?? 2}px solid ${props.stroke ?? COLORS.divider}`,
      }}
    />
  );
};

export const ArrowShape: React.FC<ShapeProps> = ({
  position,
  props,
  startFrame = 0,
  durationFrames = 20,
}) => {
  const frame = useCurrentFrame();
  const local = frame - startFrame;
  const progress = interpolate(local, [0, durationFrames], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const from = props.from ?? {x: 0, y: 0};
  const to = props.to ?? {x: 100, y: 0};
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const len = Math.sqrt(dx * dx + dy * dy);
  const angle = (Math.atan2(dy, dx) * 180) / Math.PI;

  return (
    <div
      style={{
        ...posStyle({x: position.x + from.x, y: position.y + from.y}),
        opacity: progress,
        transform: `rotate(${angle}deg)`,
        transformOrigin: '0 50%',
      }}
    >
      <div
        style={{
          width: len * progress,
          height: 4,
          background: props.color ?? COLORS.primary,
          position: 'relative',
        }}
      >
        <div
          style={{
            position: 'absolute',
            right: -8,
            top: -6,
            width: 0,
            height: 0,
            borderTop: '8px solid transparent',
            borderBottom: '8px solid transparent',
            borderLeft: `12px solid ${props.color ?? COLORS.primary}`,
          }}
        />
      </div>
    </div>
  );
};

export const LineShape: React.FC<ShapeProps> = ({position, props, startFrame = 0, durationFrames = 15}) => {
  const anim = useElementAnimation(startFrame, durationFrames, 'fadeIn');
  const from = props.from ?? {x: 0, y: 0};
  const to = props.to ?? {x: 200, y: 0};
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const len = Math.sqrt(dx * dx + dy * dy);
  const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
  return (
    <div
      style={{
        ...posStyle({x: position.x + from.x, y: position.y + from.y}),
        ...anim,
        width: len,
        height: props.strokeWidth ?? 2,
        background: props.stroke ?? COLORS.textMuted,
        transform: `rotate(${angle}deg)`,
        transformOrigin: '0 50%',
      }}
    />
  );
};

export const Grid: React.FC<ShapeProps> = ({position, props, startFrame = 0, durationFrames = 20}) => {
  const anim = useElementAnimation(startFrame, durationFrames, 'fadeIn');
  const w = props.width ?? 400;
  const h = props.height ?? 400;
  const step = 40;
  const lines: React.ReactNode[] = [];
  for (let x = 0; x <= w; x += step) {
    lines.push(
      <div
        key={`v${x}`}
        style={{
          position: 'absolute',
          left: x,
          top: 0,
          width: 1,
          height: h,
          background: 'rgba(255,255,255,0.08)',
        }}
      />,
    );
  }
  for (let y = 0; y <= h; y += step) {
    lines.push(
      <div
        key={`h${y}`}
        style={{
          position: 'absolute',
          left: 0,
          top: y,
          width: w,
          height: 1,
          background: 'rgba(255,255,255,0.08)',
        }}
      />,
    );
  }
  return (
    <div style={{...posStyle(position), ...anim, width: w, height: h, position: 'absolute'}}>
      {lines}
    </div>
  );
};

export const Polygon: React.FC<ShapeProps> = ({position, props, startFrame = 0, durationFrames = 15}) => {
  const anim = useElementAnimation(startFrame, durationFrames, 'spring');
  const sides = props.sides ?? 6;
  const r = props.radius ?? 50;
  const points = Array.from({length: sides}, (_, i) => {
    const angle = (i * 2 * Math.PI) / sides - Math.PI / 2;
    return `${r + r * Math.cos(angle)},${r + r * Math.sin(angle)}`;
  }).join(' ');
  return (
    <svg
      style={{...posStyle(position), ...anim, overflow: 'visible'}}
      width={r * 2}
      height={r * 2}
    >
      <polygon
        points={points}
        fill={props.fill ?? 'rgba(56,182,255,0.3)'}
        stroke={props.stroke ?? COLORS.secondary}
        strokeWidth={props.strokeWidth ?? 2}
      />
    </svg>
  );
};
