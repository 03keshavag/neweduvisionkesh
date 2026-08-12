import path from 'node:path';
import {generateVideo} from '../src/renderer/generateVideo';

const topicsToTest = [
  'explain projectile motion',
  'explain mirror properties',
  'explain concave lens',
  'explain binary search',
  'explain merge sort',
  'explain dijkstra algorithm',
];

interface TopicAudit {
  topic: string;
  planner: 'PASS' | 'FAIL';
  tts: 'PASS' | 'FAIL';
  groqManim: 'PASS' | 'FAIL';
  pythonValidation: 'PASS' | 'FAIL';
  timingValidation: 'PASS' | 'FAIL';
  manimRender: 'PASS' | 'FAIL';
  audioSync: 'PASS' | 'FAIL';
  finalSource: 'GROQ' | 'FALLBACK';
  duration: string;
  videoUrl: string;
}

async function runQwenTestSuite() {
  console.log(`\n======================================================`);
  console.log(`QWEN 3.6 27B PRODUCTION AUDIT TEST SUITE (${topicsToTest.length} Topics)`);
  console.log(`Model: ${process.env.GROQ_MODEL || 'qwen/qwen3.6-27b'}`);
  console.log(`======================================================\n`);

  const auditTable: TopicAudit[] = [];

  for (const topic of topicsToTest) {
    const slug = topic.replace(/\s+/g, '-').toLowerCase();
    const jobId = `qwen-${slug}-${Date.now().toString(36)}`;
    console.log(`\n------------------------------------------------------`);
    console.log(`Auditing Topic: "${topic}" (Job: ${jobId})`);
    console.log(`------------------------------------------------------`);

    let plannerStatus: 'PASS' | 'FAIL' = 'FAIL';
    let ttsStatus: 'PASS' | 'FAIL' = 'FAIL';
    let groqManimStatus: 'PASS' | 'FAIL' = 'FAIL';
    let pyValStatus: 'PASS' | 'FAIL' = 'FAIL';
    let timingValStatus: 'PASS' | 'FAIL' = 'FAIL';
    let renderStatus: 'PASS' | 'FAIL' = 'FAIL';
    let audioSyncStatus: 'PASS' | 'FAIL' = 'FAIL';

    try {
      const result = await generateVideo({
        input: {topic, language: 'English', ageGroup: '13-18'},
        outputDir: path.join(process.cwd(), 'output', 'videos'),
        audioDir: path.join(process.cwd(), 'output', 'audio'),
        baseUrl: 'http://localhost:4000',
        jobId,
        onProgress: (stage, progress) => {
          console.log(`[${slug}] ${stage}: ${(progress * 100).toFixed(0)}%`);
          if (stage === 'plan' && progress === 1) plannerStatus = 'PASS';
          if (stage === 'tts' && progress === 1) ttsStatus = 'PASS';
          if (stage === 'manim-script' && progress === 1) {
            groqManimStatus = 'PASS';
            pyValStatus = 'PASS';
            timingValStatus = 'PASS';
          }
          if (stage === 'manim-render' && progress === 1) renderStatus = 'PASS';
          if (stage === 'mux' && progress === 1) audioSyncStatus = 'PASS';
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

      auditTable.push({
        topic,
        planner: plannerStatus,
        tts: ttsStatus,
        groqManim: groqManimStatus,
        pythonValidation: pyValStatus,
        timingValidation: timingValStatus,
        manimRender: renderStatus,
        audioSync: audioSyncStatus,
        finalSource,
        duration: `${result.duration.toFixed(1)}s`,
        videoUrl: result.videoUrl,
      });
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      console.error(`\n✗ Error for "${topic}":`, errMsg);
      auditTable.push({
        topic,
        planner: plannerStatus,
        tts: ttsStatus,
        groqManim: groqManimStatus,
        pythonValidation: pyValStatus,
        timingValidation: timingValStatus,
        manimRender: renderStatus,
        audioSync: audioSyncStatus,
        finalSource: 'FALLBACK',
        duration: 'N/A',
        videoUrl: `ERROR: ${errMsg}`,
      });
    }
  }

  console.log(`\n======================================================`);
  console.log(`QWEN 3.6 27B AUDIT SUMMARY REPORT`);
  console.log(`======================================================`);
  console.table(auditTable);
}

runQwenTestSuite().catch(console.error);
