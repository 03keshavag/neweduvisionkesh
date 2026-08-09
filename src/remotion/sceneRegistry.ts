/**
 * Scene registry — maps each validated lesson scene `type` to the reusable
 * Remotion scene component that renders it.
 *
 * This is the single place that decides "which scene component renders a
 * given lesson type", so new templates or re-mappings require no changes to
 * LessonVideo or the scenes themselves.
 */
import type {ComponentType} from 'react';
import type {SceneType} from '../lesson/lessonTypes';
import {IntroScene} from './scenes/IntroScene';
import {ExplanationScene} from './scenes/ExplanationScene';
import {ImageScene} from './scenes/ImageScene';
import {TimelineScene} from './scenes/TimelineScene';
import {FactScene} from './scenes/FactScene';
import {OutroScene} from './scenes/OutroScene';
import type {SceneProps} from './scenes/types';

const REGISTRY: Record<SceneType, ComponentType<SceneProps>> = {
  intro: IntroScene,
  content: ExplanationScene,
  example: ImageScene,
  activity: TimelineScene,
  summary: FactScene,
  conclusion: OutroScene,
};

/** Fallback for any unexpected type — explanation is the safest general layout. */
const FALLBACK: ComponentType<SceneProps> = ExplanationScene;

/** Returns the scene component for a given validated lesson scene type. */
export function sceneForType(type: SceneType): ComponentType<SceneProps> {
  return REGISTRY[type] ?? FALLBACK;
}
