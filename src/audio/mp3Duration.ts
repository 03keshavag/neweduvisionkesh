/**
 * Measure the duration of an MP3 file in pure Node (no browser, no ffprobe).
 *
 * Google-TTS MP3s are MPEG-1/2 Layer III CBR; we walk the frame headers from
 * the first sync byte, summing samples. Falls back to a constant-bitrate
 * estimate from the file size if no frame header can be parsed.
 */
import {readFile} from 'node:fs/promises';

const MPEG1_SAMPLE_RATES = [44100, 48000, 32000];
const MPEG2_SAMPLE_RATES = [22050, 24000, 16000];
const MPEG25_SAMPLE_RATES = [11025, 12000, 8000];
const MPEG1_BITRATES = [0, 32, 40, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320];
const MPEG2_BITRATES = [0, 8, 16, 24, 32, 40, 48, 56, 64, 80, 96, 112, 128, 144, 160];

interface ParsedHeader {
  frameLength: number;
  sampleRate: number;
  samplesPerFrame: number;
  bitrateKbps: number;
}

/** Parse an MPEG audio frame header at `offset`, or null if not a valid header. */
function parseHeader(buf: Buffer, offset: number): ParsedHeader | null {
  if (offset + 4 > buf.length) return null;
  const b0 = buf[offset];
  const b1 = buf[offset + 1];
  const b2 = buf[offset + 2];
  // 11-bit sync + MPEG audio.
  if (b0 !== 0xff || (b1 & 0xe0) !== 0xe0) return null;

  const versionBits = (b1 >> 3) & 0x03; // 3=MPEG1 2=MPEG2 0=MPEG2.5 1=reserved
  const layerBits = (b1 >> 1) & 0x03; // 3=Layer I 2=Layer II 1=Layer III 0=reserved
  const bitrateIdx = (b2 >> 4) & 0x0f;
  const sampleRateIdx = (b2 >> 2) & 0x03;
  const padding = (b2 >> 1) & 0x01;

  if (versionBits === 1 || layerBits === 0) return null;
  if (bitrateIdx === 0 || bitrateIdx === 15 || sampleRateIdx === 3) return null;

  const mpeg1 = versionBits === 3;
  const sampleRate = mpeg1
    ? MPEG1_SAMPLE_RATES[sampleRateIdx]
    : versionBits === 2
      ? MPEG2_SAMPLE_RATES[sampleRateIdx]
      : MPEG25_SAMPLE_RATES[sampleRateIdx];
  const bitrateKbps = mpeg1 ? MPEG1_BITRATES[bitrateIdx] : MPEG2_BITRATES[bitrateIdx];

  // Samples per frame by layer.
  let samplesPerFrame: number;
  let frameLength: number;
  if (layerBits === 3) {
    // Layer I: 384 samples/frame, size = (12 * bitrate / sampleRate + padding) * 4
    samplesPerFrame = 384;
    frameLength = Math.floor(((12 * bitrateKbps * 1000) / sampleRate + padding) * 4);
  } else if (layerBits === 2) {
    // Layer II: 1152 samples/frame
    samplesPerFrame = 1152;
    frameLength = Math.floor((144 * bitrateKbps * 1000) / sampleRate) + padding;
  } else {
    // Layer III: 1152 (MPEG1) or 576 (MPEG2/2.5)
    samplesPerFrame = mpeg1 ? 1152 : 576;
    frameLength = Math.floor((144 * bitrateKbps * 1000) / sampleRate) + padding;
  }

  if (frameLength <= 4 || Number.isNaN(sampleRate) || sampleRate <= 0) return null;
  return {frameLength, sampleRate, samplesPerFrame, bitrateKbps};
}

/** First byte offset at which audio frames start (skips ID3v2 tags). */
function audioStartOffset(buf: Buffer): number {
  if (buf.length > 10 && buf[0] === 0x49 && buf[1] === 0x44 && buf[2] === 0x33) {
    // sync-safe integer at bytes 6..9
    const size =
      ((buf[6] & 0x7f) << 21) | ((buf[7] & 0x7f) << 14) | ((buf[8] & 0x7f) << 7) | (buf[9] & 0x7f);
    return 10 + size;
  }
  return 0;
}

/** Duration (seconds) of an MP3 file, or a size-based estimate if unparseable. */
export function mp3DurationSeconds(buffer: Buffer, fallbackKbps = 128): number {
  const start = audioStartOffset(buffer);
  let offset = start;
  let totalSamples = 0;
  let sampleRate = 0;
  let frames = 0;

  while (offset + 4 <= buffer.length && frames < 1_000_000) {
    const header = parseHeader(buffer, offset);
    if (!header) {
      // Try to re-sync over the next byte (tolerates junk between frames).
      offset += 1;
      continue;
    }
    if (frames === 0) sampleRate = header.sampleRate;
    totalSamples += header.samplesPerFrame;
    frames += 1;
    offset += header.frameLength;
  }

  if (frames > 0 && sampleRate > 0) {
    return totalSamples / sampleRate;
  }

  // Fallback: assume constant bitrate from the audio bytes.
  const audioBytes = buffer.length - start;
  return (audioBytes * 8) / (fallbackKbps * 1000);
}

/** Convenience: read a file and return its duration in seconds. */
export async function getMp3DurationSeconds(filePath: string): Promise<number> {
  const buffer = await readFile(filePath);
  return mp3DurationSeconds(buffer);
}