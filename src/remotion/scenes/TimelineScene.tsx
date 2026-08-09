/**
 * TimelineScene — horizontally reveals sequence items one by one.
 * Items come from scene.onScreenText (falls back to the narration line),
 * so it works for any "activity"/sequence content.
 */
import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {AnimatedText} from '../components/AnimatedText';
import {Subtitle} from '../components/Subtitle';
import {clamp} from '../animations/fade';
import {COLORS, FONTS, LAYOUT} from '../theme';
import type {SceneProps} from './types';

const STEP_FRAMES = 22;

export const TimelineScene: React.FC<SceneProps> = ({scene}) => {
  const frame = useCurrentFrame();
  const items = scene.onScreenText.length > 0 ? scene.onScreenText.slice(1) : [];
  const heading = scene.onScreenText[0] ?? '';
  const points = items.length > 0 ? items : [scene.narration];

  return (
    <AbsoluteFill style={{padding: `${LAYOUT.paddingY}px ${LAYOUT.paddingX}px`, justifyContent: 'center'}}>
      {heading ? (
        <AnimatedText variant="heading" delay={2}>
          {heading}
        </AnimatedText>
      ) : null}

      <div
        style={{
          position: 'relative',
          marginTop: 90,
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'flex-start',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 10,
            left: 0,
            right: 0,
            height: 4,
            background: COLORS.divider,
            borderRadius: 2,
          }}
        />
        {points.map((item, i) => {
          const appear = clamp((frame - (18 + i * STEP_FRAMES)) / 14, 0, 1);
          return (
            <div
              key={i}
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                opacity: appear,
                transform: `translateY(${(1 - appear) * 22}px)`,
              }}
            >
              <div
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: '50%',
                  background: COLORS.primary,
                  border: `4px solid ${COLORS.backgroundDeep}`,
                  zIndex: 2,
                }}
              />
              <div
                style={{
                  marginTop: 26,
                  padding: '0 22px',
                  textAlign: 'center',
                  fontFamily: FONTS.body,
                  color: COLORS.text,
                  fontSize: 26,
                  lineHeight: 1.4,
                }}
              >
                {item}
              </div>
            </div>
          );
        })}
      </div>

      <Subtitle text={scene.narration} delay={18} />
    </AbsoluteFill>
  );
};
