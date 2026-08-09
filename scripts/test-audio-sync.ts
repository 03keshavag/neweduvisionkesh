import {splitNarration, synthesizeSpeech, languageToLocale} from '../src/audio/tts';
import {mp3DurationSeconds} from '../src/audio/mp3Duration';
import {buildMasterTimeline, validateTimelineSync, AUDIO_SAFETY_MARGIN_SECONDS} from '../src/engine/timeline';
import type {AnimationPlan} from '../src/engine/types';

function assert(condition: boolean, msg: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${msg}`);
  }
}

async function runTests() {
  console.log('=== STARTING AUDIO/VISUAL SYNCHRONIZATION TESTS ===\n');

  // Test E: Long TTS Chunking & Text Preservation
  console.log('[Test E] Long TTS Chunking & Character Preservation:');
  const longSentence = 'Projectile motion is the motion of an object launched into the air at an angle where the horizontal component of velocity remains constant while gravity continuously accelerates the object downward towards the center of the earth without stopping or slowing down.';
  const chunks = splitNarration(longSentence);
  console.log(`  Input length: ${longSentence.length} chars, Chunks created: ${chunks.length}`);
  chunks.forEach((c, idx) => console.log(`    Chunk ${idx + 1} (${c.length} chars): "${c}"`));
  const rejoined = chunks.join(' ');
  assert(chunks.length >= 2, 'Should split into multiple chunks');
  for (const chunk of chunks) {
    assert(chunk.length <= 180, `Chunk length ${chunk.length} must be <= 180`);
  }
  // Verify all words from the original sentence are preserved
  const originalWords = longSentence.split(/\s+/);
  const chunkWords = rejoined.split(/\s+/);
  assert(originalWords.length === chunkWords.length, `Expected ${originalWords.length} words, got ${chunkWords.length}`);
  console.log('  ✓ Test E Passed: All text preserved across chunk boundaries.\n');

  // Test F: Language Locales & TTS
  console.log('[Test F] Multilingual Support:');
  const languages = ['English', 'Kannada', 'Hindi', 'Tamil', 'Telugu', 'Malayalam', 'Bengali', 'Marathi', 'Gujarati', 'Punjabi'];
  for (const lang of languages) {
    const loc = languageToLocale(lang);
    assert(!!loc, `Locale for ${lang} must exist`);
  }
  // Native script aliases
  assert(languageToLocale('ಕನ್ನಡ') === 'kn', 'Kannada script locale');
  assert(languageToLocale('हिंदी') === 'hi', 'Hindi script locale');
  console.log(`  ✓ Test F Passed: All ${languages.length} languages and native aliases validated.\n`);

  // Test A & B: MP3 Duration Accuracy & Long vs Short Narrations
  console.log('[Test A & B] MP3 Duration Measurement Accuracy:');
  const shortText = 'Binary search runs in logarithmic time.';
  const longText = 'Projectile motion is the motion of an object launched into the air at an angle. The horizontal component of velocity remains constant while gravity continuously accelerates the object downward until it reaches the ground.';
  
  const shortBuf = await synthesizeSpeech(shortText, 'en');
  const shortDur = mp3DurationSeconds(shortBuf);
  console.log(`  Short narration: buffer=${shortBuf.length} bytes, measured=${shortDur.toFixed(2)}s`);
  assert(shortDur > 1.5 && shortDur < 5.0, `Short duration ${shortDur}s within expected range`);

  const longBuf = await synthesizeSpeech(longText, 'en');
  const longDur = mp3DurationSeconds(longBuf);
  console.log(`  Long narration: buffer=${longBuf.length} bytes, measured=${longDur.toFixed(2)}s`);
  assert(longDur > 8.0, `Long duration ${longDur}s should be > 8s`);
  console.log('  ✓ Test A & B Passed: Durations measured accurately without 50% undercount.\n');

  // Test C & D: Master Timeline Multi-Scene & Final Scene Audio Guarantee
  console.log('[Test C & D] Multi-Scene Master Timeline & Final Scene Termination:');
  const mockPlan: AnimationPlan = {
    id: 'test-plan',
    title: 'Test Plan',
    topic: 'Physics',
    subject: 'Physics',
    language: 'English',
    objective: 'Test audio sync',
    fps: 30,
    width: 1920,
    height: 1080,
    totalDuration: 40,
    scenes: [
      {id: 's1', purpose: 'Intro', narration: 'Scene 1', duration: 8, elements: [], animations: []},
      {id: 's2', purpose: 'Concept', narration: 'Scene 2', duration: 8, elements: [], animations: []},
      {id: 's3', purpose: 'Deep Dive', narration: 'Scene 3', duration: 8, elements: [], animations: []},
      {id: 's4', purpose: 'Conclusion', narration: 'Scene 4', duration: 8, elements: [], animations: []},
    ],
  };

  const audioDurations = {
    s1: 7.3,
    s2: 13.8, // Long scene (exceeds 8s estimate)
    s3: 9.5,
    s4: 17.1, // Very long final scene (exceeds 8s estimate)
  };

  const timeline = buildMasterTimeline(mockPlan, audioDurations, {}, 30, AUDIO_SAFETY_MARGIN_SECONDS);
  console.log(`  Total composition frames: ${timeline.totalFrames} (${timeline.totalSeconds.toFixed(2)}s)`);

  for (let i = 0; i < timeline.scenes.length; i++) {
    const entry = timeline.scenes[i];
    const audioSec = audioDurations[entry.sceneId as keyof typeof audioDurations];
    const audioFrames = Math.round(audioSec * 30);
    console.log(`    Scene ${entry.sceneId}: visualFrames=${entry.durationFrames} (${entry.durationSeconds.toFixed(2)}s), audioFrames=${audioFrames} (${audioSec}s), startFrame=${entry.startFrame}, endFrame=${entry.endFrame}, audioStart=${entry.audioStartFrame}, audioEnd=${entry.audioEndFrame}`);

    // Assert visual duration >= audio duration
    assert(entry.endFrame >= entry.audioEndFrame, `Scene ${entry.sceneId} visual end must be >= audio end`);
    assert(entry.audioEndFrame - entry.audioStartFrame >= audioFrames, `Scene ${entry.sceneId} audio sequence must accommodate full audio`);

    // If there is a next scene, ensure next scene audio starts AFTER current audio ends
    if (i < timeline.scenes.length - 1) {
      const nextEntry = timeline.scenes[i + 1];
      assert(nextEntry.audioStartFrame >= entry.audioEndFrame, `Scene ${nextEntry.sceneId} audio must not start before Scene ${entry.sceneId} audio finishes`);
    }
  }

  // Test D check: Final scene audio must not exceed composition totalFrames
  const lastEntry = timeline.scenes[timeline.scenes.length - 1];
  assert(timeline.totalFrames >= lastEntry.audioEndFrame, 'Composition total frames must cover last scene audio completely');
  console.log('  ✓ Test C & D Passed: Multi-scene and final scene audio sequence verified.\n');

  // Pre-render validation check
  const val = validateTimelineSync(timeline, audioDurations);
  assert(val.valid, `Timeline validation should pass with 0 errors, got: ${val.errors.join(', ')}`);
  console.log('  ✓ Pre-render validation passed.\n');

  console.log('=== ALL TESTS PASSED SUCCESSFULLY ===');
}

runTests().catch((err) => {
  console.error('\n❌ TEST SUITE FAILED:', err);
  process.exit(1);
});
