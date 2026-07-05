import type { Chat } from "@/types/chat";

const GENERIC_TITLES = new Set([
  "new conversation",
  "new chat",
  "untitled",
  "untitled chat",
  "voice call",
  "voice message",
]);

export function isGenericChatTitle(title: string): boolean {
  return GENERIC_TITLES.has(title.trim().toLowerCase()) || title.trim() === "";
}

export function truncateText(text: string, maxLength = 42): string {
  const trimmed = text.trim().replace(/\s+/g, " ");
  if (trimmed.length <= maxLength) return trimmed;
  return `${trimmed.slice(0, maxLength).trimEnd()}…`;
}

export function getChatSidebarLabel(
  chat: Chat,
  previews: Record<number, string>,
  maxLength = 42,
): string {
  const preview = previews[chat.id];
  if (preview) return truncateText(preview, maxLength);

  if (!isGenericChatTitle(chat.title)) {
    return truncateText(chat.title, maxLength);
  }

  return "New chat";
}

export function sortChatsByRecent(chats: Chat[]): Chat[] {
  return [...chats].sort((a, b) => {
    const aTime = new Date(a.updated_at ?? a.created_at).getTime();
    const bTime = new Date(b.updated_at ?? b.created_at).getTime();
    return bTime - aTime;
  });
}

export function extractFirstUserMessage(
  messages: Chat["messages"],
): string | null {
  if (!messages?.length) return null;
  const firstUser = messages.find((m) => m.role === "user");
  return firstUser?.content ?? null;
}
