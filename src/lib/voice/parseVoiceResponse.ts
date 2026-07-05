import { ApiError } from "@/types/api";
import type { VoiceChatResponse } from "@/types/voice";

function extractFields(source: Record<string, unknown>): VoiceChatResponse | null {
  const transcript = source.transcript ?? source.user_transcript;
  const answer = source.answer ?? source.response ?? source.ai_response;
  const audioUrl = source.audio_url ?? source.audioUrl ?? source.audio;

  if (transcript == null && answer == null) {
    return null;
  }

  return {
    transcript: String(transcript ?? ""),
    answer: String(answer ?? ""),
    audio_url: String(audioUrl ?? ""),
  };
}

export function parseVoiceResponse(json: unknown): VoiceChatResponse {
  if (!json || typeof json !== "object") {
    throw new ApiError("Invalid voice response from server.", 500);
  }

  const root = json as Record<string, unknown>;

  const direct = extractFields(root);
  if (direct) return direct;

  if (root.data && typeof root.data === "object") {
    const nested = extractFields(root.data as Record<string, unknown>);
    if (nested) return nested;
  }

  throw new ApiError("Invalid voice response format from server.", 500);
}
