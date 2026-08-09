import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import {COLORS, FONTS} from '../../remotion/theme';
import type {ElementProps, Position} from '../types';
import {baseTextStyle, posStyle, useElementAnimation} from './shared';

interface PhysicsProps {
  position: Position;
  props: ElementProps;
  startFrame?: number;
  durationFrames?: number;
}

export const PhysicsObject: React.FC<PhysicsProps> = ({
  position,
  props,
  startFrame = 0,
  durationFrames = 20,
}) => {
  const frame = useCurrentFrame();
  const local = frame - startFrame;
  const anim = useElementAnimation(startFrame, durationFrames, 'fadeIn');
  const moveX = props.velocity
    ? interpolate(local, [durationFrames, durationFrames + 60], [0, Number(props.velocity) * 3], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      })
    : 0;
  return (
    <div
      style={{
        ...posStyle({x: position.x + moveX, y: position.y}),
        ...anim,
        width: props.width ?? 120,
        height: props.height ?? 80,
        background: props.fill ?? COLORS.secondary,
        borderRadius: 8,
        border: `2px solid ${COLORS.text}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 20,
        color: COLORS.text,
        fontFamily: FONTS.body,
      }}
    >
      {props.mass ? `${props.mass} kg` : 'm'}
    </div>
  );
};

function ArrowPrimitive({
  position,
  props,
  startFrame,
  durationFrames,
  defaultColor,
  label,
}: PhysicsProps & {defaultColor: string; label: string}) {
  const anim = useElementAnimation(startFrame ?? 0, durationFrames ?? 18, 'slideUp');
  const len = Number(props.force ?? props.velocity ?? props.acceleration ?? 80);
  const dir = props.direction ?? 'right';
  const rotations: Record<string, number> = {right: 0, left: 180, up: -90, down: 90};
  return (
    <div style={{...posStyle(position), ...anim}}>
      <div
        style={{
          transform: `rotate(${rotations[dir]}deg)`,
          transformOrigin: '0 50%',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <div
          style={{
            width: len,
            height: 5,
            background: props.color ?? defaultColor,
            position: 'relative',
          }}
        >
          <div
            style={{
              position: 'absolute',
              right: -10,
              top: -7,
              borderTop: '9px solid transparent',
              borderBottom: '9px solid transparent',
              borderLeft: `14px solid ${props.color ?? defaultColor}`,
            }}
          />
        </div>
      </div>
      <span style={{...baseTextStyle, fontSize: 22, color: props.color ?? defaultColor, marginTop: 8, display: 'block'}}>
        {label}
      </span>
    </div>
  );
}

export const ForceArrow: React.FC<PhysicsProps> = (p) => (
  <ArrowPrimitive {...p} defaultColor={COLORS.primary} label="F" />
);

export const VelocityArrow: React.FC<PhysicsProps> = (p) => (
  <ArrowPrimitive {...p} defaultColor={COLORS.success} label="v" />
);

export const AccelerationArrow: React.FC<PhysicsProps> = (p) => (
  <ArrowPrimitive {...p} defaultColor={COLORS.secondary} label="a" />
);

export const Trajectory: React.FC<PhysicsProps> = ({position, props, startFrame = 0, durationFrames = 40}) => {
  const frame = useCurrentFrame();
  const local = frame - startFrame;
  const progress = interpolate(local, [0, durationFrames], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const pts: string[] = [];
  for (let t = 0; t <= progress; t += 0.02) {
    const x = t * 400;
    const y = 200 - 180 * t + 200 * t * t;
    pts.push(`${pts.length === 0 ? 'M' : 'L'} ${x} ${y}`);
  }
  return (
    <svg style={{...posStyle(position), opacity: progress}} width={450} height={250}>
      <path d={pts.join(' ')} fill="none" stroke={COLORS.primary} strokeWidth={2} strokeDasharray="6 4" />
    </svg>
  );
};

export const Wave: React.FC<PhysicsProps> = ({position, props, startFrame = 0, durationFrames = 60}) => {
  const frame = useCurrentFrame();
  const local = frame - startFrame;
  const amp = Number(props.amplitude ?? 40);
  const freq = Number(props.frequency ?? 2);
  const phase = local * 0.15;
  const pts: string[] = [];
  for (let x = 0; x <= 500; x += 4) {
    const y = 100 + amp * Math.sin((x / 500) * Math.PI * freq * 2 + phase);
    pts.push(`${x === 0 ? 'M' : 'L'} ${x} ${y}`);
  }
  const opacity = interpolate(local, [0, 15], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <svg style={{...posStyle(position), opacity}} width={500} height={200}>
      <path d={pts.join(' ')} fill="none" stroke={COLORS.secondary} strokeWidth={3} />
    </svg>
  );
};

export const Particle: React.FC<PhysicsProps> = ({position, props, startFrame = 0, durationFrames = 30}) => {
  const frame = useCurrentFrame();
  const local = frame - startFrame;
  const progress = interpolate(local, [0, durationFrames], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  return (
    <div
      style={{
        ...posStyle({x: position.x + progress * 300, y: position.y - Math.sin(progress * Math.PI) * 80}),
        width: 16,
        height: 16,
        borderRadius: '50%',
        background: props.color ?? COLORS.primary,
        boxShadow: `0 0 12px ${props.color ?? COLORS.primary}`,
      }}
    />
  );
};

export const Spring: React.FC<PhysicsProps> = ({position, props, startFrame = 0, durationFrames = 40}) => {
  const frame = useCurrentFrame();
  const local = frame - startFrame;
  const compress = interpolate(local, [0, durationFrames / 2, durationFrames], [0, 30, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const coils = 8;
  const w = 200 - compress;
  const path: string[] = [`M 0 20`];
  for (let i = 0; i <= coils; i++) {
    const x = (i / coils) * w;
    const y = i % 2 === 0 ? 10 : 30;
    path.push(`L ${x} ${y}`);
  }
  const opacity = interpolate(local, [0, 10], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <svg style={{...posStyle(position), opacity}} width={220} height={40}>
      <path d={path.join(' ')} fill="none" stroke={COLORS.textMuted} strokeWidth={3} />
    </svg>
  );
};

export const CircuitElement: React.FC<PhysicsProps> = ({position, props, startFrame = 0, durationFrames = 20}) => {
  const anim = useElementAnimation(startFrame, durationFrames, 'fadeIn');
  return (
    <svg style={{...posStyle(position), ...anim}} width={300} height={120}>
      <rect x={20} y={40} width={60} height={40} fill={COLORS.panel} stroke={COLORS.secondary} strokeWidth={2} />
      <text x={50} y={66} textAnchor="middle" fill={COLORS.text} fontSize={16} fontFamily={FONTS.body}>
        {props.label ?? 'R'}
      </text>
      <line x1={80} y1={60} x2={140} y2={60} stroke={COLORS.textMuted} strokeWidth={2} />
      <circle cx={180} cy={60} r={20} fill="none" stroke={COLORS.primary} strokeWidth={2} />
      <line x1={200} y1={60} x2={260} y2={60} stroke={COLORS.textMuted} strokeWidth={2} />
    </svg>
  );
};
