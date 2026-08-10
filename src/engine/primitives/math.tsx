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
  const w = props.width ?? 600;
  const h = props.height ?? 420;
  const cx = w / 2;
  const cy = h / 2;

  return (
    <svg style={{...posStyle(position), ...anim}} width={w} height={h}>
      <defs>
        <marker id="axis-arrow-x" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
          <polygon points="0 0, 8 3, 0 6" fill={COLORS.textMuted} />
        </marker>
        <marker id="axis-arrow-y" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
          <polygon points="0 0, 8 3, 0 6" fill={COLORS.textMuted} />
        </marker>
      </defs>
      <rect width={w} height={h} fill="rgba(11,20,34,0.75)" rx={8} stroke={COLORS.divider} strokeWidth={1} />

      {/* Grid lines */}
      {Array.from({length: 12}, (_, i) => {
        const gx = (i + 1) * (w / 13);
        const gy = (i + 1) * (h / 13);
        return (
          <g key={i}>
            <line x1={gx} y1={0} x2={gx} y2={h} stroke="rgba(255,255,255,0.05)" strokeWidth={1} />
            <line x1={0} y1={gy} x2={w} y2={gy} stroke="rgba(255,255,255,0.05)" strokeWidth={1} />
          </g>
        );
      })}

      {/* X and Y Main Axes */}
      <line x1={20} y1={cy} x2={w - 20} y2={cy} stroke={COLORS.textMuted} strokeWidth={2} markerEnd="url(#axis-arrow-x)" />
      <line x1={cx} y1={h - 20} x2={cx} y2={20} stroke={COLORS.textMuted} strokeWidth={2} markerEnd="url(#axis-arrow-y)" />

      {/* Axis Labels */}
      <text x={w - 18} y={cy - 10} fill={COLORS.textMuted} fontSize={18} fontFamily={FONTS.body} fontWeight="bold">x</text>
      <text x={cx + 10} y={24} fill={COLORS.textMuted} fontSize={18} fontFamily={FONTS.body} fontWeight="bold">y</text>
      <text x={cx - 16} y={cy + 18} fill="rgba(255,255,255,0.4)" fontSize={14} fontFamily={FONTS.body}>0</text>
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
  const local = Math.max(0, frame - startFrame);
  const progress = interpolate(local, [0, Math.max(1, durationFrames)], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const w = props.width ?? 600;
  const h = props.height ?? 380;
  const pts: string[] = [];
  const areaPts: string[] = [`M 0 ${h / 2}`];

  // Draw smooth curve (e.g. parabola y = x^2, or custom expression)
  for (let x = 0; x <= w * progress; x += 4) {
    const nx = (x / w) * 6 - 3;
    const y = h * 0.75 - (nx * nx * 28);
    pts.push(`${x === 0 ? 'M' : 'L'} ${x} ${y}`);
    areaPts.push(`L ${x} ${y}`);
  }
  if (pts.length > 0) {
    areaPts.push(`L ${w * progress} ${h / 2} Z`);
  }

  return (
    <svg style={{...posStyle(position), opacity: progress}} width={w} height={h}>
      {props.showArea ? (
        <path d={areaPts.join(' ')} fill="rgba(56,182,255,0.18)" />
      ) : null}
      <path d={pts.join(' ')} fill="none" stroke={props.color ?? COLORS.success} strokeWidth={3.5} />
    </svg>
  );
};

export const Vector: React.FC<MathProps> = ({position, props, startFrame = 0, durationFrames = 20}) => {
  const anim = useElementAnimation(startFrame, durationFrames, 'slideUp');
  const from = props.from ?? {x: 60, y: 160};
  const to = props.to ?? {x: 280, y: 60};
  const vecColor = props.color ?? COLORS.primary;

  return (
    <svg style={{...posStyle(position), ...anim}} width={props.width ?? 420} height={props.height ?? 260}>
      <defs>
        <marker id="vec-arrow-head" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
          <polygon points="0 0, 10 3.5, 0 7" fill={vecColor} />
        </marker>
      </defs>

      {/* Projection dashed lines for vx, vy components */}
      {props.showVelocityComponents ? (
        <g>
          <line x1={from.x} y1={from.y} x2={to.x} y2={from.y} stroke="rgba(56,182,255,0.6)" strokeWidth={1.5} strokeDasharray="4 4" />
          <line x1={to.x} y1={from.y} x2={to.x} y2={to.y} stroke="rgba(244,163,0,0.6)" strokeWidth={1.5} strokeDasharray="4 4" />
        </g>
      ) : null}

      <line
        x1={from.x}
        y1={from.y}
        x2={to.x}
        y2={to.y}
        stroke={vecColor}
        strokeWidth={3.5}
        markerEnd="url(#vec-arrow-head)"
      />
      {props.label ? (
        <text x={to.x + 12} y={to.y + 4} fill={vecColor} fontSize={22} fontFamily={FONTS.body} fontWeight="bold">
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
