import React from 'react';
import {Composition} from 'remotion';
import type {Lesson} from '../lesson/lessonTypes';
import {LessonVideo} from './LessonVideo';
import {SAMPLE_LESSON} from './sampleLesson';
import {VIDEO} from './theme';

/**
 * The composition's duration is derived from the lesson, so the same engine
 * produces correctly-lengthened videos for ANY lesson (Mysuru Dasara, Indian
 * Constitution, Silk Road, …) with no code change.
 */
const calculateMetadata = ({
  props,
  defaultProps,
}: {
  props: Record<string, unknown>;
  defaultProps: Record<string, unknown>;
}) => {
  const lesson = (props.lesson ?? defaultProps.lesson) as Lesson | undefined;
  const estimatedSeconds = lesson?.estimatedDuration ?? 60;
  const durationInFrames = Math.max(1, Math.round(estimatedSeconds * VIDEO.fps));
  return {durationInFrames, props};
};

/**
 * Root composition tree for EduVision Video Generator.
 * The engine (LessonVideo) is data-driven; the registered defaultProps sample
 * lesson lets the preview run without an API key, and is overridden by the
 * renderer with the lesson generated for each request.
 */
export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="LessonVideo"
      component={LessonVideo as React.FC}
      fps={VIDEO.fps}
      width={VIDEO.width}
      height={VIDEO.height}
      defaultProps={{lesson: SAMPLE_LESSON, audio: {}}}
      calculateMetadata={calculateMetadata}
    />
  );
};
