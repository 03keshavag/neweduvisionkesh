/**
 * FactScene — a highlighted "Did you know?" callout.
 * The emphasised fact comes from the scene data, never hardcoded.
 */
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {AnimatedText} from '../components/AnimatedText';
import {Audio} from '../components/Audio';
import {Subtitle} from '../components/Subtitle';
import {COLORS} from '../theme';
import type {SceneProps} from './types';

export const FactScene: React.FC<SceneProps> = ({scene}) => {
  const fact = scene.onScreenText[0] ?? scene.narration;

  return (
    <AbsoluteFill
      style={{justifyContent: 'center', alignItems: 'center', padding: 80}}
    >
      <Audio src={`audio/narration_${scene.id}.mp3`} />
      <AnimatedText variant="label" align="center" delay={4} color={COLORS.primary}>
        ⚡ Key Fact
      </AnimatedText>
      <div
        style={{
          marginTop: 34,
          maxWidth: 1280,
          padding: '44px 60px',
          borderRadius: 28,
          background: COLORS.panel,
          border: `3px solid ${COLORS.primary}`,
        }}
      >
        <AnimatedText
          variant="heading"
          align="center"
          delay={12}
          style={{textAlign: 'center'}}
        >
          {fact}
        </AnimatedText>
      </div>
      <Subtitle text={scene.narration} delay={22} />
      {scene.visualDescription ? (
        <div
          style={{
            position: 'absolute',
            bottom: '30%',
            fontFamily: 'inherit',
            color: COLORS.textMuted,
            fontSize: 22,
            opacity: 0.85,
          }}
        >
          {scene.visualDescription}
        </div>
      ) : null}
    </AbsoluteFill>
  );
};
