/**
 * Audio — integration point for per-scene narration (TTS).
 *
 * TTS is NOT implemented yet (future stage). Until then this component is a
 * no-op. When narration audio files exist, pass their static file path via
 * `src` and render them here (e.g. using Remotion's <Audio> with `startFrom`
 * and `endAt` scoped to the scene).
 */
import React from 'react';

interface AudioProps {
  src?: string;
  startFrom?: number;
  endAt?: number;
}

export const Audio: React.FC<AudioProps> = ({src}) => {
  if (!src) {
    return null;
  }
  // TTS pending — rendering no audio yet.
  return null;
};
