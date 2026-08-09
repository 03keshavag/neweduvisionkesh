import React from 'react';
import {Composition} from 'remotion';
import {EduVisionVideo, EDUVISION_VIDEO_DEFAULTS} from '../engine/renderer/EduVisionVideo';
import {BINARY_SEARCH_DEMO} from '../engine/demos/binarySearchDemo';
import {buildMasterTimeline} from '../engine/timeline';
import type {AnimationPlan, MasterTimeline} from '../engine/types';
import type {Lesson} from '../lesson/lessonTypes';
import {LessonVideo} from './LessonVideo';
import {SAMPLE_LESSON} from './sampleLesson';
import {VIDEO} from './theme';

/**
 * The LessonVideo composition's duration is derived from the lesson, so the
 * same engine produces correctly-lengthened videos for ANY lesson (Mysuru
 * Dasara, Indian Constitution, Silk Road, …) with no code change.
 */
const lessonDuration = ({
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

/** Build a timeline for the demo plan once (no audio → plan durations). */
const DEMO_PLAN: AnimationPlan = BINARY_SEARCH_DEMO;
const DEMO_TIMELINE: MasterTimeline = buildMasterTimeline(
  BINARY_SEARCH_DEMO,
  {},
  {},
  EDUVISION_VIDEO_DEFAULTS.fps,
);

/**
 * The EduVisionVideo (flexible engine) composition's duration is driven by the
 * master timeline, which the renderer computes from real narration audio and
 * passes through inputProps. The registered default is the binary-search demo.
 */
const planDuration = ({
  props,
  defaultProps,
}: {
  props: Record<string, unknown>;
  defaultProps: Record<string, unknown>;
}) => {
  const timeline = (props.timeline ?? defaultProps.timeline) as MasterTimeline | undefined;
  const plan = (props.plan ?? defaultProps.plan) as AnimationPlan | undefined;
  const durationInFrames =
    timeline?.totalFrames ??
    Math.max(1, Math.round((plan?.totalDuration ?? 60) * eduVisionFps()));
  return {durationInFrames, props};
};

function eduVisionFps(): number {
  return EDUVISION_VIDEO_DEFAULTS.fps;
}

/**
 * Root composition tree for EduVision Video Generator.
 * Two engines are registered:
 *   - `EduVisionVideo` — the flexible instruction-driven engine (blocks,
 *     arrays, pointers, arrows, callouts) fed by Groq's AnimationPlan.
 *   - `LessonVideo` — the legacy strict-lesson engine (kept as fallback).
 */
export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="EduVisionVideo"
        component={EduVisionVideo as React.FC}
        fps={EDUVISION_VIDEO_DEFAULTS.fps}
        width={EDUVISION_VIDEO_DEFAULTS.width}
        height={EDUVISION_VIDEO_DEFAULTS.height}
        defaultProps={{plan: DEMO_PLAN, timeline: DEMO_TIMELINE, audio: {}}}
        calculateMetadata={planDuration}
      />
      <Composition
        id="LessonVideo"
        component={LessonVideo as React.FC}
        fps={VIDEO.fps}
        width={VIDEO.width}
        height={VIDEO.height}
        defaultProps={{lesson: SAMPLE_LESSON, audio: {}}}
        calculateMetadata={lessonDuration}
      />
    </>
  );
};
