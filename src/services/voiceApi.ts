import { fetchWithAuth } from "@/lib/api/client";
import { parseVoiceResponse } from "@/lib/voice/parseVoiceResponse";
import { ApiError } from "@/types/api";
import type { VoiceChatResponse, VoiceUploadParams } from "@/types/voice";

export async function sendVoiceMessage({
  audioBlob,
  chatSessionId,
  companyId,
}: VoiceUploadParams): Promise<VoiceChatResponse> {
  const formData = new FormData();
  formData.append("audio_file", audioBlob, "recording.webm");
  formData.append("chat_session_id", String(chatSessionId));
  formData.append("company_id", String(companyId));

  try {
    const response = await fetchWithAuth("/api/chat/voice", {
      method: "POST",
      body: formData,
    });

    const json: unknown = await response.json();
    return parseVoiceResponse(json);
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      error instanceof Error ? error.message : "Failed to send voice message",
      0,
    );
  }
}
