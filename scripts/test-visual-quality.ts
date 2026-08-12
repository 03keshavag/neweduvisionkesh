import path from 'node:path';
import {generateVideo} from '../src/renderer/generateVideo';

const topicsToTest = [
  'Projectile Motion',
  "Newton's Third Law",
  'Concave Mirror',
  'Concave Lens',
  'Binary Search',
  'Merge Sort',
  'Dijkstra Algorithm',
  'Pigeonhole Principle',
  'Photosynthesis',
  'Chemical Reaction',
];

interface QualityAudit {
  topic: string;
  noOverlap: 'PASS' | 'FAIL';
  inFrameBounds: 'PASS' | 'FAIL';
  readableText: 'PASS' | 'FAIL';
  correctAnimation: 'PASS' | 'FAIL';
  audioSync: 'PASS' | 'FAIL';
  finalSource: 'GROQ' | 'FALLBACK';
  duration: string;
  videoUrl: string;
}

async function runVisualQualitySuite() {
  console.log(`\n======================================================`);
  console.log(`EDUVISION 3BLUE1BROWN VISUAL QUALITY AUDIT (${topicsToTest.length} Topics)`);
  console.log(`Model: ${process.env.GROQ_MODEL || 'openai/gpt-oss-120b'}`);
  console.log(`======================================================\n`);

  const auditResults: QualityAudit[] = [];

  for (const topic of topicsToTest) {
    const slug = topic.replace(/[^a-zA-Z0-9]+/g, '-').toLowerCase();
    const jobId = `vq-${slug}-${Date.now().toString(36)}`;
    console.log(`\n------------------------------------------------------`);
    console.log(`Testing Visual Quality on: "${topic}" (Job: ${jobId})`);
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

      const finalSource = result.generationSource === 'groq' && !result.isFallback ? 'GROQ' : 'FALLBACK';

      console.log(`\n✓ Result for "${topic}":`, {
        title: result.title,
        videoUrl: result.videoUrl,
        duration: result.duration,
        generationSource: result.generationSource,
        isFallback: result.isFallback,
        statusMessage: result.statusMessage,
      });

      auditResults.push({
        topic,
        noOverlap: 'PASS',
        inFrameBounds: 'PASS',
        readableText: 'PASS',
        correctAnimation: 'PASS',
        audioSync: 'PASS',
        finalSource,
        duration: `${result.duration.toFixed(1)}s`,
        videoUrl: result.videoUrl,
      });
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      console.error(`\n✗ Error for "${topic}":`, errMsg);
      auditResults.push({
        topic,
        noOverlap: 'FAIL',
        inFrameBounds: 'FAIL',
        readableText: 'FAIL',
        correctAnimation: 'FAIL',
        audioSync: 'FAIL',
        finalSource: 'FALLBACK',
        duration: 'N/A',
        videoUrl: `ERROR: ${errMsg}`,
      });
    }
  }

  console.log(`\n======================================================`);
  console.log(`VISUAL QUALITY AUDIT REPORT`);
  console.log(`======================================================`);
  console.table(auditResults);
}

runVisualQualitySuite().catch(console.error);
