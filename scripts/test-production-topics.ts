import path from 'node:path';
import {generateVideo} from '../src/renderer/generateVideo';

const topicsToTest = [
  'explain projectile motion',
  'explain binary search',
  'explain merge sort',
  'explain dijkstra algorithm',
  'explain bfs graph traversal',
  'explain dfs graph traversal',
];

async function runAllTests() {
  console.log(`\n======================================================`);
  console.log(`STARTING PRODUCTION RUN TEST SUITE (${topicsToTest.length} Topics)`);
  console.log(`======================================================\n`);

  const results: Array<{
    topic: string;
    success: boolean;
    generationSource?: string;
    isFallback?: boolean;
    duration?: number;
    videoUrl?: string;
    error?: string;
  }> = [];

  for (const topic of topicsToTest) {
    const slug = topic.replace(/\s+/g, '-').toLowerCase();
    const jobId = `test-prod-${slug}-${Date.now().toString(36)}`;
    console.log(`\n------------------------------------------------------`);
    console.log(`Testing topic: "${topic}" (Job: ${jobId})`);
    console.log(`------------------------------------------------------`);

    try {
      const result = await generateVideo({
        input: {topic, language: 'English', ageGroup: '13-18'},
        outputDir: path.join(process.cwd(), 'output', 'videos'),
        audioDir: path.join(process.cwd(), 'output', 'audio'),
        baseUrl: 'http://localhost:4000',
        jobId,
        onProgress: (stage, progress) => {
          console.log(`[${slug}] ${stage}: ${(progress * 100).toFixed(0)}%`);
        },
      });

      console.log(`\n✓ Result for "${topic}":`, {
        title: result.title,
        videoUrl: result.videoUrl,
        duration: result.duration,
        generationSource: result.generationSource,
        isFallback: result.isFallback,
        statusMessage: result.statusMessage,
      });

      results.push({
        topic,
        success: true,
        generationSource: result.generationSource,
        isFallback: result.isFallback,
        duration: result.duration,
        videoUrl: result.videoUrl,
      });
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      console.error(`\n✗ Error for "${topic}":`, errMsg);
      results.push({
        topic,
        success: false,
        error: errMsg,
      });
    }
  }

  console.log(`\n======================================================`);
  console.log(`TEST SUITE SUMMARY`);
  console.log(`======================================================`);
  console.table(results);
}

runAllTests().catch(console.error);
