/**
 * ExplanationScene — the main "teaching" layout: heading + info presented as
 * staggered animated blocks/cards. Fully data-driven from the scene.
 *   onScreenText[0] = heading, the rest = numbered info blocks.
 * Falls back to the narration when there are no points.
 */
import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {AnimatedText} from '../components/AnimatedText';
import {Audio} from '../components/Audio';
import {Subtitle} from '../components/Subtitle';
import {clamp} from '../animations/fade';
import {COLORS, FONTS, LAYOUT} from '../theme';
import type {SceneProps} from './types';

const START_DELAY = 10;
const STAGGER = 9;

export const ExplanationScene: React.FC<SceneProps> = ({scene}) => {
  const frame = useCurrentFrame();
  const heading = scene.onScreenText[0] ?? '';
  const rawPoints =
    scene.onScreenText.length > 1 ? scene.onScreenText.slice(1) : [];
  const points = rawPoints.length > 0 ? rawPoints : [scene.narration];
  const twoColumns = points.length > 2;

  return (
    <AbsoluteFill
      style={{
        padding: `${LAYOUT.paddingY}px ${LAYOUT.paddingX}px`,
        justifyContent: 'center',
      }}
    >
      <Audio src={`audio/narration_${scene.id}.mp3`} />
      {heading ? (
        <AnimatedText variant="heading" delay={2}>
          {heading}
        </AnimatedText>
      ) : null}

      {/* Information blocks (cards) with a numbered, staggered entrance. */}
      <div
        style={{
          marginTop: 44,
          display: 'grid',
          gridTemplateColumns: twoColumns ? '1fr 1fr' : '1fr',
          gap: 24,
          maxWidth: LAYOUT.maxTextWidth,
        }}
      >
        {points.map((point, i) => {
          const appear = clamp(
            (frame - (START_DELAY + i * STAGGER)) / 12,
            0,
            1,
          );
          const accent = i % 2 === 0 ? COLORS.primary : COLORS.secondary;
          return (
            <div
              key={i}
              style={{
                opacity: appear,
                transform: `translateY(${(1 - appear) * 32}px)`,
                display: 'flex',
                alignItems: 'center',
                minHeight: 84,
                padding: '20px 26px',
                borderRadius: 16,
                background: COLORS.panel,
                border: `1px solid ${COLORS.divider}`,
                borderLeft: `6px solid ${accent}`,
              }}
            >
              <span
                style={{
                  color: accent,
                  fontSize: 26,
                  fontWeight: 700,
                  fontFamily: FONTS.body,
                  marginRight: 18,
                }}
              >
                {i + 1}
              </span>
              <span
                style={{
                  fontFamily: FONTS.body,
                  color: COLORS.text,
                  fontSize: 28,
                  lineHeight: 1.45,
                }}
              >
                {point}
              </span>
            </div>
          );
        })}
      </div>

      {scene.visualDescription && points.length <= 2 ? (
        <div
          style={{
            marginTop: 26,
            maxWidth: LAYOUT.maxTextWidth,
            color: COLORS.textMuted,
            fontFamily: FONTS.body,
            fontSize: 22,
          }}
        >
          {scene.visualDescription}
        </div>
      ) : null}

      <Subtitle text={scene.narration} delay={START_DELAY + points.length * STAGGER} />
    </AbsoluteFill>
  );
};
