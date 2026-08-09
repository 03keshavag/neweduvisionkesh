/**
 * Programmatic Remotion renderer — renders ANY registered composition with
 * the given inputProps (used by both the flexible EduVisionVideo engine and
 * the legacy LessonVideo engine). The narration <Audio> elements inside the
 * composition are mixed in, so the MP4 already contains synchronized audio.
 */
import {bundle} from '@remotion/bundler';
import {renderMedia, selectComposition} from '@remotion/renderer';
import path from 'node:path';

const ENTRY_POINT = path.join(process.cwd(), 'src', 'index.ts');

let cachedServeUrl: string | null = null;

/** Bundle the Remotion entry once and reuse the cached serve URL. */
export async function getServeUrl(): Promise<string> {
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

export interface RenderCompositionParams {
  /** Registered composition id, e.g. 'EduVisionVideo' or 'LessonVideo'. */
  compositionId: string;
  /** Props passed to the composition (for calculateMetadata + component). */
  inputProps: Record<string, unknown>;
  /** Absolute output file path (must end in .mp4). */
  outputLocation: string;
  /** Called with overall render progress 0 → 1. */
  onProgress?: (progress: number) => void;
}

export async function renderComposition(params: RenderCompositionParams): Promise<void> {
  const {compositionId, inputProps, outputLocation, onProgress} = params;

  const serveUrl = await getServeUrl();
  const composition = await selectComposition({
    serveUrl,
    id: compositionId,
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