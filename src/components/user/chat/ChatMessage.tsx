"use client";

import { cn } from "@/lib/utils";
import { StreamingMarkdown } from "@/components/user/chat/MarkdownRenderer";
import { AIOrb } from "@/components/ui/AIOrb";

function ThinkingDots() {
  return (
    <span className="inline-flex items-center gap-1 py-1" aria-label="Agent is thinking">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="h-2 w-2 rounded-full bg-cyan-400"
          style={{
            animation: "thinking-bounce 1.2s ease-in-out infinite",
            animationDelay: `${i * 0.15}s`,
          }}
        />
      ))}
    </span>
  );
}

interface ChatMessageProps {
  message: {
    role: "user" | "assistant";
    content: string;
    isStreaming?: boolean;
  };
  index: number;
  isLatest?: boolean;
}

export function ChatMessageBubble({ message, index, isLatest = false }: ChatMessageProps) {
  const isUser = message.role === "user";
  const animateEntry = !message.isStreaming || isLatest;

  return (
    <div
      className={cn(
        "flex w-full",
        animateEntry && "message-enter",
        isUser ? "justify-end" : "justify-start",
      )}
      style={animateEntry ? { animationDelay: `${Math.min(index * 40, 200)}ms` } : undefined}
    >
      <div className={cn(isUser ? "max-w-[85%] sm:max-w-[75%]" : "w-full max-w-3xl")}>
        {!isUser && (
          <div className="mb-1.5 flex items-center gap-2">
            <AIOrb size="sm" />
            <span className="text-xs font-medium text-slate-400">
              {message.isStreaming ? "AI Agent is thinking…" : "AI Support Agent"}
            </span>
          </div>
        )}

        <div
          className={cn(
            "rounded-2xl px-4 py-3",
            isUser
              ? "rounded-br-md bg-gradient-to-br from-cyan-600 via-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/20"
              : "glass-panel rounded-bl-md text-slate-200",
            message.isStreaming && !isUser && "streaming-glow",
          )}
        >
          {isUser ? (
            <p className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</p>
          ) : message.isStreaming && !message.content ? (
            <ThinkingDots />
          ) : (
            <StreamingMarkdown
              content={message.content}
              isStreaming={Boolean(message.isStreaming)}
            />
          )}
        </div>
      </div>
    </div>
  );
}
