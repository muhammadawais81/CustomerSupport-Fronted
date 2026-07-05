"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { flushSync } from "react-dom";
import { createChat, getChat } from "@/lib/api/chats";
import { useChatContext } from "@/lib/chat/ChatProvider";
import { ApiError } from "@/types/api";
import type { LocalMessage } from "@/types/chat";
import { VoiceModeAssistant } from "@/components/VoiceMode/VoiceAssistant";
import type { RealtimeVoiceCallbacks } from "@/hooks/useRealtimeVoice";
import type { VoiceSessionContext } from "@/components/VoiceAssistant/VoiceAssistant";

function toLocalMessages(
  messages: NonNullable<Awaited<ReturnType<typeof getChat>>["data"]["chat"]["messages"]>,
): LocalMessage[] {
  return messages.map((m) => ({
    id: String(m.id),
    role: m.role,
    content: m.content,
    sources: m.sources,
    created_at: m.created_at,
  }));
}

export default function VoicePageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const chatIdParam = searchParams.get("chatId");
  const chatId = chatIdParam ? Number(chatIdParam) : undefined;

  const { refreshChats, setChatPreview } = useChatContext();
  const [messages, setMessages] = useState<LocalMessage[]>([]);
  const [companyId, setCompanyId] = useState<number | undefined>();
  const [isLoadingChat, setIsLoadingChat] = useState(Boolean(chatId));
  const pendingChatIdRef = useRef<number | undefined>(chatId);

  useEffect(() => {
    if (!chatId || Number.isNaN(chatId)) {
      setIsLoadingChat(false);
      return;
    }

    let cancelled = false;
    setIsLoadingChat(true);

    getChat(chatId)
      .then((response) => {
        if (cancelled) return;
        setMessages(toLocalMessages(response.data.chat.messages ?? []));
        setCompanyId(response.data.chat.company_id);
        pendingChatIdRef.current = chatId;
      })
      .catch(() => {
        if (!cancelled) setMessages([]);
      })
      .finally(() => {
        if (!cancelled) setIsLoadingChat(false);
      });

    return () => {
      cancelled = true;
    };
  }, [chatId]);

  const ensureVoiceSession = useCallback(
    async (hint: string): Promise<VoiceSessionContext> => {
      let currentChatId = chatId ?? pendingChatIdRef.current;
      let currentCompanyId = companyId;

      if (!currentChatId) {
        const response = await createChat({ title: "New Conversation" });
        currentChatId = response.data.chat.id;
        currentCompanyId = response.data.chat.company_id;
        pendingChatIdRef.current = currentChatId;
        setCompanyId(currentCompanyId);
        await refreshChats();
        // Do not update URL during active call — avoids remount/reconnect
      }

      if (!currentCompanyId && currentChatId) {
        const response = await getChat(currentChatId);
        currentCompanyId = response.data.chat.company_id;
        setCompanyId(currentCompanyId);
      }

      return {
        chatId: currentChatId,
        companyId: currentCompanyId ?? 0,
      };
    },
    [chatId, companyId, refreshChats, router, setChatPreview],
  );

  const handleVoiceUserMessage = useCallback(
    (transcript: string): string => {
      const id = `user-voice-${Date.now()}`;
      const trimmed = transcript.trim();
      const currentChatId = chatId ?? pendingChatIdRef.current;
      const isFirstUserMessage = !messages.some((m) => m.role === "user");

      flushSync(() => {
        setMessages((prev) => [
          ...prev,
          {
            id,
            role: "user",
            content: transcript,
            created_at: new Date().toISOString(),
          },
        ]);
      });

      if (isFirstUserMessage && currentChatId && trimmed) {
        setChatPreview(currentChatId, trimmed);
      }

      return id;
    },
    [chatId, messages, setChatPreview],
  );

  const handleVoiceUserMessageUpdate = useCallback(
    (messageId: string, transcript: string) => {
      const trimmed = transcript.trim();
      const currentChatId = chatId ?? pendingChatIdRef.current;

      flushSync(() => {
        setMessages((prev) => {
          const updated = prev.map((m) =>
            m.id === messageId ? { ...m, content: transcript } : m,
          );
          const firstUser = updated.find((m) => m.role === "user");
          if (firstUser?.id === messageId && currentChatId && trimmed) {
            setChatPreview(currentChatId, trimmed);
          }
          return updated;
        });
      });
    },
    [chatId, setChatPreview],
  );

  const handleVoiceAssistantStart = useCallback((): string => {
    const id = `assistant-voice-${Date.now()}`;
    flushSync(() => {
      setMessages((prev) => [
        ...prev,
        {
          id,
          role: "assistant",
          content: "",
          created_at: new Date().toISOString(),
          isStreaming: true,
        },
      ]);
    });
    return id;
  }, []);

  const handleVoiceAssistantStream = useCallback(
    (messageId: string, content: string, isComplete: boolean) => {
      flushSync(() => {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === messageId ? { ...m, content, isStreaming: !isComplete } : m,
          ),
        );
      });
      if (isComplete) void refreshChats();
    },
    [refreshChats],
  );

  const handleSessionCreated = useCallback(async () => {
    await refreshChats();
  }, [refreshChats]);

  const handleClose = useCallback(() => {
    const id = chatId ?? pendingChatIdRef.current;
    router.push(id ? `/chat/${id}` : "/chat");
  }, [chatId, router]);

  const callbacks: RealtimeVoiceCallbacks = {
    ensureSession: ensureVoiceSession,
    onVoiceUserMessage: handleVoiceUserMessage,
    onVoiceUserMessageUpdate: handleVoiceUserMessageUpdate,
    onVoiceAssistantStart: handleVoiceAssistantStart,
    onVoiceAssistantStream: handleVoiceAssistantStream,
    onSessionCreated: handleSessionCreated,
  };

  return (
    <VoiceModeAssistant
      isOpen
      onClose={handleClose}
      chatId={chatId ?? pendingChatIdRef.current}
      companyId={companyId}
      messages={messages}
      isLoadingChat={isLoadingChat}
      callbacks={callbacks}
    />
  );
}
