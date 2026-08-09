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
    // Note: for MPEG-2 and MPEG-2.5 Layer III, the frame size coefficient is 72 (not 144)
    samplesPerFrame = mpeg1 ? 1152 : 576;
    const coef = mpeg1 ? 144 : 72;
    frameLength = Math.floor((coef * bitrateKbps * 1000) / sampleRate) + padding;
  }

  if (frameLength <= 4 || Number.isNaN(sampleRate) || sampleRate <= 0) return null;
  return {frameLength, sampleRate, samplesPerFrame, bitrateKbps};
}

/** Check if there is an ID3v2 tag at `offset` and return its total size (header + payload), or 0 if not ID3v2. */
function id3v2TagLengthAt(buf: Buffer, offset: number): number {
  if (offset + 10 <= buf.length && buf[offset] === 0x49 && buf[offset + 1] === 0x44 && buf[offset + 2] === 0x33) {
    // 4-byte sync-safe integer at bytes 6..9
    const size =
      ((buf[offset + 6] & 0x7f) << 21) |
      ((buf[offset + 7] & 0x7f) << 14) |
      ((buf[offset + 8] & 0x7f) << 7) |
      (buf[offset + 9] & 0x7f);
    return 10 + size;
  }
  return 0;
}

/** Duration (seconds) of an MP3 file, or a size-based estimate if unparseable. */
export function mp3DurationSeconds(buffer: Buffer, fallbackKbps = 64): number {
  let offset = 0;
  let totalDurationSeconds = 0;
  let frames = 0;
  let lastKnownBitrate = fallbackKbps;

  while (offset + 4 <= buffer.length && frames < 1_000_000) {
    // Check if an ID3v2 tag is present at the current offset (e.g. at the start of a concatenated chunk)
    const id3Length = id3v2TagLengthAt(buffer, offset);
    if (id3Length > 0) {
      offset += id3Length;
      continue;
    }

    const header = parseHeader(buffer, offset);
    if (!header) {
      // Try to re-sync over the next byte (tolerates junk or padding between frames).
      offset += 1;
      continue;
    }

    lastKnownBitrate = header.bitrateKbps;
    totalDurationSeconds += header.samplesPerFrame / header.sampleRate;
    frames += 1;
    offset += header.frameLength;
  }

  if (frames > 0 && totalDurationSeconds > 0) {
    return totalDurationSeconds;
  }

  // Fallback: estimate from total audio bytes using detected or fallback bitrate.
  const audioBytes = Math.max(0, buffer.length);
  return (audioBytes * 8) / (lastKnownBitrate * 1000);
}

/** Convenience: read a file and return its duration in seconds. */
export async function getMp3DurationSeconds(filePath: string): Promise<number> {
  const buffer = await readFile(filePath);
  return mp3DurationSeconds(buffer);
}