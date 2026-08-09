/**
 * OutroScene — closing splash (summary / thank-you).
 * Data-driven from the scene and the lesson topic passed via props.
 */
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {AnimatedText} from '../components/AnimatedText';
import {Audio} from '../components/Audio';
import {Subtitle} from '../components/Subtitle';
import {COLORS} from '../theme';
import type {SceneProps} from './types';

export const OutroScene: React.FC<SceneProps> = ({scene}) => {
  const heading = scene.onScreenText[0] ?? 'ಧನ್ಯವಾದಗಳು';
  const line = scene.onScreenText[1] ?? scene.narration;

  return (
    <AbsoluteFill
      style={{justifyContent: 'center', alignItems: 'center', padding: 80}}
    >
      <Audio src={`audio/narration_${scene.id}.mp3`} />
      <AnimatedText
        variant="label"
        align="center"
        delay={4}
        color={COLORS.secondary}
      >
        EduVision
      </AnimatedText>
      <AnimatedText
        variant="title"
        align="center"
        delay={12}
        style={{marginTop: 16, textAlign: 'center'}}
      >
        {heading}
      </AnimatedText>
      <AnimatedText
        variant="subtitle"
        align="center"
        delay={20}
        color={COLORS.textMuted}
        style={{marginTop: 24, textAlign: 'center', maxWidth: 1200}}
      >
        {line}
      </AnimatedText>
      <Subtitle text={scene.narration} delay={28} />
    </AbsoluteFill>
  );
};
