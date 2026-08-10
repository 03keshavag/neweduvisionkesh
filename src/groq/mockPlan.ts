/**
 * Mock AnimationPlan builder — DEVELOPMENT/TESTING ONLY.
 *
 * Used by the pipeline when GROQ_API_KEY is not configured or in testing.
 * Builds concept-first educational plans (Projectile Motion, Binary Search, etc.)
 * matching the exact pedagogical standards of the live Groq generator.
 */
import type {AnimationPlan, AnimationScene} from '../engine/types';
import type {LessonInput} from '../lesson/lessonTypes';

function buildProjectileMotionMockPlan(input: LessonInput): AnimationPlan {
  const {language} = input;
  const isKannada = language.toLowerCase() === 'kannada' || language === 'ಕನ್ನಡ';
  const isHindi = language.toLowerCase() === 'hindi' || language === 'हिंदी' || language === 'हिन्दी';

  const scenes: AnimationScene[] = [
    {
      id: 'proj-setup',
      purpose: 'Launch setup with initial velocity vector and launch angle',
      narration: isKannada
        ? 'ಪ್ರಕ್ಷೇಪಕ ಚಲನೆಯು ವಸ್ತುವು ನಿರ್ದಿಷ್ಟ ಕೋನದಲ್ಲಿ ಆರಂಭಿಕ ವೇಗದೊಂದಿಗೆ ಗಾಳಿಯಲ್ಲಿ ಚಲಿಸುವಾಗ ಸಂಭವಿಸುತ್ತದೆ.'
        : isHindi
          ? 'प्रक्षेप्य गति तब होती है जब किसी वस्तु को क्षैतिज से किसी कोण पर प्रारंभिक वेग के साथ हवा में प्रक्षेपित किया जाता है।'
          : 'Projectile motion is the curved motion of an object launched into the air with an initial velocity at an angle to the horizontal.',
      duration: 10,
      onScreenLabels: [isKannada ? 'ಪ್ರಕ್ಷೇಪಕ ಚಲನೆ — ಆರಂಭ' : isHindi ? 'प्रक्षेप्य गति — परिचय' : 'Projectile Motion — Physical Setup'],
      elements: [
        {id: 'title', type: 'title', position: {x: 520, y: 140}, props: {text: isKannada ? 'ಪ್ರಕ್ಷೇಪಕ ಚಲನೆ' : isHindi ? 'प्रक्षेप्य गति' : 'Projectile Motion', fontSize: 72}},
        {
          id: 'traj1',
          type: 'trajectory',
          position: {x: 560, y: 300},
          props: {
            width: 800,
            height: 400,
            progress: 0.02,
            launchAngle: 45,
            showProjectile: true,
            showVelocity: true,
            showVelocityComponents: false,
            showGravity: false,
            showApex: false,
            showRange: false,
            ground: true,
          },
        },
        {id: 'sub', type: 'label', position: {x: 620, y: 740}, props: {text: isKannada ? 'ಆರಂಭಿಕ ವೇಗ v₀ ಮತ್ತು ಕೋನ θ' : isHindi ? 'प्रारंभिक वेग v₀ और कोण θ' : 'Initial Velocity v₀ at Launch Angle θ', color: '#f4a300', fontSize: 30}},
      ],
      animations: [
        {id: 'a1', type: 'fadeIn', targetId: 'title', startTime: 0.3, duration: 0.6},
        {id: 'a2', type: 'fadeIn', targetId: 'traj1', startTime: 1.0, duration: 0.8},
        {id: 'a3', type: 'fadeIn', targetId: 'sub', startTime: 3.2, duration: 0.6},
      ],
      transition: {type: 'fade', duration: 0.4},
    },
    {
      id: 'proj-components',
      purpose: 'Velocity vector resolution into horizontal and vertical components',
      narration: isKannada
        ? 'ಆರಂಭಿಕ ವೇಗವನ್ನು ಸಮತಲ ಘಟಕ vx ಮತ್ತು ಲಂಬ ಘಟಕ vy ಎಂದು ಎರಡು ಸ್ವತಂತ್ರ ಭಾಗಗಳಾಗಿ ವಿಂಗಡಿಸಬಹುದು.'
        : isHindi
          ? 'हम प्रारंभिक वेग को दो स्वतंत्र घटकों में विभाजित कर सकते हैं: क्षैतिज घटक vx और ऊर्ध्वाधर घटक vy।'
          : 'We resolve the initial velocity into two independent components: horizontal velocity vx and vertical velocity vy.',
      duration: 11,
      onScreenLabels: [isKannada ? 'ವೇಗದ ಘಟಕಗಳು' : isHindi ? 'वेग के घटक' : 'Velocity Decomposition'],
      elements: [
        {id: 'title2', type: 'title', position: {x: 520, y: 140}, props: {text: isKannada ? 'ವೇಗದ ವಿಭಜನೆ' : isHindi ? 'वेग का वियोजन' : 'Resolving Velocity v₀', fontSize: 68}},
        {
          id: 'traj2',
          type: 'trajectory',
          position: {x: 560, y: 300},
          props: {
            width: 800,
            height: 400,
            progress: 0.08,
            launchAngle: 45,
            showProjectile: true,
            showVelocity: true,
            showVelocityComponents: true,
            showGravity: false,
            showApex: false,
            showRange: false,
            ground: true,
          },
        },
        {id: 'eq-vx', type: 'equation', position: {x: 480, y: 730}, props: {expression: 'v₀x = v₀ · cos(θ)', color: '#38b6ff', fontSize: 38}},
        {id: 'eq-vy', type: 'equation', position: {x: 980, y: 730}, props: {expression: 'v₀y = v₀ · sin(θ)', color: '#f4a300', fontSize: 38}},
      ],
      animations: [
        {id: 'b1', type: 'fadeIn', targetId: 'title2', startTime: 0.3, duration: 0.6},
        {id: 'b2', type: 'fadeIn', targetId: 'traj2', startTime: 0.8, duration: 0.8},
        {id: 'b3', type: 'displayEquation', targetId: 'eq-vx', startTime: 3.5, duration: 0.7},
        {id: 'b4', type: 'displayEquation', targetId: 'eq-vy', startTime: 5.5, duration: 0.7},
      ],
      transition: {type: 'fade', duration: 0.4},
    },
    {
      id: 'proj-flight-gravity',
      purpose: 'Motion along parabolic curve under constant downward gravity',
      narration: isKannada
        ? 'ಗುರುತ್ವಾಕರ್ಷಣೆಯು ನಿರಂತರವಾಗಿ ವಸ್ತುವನ್ನು ಕೆಳಕ್ಕೆ ಎಳೆಯುತ್ತದೆ. ಸಮತಲ ವೇಗವು ಸ್ಥಿರವಾಗಿರುತ್ತದೆ, ಆದರೆ ಲಂಬ ವೇಗವು ಕಡಿಮೆಯಾಗುತ್ತದೆ.'
        : isHindi
          ? 'गुरुत्वाकर्षण लगातार वस्तु को नीचे की ओर खींचता है। क्षैतिज वेग स्थिर रहता है, लेकिन ऊर्ध्वाधर वेग कम होता जाता है।'
          : 'Gravity continuously pulls the object downward. The horizontal velocity remains constant, while vertical velocity steadily decreases.',
      duration: 12,
      onScreenLabels: [isKannada ? 'ಗುರುತ್ವಾಕರ್ಷಣೆಯ ಪ್ರಭಾವ' : isHindi ? 'गुरुत्वाकर्षण का प्रभाव' : 'Gravity and Parabolic Flight'],
      elements: [
        {id: 'title3', type: 'title', position: {x: 500, y: 140}, props: {text: isKannada ? 'ಗುರುತ್ವ ಮತ್ತು ಚಲನೆ' : isHindi ? 'गुरुत्व और परवलयिक गति' : 'Flight Under Gravity g', fontSize: 68}},
        {
          id: 'traj3',
          type: 'trajectory',
          position: {x: 560, y: 300},
          props: {
            width: 800,
            height: 400,
            progress: 0.35,
            launchAngle: 45,
            showProjectile: true,
            showVelocity: true,
            showVelocityComponents: true,
            showGravity: true,
            showApex: false,
            showRange: false,
            ground: true,
          },
        },
        {id: 'glabel', type: 'label', position: {x: 620, y: 730}, props: {text: isKannada ? 'ಲಂಬ ವೇಗ ಕ್ರಮೇಣ ಶೂನ್ಯವಾಗುತ್ತದೆ' : isHindi ? 'लंबवत वेग लगातार घटता है' : 'Constant vx → | Vertical vy decreases due to g ↓', color: '#ff4d4d', fontSize: 28}},
      ],
      animations: [
        {id: 'c1', type: 'fadeIn', targetId: 'title3', startTime: 0.3, duration: 0.6},
        {id: 'c2', type: 'fadeIn', targetId: 'traj3', startTime: 0.8, duration: 0.8},
        {id: 'c3', type: 'fadeIn', targetId: 'glabel', startTime: 3.2, duration: 0.6},
      ],
      transition: {type: 'fade', duration: 0.4},
    },
    {
      id: 'proj-apex',
      purpose: 'Maximum height where vertical velocity vy equals zero',
      narration: isKannada
        ? 'ಗರಿಷ್ಠ ಎತ್ತರದಲ್ಲಿ ಲಂಬ ವೇಗ vy ಶೂನ್ಯವಾಗುತ್ತದೆ. ಇಲ್ಲಿ ಕೇವಲ ಸಮತಲ ವೇಗ vx ಮಾತ್ರ ಉಳಿಯುತ್ತದೆ.'
        : isHindi
          ? 'अधिकतम ऊंचाई पर ऊर्ध्वाधर वेग vy शून्य हो जाता है। इस बिंदु पर केवल क्षैतिज वेग vx रहता है।'
          : 'At the apex or maximum height, vertical velocity becomes exactly zero. Only horizontal velocity remains.',
      duration: 11,
      onScreenLabels: [isKannada ? 'ಗರಿಷ್ಠ ಎತ್ತರ (vy = 0)' : isHindi ? 'अधिकतम ऊंचाई (vy = 0)' : 'Maximum Height & Apex'],
      elements: [
        {id: 'title4', type: 'title', position: {x: 500, y: 140}, props: {text: isKannada ? 'ಗರಿಷ್ಠ ಎತ್ತರ' : isHindi ? 'अधिकतम ऊंचाई H' : 'Apex: Maximum Height H', fontSize: 68}},
        {
          id: 'traj4',
          type: 'trajectory',
          position: {x: 560, y: 300},
          props: {
            width: 800,
            height: 400,
            progress: 0.5,
            launchAngle: 45,
            showProjectile: true,
            showVelocity: true,
            showVelocityComponents: true,
            showGravity: true,
            showApex: true,
            showRange: false,
            ground: true,
            heightLabel: 'H = v₀y² / (2g)',
          },
        },
        {id: 'apex-eq', type: 'equation', position: {x: 640, y: 730}, props: {expression: 'At Peak: vy = 0  ⇒  H = (v₀ · sin θ)² / 2g', color: '#f4a300', fontSize: 34}},
      ],
      animations: [
        {id: 'd1', type: 'fadeIn', targetId: 'title4', startTime: 0.3, duration: 0.6},
        {id: 'd2', type: 'fadeIn', targetId: 'traj4', startTime: 0.8, duration: 0.8},
        {id: 'd3', type: 'displayEquation', targetId: 'apex-eq', startTime: 3.6, duration: 0.7},
      ],
      transition: {type: 'fade', duration: 0.4},
    },
    {
      id: 'proj-landing-range',
      purpose: 'Landing point, horizontal range R, and kinematic equations',
      narration: isKannada
        ? 'ವಸ್ತುವು ಭೂಮಿಯನ್ನು ತಲುಪಿದಾಗ ಒಟ್ಟು ದೂರವನ್ನು ವ್ಯಾಪ್ತಿ ಎನ್ನಲಾಗುತ್ತದೆ. ಈ ಚಲನೆಯು ನೈಸರ್ಗಿಕ ಸಮತೋಲನವನ್ನು ವಿವರಿಸುತ್ತದೆ.'
        : isHindi
          ? 'प्रक्षेप्य अपनी अंतिम सीमा पर उतरता है। क्षैतिज गति और गुरुत्वाकर्षण का यह संयोजन पूर्ण प्रक्षेप्य पथ का निर्माण करता है।'
          : 'The projectile completes its descent and lands at range R. The combination of uniform horizontal motion and accelerated vertical motion defines the full path.',
      duration: 12,
      onScreenLabels: [isKannada ? 'ವ್ಯಾಪ್ತಿ ಮತ್ತು ಸಮೀಕರಣಗಳು' : isHindi ? 'क्षैतिज परास और समीकरण' : 'Horizontal Range & Equations'],
      elements: [
        {id: 'title5', type: 'title', position: {x: 520, y: 140}, props: {text: isKannada ? 'ಪೂರ್ಣ ಪ್ರಕ್ಷೇಪಕ ಪಥ' : isHindi ? 'परास और गति के समीकरण' : 'Trajectory Range & Equations', fontSize: 68}},
        {
          id: 'traj5',
          type: 'trajectory',
          position: {x: 560, y: 280},
          props: {
            width: 800,
            height: 400,
            progress: 1.0,
            launchAngle: 45,
            showProjectile: true,
            showVelocity: true,
            showVelocityComponents: true,
            showGravity: true,
            showApex: true,
            showRange: true,
            ground: true,
            rangeLabel: 'Range R = v₀² sin(2θ) / g',
          },
        },
        {id: 'eq-x', type: 'equation', position: {x: 460, y: 720}, props: {expression: 'x(t) = v₀ · cos(θ) · t', color: '#38b6ff', fontSize: 32}},
        {id: 'eq-y', type: 'equation', position: {x: 960, y: 720}, props: {expression: 'y(t) = v₀ · sin(θ) · t - ½ g t²', color: '#f4a300', fontSize: 32}},
      ],
      animations: [
        {id: 'e1', type: 'fadeIn', targetId: 'title5', startTime: 0.3, duration: 0.6},
        {id: 'e2', type: 'fadeIn', targetId: 'traj5', startTime: 0.8, duration: 0.8},
        {id: 'e3', type: 'displayEquation', targetId: 'eq-x', startTime: 3.5, duration: 0.7},
        {id: 'e4', type: 'displayEquation', targetId: 'eq-y', startTime: 5.5, duration: 0.7},
      ],
      transition: {type: 'fade', duration: 0.4},
    },
  ];

  return {
    id: 'mock-projectile-plan',
    title: isKannada ? 'ಪ್ರಕ್ಷೇಪಕ ಚಲನೆ — EduVision' : isHindi ? 'प्रक्षेप्य गति — EduVision' : 'Projectile Motion — EduVision',
    topic: input.topic,
    subject: 'Physics',
    language,
    objective: 'Understand projectile trajectory, velocity components, gravity, and range',
    fps: 30,
    width: 1920,
    height: 1080,
    totalDuration: scenes.reduce((acc, s) => acc + s.duration, 0),
    scenes,
  };
}

function buildChemicalReactionMockPlan(input: LessonInput): AnimationPlan {
  const {language} = input;
  const scenes: AnimationScene[] = [
    {
      id: 'reactants',
      purpose: 'Reactants Present: Methane and Oxygen',
      narration: 'We start with methane CH4 and two molecules of oxygen O2. The atoms are bonded together into stable reactant molecules.',
      duration: 10,
      onScreenLabels: ['Step 1: Reactants Present'],
      elements: [
        {id: 'title', type: 'title', position: {x: 620, y: 70}, props: {text: 'Combustion of Methane', fontSize: 64}},
        {id: 'mol-ch4', type: 'molecule', position: {x: 600, y: 260}, props: {moleculeType: 'CH4', size: 160, label: 'Methane (CH₄)'}},
        {id: 'plus', type: 'label', position: {x: 880, y: 320}, props: {text: '+', fontSize: 48, color: '#94a3b8'}},
        {id: 'mol-o2a', type: 'molecule', position: {x: 1000, y: 280}, props: {moleculeType: 'O2', size: 130, label: 'Oxygen (O₂)'}},
        {id: 'mol-o2b', type: 'molecule', position: {x: 1180, y: 280}, props: {moleculeType: 'O2', size: 130, label: 'Oxygen (O₂)'}},
        {id: 'eq1', type: 'equation', position: {x: 680, y: 560}, props: {expression: 'CH₄ + 2 O₂  ⟶  Reactants', color: '#facc15', fontSize: 36}},
      ],
      animations: [
        {id: 'r1', type: 'fadeIn', targetId: 'title', startTime: 0.3, duration: 0.6},
        {id: 'r2', type: 'create', targetId: 'mol-ch4', startTime: 0.8, duration: 0.8},
        {id: 'r3', type: 'fadeIn', targetId: 'plus', startTime: 1.6, duration: 0.5},
        {id: 'r4', type: 'create', targetId: 'mol-o2a', startTime: 2.2, duration: 0.7},
        {id: 'r5', type: 'create', targetId: 'mol-o2b', startTime: 2.8, duration: 0.7},
        {id: 'r6', type: 'displayEquation', targetId: 'eq1', startTime: 4.2, duration: 0.7},
      ],
      transition: {type: 'fade', duration: 0.4},
    },
    {
      id: 'collision',
      purpose: 'Activation Energy: Bonds Break',
      narration: 'Heat provides the activation energy. The C–H bonds in methane and the O=O bonds in oxygen vibrate intensely and break apart.',
      duration: 10,
      onScreenLabels: ['Step 2: Bonds Breaking'],
      elements: [
        {id: 'title2', type: 'title', position: {x: 620, y: 70}, props: {text: 'Activation Energy & Collision', fontSize: 60}},
        {id: 'mol-ch4-shaking', type: 'molecule', position: {x: 600, y: 260}, props: {moleculeType: 'CH4', size: 160, shaking: true, label: 'C–H Bonds Breaking'}},
        {id: 'spark', type: 'label', position: {x: 890, y: 310}, props: {text: '⚡', fontSize: 56, color: '#f59e0b'}},
        {id: 'mol-o2a-shaking', type: 'molecule', position: {x: 1000, y: 280}, props: {moleculeType: 'O2', size: 130, shaking: true, label: 'O=O Breaking'}},
        {id: 'mol-o2b-shaking', type: 'molecule', position: {x: 1180, y: 280}, props: {moleculeType: 'O2', size: 130, shaking: true, label: 'O=O Breaking'}},
        {id: 'note-break', type: 'label', position: {x: 640, y: 560}, props: {text: 'Breaking old bonds requires input of activation energy', color: '#f87171', fontSize: 28}},
      ],
      animations: [
        {id: 'c1', type: 'fadeIn', targetId: 'title2', startTime: 0.3, duration: 0.6},
        {id: 'c2', type: 'fadeIn', targetId: 'mol-ch4-shaking', startTime: 0.8, duration: 0.6},
        {id: 'c3', type: 'fadeIn', targetId: 'spark', startTime: 1.5, duration: 0.6},
        {id: 'c4', type: 'fadeIn', targetId: 'mol-o2a-shaking', startTime: 1.8, duration: 0.6},
        {id: 'c5', type: 'fadeIn', targetId: 'mol-o2b-shaking', startTime: 2.2, duration: 0.6},
        {id: 'c6', type: 'fadeIn', targetId: 'note-break', startTime: 3.5, duration: 0.6},
      ],
      transition: {type: 'fade', duration: 0.4},
    },
    {
      id: 'products',
      purpose: 'New Bonds Form: CO2 and 2H2O',
      narration: 'The separated carbon, oxygen, and hydrogen atoms rearrange into carbon dioxide and water molecules, releasing strong chemical energy.',
      duration: 11,
      onScreenLabels: ['Step 3: New Bonds Form'],
      elements: [
        {id: 'title3', type: 'title', position: {x: 620, y: 70}, props: {text: 'Product Molecules Formed', fontSize: 60}},
        {id: 'mol-co2', type: 'molecule', position: {x: 580, y: 270}, props: {moleculeType: 'CO2', size: 170, label: 'Carbon Dioxide (CO₂)'}},
        {id: 'plus2', type: 'label', position: {x: 880, y: 320}, props: {text: '+', fontSize: 48, color: '#94a3b8'}},
        {id: 'mol-h2oa', type: 'molecule', position: {x: 1000, y: 260}, props: {moleculeType: 'H2O', size: 140, label: 'Water (H₂O)'}},
        {id: 'mol-h2ob', type: 'molecule', position: {x: 1180, y: 260}, props: {moleculeType: 'H2O', size: 140, label: 'Water (H₂O)'}},
        {id: 'flame', type: 'label', position: {x: 1360, y: 310}, props: {text: '🔥', fontSize: 52}},
        {id: 'eq2', type: 'equation', position: {x: 680, y: 560}, props: {expression: '⟶  CO₂ + 2 H₂O + Energy (Heat & Light)', color: '#4ade80', fontSize: 34}},
      ],
      animations: [
        {id: 'p1', type: 'fadeIn', targetId: 'title3', startTime: 0.3, duration: 0.6},
        {id: 'p2', type: 'create', targetId: 'mol-co2', startTime: 0.8, duration: 0.8},
        {id: 'p3', type: 'fadeIn', targetId: 'plus2', startTime: 1.6, duration: 0.5},
        {id: 'p4', type: 'create', targetId: 'mol-h2oa', startTime: 2.2, duration: 0.7},
        {id: 'p5', type: 'create', targetId: 'mol-h2ob', startTime: 2.8, duration: 0.7},
        {id: 'p6', type: 'fadeIn', targetId: 'flame', startTime: 3.6, duration: 0.6},
        {id: 'p7', type: 'displayEquation', targetId: 'eq2', startTime: 4.8, duration: 0.7},
      ],
      transition: {type: 'fade', duration: 0.4},
    },
    {
      id: 'reaction-summary',
      purpose: 'Balanced Reaction Equation & Exothermic Energy',
      narration: 'In summary, chemical reactions never destroy atoms; they only rearrange chemical bonds. Because forming the new bonds releases surplus energy, this reaction is exothermic.',
      duration: 12,
      onScreenLabels: ['Summary: Balanced Reaction'],
      elements: [
        {id: 'title4', type: 'title', position: {x: 580, y: 70}, props: {text: 'Combustion of Methane — Summary', fontSize: 60}},
        {id: 'full-eq', type: 'equation', position: {x: 560, y: 260}, props: {expression: 'CH₄ + 2 O₂  ⟶  CO₂ + 2 H₂O', color: '#facc15', fontSize: 46}},
        {id: 'energy-box', type: 'infoCard', position: {x: 520, y: 380}, props: {title: 'Energy Released', text: '≈ 890 kJ/mol (Exothermic)', color: '#f97316'}},
        {id: 'type-box', type: 'infoCard', position: {x: 1040, y: 380}, props: {title: 'Reaction Type', text: 'Combustion / Exothermic Oxidation', color: '#4ade80'}},
        {id: 'law-label', type: 'label', position: {x: 560, y: 560}, props: {text: 'Conservation of Mass: 1 Carbon, 4 Hydrogen, 4 Oxygen on both sides', color: '#94a3b8', fontSize: 26}},
      ],
      animations: [
        {id: 's1', type: 'fadeIn', targetId: 'title4', startTime: 0.3, duration: 0.6},
        {id: 's2', type: 'displayEquation', targetId: 'full-eq', startTime: 1.0, duration: 0.8},
        {id: 's3', type: 'fadeIn', targetId: 'energy-box', startTime: 2.2, duration: 0.6},
        {id: 's4', type: 'fadeIn', targetId: 'type-box', startTime: 2.8, duration: 0.6},
        {id: 's5', type: 'fadeIn', targetId: 'law-label', startTime: 4.0, duration: 0.6},
      ],
      transition: {type: 'fade', duration: 0.4},
    },
  ];

  return {
    id: 'mock-chemical-reaction-plan',
    title: 'Chemical Reaction: Combustion of Methane — EduVision',
    topic: input.topic,
    subject: 'Chemistry',
    language,
    objective: 'Understand reactant bonds breaking, atom rearrangement, and product formation',
    fps: 30,
    width: 1920,
    height: 1080,
    totalDuration: scenes.reduce((acc, s) => acc + s.duration, 0),
    scenes,
  };
}

export function buildMockPlan(input: LessonInput): AnimationPlan {
  const {topic, language, ageGroup} = input;
  const t = topic.toLowerCase();

  // If topic is projectile motion or trajectory, use the rich canonical physics model
  if (t.includes('projectile') || t.includes('parabola') || t.includes('trajectory')) {
    return buildProjectileMotionMockPlan(input);
  }

  // If topic is chemical reaction, combustion, or bonding, use canonical molecular model
  if (t.includes('chemical') || t.includes('reaction') || t.includes('combustion') || t.includes('methane') || t.includes('molecule')) {
    return buildChemicalReactionMockPlan(input);
  }

  const audience = ageGroup ? ` for ${ageGroup}` : '';

  const scenes: AnimationScene[] = [
    {
      id: 'intro',
      purpose: 'Title card that introduces the topic',
      narration: `Let us learn about ${topic}${audience}. This lesson explains the most important ideas with simple animated visuals.`,
      duration: 9,
      onScreenLabels: ['EduVision'],
      elements: [
        {id: 'title', type: 'title', position: {x: 500, y: 200}, props: {text: topic, fontSize: 84}},
        {id: 'sub', type: 'label', position: {x: 640, y: 340}, props: {text: 'An animated explainer', color: '#38b6ff'}},
        {id: 'orb', type: 'circle', position: {x: 880, y: 480}, props: {radius: 90, fill: 'rgba(56,182,255,0.30)', stroke: '#38b6ff'}},
      ],
      animations: [
        {id: 'a1', type: 'fadeIn', targetId: 'title', startTime: 0.4, duration: 0.8},
        {id: 'a2', type: 'fadeIn', targetId: 'sub', startTime: 1.8, duration: 0.7},
        {id: 'a3', type: 'create', targetId: 'orb', startTime: 2.6, duration: 1.2},
      ],
      transition: {type: 'fade', duration: 0.4},
    },
    {
      id: 'key-ideas',
      purpose: 'Three key idea blocks connected by arrows',
      narration: `Here are the key ideas about ${topic} that we will explore today.`,
      duration: 10,
      onScreenLabels: ['Key Ideas'],
      elements: [
        {id: 'b1', type: 'infoCard', position: {x: 300, y: 340}, props: {title: 'Idea 1', text: 'Core concept behind the topic', color: '#f4a300'}},
        {id: 'b2', type: 'infoCard', position: {x: 900, y: 340}, props: {title: 'Idea 2', text: 'How it connects to everyday life', color: '#38b6ff'}},
        {id: 'b3', type: 'infoCard', position: {x: 1500, y: 340}, props: {title: 'Idea 3', text: 'Why it matters for culture', color: '#3ddc97'}},
      ],
      animations: [
        {id: 'b1a', type: 'fadeIn', targetId: 'b1', startTime: 0.3, duration: 0.6},
        {id: 'b2a', type: 'fadeIn', targetId: 'b2', startTime: 2.2, duration: 0.6},
        {id: 'b3a', type: 'fadeIn', targetId: 'b3', startTime: 4.1, duration: 0.6},
      ],
      transition: {type: 'slide', duration: 0.4},
    },
    {
      id: 'process',
      purpose: 'Step-by-step process bubbles',
      narration: `Let us break ${topic} down into clear steps. Each number in the diagram is one idea we will explore.`,
      duration: 10,
      onScreenLabels: ['How It Works'],
      elements: [
        {id: 'psteps', type: 'progressSteps', position: {x: 480, y: 430}, props: {steps: ['First step', 'Middle step', 'Final step'], currentStep: 1}},
        {id: 'plabel', type: 'label', position: {x: 560, y: 720}, props: {text: 'Follow the numbered steps from left to right', color: '#38b6ff'}},
      ],
      animations: [
        {id: 'p1', type: 'fadeIn', targetId: 'psteps', startTime: 0.4, duration: 0.8},
        {id: 'p2', type: 'fadeIn', targetId: 'plabel', startTime: 2.4, duration: 0.6},
        {id: 'p3', type: 'highlight', targetId: 'psteps', startTime: 3.0, duration: 0.5, params: {value: 1}},
      ],
      transition: {type: 'fade', duration: 0.4},
    },
    {
      id: 'summary',
      purpose: 'Highlighted takeaway callout',
      narration: `To summarise: ${topic} is a rich topic with simple, powerful ideas worth remembering.`,
      duration: 8,
      onScreenLabels: ['Takeaway'],
      elements: [
        {id: 'call', type: 'highlightedText', position: {x: 560, y: 430}, props: {text: `✓ ${topic} in a nutshell`, fontSize: 56}},
        {id: 'note', type: 'stepCard', position: {x: 420, y: 700}, props: {title: 'Remember', text: 'Explore one key idea at a time, then connect them.', color: '#3ddc97'}},
      ],
      animations: [
        {id: 's1a', type: 'fadeIn', targetId: 'call', startTime: 0.3, duration: 0.8},
        {id: 's2a', type: 'fadeIn', targetId: 'note', startTime: 2.0, duration: 0.7},
      ],
      transition: {type: 'zoom', duration: 0.4},
    },
  ];

  return {
    id: 'mock-plan',
    title: `${topic} — EduVision`,
    topic,
    subject: 'General',
    language,
    objective: `Understand the key ideas of ${topic}`,
    fps: 30,
    width: 1920,
    height: 1080,
    totalDuration: scenes.reduce((acc, s) => acc + s.duration, 0),
    scenes,
  };
}