/**
 * Simple end-to-end test for the Groq lesson generator.
 *
 * Run with: npm run test:lesson
 * Requires GROQ_API_KEY in .env.
 * Prints the validated lesson JSON to stdout.
 */
import 'dotenv/config';
import {generateLesson} from './lessonGenerator';

async function main(): Promise<void> {
  const lesson = await generateLesson({
    topic: 'Mysuru Dasara',
    language: 'Kannada',
    ageGroup: '13-18',
  });

  console.log('=== Validated EduVision Lesson (Mysuru Dasara / Kannada) ===\n');
  console.log(JSON.stringify(lesson, null, 2));
}

main().catch((err: unknown) => {
  console.error('\n[EduVision] Lesson generation failed:');
  console.error(err instanceof Error ? err.message : err);
  process.exitCode = 1;
});
