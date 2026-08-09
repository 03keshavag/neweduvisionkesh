/**
 * IntroScene — big title splash for the lesson.
 * Fully data-driven: text comes from the scene, never hardcoded.
 */
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {AnimatedText} from '../components/AnimatedText';
import {Audio} from '../components/Audio';
import {Subtitle} from '../components/Subtitle';
import {COLORS} from '../theme';
import type {SceneProps} from './types';

export const IntroScene: React.FC<SceneProps> = ({scene}) => {
  const heading = scene.onScreenText[0] ?? scene.narration;
  const tagline = scene.onScreenText[1] ?? '';

  return (
    <AbsoluteFill
      style={{justifyContent: 'center', alignItems: 'center', padding: 80}}
    >
      <Audio src={`audio/narration_${scene.id}.mp3`} />
      <AnimatedText
        variant="label"
        align="center"
        delay={4}
        color={COLORS.primary}
      >
        EduVision
      </AnimatedText>
      <AnimatedText
        variant="title"
        align="center"
        delay={12}
        style={{marginTop: 18, textAlign: 'center', maxWidth: 1500}}
      >
        {heading}
      </AnimatedText>
      {tagline ? (
        <AnimatedText
          variant="subtitle"
          align="center"
          delay={20}
          color={COLORS.textMuted}
          style={{marginTop: 26, textAlign: 'center'}}
        >
          {tagline}
        </AnimatedText>
      ) : null}
      <Subtitle text={scene.narration} delay={28} />
    </AbsoluteFill>
  );
};
