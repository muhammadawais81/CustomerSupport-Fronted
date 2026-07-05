"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { flushSync } from "react-dom";
import { createChat, getChat, sendMessageStream } from "@/lib/api/chats";
import { useChatContext } from "@/lib/chat/ChatProvider";
import { ApiError } from "@/types/api";
import type { LocalMessage } from "@/types/chat";
import { Alert } from "@/components/ui/Alert";
import { Spinner } from "@/components/ui/Spinner";
import { VoiceAssistant } from "@/components/VoiceAssistant";
import type { VoiceSessionContext } from "@/components/VoiceAssistant";
import { ChatEmptyState } from "@/components/user/chat/ChatEmptyState";
import { ChatInput } from "@/components/user/chat/ChatInput";
import { ChatMessageBubble } from "@/components/user/chat/ChatMessage";

interface ChatInterfaceProps {
  chatId?: number;
}

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

export function ChatInterface({ chatId }: ChatInterfaceProps) {
  const router = useRouter();
  const { refreshChats, setSidebarOpen, setChatPreview } = useChatContext();
  const [messages, setMessages] = useState<LocalMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoadingChat, setIsLoadingChat] = useState(Boolean(chatId));
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [voiceOpen, setVoiceOpen] = useState(false);
  const [companyId, setCompanyId] = useState<number | undefined>();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const activeChatIdRef = useRef<number | undefined>(chatId);
  const isStreamingRef = useRef(false);
  const pendingChatIdRef = useRef<number | undefined>(undefined);
  const voiceOpenRef = useRef(false);

  activeChatIdRef.current = chatId ?? pendingChatIdRef.current;
  voiceOpenRef.current = voiceOpen;

  const scrollToBottom = useCallback((instant = false) => {
    messagesEndRef.current?.scrollIntoView({
      behavior: instant ? "instant" : "smooth",
    });
  }, []);

  useEffect(() => {
    if (isStreamingRef.current) return;
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    if (isStreamingRef.current) return;

    if (!chatId) {
      if (!pendingChatIdRef.current) {
        setMessages([]);
      }
      setIsLoadingChat(false);
      return;
    }

    // Skip server reload while voice call is active on a pending session
    if (voiceOpenRef.current && pendingChatIdRef.current === chatId) {
      return;
    }

    let cancelled = false;
    setIsLoadingChat(true);
    setError(null);

    getChat(chatId)
      .then((response) => {
        if (cancelled || isStreamingRef.current) return;
        const chatMessages = response.data.chat.messages ?? [];
        setMessages(toLocalMessages(chatMessages));
        setCompanyId(response.data.chat.company_id);
        pendingChatIdRef.current = undefined;
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err instanceof ApiError ? err.message : "Failed to load chat");
      })
      .finally(() => {
        if (!cancelled) setIsLoadingChat(false);
      });

    return () => {
      cancelled = true;
    };
  }, [chatId]);

  const updateStreamingMessage = useCallback((assistantId: string, fullText: string) => {
    flushSync(() => {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId
            ? { ...m, content: fullText, isStreaming: true }
            : m,
        ),
      );
    });
    scrollToBottom(true);
  }, [scrollToBottom]);

  const sendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isSending) return;

    setError(null);
    setIsSending(true);
    setInput("");

    let currentChatId = chatId ?? pendingChatIdRef.current;
    const isFirstMessage = messages.length === 0;

    try {
      if (!currentChatId) {
        const response = await createChat({
          title: trimmed.slice(0, 50) + (trimmed.length > 50 ? "..." : ""),
        });
        currentChatId = response.data.chat.id;
        pendingChatIdRef.current = currentChatId;
        setChatPreview(currentChatId, trimmed);
        await refreshChats();
        // Do NOT navigate here — wait until stream finishes to avoid remounting
      } else if (isFirstMessage) {
        setChatPreview(currentChatId, trimmed);
      }

      const userMessage: LocalMessage = {
        id: `user-${Date.now()}`,
        role: "user",
        content: trimmed,
        created_at: new Date().toISOString(),
      };

      const assistantId = `assistant-${Date.now()}`;
      const assistantPlaceholder: LocalMessage = {
        id: assistantId,
        role: "assistant",
        content: "",
        created_at: new Date().toISOString(),
        isStreaming: true,
      };

      isStreamingRef.current = true;
      setMessages((prev) => [...prev, userMessage, assistantPlaceholder]);

      await sendMessageStream(currentChatId, trimmed, (fullText) => {
        updateStreamingMessage(assistantId, fullText);
      });

      // Mark streaming complete in UI immediately
      flushSync(() => {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId ? { ...m, isStreaming: false } : m,
          ),
        );
      });

      isStreamingRef.current = false;

      // Fetch final message with sources from server
      const updated = await getChat(currentChatId);
      const serverMessages = updated.data.chat.messages ?? [];

      setMessages((prev) => {
        const serverAssistant = [...serverMessages]
          .reverse()
          .find((m) => m.role === "assistant");

        if (!serverAssistant) return toLocalMessages(serverMessages);

        return prev.map((m) =>
          m.id === assistantId
            ? {
                id: String(serverAssistant.id),
                role: "assistant" as const,
                content: serverAssistant.content,
                sources: serverAssistant.sources,
                created_at: serverAssistant.created_at,
                isStreaming: false,
              }
            : m,
        );
      });

      await refreshChats();

      // Navigate after stream completes so state is preserved
      if (!chatId && currentChatId) {
        router.replace(`/chat/${currentChatId}`);
      }
    } catch (err) {
      isStreamingRef.current = false;
      setMessages((prev) => prev.filter((m) => !m.isStreaming));
      setError(err instanceof ApiError ? err.message : "Failed to send message");
      setInput(trimmed);
    } finally {
      setIsSending(false);
    }
  };

  const streamingMessageId = messages.find((m) => m.isStreaming)?.id;

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
    [chatId, companyId, refreshChats, setChatPreview],
  );

  const handleVoiceUserMessage = useCallback(
    (transcript: string): string => {
      const id = `user-voice-${Date.now()}`;
      const now = new Date().toISOString();
      const currentChatId = chatId ?? pendingChatIdRef.current;
      const isFirstUserMessage = !messages.some((m) => m.role === "user");
      const trimmed = transcript.trim();

      flushSync(() => {
        setMessages((prev) => [
          ...prev,
          { id, role: "user", content: transcript, created_at: now },
        ]);
      });

      if (isFirstUserMessage && currentChatId && trimmed) {
        setChatPreview(currentChatId, trimmed);
      }

      scrollToBottom(true);
      return id;
    },
    [chatId, messages, scrollToBottom, setChatPreview],
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

      scrollToBottom(true);
    },
    [chatId, scrollToBottom, setChatPreview],
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
    scrollToBottom(true);
    return id;
  }, [scrollToBottom]);

  const handleVoiceAssistantStream = useCallback(
    (messageId: string, content: string, isComplete: boolean) => {
      flushSync(() => {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === messageId
              ? { ...m, content, isStreaming: !isComplete }
              : m,
          ),
        );
      });
      scrollToBottom(true);

      if (isComplete) {
        void refreshChats();
      }
    },
    [refreshChats, scrollToBottom],
  );

  const handleVoiceSessionCreated = useCallback(
    async (_newChatId: number) => {
      // Only refresh sidebar — do NOT navigate during an active voice call.
      // Navigation happens when the user ends the call (see handleVoiceClose).
      await refreshChats();
    },
    [refreshChats],
  );

  const handleVoiceClose = useCallback(() => {
    setVoiceOpen(false);
    const pendingId = pendingChatIdRef.current;
    if (!chatId && pendingId) {
      router.replace(`/chat/${pendingId}`);
    }
  }, [chatId, router]);

  return (
    <div className="flex h-full flex-1 flex-col">
      <header className="flex items-center gap-3 border-b border-white/10 bg-black/30 px-4 py-3 backdrop-blur-xl lg:hidden">
        <button
          type="button"
          onClick={() => setSidebarOpen(true)}
          className="rounded-lg p-2 text-slate-400 hover:bg-white/10 hover:text-white"
          aria-label="Open sidebar"
        >
          ☰
        </button>
        <span className="font-semibold gradient-text">AI Support Agent</span>
      </header>

      {error && (
        <div className="px-4 pt-4">
          <Alert variant="error">{error}</Alert>
        </div>
      )}

      <div ref={messagesContainerRef} className="flex-1 overflow-y-auto">
        {isLoadingChat ? (
          <div className="flex h-full items-center justify-center">
            <Spinner size="lg" />
          </div>
        ) : messages.length === 0 ? (
          <ChatEmptyState onSuggestionClick={sendMessage} />
        ) : (
          <div className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-6">
            {messages.map((message, index) => (
              <ChatMessageBubble
                key={message.id}
                message={message}
                index={index}
                isLatest={message.id === streamingMessageId}
              />
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      <div className="relative">
        {!voiceOpen && (
          <button
            type="button"
            onClick={() => setVoiceOpen(true)}
            disabled={isLoadingChat}
            aria-label="Start voice conversation"
            className="voice-fab-enter absolute -top-14 right-4 z-10 flex h-12 items-center gap-2 rounded-full bg-gradient-to-br from-emerald-500 via-cyan-500 to-indigo-500 px-4 text-white shadow-lg shadow-emerald-500/25 btn-glow transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#060818] disabled:cursor-not-allowed disabled:opacity-50 sm:-top-16 sm:h-14 sm:px-5"
          >
            <PhoneIcon className="h-5 w-5 sm:h-6 sm:w-6" />
            <span className="text-sm font-medium">Start Voice</span>
          </button>
        )}

        <ChatInput
          value={input}
          onChange={setInput}
          onSubmit={() => sendMessage(input)}
          disabled={isLoadingChat || isSending}
          isLoading={isSending}
        />
      </div>

      <VoiceAssistant
        isOpen={voiceOpen}
        onClose={handleVoiceClose}
        chatId={chatId ?? pendingChatIdRef.current}
        companyId={companyId}
        disabled={isLoadingChat || isSending}
        messages={messages}
        isLoadingChat={isLoadingChat}
        ensureSession={ensureVoiceSession}
        onVoiceUserMessage={handleVoiceUserMessage}
        onVoiceUserMessageUpdate={handleVoiceUserMessageUpdate}
        onVoiceAssistantStart={handleVoiceAssistantStart}
        onVoiceAssistantStream={handleVoiceAssistantStream}
        onSessionCreated={handleVoiceSessionCreated}
      />
    </div>
  );
}

function PhoneIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M19.95 21q-3.125 0-6.175-1.362-3.05-1.363-5.425-3.737-2.375-2.375-3.738-5.425Q3.25 7.425 3.25 4.3q0-.45.3-.775T4.3 3.2h3.75q.375 0 .688.213.312.212.537.587l1.475 2.775q.225.425.125.863t-.525.712l-2.125 2.125q.5 1.025 1.188 1.963.687.938 1.562 1.812.875.875 1.813 1.563.937.687 1.962 1.187l2.125-2.125q.3-.3.725-.387.425-.088.825.137l2.775 1.475q.375.225.588.537Q21.8 17.675 21.8 18.05v3.75q0 .45-.325.75t-.775.3Z" />
    </svg>
  );
}
