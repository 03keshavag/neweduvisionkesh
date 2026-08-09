import {validatePlanSemantics} from '../src/groq/planGenerator';
import {buildMockPlan} from '../src/groq/mockPlan';
import {enrichPlan} from '../src/engine/plans/enrichPlan';
import type {AnimationPlan} from '../src/engine/types';

function assert(condition: boolean, msg: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${msg}`);
  }
}

async function runTests() {
  console.log('=== STARTING SEMANTIC VISUAL MODEL & EDUCATIONAL TESTS ===\n');

  // 1. Test Projectile Motion Model
  console.log('[Test 1] Projectile Motion Canonical Model:');
  const projPlan = buildMockPlan({topic: 'Explain projectile motion', language: 'English'});
  assert(projPlan.scenes.length >= 5, `Expected >= 5 scenes, got ${projPlan.scenes.length}`);

  const enrichedProj = enrichPlan(projPlan);
  const trajElements = enrichedProj.scenes.flatMap((s) => s.elements).filter((e) => e.type === 'trajectory');
  assert(trajElements.length >= 4, `Expected multiple trajectory scenes, found ${trajElements.length}`);

  // Verify key physical properties on trajectory elements
  const hasVelocity = trajElements.some((e) => e.props.showVelocity && e.props.showVelocityComponents);
  const hasGravity = trajElements.some((e) => e.props.showGravity);
  const hasApex = trajElements.some((e) => e.props.showApex);
  const hasRange = trajElements.some((e) => e.props.showRange);
  assert(hasVelocity, 'Must show velocity and component decomposition');
  assert(hasGravity, 'Must show downward gravity vector');
  assert(hasApex, 'Must show apex / maximum height H');
  assert(hasRange, 'Must show horizontal range R');

  // Verify diagram coordinates were not corrupted/displaced by enrichment
  for (const traj of trajElements) {
    assert(traj.position.x === 560, `Trajectory X position maintained at 560, got ${traj.position.x}`);
  }
  console.log('  ✓ Test 1 Passed: Projectile motion canonical model verified with all physical variables.\n');

  // 2. Test Semantic Validation for Subjects
  console.log('[Test 2] Semantic Plan Validation:');
  const validCheck = validatePlanSemantics(projPlan, 'Projectile Motion');
  assert(validCheck.valid, 'Projectile motion plan should pass semantic validation');

  const weakPlan: AnimationPlan = {
    id: 'weak',
    title: 'Weak Plan',
    topic: 'Projectile Motion',
    subject: 'Physics',
    language: 'English',
    objective: 'Test',
    fps: 30,
    width: 1920,
    height: 1080,
    totalDuration: 30,
    scenes: [
      {
        id: 's1',
        purpose: 'Test',
        narration: 'Test narration.',
        duration: 10,
        elements: [{id: 'c1', type: 'infoCard', position: {x: 400, y: 300}, props: {title: 'Test', text: 'Text only'}}],
        animations: [],
      },
    ],
  };
  const invalidCheck = validatePlanSemantics(weakPlan, 'Projectile Motion');
  assert(!invalidCheck.valid, 'Weak plan without physical primitives should be rejected');
  console.log(`  ✓ Test 2 Passed: Semantic validation correctly identified and rejected weak plan.\n`);

  // 3. Test CS Plan (Binary Search)
  console.log('[Test 3] Computer Science (Binary Search):');
  const csPlan = buildMockPlan({topic: 'Binary Search Algorithm', language: 'English'});
  const enrichedCs = enrichPlan(csPlan);
  assert(enrichedCs.scenes.length >= 4, 'CS plan generated successfully');
  console.log('  ✓ Test 3 Passed: Computer science plan generated and enriched.\n');

  console.log('=== ALL SEMANTIC & CONCEPT VISUALIZATION TESTS PASSED ===');
}

runTests().catch((err) => {
  console.error('\n❌ SEMANTIC TEST SUITE FAILED:', err);
  process.exit(1);
});
