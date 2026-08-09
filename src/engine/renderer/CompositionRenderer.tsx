import React from 'react';
import {Sequence} from 'remotion';
import type {AnimationScene, TimelineSceneEntry} from '../types';
import {SceneRenderer} from './SceneRenderer';

interface CompositionRendererProps {
  scenes: AnimationScene[];
  timelineEntries: TimelineSceneEntry[];
}

/**
 * Renders every scene inside its own <Sequence> (offset by the master-timeline
 * start frame). Because `useCurrentFrame()` is scene-local inside a Sequence,
 * entrance animations keyed to `startFrame` play correctly instead of being
 * offset by the whole composition timeline.
 */
export const CompositionRenderer: React.FC<CompositionRendererProps> = ({
  scenes,
  timelineEntries,
}) => {
  return (
    <>
      {scenes.map((scene, i) => {
        const entry = timelineEntries[i];
        if (!entry) return null;
        return (
          <Sequence
            key={scene.id}
            from={entry.startFrame}
            durationInFrames={entry.durationFrames}
          >
            <SceneRenderer
              scene={scene}
              timelineEntry={entry}
              isFirst={i === 0}
              isLast={i === scenes.length - 1}
            />
          </Sequence>
        );
      })}
    </>
  );
};
