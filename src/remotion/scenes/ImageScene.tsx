/**
 * ImageScene — headline + a large illustration/visual.
 * Uses the reusable SceneImage (image when available, styled placeholder
 * otherwise) driven by the scene's `visualDescription`.
 */
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {AnimatedText} from '../components/AnimatedText';
import {Audio} from '../components/Audio';
import {SceneImage} from '../components/SceneImage';
import {Subtitle} from '../components/Subtitle';
import type {SceneProps} from './types';

export const ImageScene: React.FC<SceneProps> = ({scene}) => {
  const heading = scene.onScreenText[0] ?? '';

  return (
    <AbsoluteFill
      style={{alignItems: 'center', justifyContent: 'center', padding: 80}}
    >
      <Audio src={`audio/narration_${scene.id}.mp3`} />
      {heading ? (
        <AnimatedText variant="heading" align="center" delay={4}>
          {heading}
        </AnimatedText>
      ) : null}
      <div style={{marginTop: 36}}>
        <AnimatedText delay={12}>
          <SceneImage
            visualDescription={scene.visualDescription}
            label={heading || undefined}
          />
        </AnimatedText>
      </div>
      <Subtitle text={scene.narration} delay={20} />
    </AbsoluteFill>
  );
};
