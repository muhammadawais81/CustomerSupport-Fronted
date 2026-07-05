import { apiClient, fetchWithAuth } from "@/lib/api/client";
import type {
  ChatResponse,
  ChatsListResponse,
  CreateChatRequest,
} from "@/types/chat";

export async function createChat(data: CreateChatRequest): Promise<ChatResponse> {
  return apiClient<ChatResponse>("/api/chats", {
    method: "POST",
    auth: true,
    body: data,
  });
}

export async function getChats(): Promise<ChatsListResponse> {
  return apiClient<ChatsListResponse>("/api/chats", {
    method: "GET",
    auth: true,
  });
}

export async function getChat(chatId: number): Promise<ChatResponse> {
  return apiClient<ChatResponse>(`/api/chats/${chatId}`, {
    method: "GET",
    auth: true,
  });
}

export async function sendMessageStream(
  chatId: number,
  message: string,
  onToken: (fullText: string, chunk: string) => void,
): Promise<string> {
  const response = await fetchWithAuth(`/api/chats/${chatId}/messages`, {
    method: "POST",
    body: JSON.stringify({ message }),
  });

  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error("Streaming is not supported");
  }

  const decoder = new TextDecoder();
  let fullResponse = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value, { stream: true });
    if (!chunk) continue;

    fullResponse += chunk;
    onToken(fullResponse, chunk);
  }

  // Flush any trailing bytes from the decoder
  const trailing = decoder.decode();
  if (trailing) {
    fullResponse += trailing;
    onToken(fullResponse, trailing);
  }

  return fullResponse;
}
