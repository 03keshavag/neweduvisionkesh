import React from 'react';
import {
  AbsoluteFill,
  Audio as RemotionAudio,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import type {AnimationPlan, MasterTimeline} from '../types';
import {Background} from '../../remotion/components/Background';
import {ProgressBar} from '../../remotion/components/ProgressBar';
import {CompositionRenderer} from './CompositionRenderer';

export interface EduVisionVideoProps {
  plan: AnimationPlan;
  timeline: MasterTimeline;
  /** sceneId → audio URL */
  audio?: Record<string, string>;
}

export const EduVisionVideo: React.FC<EduVisionVideoProps> = ({plan, timeline, audio = {}}) => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const progress = durationInFrames > 0 ? frame / durationInFrames : 0;

  return (
    <AbsoluteFill style={{backgroundColor: '#000'}}>
      <Background />
      <CompositionRenderer scenes={plan.scenes} timelineEntries={timeline.scenes} />
      {timeline.scenes.map((entry) => {
        const url = audio[entry.sceneId] ?? entry.audioUrl;
        if (!url) return null;
        return (
          <Sequence
            key={entry.sceneId}
            from={entry.audioStartFrame}
            durationInFrames={entry.durationFrames}
          >
            <RemotionAudio src={url} />
          </Sequence>
        );
      })}
      <ProgressBar progress={progress} />
    </AbsoluteFill>
  );
};

export const EDUVISION_VIDEO_DEFAULTS = {
  width: 1920,
  height: 1080,
  fps: 30,
} as const;
