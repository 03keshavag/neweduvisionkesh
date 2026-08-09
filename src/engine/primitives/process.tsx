import React from 'react';
import {COLORS, FONTS} from '../../remotion/theme';
import type {ElementProps, Position} from '../types';
import {posStyle, useElementAnimation} from './shared';

interface ProcessProps {
  position: Position;
  props: ElementProps;
  startFrame?: number;
  durationFrames?: number;
}

/**
 * ProgressSteps — numbered bubbles on a connected line (a "tasks / steps"
 * diagram); `props.currentStep` highlights everything up to that index.
 */
export const ProgressSteps: React.FC<ProcessProps> = ({
  position,
  props,
  startFrame = 0,
  durationFrames = 25,
}) => {
  const anim = useElementAnimation(startFrame, durationFrames, 'spring');
  const steps =
    (props.steps as string[] | undefined) ??
    (props.items as string[] | undefined) ??
    [];
  const current = props.currentStep as number | undefined;

  return (
    <div style={{...posStyle(position), ...anim, display: 'flex', alignItems: 'flex-start'}}>
      {steps.map((s, i) => {
        const active = current !== undefined ? i <= current : true;
        return (
          <React.Fragment key={i}>
            <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', width: 190}}>
              <div
                style={{
                  width: 46,
                  height: 46,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: active ? '#3b82f6' : COLORS.panel,
                  border: `2px solid ${active ? COLORS.primary : COLORS.divider}`,
                  fontFamily: FONTS.body,
                  fontSize: 24,
                  fontWeight: 700,
                  color: active ? COLORS.text : COLORS.textMuted,
                  opacity: active ? 1 : 0.45,
                }}
              >
                {i + 1}
              </div>
              <div
                style={{
                  marginTop: 10,
                  fontFamily: FONTS.body,
                  fontSize: 20,
                  color: active ? COLORS.text : COLORS.textMuted,
                  opacity: active ? 1 : 0.45,
                  textAlign: 'center',
                  lineHeight: 1.3,
                }}
              >
                {s}
              </div>
            </div>
            {i < steps.length - 1 ? (
              <div style={{width: 64, height: 3, background: COLORS.divider, marginTop: 22}} />
            ) : null}
          </React.Fragment>
        );
      })}
    </div>
  );
};

/**
 * TaskList — checklist with numbered/✓ boxes; `props.doneIndices` (or
 * `props.completed`) marks finished items.
 */
export const TaskList: React.FC<ProcessProps> = ({
  position,
  props,
  startFrame = 0,
  durationFrames = 22,
}) => {
  const anim = useElementAnimation(startFrame, durationFrames, 'slideUp');
  const items = (props.items as string[] | undefined) ?? (props.values as string[] | undefined) ?? [];
  const doneIndices = (props.doneIndices as number[] | undefined) ?? ((props.completed as number) !== undefined ? Array.from({length: Number(props.completed)}, (_, i) => i) : []);

  return (
    <div style={{...posStyle(position), ...anim, display: 'flex', flexDirection: 'column', gap: 16}}>
      {items.map((t, i) => {
        const isDone = doneIndices.includes(i);
        return (
          <div key={i} style={{display: 'flex', alignItems: 'center', fontFamily: FONTS.body, fontSize: 26, color: COLORS.text}}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 34,
                height: 34,
                borderRadius: 8,
                marginRight: 14,
                fontSize: 20,
                fontWeight: 700,
                background: isDone ? 'rgba(61,220,151,0.2)' : COLORS.panel,
                border: `2px solid ${isDone ? COLORS.success : COLORS.divider}`,
                color: isDone ? COLORS.success : COLORS.textMuted,
              }}
            >
              {isDone ? '✓' : i + 1}
            </span>
            <span style={{opacity: isDone ? 1 : 0.85}}>{t}</span>
          </div>
        );
      })}
    </div>
  );
};