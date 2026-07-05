"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { createChat, getChat, getChats } from "@/lib/api/chats";
import {
  extractFirstUserMessage,
  isGenericChatTitle,
  sortChatsByRecent,
} from "@/lib/chat/utils";
import type { Chat } from "@/types/chat";

interface ChatContextValue {
  chats: Chat[];
  chatPreviews: Record<number, string>;
  isLoading: boolean;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  refreshChats: () => Promise<void>;
  setChatPreview: (chatId: number, firstMessage: string) => void;
  startNewChat: () => Promise<Chat>;
}

const ChatContext = createContext<ChatContextValue | null>(null);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [chats, setChats] = useState<Chat[]>([]);
  const [chatPreviews, setChatPreviews] = useState<Record<number, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const enrichPreviews = useCallback(async (chatList: Chat[]) => {
    const needsPreview = chatList.filter((chat) => isGenericChatTitle(chat.title));

    if (needsPreview.length === 0) return;

    const results = await Promise.all(
      needsPreview.map(async (chat) => {
        try {
          const response = await getChat(chat.id);
          const firstMessage = extractFirstUserMessage(response.data.chat.messages);
          return firstMessage ? ([chat.id, firstMessage] as const) : null;
        } catch {
          return null;
        }
      }),
    );

    const updates: Record<number, string> = {};
    for (const entry of results) {
      if (entry) updates[entry[0]] = entry[1];
    }

    if (Object.keys(updates).length > 0) {
      setChatPreviews((prev) => ({ ...prev, ...updates }));
    }
  }, []);

  const refreshChats = useCallback(async () => {
    try {
      const response = await getChats();
      const sorted = sortChatsByRecent(response.data.chats);
      setChats(sorted);

      const previewsFromTitles: Record<number, string> = {};
      for (const chat of sorted) {
        if (!isGenericChatTitle(chat.title)) {
          previewsFromTitles[chat.id] = chat.title;
        }
      }
      setChatPreviews((prev) => {
        const next = { ...prev };
        for (const [id, title] of Object.entries(previewsFromTitles)) {
          const chatId = Number(id);
          if (!next[chatId]) {
            next[chatId] = title;
          }
        }
        return next;
      });

      void enrichPreviews(sorted);
    } catch {
      setChats([]);
    } finally {
      setIsLoading(false);
    }
  }, [enrichPreviews]);

  const setChatPreview = useCallback((chatId: number, firstMessage: string) => {
    setChatPreviews((prev) => ({ ...prev, [chatId]: firstMessage.trim() }));
    setChats((prev) =>
      sortChatsByRecent(
        prev.map((chat) =>
          chat.id === chatId
            ? { ...chat, title: firstMessage.trim(), updated_at: new Date().toISOString() }
            : chat,
        ),
      ),
    );
  }, []);

  const startNewChat = useCallback(async () => {
    const response = await createChat({ title: "New Conversation" });
    await refreshChats();
    return response.data.chat;
  }, [refreshChats]);

  useEffect(() => {
    refreshChats();
  }, [refreshChats]);

  const value = useMemo(
    () => ({
      chats,
      chatPreviews,
      isLoading,
      sidebarOpen,
      setSidebarOpen,
      refreshChats,
      setChatPreview,
      startNewChat,
    }),
    [
      chats,
      chatPreviews,
      isLoading,
      sidebarOpen,
      refreshChats,
      setChatPreview,
      startNewChat,
    ],
  );

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function useChatContext(): ChatContextValue {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChatContext must be used within ChatProvider");
  }
  return context;
}
