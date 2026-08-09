/**
 * End-to-end test for the flexible AnimationPlan generator.
 *
 * Run with: npm run test:plan
 * Requires GROQ_API_KEY in .env. Prints the validated plan JSON to stdout.
 */
import 'dotenv/config';
import {generateAnimationPlan} from './planGenerator';

async function main(): Promise<void> {
  const plan = await generateAnimationPlan({
    topic: 'Binary Search',
    language: 'English',
    ageGroup: '13-18',
  });

  console.log('=== Validated AnimationPlan (Binary Search / English) ===\n');
  console.log(JSON.stringify(plan, null, 2));
  console.log(
    `\nScenes: ${plan.scenes.length} · totalDuration: ${plan.totalDuration}s · ` +
      `elements: ${plan.scenes.reduce((a, s) => a + s.elements.length, 0)} · ` +
      `animations: ${plan.scenes.reduce((a, s) => a + s.animations.length, 0)}`,
  );
}

main().catch((err: unknown) => {
  console.error('\n[EduVision] Animation plan generation failed:');
  console.error(err instanceof Error ? err.message : err);
  process.exitCode = 1;
});