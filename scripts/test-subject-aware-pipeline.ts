/**
 * Subject-Aware Multi-Domain Acceptance Suite for EduVision.
 */
import path from 'node:path';
import {stat} from 'node:fs/promises';
import {generateVideo} from '../src/renderer/generateVideo';

const ROOT = process.cwd();
const OUTPUT_DIR = path.join(ROOT, 'output', 'videos');
const AUDIO_DIR = path.join(ROOT, 'output', 'audio');

async function testTopic(topic: string, jobId: string) {
  console.log(`\n======================================================`);
  console.log(`TESTING SUBJECT-AWARE MANIM: "${topic}" (Job: ${jobId})`);
  console.log(`======================================================`);

  const result = await generateVideo({
    input: {topic, language: 'English', ageGroup: '13-18'},
    outputDir: OUTPUT_DIR,
    audioDir: AUDIO_DIR,
    baseUrl: 'http://localhost:4000',
    jobId,
    onProgress: (stage, progress) => {
      if (Math.round(progress * 100) % 50 === 0) {
        console.log(`  [${stage}] ${(progress * 100).toFixed(0)}%`);
      }
    },
  });

  const mp4Path = path.join(OUTPUT_DIR, `generated-${jobId}.mp4`);
  const s = await stat(mp4Path);
  console.log(`\n✓ SUCCESS for "${topic}":`);
  console.log(`  - Title: ${result.title}`);
  console.log(`  - URL: ${result.videoUrl}`);
  console.log(`  - Duration: ${result.duration.toFixed(2)}s`);
  console.log(`  - File Size: ${(s.size / 1024 / 1024).toFixed(2)} MB`);
}

async function main() {
  console.log('🚀 Running EduVision Subject-Aware Multi-Domain Acceptance Suite...\n');
  await testTopic('Explain Merge Sort', 'manim-merge-sort-v2');
  await testTopic('Explain Binary Search', 'manim-binary-search-v2');
  await testTopic('Explain Linked List Insertion', 'manim-linked-list-v2');
  await testTopic('Explain BFS', 'manim-bfs-v2');
  await testTopic('Explain Matrix Multiplication', 'manim-matrix-mult-v2');
  await testTopic('Explain Derivatives', 'manim-derivatives-v2');
  await testTopic('Explain Electric Circuits', 'manim-circuits-v2');
  await testTopic('Explain Projectile Motion', 'manim-projectile-v2');
}

main().catch((err) => {
  console.error('Test suite failed:', err);
  process.exit(1);
});
