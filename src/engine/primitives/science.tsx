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

/* =========================================================
   MOLECULE — SVG diagrams for chemical reactions & molecular biology
========================================================= */

type MoleculeAtom = {x: number; y: number; el: string; label: string};
type MoleculeBond = [number, number];

const ATOM_COLOR: Record<string, string> = {
  C: '#334155',
  H: '#e2e8f0',
  O: '#ef4444',
  N: '#3b82f6',
  Na: '#8b5cf6',
  Cl: '#10b981',
};
const ATOM_TEXT: Record<string, string> = {
  C: '#f8fafc',
  H: '#0f172a',
  O: '#f8fafc',
  N: '#f8fafc',
  Na: '#ffffff',
  Cl: '#ffffff',
};
const ATOM_R: Record<string, number> = {C: 16, H: 11, O: 15, N: 15, Na: 18, Cl: 17};

const MOLECULES: Record<string, {atoms: MoleculeAtom[]; bonds: MoleculeBond[]; label: string}> = {
  CH4: {
    label: 'Methane (CH₄)',
    atoms: [
      {x: 50, y: 50, el: 'C', label: 'C'},
      {x: 50, y: 14, el: 'H', label: 'H'},
      {x: 50, y: 86, el: 'H', label: 'H'},
      {x: 14, y: 50, el: 'H', label: 'H'},
      {x: 86, y: 50, el: 'H', label: 'H'},
    ],
    bonds: [
      [0, 1],
      [0, 2],
      [0, 3],
      [0, 4],
    ],
  },
  CH3CL: {
    label: 'Methyl Chloride (CH₃Cl)',
    atoms: [
      {x: 50, y: 50, el: 'C', label: 'C'},
      {x: 50, y: 14, el: 'H', label: 'H'},
      {x: 50, y: 86, el: 'H', label: 'H'},
      {x: 14, y: 50, el: 'H', label: 'H'},
      {x: 86, y: 50, el: 'Cl', label: 'Cl'},
    ],
    bonds: [
      [0, 1],
      [0, 2],
      [0, 3],
      [0, 4],
    ],
  },
  CH3F: {
    label: 'Methyl Fluoride (CH₃F)',
    atoms: [
      {x: 50, y: 50, el: 'C', label: 'C'},
      {x: 50, y: 14, el: 'H', label: 'H'},
      {x: 50, y: 86, el: 'H', label: 'H'},
      {x: 14, y: 50, el: 'H', label: 'H'},
      {x: 86, y: 50, el: 'F', label: 'F'},
    ],
    bonds: [
      [0, 1],
      [0, 2],
      [0, 3],
      [0, 4],
    ],
  },
  AGF: {
    label: 'Silver Fluoride (AgF)',
    atoms: [
      {x: 32, y: 50, el: 'Ag', label: 'Ag⁺'},
      {x: 68, y: 50, el: 'F', label: 'F⁻'},
    ],
    bonds: [[0, 1]],
  },
  AGCL: {
    label: 'Silver Chloride (AgCl ↓)',
    atoms: [
      {x: 32, y: 50, el: 'Ag', label: 'Ag⁺'},
      {x: 68, y: 50, el: 'Cl', label: 'Cl⁻'},
    ],
    bonds: [[0, 1]],
  },
  SBF3: {
    label: 'Antimony Trifluoride (SbF₃)',
    atoms: [
      {x: 50, y: 35, el: 'Sb', label: 'Sb'},
      {x: 24, y: 76, el: 'F', label: 'F'},
      {x: 50, y: 84, el: 'F', label: 'F'},
      {x: 76, y: 76, el: 'F', label: 'F'},
    ],
    bonds: [
      [0, 1],
      [0, 2],
      [0, 3],
    ],
  },
  O2: {
    label: 'Oxygen (O₂)',
    atoms: [
      {x: 28, y: 50, el: 'O', label: 'O'},
      {x: 72, y: 50, el: 'O', label: 'O'},
    ],
    bonds: [[0, 1]],
  },
  CO2: {
    label: 'Carbon Dioxide (CO₂)',
    atoms: [
      {x: 15, y: 50, el: 'O', label: 'O'},
      {x: 50, y: 50, el: 'C', label: 'C'},
      {x: 85, y: 50, el: 'O', label: 'O'},
    ],
    bonds: [
      [0, 1],
      [1, 2],
    ],
  },
  H2O: {
    label: 'Water (H₂O)',
    atoms: [
      {x: 50, y: 22, el: 'O', label: 'O'},
      {x: 22, y: 78, el: 'H', label: 'H'},
      {x: 78, y: 78, el: 'H', label: 'H'},
    ],
    bonds: [
      [0, 1],
      [0, 2],
    ],
  },
  NACL: {
    label: 'Sodium Chloride (NaCl)',
    atoms: [
      {x: 32, y: 50, el: 'Na', label: 'Na⁺'},
      {x: 68, y: 50, el: 'Cl', label: 'Cl⁻'},
    ],
    bonds: [[0, 1]],
  },
  HCL: {
    label: 'Hydrogen Chloride (HCl)',
    atoms: [
      {x: 30, y: 50, el: 'H', label: 'H'},
      {x: 70, y: 50, el: 'Cl', label: 'Cl'},
    ],
    bonds: [[0, 1]],
  },
  NH3: {
    label: 'Ammonia (NH₃)',
    atoms: [
      {x: 50, y: 35, el: 'N', label: 'N'},
      {x: 24, y: 76, el: 'H', label: 'H'},
      {x: 50, y: 84, el: 'H', label: 'H'},
      {x: 76, y: 76, el: 'H', label: 'H'},
    ],
    bonds: [
      [0, 1],
      [0, 2],
      [0, 3],
    ],
  },
};

export const Molecule: React.FC<ScienceProps> = ({
  position,
  props,
  startFrame = 0,
  durationFrames = 25,
}) => {
  const frame = useCurrentFrame();
  const anim = useElementAnimation(startFrame, durationFrames, 'spring');

  const molKey = String(props.moleculeType ?? props.label ?? 'CH4').toUpperCase();
  const mol = MOLECULES[molKey] ?? {
    label: props.label ?? molKey,
    atoms: (props.atoms as MoleculeAtom[]) ?? [
      {x: 35, y: 50, el: 'C', label: 'C'},
      {x: 65, y: 50, el: 'O', label: 'O'},
    ],
    bonds: (props.bonds as MoleculeBond[]) ?? [[0, 1]],
  };

  const size = Number(props.size ?? props.width ?? 140);
  const shaking = Boolean(props.shaking);
  const jitter = shaking ? Math.sin(frame * 0.9) * 2.2 : 0;
  const showLabel = props.showLabel !== false;

  return (
    <div
      style={{
        ...posStyle(position),
        ...anim,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 8,
      }}
    >
      <svg
        viewBox="0 0 100 100"
        width={size}
        height={size}
        style={{
          filter: shaking ? 'drop-shadow(0 0 12px rgba(248,113,113,0.7))' : 'drop-shadow(0 0 6px rgba(56,182,255,0.25))',
          overflow: 'visible',
        }}
      >
        {mol.bonds.map(([a, b], i) => {
          const atomA = mol.atoms[a];
          const atomB = mol.atoms[b];
          if (!atomA || !atomB) return null;
          return (
            <line
              key={i}
              x1={atomA.x + jitter}
              y1={atomA.y}
              x2={atomB.x - jitter}
              y2={atomB.y}
              stroke={shaking ? '#f87171' : '#94a3b8'}
              strokeWidth={shaking ? 2.5 : 3.5}
              strokeDasharray={shaking ? '4 3' : undefined}
            />
          );
        })}
        {mol.atoms.map((atom, i) => {
          const col = ATOM_COLOR[atom.el] ?? '#38b6ff';
          const txtCol = ATOM_TEXT[atom.el] ?? '#ffffff';
          const r = ATOM_R[atom.el] ?? 14;
          return (
            <g key={i} transform={`translate(${jitter * (i % 2 === 0 ? 1 : -1)},0)`}>
              <circle
                cx={atom.x}
                cy={atom.y}
                r={r}
                fill={col}
                stroke="#0f172a"
                strokeWidth={1.8}
              />
              <text
                x={atom.x}
                y={atom.y + 4.5}
                textAnchor="middle"
                fontSize={r * 0.95}
                fontWeight="bold"
                fill={txtCol}
                fontFamily={FONTS.body}
              >
                {atom.label}
              </text>
            </g>
          );
        })}
      </svg>
      {showLabel && (
        <div style={{fontSize: 16, color: '#cbd5e1', fontFamily: FONTS.body, fontWeight: 'bold'}}>
          {props.label ?? mol.label}
        </div>
      )}
    </div>
  );
};

