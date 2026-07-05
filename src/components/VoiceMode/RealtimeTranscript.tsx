"use client";

import { memo } from "react";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/utils";

interface RealtimeTranscriptProps {
  userText: string;
  aiText: string;
  isUserActive?: boolean;
  isAiActive?: boolean;
  isAiStreaming?: boolean;
  className?: string;
}

export const RealtimeTranscript = memo(function RealtimeTranscript({
  userText,
  aiText,
  isUserActive,
  isAiActive,
  isAiStreaming,
  className,
}: RealtimeTranscriptProps) {
  const now = new Date().toISOString();

  return (
    <div className={cn("flex flex-col gap-3 overflow-y-auto", className)}>
      {(userText || isUserActive) && (
        <TranscriptBubble
          role="user"
          text={userText}
          isActive={isUserActive}
          placeholder="Listening…"
          timestamp={now}
        />
      )}

      {(aiText || isAiActive) && (
        <TranscriptBubble
          role="assistant"
          text={aiText}
          isActive={isAiActive}
          isStreaming={isAiStreaming}
          placeholder="Thinking…"
          timestamp={now}
        />
      )}
    </div>
  );
});

function TranscriptBubble({
  role,
  text,
  isActive,
  isStreaming,
  placeholder,
  timestamp,
}: {
  role: "user" | "assistant";
  text: string;
  isActive?: boolean;
  isStreaming?: boolean;
  placeholder?: string;
  timestamp: string;
}) {
  const isUser = role === "user";

  return (
    <div
      className={cn(
        "message-enter rounded-2xl p-4 transition-all duration-300",
        isUser
          ? "border border-cyan-500/20 bg-gradient-to-br from-cyan-600/20 via-indigo-600/15 to-violet-600/20"
          : "glass-panel",
        isActive && !isUser && "streaming-glow",
      )}
    >
      <div className="mb-2 flex items-center justify-between gap-2">
        <span
          className={cn(
            "text-xs font-semibold uppercase tracking-wide",
            isUser ? "text-cyan-400" : "text-violet-400",
          )}
        >
          {isUser ? "You" : "AI Agent"}
        </span>
        <time className="text-[10px] text-slate-500" dateTime={timestamp}>
          {formatDate(timestamp)}
        </time>
      </div>

      <p
        className={cn(
          "whitespace-pre-wrap text-sm leading-relaxed",
          isUser ? "text-slate-100" : "text-slate-200",
          !text && placeholder && "italic text-slate-500",
        )}
      >
        {text || placeholder}
        {isStreaming && text && (
          <span className="streaming-cursor ml-0.5 inline-block h-4 w-0.5 bg-cyan-400 align-middle" />
        )}
      </p>
    </div>
  );
}
