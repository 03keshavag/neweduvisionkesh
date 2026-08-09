/**
 * TTS — per-scene narration audio generation.
 *
 * Provider: Google Translate TTS (`translate.google.com/translate_tts`) —
 * chosen here because it needs no API key, returns real MP3 audio, and covers
 * the Indian regional languages this module supports (Kannada, Hindi, etc.).
 *
 * Each scene's `narration` becomes a small MP3 file, saved into `outDir`
 * (the renderer passes `public/audio` so Remotion's staticFile() can reach it).
 * Returns a map of scene id → file name for embedding into the video.
 *
 * NOTE: The keyless endpoint is rate-limited; we chunk long narrations and
 * pace requests with a small delay. Swap `synthesizeSpeech` for any paid
 * provider (ElevenLabs etc.) without touching the rest of the pipeline.
 */
import {writeFile} from 'node:fs/promises';
import path from 'node:path';
import type {Lesson} from '../lesson/lessonTypes';

const GOOGLE_TTS_URL = 'https://translate.google.com/translate_tts';

/** Google TTS hard-caps a single request at 200 characters. */
const MAX_CHARS_PER_REQUEST = 180;
/** Gentle pacing to stay under the unofficial endpoint's rate limit. */
const REQUEST_DELAY_MS = 350;

/**
 * Locale per supported language, keyed by the English name AND by the
 * language's own script — the AI often echoes the language in its script
 * (e.g. "ಕನ್ನಡ" instead of "Kannada"). Lookup is case-insensitive.
 */
const LANGUAGE_TO_LOCALE: Record<string, string> = {
  english: 'en',
  kannada: 'kn',
  hindi: 'hi',
  tamil: 'ta',
  telugu: 'te',
  malayalam: 'ml',
  bengali: 'bn',
  marathi: 'mr',
  gujarati: 'gu',
  punjabi: 'pa',
  // Local-script aliases the LLM may return.
  'ಕನ್ನಡ': 'kn',
  'हिंदी': 'hi',
  'हिन्दी': 'hi',
  'தமிழ்': 'ta',
  'తెలుగు': 'te',
  'മലയാളം': 'ml',
  'বাংলা': 'bn',
  'मराठी': 'mr',
  'ગુજરાતી': 'gu',
  'ਪੰਜਾਬੀ': 'pa',
};

/** Supported languages (canonical English names) for human-facing messages. */
export const SUPPORTED_TTS_LANGUAGES = [
  'English',
  'Kannada',
  'Hindi',
  'Tamil',
  'Telugu',
  'Malayalam',
  'Bengali',
  'Marathi',
  'Gujarati',
  'Punjabi',
];

/** Thrown when TTS synthesis fails for a scene. */
export class TtsError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TtsError';
  }
}

/** Maps a lesson language (English or native script) to its TTS locale. */
export function languageToLocale(language: string): string {
  const key = language.trim().toLowerCase();
  const locale = LANGUAGE_TO_LOCALE[key] ?? LANGUAGE_TO_LOCALE[language.trim()];
  if (!locale) {
    throw new TtsError(
      `No TTS locale configured for language "${language}". Supported: ${SUPPORTED_TTS_LANGUAGES.join(', ')}`,
    );
  }
  return locale;
}

/** Split a narration into chunks that fit Google TTS's per-request limit. */
export function splitNarration(text: string, limit = MAX_CHARS_PER_REQUEST): string[] {
  const clean = text.replace(/\s+/g, ' ').trim();
  if (clean.length <= limit) {
    return clean ? [clean] : [];
  }

  const sentences = clean.split(/(?<=[.!?।])\s+/);
  const chunks: string[] = [];
  let current = '';

  for (const sentence of sentences) {
    if ((current + ' ' + sentence).trim().length <= limit) {
      current = (current + ' ' + sentence).trim();
    } else {
      if (current) {
        chunks.push(current);
      }
      // A single sentence longer than the limit — hard-break it.
      current = sentence.slice(0, limit);
      current = sentence.length > limit ? sentence.slice(0, limit) : sentence;
    }
  }
  if (current) {
    chunks.push(current);
  }
  return chunks;
}

async function fetchSpeechSegment(text: string, locale: string): Promise<Buffer> {
  const url =
    `${GOOGLE_TTS_URL}?ie=UTF-8&client=tw-ob&tl=${locale}&q=` +
    encodeURIComponent(text);

  const response = await fetch(url, {
    headers: {
      // The unofficial endpoint expects a browser-like user agent.
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    },
  });

  if (!response.ok) {
    throw new TtsError(`TTS request failed with HTTP ${response.status}`);
  }
  const contentType = response.headers.get('content-type') ?? '';
  if (!contentType.includes('audio')) {
    throw new TtsError(
      `TTS returned unexpected content type "${contentType}" (rate-limited?)`,
    );
  }
  return Buffer.from(await response.arrayBuffer());
}

/** Synthesise an entire narration into a single MP3 buffer. */
export async function synthesizeSpeech(
  text: string,
  locale: string,
): Promise<Buffer> {
  const chunks = splitNarration(text);
  if (chunks.length === 0) {
    return Buffer.alloc(0);
  }

  const parts: Buffer[] = [];
  for (const chunk of chunks) {
    parts.push(await fetchSpeechSegment(chunk, locale));
    if (chunks.length > 1) {
      // Small pause between chunks sounds like a natural sentence break.
      await new Promise((resolve) => setTimeout(resolve, REQUEST_DELAY_MS));
    }
  }
  return Buffer.concat(parts);
}

/**
 * Generate one MP3 per scene and persist to `outDir`.
 * Returns a mapping of scene id (string or number) → file name.
 */
export async function generateNarrationAudioFromScenes(
  scenes: {id: string | number; narration: string}[],
  language: string,
  outDir: string,
): Promise<Record<string, string>> {
  const locale = languageToLocale(language);
  const audioFiles: Record<string, string> = {};

  for (const scene of scenes) {
    const buffer = await synthesizeSpeech(scene.narration, locale);
    const fileName = `narration-${String(scene.id)}.mp3`;
    await writeFile(path.join(outDir, fileName), buffer);
    audioFiles[String(scene.id)] = fileName;
    // Pace requests so consecutive scenes don't trip the rate limit.
    await new Promise((resolve) => setTimeout(resolve, REQUEST_DELAY_MS));
  }

  return audioFiles;
}

/**
 * Generate one MP3 per lesson scene and persist to `outDir`.
 * Returns a mapping of scene id → file name.
 */
export async function generateNarrationAudio(
  lesson: Lesson,
  outDir: string,
): Promise<Record<number, string>> {
  const files = await generateNarrationAudioFromScenes(lesson.scenes, lesson.language, outDir);
  const numeric: Record<number, string> = {};
  for (const [id, name] of Object.entries(files)) {
    numeric[Number(id)] = name;
  }
  return numeric;
}