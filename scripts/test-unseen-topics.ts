import path from 'node:path';
import {generateVideo} from '../src/renderer/generateVideo';

const unseenTopics = [
  'Explain the Doppler effect',
  "Explain Kirchhoff's laws",
  'Explain Bayes theorem',
  'Explain AVL tree rotations',
  'Explain Fourier Transform',
  'Explain SN1 reaction',
  'Explain TCP Three-Way Handshake',
  'Explain Thermodynamic Carnot Cycle',
];

interface UnseenTopicAudit {
  topic: string;
  domain: string;
  source: 'GROQ' | 'FALLBACK';
  duration: string;
  videoUrl: string;
  status: 'SUCCESS' | 'FAILED';
}

async function runUnseenTestSuite() {
  console.log(`\n======================================================`);
  console.log(`UNIVERSAL ZERO-BREAK TEST SUITE (${unseenTopics.length} Unseen Topics)`);
  console.log(`Model: ${process.env.GROQ_MODEL || 'openai/gpt-oss-120b'}`);
  console.log(`======================================================\n`);

  const results: UnseenTopicAudit[] = [];

  for (const topic of unseenTopics) {
    const slug = topic.replace(/[^a-zA-Z0-9]+/g, '-').toLowerCase();
    const jobId = `unseen-${slug}-${Date.now().toString(36)}`;
    console.log(`\n------------------------------------------------------`);
    console.log(`Testing Universal Generation on Unseen Topic: "${topic}" (Job: ${jobId})`);
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

      const source = result.generationSource === 'groq' && !result.isFallback ? 'GROQ' : 'FALLBACK';

      console.log(`\n✓ Generated for "${topic}":`, {
        title: result.title,
        videoUrl: result.videoUrl,
        duration: result.duration,
        generationSource: result.generationSource,
        isFallback: result.isFallback,
        statusMessage: result.statusMessage,
      });

      results.push({
        topic,
        domain: result.title,
        source,
        duration: `${result.duration.toFixed(1)}s`,
        videoUrl: result.videoUrl,
        status: 'SUCCESS',
      });
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      console.error(`\n✗ Error for "${topic}":`, errMsg);
      results.push({
        topic,
        domain: 'N/A',
        source: 'FALLBACK',
        duration: 'N/A',
        videoUrl: `ERROR: ${errMsg}`,
        status: 'FAILED',
      });
    }
  }

  console.log(`\n======================================================`);
  console.log(`UNIVERSAL ZERO-BREAK AUDIT REPORT`);
  console.log(`======================================================`);
  console.table(results);
}

runUnseenTestSuite().catch(console.error);
