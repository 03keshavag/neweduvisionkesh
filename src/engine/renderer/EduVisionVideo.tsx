import React from 'react';
import {
  AbsoluteFill,
  Audio as RemotionAudio,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import type {AnimationPlan, MasterTimeline} from '../types';
import {COLORS, FONTS} from '../../remotion/theme';
import {Background} from '../../remotion/components/Background';
import {ProgressBar} from '../../remotion/components/ProgressBar';
import {CompositionRenderer} from './CompositionRenderer';

export interface EduVisionVideoProps {
  plan: AnimationPlan;
  timeline: MasterTimeline;
  /** sceneId → audio URL */
  audio?: Record<string, string>;
}

/**
 * Deterministic floating particle layer (formula-based, no randomness) that
 * sits behind scene content so the frame always has gentle ambient motion.
 */
const FloatingParticles: React.FC<{count?: number}> = ({count = 30}) => {
  const frame = useCurrentFrame();
  const {width, height} = useVideoConfig();
  return (
    <AbsoluteFill style={{zIndex: 1, pointerEvents: 'none'}}>
      {Array.from({length: count}, (_, i) => {
        const seed = i * 137.508;
        const t = frame / 30;
        const x = width * ((Math.sin(seed * 1.31 + t * 0.55 + i) + 1) / 2);
        const y = height * ((Math.cos(seed * 0.93 + t * 0.4 + i * 1.7) + 1) / 2);
        const r = 2 + (i % 3);
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: x,
              top: y,
              width: r * 2,
              height: r * 2,
              borderRadius: '50%',
              background: i % 2 === 0 ? '#38b6ff' : '#f4a300',
              opacity: 0.08 + (i % 4) * 0.05,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

export const EduVisionVideo: React.FC<EduVisionVideoProps> = ({plan, timeline, audio = {}}) => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const progress = durationInFrames > 0 ? frame / durationInFrames : 0;

  // Active scene index (by master-timeline start frames) for the footer counter.
  let activeIndex = 0;
  for (let i = 0; i < timeline.scenes.length; i++) {
    if (frame >= timeline.scenes[i].startFrame) activeIndex = i;
  }

  return (
    <AbsoluteFill style={{backgroundColor: '#000'}}>
      <Background />
      {plan.subject === 'General' ? <FloatingParticles count={15} /> : null}
      <CompositionRenderer scenes={plan.scenes} timelineEntries={timeline.scenes} />
      {timeline.scenes.map((entry) => {
        const url = audio[entry.sceneId] ?? entry.audioUrl;
        if (!url) return null;
        const audioFrames = Math.max(
          entry.audioEndFrame - entry.audioStartFrame,
          entry.durationFrames,
        );
        return (
          <Sequence
            key={entry.sceneId}
            from={entry.audioStartFrame}
            durationInFrames={audioFrames}
          >
            <RemotionAudio src={url} />
          </Sequence>
        );
      })}
      {/* Footer: lesson title + scene counter */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          height: 46,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '0 40px',
          zIndex: 60,
          fontFamily: FONTS.body,
          fontSize: 20,
          color: COLORS.textMuted,
          borderTop: `1px solid ${COLORS.divider}`,
          background: 'rgba(8, 17, 31, 0.55)',
          boxSizing: 'border-box',
        }}
      >
        <span style={{opacity: 0.9}}>{`EduVision · ${plan.title}`}</span>
        <span>{`Scene ${Math.min(activeIndex + 1, timeline.scenes.length)} / ${timeline.scenes.length}`}</span>
      </div>
      <ProgressBar progress={progress} />
    </AbsoluteFill>
  );
};

export const EDUVISION_VIDEO_DEFAULTS = {
  width: 1920,
  height: 1080,
  fps: 30,
} as const;
