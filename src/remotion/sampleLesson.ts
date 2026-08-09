/**
 * Development-only sample Lesson used to preview the video engine.
 * NOT part of the AI pipeline — it stands in for a validated Groq lesson so
 * the Remotion preview can be tested without an API key.
 *
 * Covers all six scene types so every reusable scene component is visible.
 * The same shape is produced by `src/groq/lessonGenerator.ts` for any topic.
 */
import type {Lesson} from '../lesson/lessonTypes';

export const SAMPLE_LESSON: Lesson = {
  title: 'ಮೈಸೂರು ದಸರಾ — ನಾಡಹಬ್ಬದ ಪರಿಚಯ',
  topic: 'Mysuru Dasara',
  language: 'Kannada',
  ageGroup: '13-18',
  estimatedDuration: 84,
  learningObjectives: [
    'ದಸರಾದ ಐತಿಹಾಸಿಕ ಹಿನ್ನೆಲೆಯನ್ನು ಅರ್ಥಮಾಡಿಕೊಳ್ಳುವುದು',
    'ಮುಖ್ಯ ಆಚರಣೆಗಳನ್ನು ಗುರುತಿಸುವುದು',
  ],
  scenes: [
    {
      id: 1,
      type: 'intro',
      duration: 10,
      narration:
        'ಮೈಸೂರು ದಸರಾ ಕರ್ನಾಟಕದ ಅತ್ಯಂತ ಪ್ರಸಿದ್ಧ ಹಬ್ಬಗಳಲ್ಲಿ ಒಂದು. ವಿಜಯದಶಮಿಯಂದು ಈ ಹಬ್ಬವನ್ನು ವಿಜೃಂಭಣೆಯಿಂದ ಆಚರಿಸಲಾಗುತ್ತದೆ.',
      onScreenText: ['ಮೈಸೂರು ದಸರಾ', 'ನಾಡಹಬ್ಬ'],
      visualDescription:
        'ರಾತ್ರಿಯಲ್ಲಿ ಬೆಳಗುತ್ತಿರುವ ಮೈಸೂರು ಅರಮನೆ, ಆನೆಗಳ ಮೆರವಣಿಗೆ.',
    },
    {
      id: 2,
      type: 'content',
      duration: 20,
      narration:
        'ದಸರಾ ಎಂದರೆ ವಿಜಯದಶಮಿ. ಈ ದಿನ ಶ್ರೀರಾಮನು ರಾವಣನನ್ನು ಸೋಲಿಸಿದನೆಂದು ನಂಬಲಾಗಿದೆ. ಮೈಸೂರು ರಾಜಮನೆತನದ ಆಶ್ರಯದಲ್ಲಿ ಈ ಹಬ್ಬ ಶತಮಾನಗಳಿಂದ ನಡೆದುಬಂದಿದೆ.',
      onScreenText: ['ವಿಜಯದಶಮಿ', 'ಶ್ರೀರಾಮನ ವಿಜಯ', 'ರಾಜಮನೆತನದ ಸಂಪ್ರದಾಯ'],
      visualDescription:
        'ಶ್ರೀರಾಮ ಮತ್ತು ರಾವಣನ ಕಥೆಯ ಸರಳ ಚಿತ್ರಣ, ಐತಿಹಾಸಿಕ ಕಾಲರೇಖೆ.',
    },
    {
      id: 3,
      type: 'example',
      duration: 16,
      narration:
        'ದಸರಾ ಮೆರವಣಿಗೆಯಲ್ಲಿ ಅಲಂಕೃತ ಆನೆಗಳು, ನೃತ್ಯ ತಂಡಗಳು ಮತ್ತು ಜಾನಪದ ಕಲಾವಿದರು ಭಾಗವಹಿಸುತ್ತಾರೆ. ಅರಮನೆ ದೀಪಗಳಿಂದ ಮಿಂಚುತ್ತದೆ.',
      onScreenText: ['ಆನೆಗಳ ಮೆರವಣಿಗೆ'],
      visualDescription:
        'ಅಲಂಕೃತ ಆನೆ, ಬೆಳಗುತ್ತಿರುವ ಅರಮನೆಯ ಮುಂಭಾಗದ ದೃಶ್ಯ.',
    },
    {
      id: 4,
      type: 'activity',
      duration: 18,
      narration:
        'ದಸರಾ ಹತ್ತು ದಿನಗಳ ಕಾಲ ನಡೆಯುತ್ತದೆ. ಪ್ರತಿದಿನ ವಿಶೇಷ ಕಾರ್ಯಕ್ರಮಗಳು ಇರುತ್ತವೆ. ಕೊನೆಯ ದಿನ ವಿಜಯದಶಮಿ ಎಂದು ಆಚರಿಸಲಾಗುತ್ತದೆ.',
      onScreenText: ['ಮೊದಲ ದಿನ', 'ನವರಾತ್ರಿ', 'ವಿಜಯದಶಮಿ'],
      visualDescription:
        'ಹತ್ತು ದಿನಗಳ ದಸರಾ ಉತ್ಸವವನ್ನು ತೋರಿಸುವ ಸಮಯರೇಖೆ.',
    },
    {
      id: 5,
      type: 'summary',
      duration: 12,
      narration:
        'ಮೈಸೂರು ದಸರಾ ಕೇವಲ ಒಂದು ಹಬ್ಬವಲ್ಲ — ಇದು ಕರ್ನಾಟಕದ ಸಂಸ್ಕೃತಿ ಮತ್ತು ಪರಂಪರೆಯ ಸಂಕೇತವಾಗಿದೆ.',
      onScreenText: ['ಸಂಸ್ಕೃತಿಯ ಸಂಕೇತ'],
      visualDescription:
        'ಮೆರವಣಿಗೆ ಮತ್ತು ಜನರ ಸಂಭ್ರಮದ ಸಾರಾಂಶ ದೃಶ್ಯ.',
    },
    {
      id: 6,
      type: 'conclusion',
      duration: 8,
      narration:
        'ಹೀಗೆ ಮೈಸೂರು ದಸರಾ ಕರ್ನಾಟಕದ ಹೆಮ್ಮೆಯ ಹಬ್ಬ. ನಿಮ್ಮ ಗಮನಕ್ಕೆ ಧನ್ಯವಾದಗಳು.',
      onScreenText: ['ಧನ್ಯವಾದಗಳು', 'ಮತ್ತೆ ಭೇಟಿಯಾಗೋಣ'],
      visualDescription: 'ಅರಮನೆ ದೃಶ್ಯದೊಂದಿಗೆ ಮುಕ್ತಾಯ ಪರದೆ.',
    },
  ],
  quiz: [
    {
      question: 'ದಸರಾ ಯಾವ ರಾಜ್ಯದ ನಾಡಹಬ್ಬ?',
      options: ['ತಮಿಳುನಾಡು', 'ಕರ್ನಾಟಕ', 'ಕೇರಳ'],
      correctAnswer: 1,
      explanation: 'ದಸರಾ ಕರ್ನಾಟಕದ ನಾಡಹಬ್ಬ.',
    },
  ],
  sources: [{title: 'Mysore Palace', url: 'https://mysorepalace.gov.in'}],
};
