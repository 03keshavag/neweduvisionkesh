/**
 * Dev-only verification for the flexible engine.
 * Run: node_modules\.bin\tsx.cmd scripts/verify-flexible.ts
 */
import {getMp3DurationSeconds} from '../src/audio/mp3Duration';
import {parseAnimationPlanContent, normalizeAnimationPlan} from '../src/engine/plans/planSchema';
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
  console.log(
    `scenes=${plan.scenes.length} elements=${plan.scenes.reduce((a, s) => a + s.elements.length, 0)} ` +
      `animations=${plan.scenes.reduce((a, s) => a + s.animations.length, 0)} totalDuration=${plan.totalDuration}`,
  );
  const types = new Set(plan.scenes.flatMap((s) => s.elements.map((e) => e.type)));
  console.log('element types in demo:', [...types].join(', '));

  console.log('\n=== 3. Master timeline (audio-sync math) ===');
  const audioDurations: Record<string, number> = {};
  for (const s of plan.scenes) audioDurations[s.id] = s.duration * 1.1;
  const timeline = buildMasterTimeline(
    plan,
    audioDurations,
    {intro: 'http://localhost:4000/audio/a.mp3'},
    30,
  );
  console.log(`totalFrames=${timeline.totalFrames} (${timeline.totalSeconds}s) scenes=${timeline.scenes.length}`);
  const scaled = scaleSceneAnimations(plan.scenes[0], plan.scenes[0].duration, timeline.scenes[0].durationSeconds);
  console.log(`scaled scene0 anim start: ${plan.scenes[0].animations[0].startTime} → ${scaled.animations[0].startTime}`);

  console.log('\n=== 4. Mock plan (no-key fallback) ===');
  const mock = normalizeAnimationPlan(buildMockPlan({topic: 'Mysuru Dasara', language: 'English', ageGroup: '13-18'}));
  console.log(`scenes=${mock.scenes.length} elements=${mock.scenes.reduce((a, s) => a + s.elements.length, 0)}`);

  console.log('\nAll checks passed.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});