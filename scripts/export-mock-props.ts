/**
 * Exports a Remotion props JSON for the enriched mock plan so the mock scenes
 * (progressSteps, taskList, …) can be previewed/rendered without an API key.
 * Run: node_modules\.bin\tsx.cmd scripts/export-mock-props.ts
 */
import {writeFile} from 'node:fs/promises';
import {normalizeAnimationPlan} from '../src/engine/plans/planSchema';
import {enrichPlan} from '../src/engine/plans/enrichPlan';
import {buildMockPlan} from '../src/groq/mockPlan';
import {buildMasterTimeline} from '../src/engine/timeline';
import {EDUVISION_VIDEO_DEFAULTS} from '../src/engine/renderer/EduVisionVideo';
import path from 'node:path';

const plan = enrichPlan(
  normalizeAnimationPlan(
    buildMockPlan({topic: 'Mysuru Dasara', language: 'English', ageGroup: '13-18'}),
  ),
);
const timeline = buildMasterTimeline(plan, {}, {}, EDUVISION_VIDEO_DEFAULTS.fps);
const out = path.join(process.cwd(), 'output', 'mock-props.json');
await writeFile(out, JSON.stringify({plan, timeline, audio: {}}, null, 2));
console.log(`wrote ${out} (${plan.scenes.length} scenes, ${plan.totalDuration.toFixed(1)}s)`);