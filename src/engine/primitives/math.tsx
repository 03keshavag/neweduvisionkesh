import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import {COLORS, FONTS} from '../../remotion/theme';
import type {ElementProps, Position} from '../types';
import {baseTextStyle, posStyle, useElementAnimation} from './shared';

interface MathProps {
  position: Position;
  props: ElementProps;
  startFrame?: number;
  durationFrames?: number;
}

export const CoordinatePlane: React.FC<MathProps> = ({
  position,
  props,
  startFrame = 0,
  durationFrames = 25,
}) => {
  const anim = useElementAnimation(startFrame, durationFrames, 'fadeIn');
  const w = props.width ?? 500;
  const h = props.height ?? 400;
  const cx = w / 2;
  const cy = h / 2;
  return (
    <svg style={{...posStyle(position), ...anim}} width={w} height={h}>
      <rect width={w} height={h} fill="rgba(16,27,44,0.6)" rx={8} />
      <line x1={0} y1={cy} x2={w} y2={cy} stroke={COLORS.textMuted} strokeWidth={1} />
      <line x1={cx} y1={0} x2={cx} y2={h} stroke={COLORS.textMuted} strokeWidth={1} />
      {Array.from({length: 10}, (_, i) => (
        <g key={i}>
          <line
            x1={(i + 1) * (w / 11)}
            y1={cy - 4}
            x2={(i + 1) * (w / 11)}
            y2={cy + 4}
            stroke={COLORS.divider}
          />
          <line
            x1={cx - 4}
            y1={(i + 1) * (h / 11)}
            x2={cx + 4}
            y2={(i + 1) * (h / 11)}
            stroke={COLORS.divider}
          />
        </g>
      ))}
    </svg>
  );
};

export const GraphVisual: React.FC<MathProps> = ({
  position,
  props,
  startFrame = 0,
  durationFrames = 30,
}) => {
  const frame = useCurrentFrame();
  const local = frame - startFrame;
  const progress = interpolate(local, [0, durationFrames], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const points = props.points ?? [
    {x: 50, y: 300},
    {x: 150, y: 200},
    {x: 250, y: 150},
    {x: 350, y: 120},
    {x: 450, y: 80},
  ];
  const visibleCount = Math.ceil(points.length * progress);
  const pathD = points
    .slice(0, visibleCount)
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
    .join(' ');
  return (
    <svg style={{...posStyle(position), opacity: progress}} width={500} height={350}>
      <path d={pathD} fill="none" stroke={COLORS.secondary} strokeWidth={3} />
      {points.slice(0, visibleCount).map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={5} fill={COLORS.primary} />
      ))}
    </svg>
  );
};

export const FunctionCurve: React.FC<MathProps> = ({
  position,
  props,
  startFrame = 0,
  durationFrames = 30,
}) => {
  const frame = useCurrentFrame();
  const local = frame - startFrame;
  const progress = interpolate(local, [0, durationFrames], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const w = 500;
  const h = 300;
  const pts: string[] = [];
  for (let x = 0; x <= w * progress; x += 4) {
    const nx = (x / w) * 8 - 4;
    const y = h / 2 - (nx * nx * 15);
    pts.push(`${x === 0 ? 'M' : 'L'} ${x} ${y}`);
  }
  return (
    <svg style={{...posStyle(position), opacity: progress}} width={w} height={h}>
      <path d={pts.join(' ')} fill="none" stroke={COLORS.success} strokeWidth={3} />
    </svg>
  );
};

export const Vector: React.FC<MathProps> = ({position, props, startFrame = 0, durationFrames = 20}) => {
  const anim = useElementAnimation(startFrame, durationFrames, 'slideUp');
  const from = props.from ?? {x: 100, y: 150};
  const to = props.to ?? {x: 250, y: 80};
  return (
    <svg style={{...posStyle(position), ...anim}} width={400} height={250}>
      <defs>
        <marker id="vec-arrow" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
          <polygon points="0 0, 10 3.5, 0 7" fill={COLORS.primary} />
        </marker>
      </defs>
      <line
        x1={from.x}
        y1={from.y}
        x2={to.x}
        y2={to.y}
        stroke={COLORS.primary}
        strokeWidth={3}
        markerEnd="url(#vec-arrow)"
      />
      {props.label ? (
        <text x={to.x + 10} y={to.y} fill={COLORS.text} fontSize={20} fontFamily={FONTS.body}>
          {props.label}
        </text>
      ) : null}
    </svg>
  );
};

export const NumberLine: React.FC<MathProps> = ({
  position,
  props,
  startFrame = 0,
  durationFrames = 20,
}) => {
  const anim = useElementAnimation(startFrame, durationFrames, 'fadeIn');
  const values = (props.values as number[]) ?? [-2, -1, 0, 1, 2, 3, 4];
  const highlight = props.highlightedIndex;
  return (
    <div style={{...posStyle(position), ...anim, display: 'flex', alignItems: 'center', gap: 0}}>
      <div style={{width: 600, height: 3, background: COLORS.textMuted, position: 'relative'}}>
        {values.map((v, i) => (
          <div
            key={v}
            style={{
              position: 'absolute',
              left: `${(i / (values.length - 1)) * 100}%`,
              transform: 'translateX(-50%)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              top: -30,
            }}
          >
            <div
              style={{
                width: highlight === i ? 14 : 8,
                height: highlight === i ? 14 : 8,
                borderRadius: '50%',
                background: highlight === i ? COLORS.primary : COLORS.secondary,
                marginBottom: 8,
              }}
            />
            <span style={{...baseTextStyle, fontSize: 24}}>{v}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export const GeometricShape: React.FC<MathProps> = ({
  position,
  props,
  startFrame = 0,
  durationFrames = 18,
}) => {
  const anim = useElementAnimation(startFrame, durationFrames, 'scale');
  return (
    <div
      style={{
        ...posStyle(position),
        ...anim,
        width: props.width ?? 100,
        height: props.height ?? 100,
        border: `3px solid ${props.stroke ?? COLORS.secondary}`,
        background: props.fill ?? 'rgba(56,182,255,0.15)',
        borderRadius: props.sides === 0 ? '50%' : 4,
      }}
    />
  );
};

export const EquationDisplay: React.FC<MathProps> = ({
  position,
  props,
  startFrame = 0,
  durationFrames = 18,
}) => {
  const anim = useElementAnimation(startFrame, durationFrames, 'scale');
  return (
    <div
      style={{
        ...posStyle(position),
        ...anim,
        fontSize: props.fontSize ?? 48,
        fontFamily: "'Cambria Math', serif",
        color: props.color ?? COLORS.secondary,
      }}
    >
      {props.expression}
    </div>
  );
};
