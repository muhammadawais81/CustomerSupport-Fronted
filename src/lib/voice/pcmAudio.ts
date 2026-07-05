import { VOICE_SAMPLE_RATE } from "@/types/voice";

export { VOICE_SAMPLE_RATE };

export function float32ToPcm16(float32: Float32Array): Uint8Array {
  const buffer = new ArrayBuffer(float32.length * 2);
  const view = new DataView(buffer);

  for (let i = 0; i < float32.length; i++) {
    const sample = Math.max(-1, Math.min(1, float32[i] ?? 0));
    view.setInt16(i * 2, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true);
  }

  return new Uint8Array(buffer);
}

export function pcm16ToFloat32(pcm16: Uint8Array): Float32Array {
  const view = new DataView(pcm16.buffer, pcm16.byteOffset, pcm16.byteLength);
  const float32 = new Float32Array(pcm16.byteLength / 2);

  for (let i = 0; i < float32.length; i++) {
    float32[i] = view.getInt16(i * 2, true) / 0x8000;
  }

  return float32;
}

export function encodeBase64(bytes: Uint8Array): string {
  let binary = "";
  const chunkSize = 0x8000;

  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.subarray(i, i + chunkSize);
    binary += String.fromCharCode(...chunk);
  }

  return btoa(binary);
}

export function decodeBase64(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);

  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }

  return bytes;
}

export function downsampleBuffer(
  input: Float32Array,
  inputRate: number,
  outputRate: number,
): Float32Array {
  if (inputRate === outputRate) return input;

  const ratio = inputRate / outputRate;
  const outputLength = Math.floor(input.length / ratio);
  const output = new Float32Array(outputLength);

  for (let i = 0; i < outputLength; i++) {
    output[i] = input[Math.floor(i * ratio)] ?? 0;
  }

  return output;
}

/** Target ~100ms of PCM16 mono at 24kHz = 4800 bytes */
export const PCM_CHUNK_BYTES = 4800;

export function mergeToChunkBuffer(
  pending: Uint8Array[],
  incoming: Uint8Array,
  chunkSize = PCM_CHUNK_BYTES,
): { chunks: Uint8Array[]; remaining: Uint8Array[] } {
  const combined = [...pending, incoming];
  const totalLength = combined.reduce((sum, part) => sum + part.length, 0);
  const merged = new Uint8Array(totalLength);

  let offset = 0;
  for (const part of combined) {
    merged.set(part, offset);
    offset += part.length;
  }

  const chunks: Uint8Array[] = [];
  let cursor = 0;

  while (cursor + chunkSize <= merged.length) {
    chunks.push(merged.subarray(cursor, cursor + chunkSize));
    cursor += chunkSize;
  }

  const remaining =
    cursor < merged.length ? [merged.subarray(cursor)] : [];

  return { chunks, remaining };
}

/** Flush any partial PCM buffer (call when user stops speaking). */
export function flushPendingChunks(pending: Uint8Array[]): {
  chunks: Uint8Array[];
  remaining: Uint8Array[];
} {
  if (pending.length === 0) {
    return { chunks: [], remaining: [] };
  }

  const totalLength = pending.reduce((sum, part) => sum + part.length, 0);
  const merged = new Uint8Array(totalLength);
  let offset = 0;
  for (const part of pending) {
    merged.set(part, offset);
    offset += part.length;
  }

  return merged.length > 0
    ? { chunks: [merged], remaining: [] }
    : { chunks: [], remaining: [] };
}
