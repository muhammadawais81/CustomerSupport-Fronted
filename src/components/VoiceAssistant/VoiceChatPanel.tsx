"use client";

import { useEffect, useRef } from "react";
import type { LocalMessage } from "@/types/chat";
import { ChatMessageBubble } from "@/components/user/chat/ChatMessage";
import { Spinner } from "@/components/ui/Spinner";

interface VoiceChatPanelProps {
  messages: LocalMessage[];
  isLoading?: boolean;
}

export function VoiceChatPanel({ messages, isLoading }: VoiceChatPanelProps) {
  const endRef = useRef<HTMLDivElement>(null);
  const streamingId = messages.find((m) => m.isStreaming)?.id;

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-white/10 px-4 py-3">
        <h3 className="text-sm font-semibold text-slate-200">Conversation</h3>
        <p className="text-xs text-slate-500">Live transcript updates as you speak</p>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4">
        {isLoading ? (
          <div className="flex h-full items-center justify-center">
            <Spinner size="md" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
            <p className="text-sm text-slate-400">No messages yet</p>
            <p className="text-xs text-slate-500">
              Your voice will appear here in real time
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {messages.map((message, index) => (
              <ChatMessageBubble
                key={message.id}
                message={message}
                index={index}
                isLatest={message.id === streamingId}
              />
            ))}
            <div ref={endRef} />
          </div>
        )}
      </div>
    </div>
  );
}
