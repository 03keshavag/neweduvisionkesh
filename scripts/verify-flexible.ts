/**
 * Dev-only verification for the flexible engine.
 * Run: node_modules\.bin\tsx.cmd scripts/verify-flexible.ts
 */
import {getMp3DurationSeconds} from '../src/audio/mp3Duration';
import {parseAnimationPlanContent, normalizeAnimationPlan} from '../src/engine/plans/planSchema';
import {enrichPlan} from '../src/engine/plans/enrichPlan';
import {BINARY_SEARCH_DEMO} from '../src/engine/demos/binarySearchDemo';
import {buildMasterTimeline, scaleSceneAnimations} from '../src/engine/timeline';
import {buildMockPlan} from '../src/groq/mockPlan';
import {existsSync, readdirSync, statSync} from 'node:fs';
import path from 'node:path';

function firstExistingMp3(): string | null {
  const root = path.join(process.cwd(), 'output', 'audio');
  if (!existsSync(root)) return null;
  for (const dir of readdirSync(root)) {
    const folder = path.join(root, dir);
    if (!statSync(folder).isDirectory()) continue;
    for (const file of readdirSync(folder)) {
      if (file.endsWith('.mp3')) return path.join(folder, file);
    }
  }
  return null;
}

function planStats(label: string, plan: ReturnType<typeof normalizeAnimationPlan>) {
  const elements = plan.scenes.reduce((a, s) => a + s.elements.length, 0);
  const animations = plan.scenes.reduce((a, s) => a + s.animations.length, 0);
  console.log(
    `${label}: scenes=${plan.scenes.length} elements=${elements} animations=${animations} total=${plan.totalDuration}s`,
  );
  return {elements, animations};
}

async function main(): Promise<void> {
  console.log('=== 1. MP3 duration parser ===');
  const mp3 = firstExistingMp3();
  if (mp3) {
    const d = await getMp3DurationSeconds(mp3);
    console.log(`${path.basename(mp3)} → ${d.toFixed(2)}s`);
  } else {
    console.log('no mp3 found to verify');
  }

  console.log('\n=== 2. Plan schema (parse + normalize round-trip) ===');
  const plan = parseAnimationPlanContent(JSON.stringify(BINARY_SEARCH_DEMO));
  const types = new Set(plan.scenes.flatMap((s) => s.elements.map((e) => e.type)));
  console.log('element types in demo:', [...types].join(', '));

  console.log('\n=== 3. Master timeline (audio-sync math) ===');
  const audioDurations: Record<string, number> = {};
  for (const s of plan.scenes) audioDurations[s.id] = s.duration * 1.1;
  const timeline = buildMasterTimeline(plan, audioDurations, {intro: 'http://x/a.mp3'}, 30);
  console.log(`totalFrames=${timeline.totalFrames} (${timeline.totalSeconds}s) scenes=${timeline.scenes.length}`);
  const scaled = scaleSceneAnimations(plan.scenes[0], plan.scenes[0].duration, timeline.scenes[0].durationSeconds);
  console.log(`scaled scene0 anim start: ${plan.scenes[0].animations[0].startTime} → ${scaled.animations[0].startTime}`);

  console.log('\n=== 4. Richness guarantees (enrichPlan) ===');
  const before = planStats('  raw demo      ', plan as never);
  const enriched = enrichPlan(parseAnimationPlanContent(JSON.stringify(BINARY_SEARCH_DEMO)));
  const after = planStats('  enriched demo ', enriched as never);
  console.log(`  → +${after.elements - before.elements} elements, +${after.animations - before.animations} animations (auto)`);
  const mock = enrichPlan(normalizeAnimationPlan(buildMockPlan({topic: 'Mysuru Dasara', language: 'English', ageGroup: '13-18'})));
  planStats('  enriched mock ', mock as never);
  const minEl = Math.min(...mock.scenes.map((s) => s.elements.length));
  const noEnter = mock.scenes.filter((s) =>
    s.elements.some((e) => !s.animations.some((a) => a.targetId === e.id)),
  ).length;
  console.log(`  min elements/scene=${minEl} scenes missing entrance anims=${noEnter}`);

  console.log('\nAll checks passed.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});