import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import {COLORS, FONTS} from '../../remotion/theme';
import type {ElementProps, Position} from '../types';
import {baseTextStyle, posStyle, useElementAnimation} from './shared';

interface ScienceProps {
  position: Position;
  props: ElementProps;
  startFrame?: number;
  durationFrames?: number;
}

/**
 * AtomPrimitive — renders atomic nucleus, electron shells, orbiting valence electrons,
 * and ionic charge states for chemistry explanations.
 */
export const AtomPrimitive: React.FC<ScienceProps> = ({
  position,
  props,
  startFrame = 0,
  durationFrames = 25,
}) => {
  const frame = useCurrentFrame();
  const local = Math.max(0, frame - startFrame);
  const anim = useElementAnimation(startFrame, durationFrames, 'spring');

  const symbol = props.elementSymbol ?? (props.label || 'Na');
  const valence = Number(props.valenceElectrons ?? props.electronCount ?? 1);
  const isPositive = props.isPositiveIon ?? (props.charge === '+1' || props.charge === '+');
  const isNegative = props.isNegativeIon ?? (props.charge === '-1' || props.charge === '-');
  const size = Number(props.radius ?? 60) * 2;
  const cx = size / 2;
  const cy = size / 2;

  // Electron orbit rotation
  const orbitAngle = (local * 2.5) % 360;

  return (
    <div style={{...posStyle(position), ...anim, width: size, height: size, position: 'absolute'}}>
      <svg width={size} height={size} style={{overflow: 'visible'}}>
        {/* Outer and inner electron shells */}
        <circle cx={cx} cy={cy} r={size * 0.44} fill="none" stroke="rgba(56,182,255,0.25)" strokeWidth={1.5} strokeDasharray="4 4" />
        <circle cx={cx} cy={cy} r={size * 0.28} fill="none" stroke="rgba(56,182,255,0.18)" strokeWidth={1} />

        {/* Nucleus */}
        <circle
          cx={cx}
          cy={cy}
          r={size * 0.18}
          fill={isPositive ? 'rgba(56,182,255,0.85)' : isNegative ? 'rgba(244,163,0,0.85)' : COLORS.panel}
          stroke={COLORS.primary}
          strokeWidth={2}
          style={{filter: 'drop-shadow(0 0 6px rgba(56,182,255,0.6))'}}
        />
        <text
          x={cx}
          y={cy + 5}
          textAnchor="middle"
          fill="#ffffff"
          fontSize={16}
          fontFamily={FONTS.body}
          fontWeight="bold"
        >
          {symbol}
        </text>

        {/* Ion charge badge */}
        {isPositive || isNegative ? (
          <g>
            <circle cx={cx + size * 0.32} cy={cy - size * 0.32} r={10} fill={isPositive ? COLORS.primary : '#f4a300'} />
            <text
              x={cx + size * 0.32}
              y={cy - size * 0.32 + 4}
              textAnchor="middle"
              fill="#ffffff"
              fontSize={12}
              fontWeight="bold"
            >
              {isPositive ? '+' : '-'}
            </text>
          </g>
        ) : null}

        {/* Valence electrons on the outer shell */}
        {Array.from({length: Math.min(8, valence)}, (_, i) => {
          const angle = (orbitAngle + (i * 360) / Math.min(8, valence)) * (Math.PI / 180);
          const ex = cx + Math.cos(angle) * (size * 0.44);
          const ey = cy + Math.sin(angle) * (size * 0.44);
          return (
            <circle
              key={i}
              cx={ex}
              cy={ey}
              r={4}
              fill="#38b6ff"
              stroke="#ffffff"
              strokeWidth={1}
              style={{filter: 'drop-shadow(0 0 4px #38b6ff)'}}
            />
          );
        })}
      </svg>
    </div>
  );
};

/**
 * DnaStrand — renders a DNA double helix segment with complementary base pairs
 * and replication/unzipping support for biology explanations.
 */
export const DnaStrand: React.FC<ScienceProps> = ({
  position,
  props,
  startFrame = 0,
  durationFrames = 30,
}) => {
  const frame = useCurrentFrame();
  const local = Math.max(0, frame - startFrame);
  const anim = useElementAnimation(startFrame, durationFrames, 'fadeIn');

  const w = Number(props.width ?? 600);
  const h = Number(props.height ?? 220);
  const rungs = 12;
  const phase = local * 0.08;
  const separation = Number(props.strandSeparation ?? 0);

  const baseColors: Record<string, string> = {
    A: '#ff4d4d', // Adenine (Red)
    T: '#38b6ff', // Thymine (Blue)
    G: '#f4a300', // Guanine (Yellow)
    C: '#2ecc71', // Cytosine (Green)
  };
  const pairs = props.basePairs ?? ['A-T', 'G-C', 'T-A', 'C-G', 'A-T', 'C-G', 'G-C', 'T-A', 'A-T', 'G-C', 'C-G', 'T-A'];

  return (
    <div style={{...posStyle(position), ...anim, width: w, height: h}}>
      <svg width={w} height={h} style={{overflow: 'visible'}}>
        {Array.from({length: rungs}, (_, i) => {
          const x = 30 + i * ((w - 60) / (rungs - 1));
          const waveSin = Math.sin((i / rungs) * Math.PI * 2 + phase);
          const y1 = h / 2 - waveSin * 45 - separation;
          const y2 = h / 2 + waveSin * 45 + separation;

          const pair = (pairs[i % pairs.length] ?? 'A-T').split('-');
          const c1 = baseColors[pair[0]] ?? COLORS.primary;
          const c2 = baseColors[pair[1]] ?? COLORS.secondary;

          return (
            <g key={i}>
              {/* Base pair connection */}
              <line x1={x} y1={y1} x2={x} y2={h / 2} stroke={c1} strokeWidth={3.5} />
              <line x1={x} y1={h / 2} x2={x} y2={y2} stroke={c2} strokeWidth={3.5} />
              {/* Sugar-phosphate backbone nodes */}
              <circle cx={x} cy={y1} r={6} fill="#38b6ff" stroke="#ffffff" strokeWidth={1.5} />
              <circle cx={x} cy={y2} r={6} fill="#f4a300" stroke="#ffffff" strokeWidth={1.5} />
            </g>
          );
        })}
      </svg>
    </div>
  );
};

/**
 * TangentLine — renders a mathematical tangent line on a function curve demonstrating
 * instantaneous rate of change / derivative slope.
 */
export const TangentLine: React.FC<ScienceProps> = ({
  position,
  props,
  startFrame = 0,
  durationFrames = 20,
}) => {
  const frame = useCurrentFrame();
  const local = Math.max(0, frame - startFrame);
  const anim = useElementAnimation(startFrame, durationFrames, 'slideUp');

  const slope = Number(props.slope ?? 1.5);
  const len = Number(props.width ?? 180);
  const angle = (Math.atan(slope) * 180) / Math.PI;

  return (
    <div style={{...posStyle(position), ...anim}}>
      <div
        style={{
          width: len,
          height: 3,
          background: props.color ?? COLORS.success,
          transform: `rotate(${-angle}deg)`,
          transformOrigin: '50% 50%',
          position: 'relative',
          boxShadow: '0 0 8px rgba(46,204,113,0.6)',
        }}
      >
        {props.label ? (
          <span
            style={{
              ...baseTextStyle,
              position: 'absolute',
              right: -10,
              top: -24,
              fontSize: 16,
              color: props.color ?? COLORS.success,
              fontWeight: 'bold',
            }}
          >
            {props.label}
          </span>
        ) : null}
      </div>
    </div>
  );
};
