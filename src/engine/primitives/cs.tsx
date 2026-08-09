import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import {COLORS, FONTS} from '../../remotion/theme';
import type {ElementProps, Position} from '../types';
import {baseTextStyle, posStyle, useElementAnimation} from './shared';

interface CsProps {
  position: Position;
  props: ElementProps;
  startFrame?: number;
  durationFrames?: number;
}

export const ArrayVisual: React.FC<CsProps> = ({
  position,
  props,
  startFrame = 0,
  durationFrames = 25,
}) => {
  const anim = useElementAnimation(startFrame, durationFrames, 'scale');
  const values = (props.values as (string | number)[]) ?? [];
  const highlight =
    props.highlightIndices ??
    (props.highlightedIndex !== undefined ? [props.highlightedIndex] : []);
  const eliminated = props.eliminatedIndices ?? [];
  const lowIndex = props.lowIndex as number | undefined;
  const midIndex = props.midIndex as number | undefined;
  const highIndex = props.highIndex as number | undefined;
  const hasRange = lowIndex !== undefined && highIndex !== undefined;

  return (
    <div style={{...posStyle(position), ...anim, display: 'flex', gap: 12}}>
      {values.map((v, i) => {
        const isMid = midIndex === i;
        const inRange = hasRange && i >= lowIndex! && i <= highIndex!;
        const isEliminated =
          eliminated.includes(i) || (hasRange && !inRange);
        const active = isMid || inRange || (!hasRange && highlight.includes(i));

        const topLabel =
          isMid ? '▲ MID' : i === lowIndex ? '▲ LOW' : undefined;
        const bottomLabel = i === highIndex ? '▼ HIGH' : undefined;

        return (
          <div
            key={i}
            style={{display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative'}}
          >
            {topLabel ? (
              <div
                style={{
                  marginBottom: 8,
                  fontSize: 20,
                  fontWeight: 700,
                  lineHeight: 1.1,
                  color: isMid ? '#4ade80' : '#facc15',
                  fontFamily: FONTS.body,
                }}
              >
                {topLabel}
              </div>
            ) : (
              <div style={{marginBottom: 32}} />
            )}
            <div
              style={{
                width: 72,
                height: 72,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 12,
                border: `2px solid ${
                  isMid || active ? COLORS.primary : COLORS.divider
                }`,
                background: isMid
                  ? '#22c55e'
                  : active
                    ? '#3b82f6'
                    : COLORS.panel,
                opacity: isEliminated && !isMid ? 0.22 : 1,
                fontSize: 30,
                fontWeight: 700,
                color: COLORS.text,
                fontFamily: FONTS.body,
                boxShadow: isMid
                  ? '0 0 28px #22c55e'
                  : active
                    ? '0 0 12px rgba(59,130,246,0.8)'
                    : 'none',
              }}
            >
              {v}
              {isEliminated ? (
                <div
                  style={{
                    position: 'absolute',
                    top: 118,
                    fontSize: 44,
                    fontWeight: 900,
                    color: '#ef4444',
                    opacity: 0.9,
                    lineHeight: 1,
                  }}
                >
                  ✕
                </div>
              ) : null}
            </div>
            {bottomLabel ? (
              <div
                style={{
                  marginTop: 8,
                  fontSize: 20,
                  fontWeight: 700,
                  lineHeight: 1.1,
                  color: '#fb7185',
                  fontFamily: FONTS.body,
                }}
              >
                {bottomLabel}
              </div>
            ) : (
              <div style={{marginTop: 32}} />
            )}
          </div>
        );
      })}
    </div>
  );
};

export const ArrayElement: React.FC<CsProps> = (p) => (
  <ArrayVisual {...p} props={{...p.props, values: [p.props.value ?? '?']}} />
);

export const Pointer: React.FC<CsProps> = ({position, props, startFrame = 0, durationFrames = 15}) => {
  const anim = useElementAnimation(startFrame, durationFrames, 'slideUp');
  return (
    <div
      style={{
        ...posStyle(position),
        ...anim,
        fontSize: 32,
        color: COLORS.primary,
        fontFamily: FONTS.body,
      }}
    >
      ▲ {props.label ?? 'mid'}
    </div>
  );
};

export const Variable: React.FC<CsProps> = ({position, props, startFrame = 0, durationFrames = 12}) => {
  const anim = useElementAnimation(startFrame, durationFrames, 'fadeIn');
  return (
    <div style={{...posStyle(position), ...anim, display: 'flex', alignItems: 'center', gap: 12}}>
      <span style={{...baseTextStyle, fontSize: 32, color: COLORS.secondary}}>{props.text}</span>
      <span style={{...baseTextStyle, fontSize: 32}}>=</span>
      <span style={{...baseTextStyle, fontSize: 32, color: COLORS.primary}}>{props.value}</span>
    </div>
  );
};

export const StackVisual: React.FC<CsProps> = ({position, props, startFrame = 0, durationFrames = 20}) => {
  const anim = useElementAnimation(startFrame, durationFrames, 'fadeIn');
  const items = (props.values as string[]) ?? ['C', 'B', 'A'];
  return (
    <div style={{...posStyle(position), ...anim, display: 'flex', flexDirection: 'column-reverse', gap: 4}}>
      {items.map((item, i) => (
        <div
          key={i}
          style={{
            width: 100,
            height: 48,
            background: COLORS.panel,
            border: `2px solid ${COLORS.divider}`,
            borderRadius: 6,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 24,
            color: COLORS.text,
            fontFamily: FONTS.body,
          }}
        >
          {item}
        </div>
      ))}
    </div>
  );
};

export const QueueVisual: React.FC<CsProps> = ({position, props, startFrame = 0, durationFrames = 20}) => {
  const anim = useElementAnimation(startFrame, durationFrames, 'fadeIn');
  const items = (props.values as string[]) ?? ['A', 'B', 'C'];
  return (
    <div style={{...posStyle(position), ...anim, display: 'flex', gap: 4, alignItems: 'center'}}>
      <span style={{...baseTextStyle, fontSize: 20, color: COLORS.textMuted, marginRight: 8}}>IN →</span>
      {items.map((item, i) => (
        <div
          key={i}
          style={{
            width: 72,
            height: 48,
            background: COLORS.panel,
            border: `2px solid ${COLORS.divider}`,
            borderRadius: 6,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 22,
            color: COLORS.text,
          }}
        >
          {item}
        </div>
      ))}
      <span style={{...baseTextStyle, fontSize: 20, color: COLORS.textMuted, marginLeft: 8}}>→ OUT</span>
    </div>
  );
};

export const LinkedListVisual: React.FC<CsProps> = ({position, props, startFrame = 0, durationFrames = 25}) => {
  const anim = useElementAnimation(startFrame, durationFrames, 'fadeIn');
  const nodes = (props.values as string[]) ?? ['A', 'B', 'C'];
  return (
    <div style={{...posStyle(position), ...anim, display: 'flex', alignItems: 'center', gap: 0}}>
      {nodes.map((n, i) => (
        <React.Fragment key={i}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              background: COLORS.panel,
              border: `2px solid ${COLORS.secondary}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 24,
              color: COLORS.text,
            }}
          >
            {n}
          </div>
          {i < nodes.length - 1 ? (
            <div style={{width: 40, height: 2, background: COLORS.textMuted}} />
          ) : null}
        </React.Fragment>
      ))}
      <div style={{marginLeft: 8, fontSize: 24, color: COLORS.textMuted}}>null</div>
    </div>
  );
};

export const TreeVisual: React.FC<CsProps> = ({position, props, startFrame = 0, durationFrames = 25}) => {
  const anim = useElementAnimation(startFrame, durationFrames, 'fadeIn');
  const frame = useCurrentFrame();
  const local = frame - startFrame;
  const progress = interpolate(local, [0, durationFrames], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  return (
    <svg style={{...posStyle(position), opacity: progress}} width={400} height={250}>
      <line x1={200} y1={40} x2={100} y2={120} stroke={COLORS.divider} strokeWidth={2} />
      <line x1={200} y1={40} x2={300} y2={120} stroke={COLORS.divider} strokeWidth={2} />
      <line x1={100} y1={120} x2={50} y2={200} stroke={COLORS.divider} strokeWidth={2} />
      <line x1={100} y1={120} x2={150} y2={200} stroke={COLORS.divider} strokeWidth={2} />
      {[
        {x: 200, y: 40, l: '8'},
        {x: 100, y: 120, l: '3'},
        {x: 300, y: 120, l: '10'},
        {x: 50, y: 200, l: '1'},
        {x: 150, y: 200, l: '6'},
      ].map((n, i) => (
        <g key={i}>
          <circle cx={n.x} cy={n.y} r={24} fill={COLORS.panel} stroke={COLORS.secondary} strokeWidth={2} />
          <text x={n.x} y={n.y + 7} textAnchor="middle" fill={COLORS.text} fontSize={18} fontFamily={FONTS.body}>
            {n.l}
          </text>
        </g>
      ))}
    </svg>
  );
};

export const GraphNode: React.FC<CsProps> = ({position, props, startFrame = 0, durationFrames = 12}) => {
  const anim = useElementAnimation(startFrame, durationFrames, 'scale');
  return (
    <div
      style={{
        ...posStyle(position),
        ...anim,
        width: 56,
        height: 56,
        borderRadius: '50%',
        background: COLORS.panel,
        border: `2px solid ${COLORS.secondary}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 22,
        color: COLORS.text,
      }}
    >
      {props.label ?? props.text}
    </div>
  );
};

export const GraphEdge: React.FC<CsProps> = ({position, props, startFrame = 0, durationFrames = 15}) => {
  const anim = useElementAnimation(startFrame, durationFrames, 'fadeIn');
  const from = props.from ?? {x: 0, y: 0};
  const to = props.to ?? {x: 100, y: 0};
  return (
    <svg style={{...posStyle(position), ...anim, overflow: 'visible'}} width={200} height={200}>
      <line
        x1={from.x}
        y1={from.y}
        x2={to.x}
        y2={to.y}
        stroke={COLORS.textMuted}
        strokeWidth={2}
      />
    </svg>
  );
};

export const GraphVisualCs: React.FC<CsProps> = TreeVisual;

export const CodeBlock: React.FC<CsProps> = ({position, props, startFrame = 0, durationFrames = 20}) => {
  const anim = useElementAnimation(startFrame, durationFrames, 'fadeIn');
  return (
    <pre
      style={{
        ...posStyle(position),
        ...anim,
        fontFamily: "'Consolas', 'Courier New', monospace",
        fontSize: 22,
        color: COLORS.success,
        background: 'rgba(0,0,0,0.45)',
        padding: '20px 28px',
        borderRadius: 10,
        border: `1px solid ${COLORS.divider}`,
        margin: 0,
        lineHeight: 1.5,
      }}
    >
      {props.code}
    </pre>
  );
};

export const AlgorithmStep: React.FC<CsProps> = ({position, props, startFrame = 0, durationFrames = 15}) => {
  const anim = useElementAnimation(startFrame, durationFrames, 'slideUp');
  return (
    <div
      style={{
        ...posStyle(position),
        ...anim,
        padding: '12px 20px',
        borderLeft: `4px solid ${COLORS.primary}`,
        background: 'rgba(244,163,0,0.08)',
        fontSize: 26,
        color: COLORS.text,
        fontFamily: FONTS.body,
        maxWidth: 600,
      }}
    >
      {props.text}
    </div>
  );
};
