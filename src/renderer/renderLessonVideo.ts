/**
 * Programmatic Remotion renderer.
 *
 * Bundles the Remotion project once (cached), selects the `LessonVideo`
 * composition with the given lesson + audio props, and renders an H.264 MP4.
 * The narration <Audio> elements inside the composition are mixed in, so the
 * output file already contains synchronized audio — no manual combining.
 */
import {bundle} from '@remotion/bundler';
import {renderMedia, selectComposition} from '@remotion/renderer';
import path from 'node:path';
import type {Lesson} from '../lesson/lessonTypes';

const ENTRY_POINT = path.join(process.cwd(), 'src', 'index.ts');

let cachedServeUrl: string | null = null;

/** Bundle the Remotion entry once and reuse the cached serve URL. */
async function getServeUrl(): Promise<string> {
  if (cachedServeUrl) {
    return cachedServeUrl;
  }
  console.log('[renderer] Bundling Remotion entry point…');
  cachedServeUrl = await bundle({
    entryPoint: ENTRY_POINT,
    onProgress: (p) => console.log(`[renderer] bundling ${Math.round(p * 100)}%`),
  });
  console.log('[renderer] Bundle ready.');
  return cachedServeUrl;
}

export interface RenderLessonParams {
  lesson: Lesson;
  /** scene id → public/-relative audio path, e.g. "audio/<jobId>/x.mp3". */
  audio: Record<number, string>;
  /** Absolute output file path (must end in .mp4). */
  outputLocation: string;
  /** Called with overall render progress 0 → 1. */
  onProgress?: (progress: number) => void;
}

export async function renderLessonVideo(params: RenderLessonParams): Promise<void> {
  const {lesson, audio, outputLocation, onProgress} = params;

  const serveUrl = await getServeUrl();
  const inputProps = {lesson, audio};
  const composition = await selectComposition({
    serveUrl,
    id: 'LessonVideo',
    inputProps,
  });

  await renderMedia({
    composition,
    serveUrl,
    codec: 'h264',
    outputLocation,
    inputProps,
    // FAST RENDERING: downscale to ~960x540 and use the fastest x264 preset so
    // short lessons render in seconds rather than minutes. Trade a little
    // resolution for speed (fine for an educational web player).
    scale: 0.5,
    crf: 24,
    x264Preset: 'superfast',
    enforceAudioTrack: true,
    onProgress: onProgress
      ? ({progress}) => {
          onProgress(progress);
        }
      : undefined,
  });
}
