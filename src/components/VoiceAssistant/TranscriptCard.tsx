"use client";

import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/utils";
import type { VoiceExchange } from "@/types/voice";

interface TranscriptCardProps {
  exchange: VoiceExchange | null;
  className?: string;
}

export function TranscriptCard({ exchange, className }: TranscriptCardProps) {
  if (!exchange) return null;

  return (
    <div
      className={cn(
        "glass-panel w-full max-w-md rounded-2xl p-4 message-enter",
        className,
      )}
      aria-label="Latest voice conversation"
    >
      <div className="mb-3 flex items-center justify-between gap-2">
        <span className="text-xs font-medium uppercase tracking-wide text-cyan-400/80">
          Voice message
        </span>
        <time className="text-xs text-slate-500" dateTime={exchange.timestamp}>
          {formatDate(exchange.timestamp)}
        </time>
      </div>

      <div className="space-y-3">
        <div>
          <p className="mb-1 text-xs font-medium text-slate-400">You said</p>
          <p className="text-sm leading-relaxed text-slate-100">{exchange.transcript}</p>
        </div>

        <div className="border-t border-white/10 pt-3">
          <p className="mb-1 text-xs font-medium text-slate-400">AI response</p>
          <p className="text-sm leading-relaxed text-slate-200">{exchange.answer}</p>
        </div>
      </div>
    </div>
  );
}
