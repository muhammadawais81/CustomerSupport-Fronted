export type MessageRole = "user" | "assistant";

export interface Source {
  id: string;
  score: number;
  text: string;
  original_filename: string;
  chunk_index: number;
}

export interface ChatMessage {
  id: number;
  chat_id: number;
  role: MessageRole;
  content: string;
  sources: Source[] | null;
  created_at: string;
}

export interface Chat {
  id: number;
  user_id: number;
  company_id: number;
  title: string;
  created_at: string;
  updated_at: string | null;
  messages: ChatMessage[] | null;
}

export interface CreateChatRequest {
  title: string;
}

export interface SendMessageRequest {
  message: string;
}

export interface ChatResponse {
  success: boolean;
  message: string;
  data: {
    chat: Chat;
  };
}

export interface ChatsListResponse {
  success: boolean;
  message: string;
  data: {
    chats: Chat[];
  };
}

export interface LocalMessage {
  id: string;
  role: MessageRole;
  content: string;
  sources?: Source[] | null;
  created_at: string;
  isStreaming?: boolean;
}
