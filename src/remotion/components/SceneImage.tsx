/**
 * SceneImage — renders an image when one is provided (e.g. a staticFile under
 * public/images), otherwise falls back to a clean illustrative placeholder
 * driven by the scene's `visualDescription`. Keeps the engine self-contained
 * even when a lesson carries no media.
 */
import React from 'react';
import {Img, staticFile} from 'remotion';
import {AnimatedText} from './AnimatedText';
import {COLORS, FONTS} from '../theme';

interface SceneImageProps {
  src?: string;
  visualDescription?: string;
  label?: string;
  width?: number;
  height?: number;
}

export const SceneImage: React.FC<SceneImageProps> = ({
  src,
  visualDescription,
  label,
  width = 860,
  height = 540,
}) => {
  const frameStyle: React.CSSProperties = {
    width,
    height,
    borderRadius: 28,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    background:
      'linear-gradient(135deg, #1b3a5c 0%, #12263e 55%, #0d1b2a 100%)',
    border: `1px solid ${COLORS.secondary}`,
  };

  if (src) {
    const resolved = src.startsWith('http')
      ? src
      : staticFile(src.replace(/^\/+/, ''));
    return (
      <Img
        src={resolved}
        alt={label ?? 'illustration'}
        style={{...frameStyle, objectFit: 'cover'}}
      />
    );
  }

  return (
    <div style={frameStyle}>
      <div style={{fontSize: 88, lineHeight: 1}}>🖼️</div>
      <AnimatedText
        variant="label"
        color={COLORS.secondary}
        align="center"
        style={{marginTop: 24, textAlign: 'center'}}
      >
        {label ?? 'Illustration'}
      </AnimatedText>
      {visualDescription ? (
        <div
          style={{
            marginTop: 14,
            padding: '0 48px',
            fontFamily: FONTS.body,
            color: COLORS.textMuted,
            fontSize: 24,
            lineHeight: 1.5,
            textAlign: 'center',
          }}
        >
          {visualDescription}
        </div>
      ) : null}
    </div>
  );
};
