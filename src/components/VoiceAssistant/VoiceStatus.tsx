"use client";

import { cn } from "@/lib/utils";
import type { VoiceState } from "@/types/voice";

const STATUS_LABELS: Record<VoiceState, string> = {
  idle: "Tap to speak",
  listening: "Listening…",
  processing: "Thinking…",
  speaking: "AI is speaking…",
  error: "Something went wrong",
};

interface VoiceStatusProps {
  state: VoiceState;
  recordingDuration?: number;
  errorMessage?: string | null;
  className?: string;
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export function VoiceStatus({
  state,
  recordingDuration = 0,
  errorMessage,
  className,
}: VoiceStatusProps) {
  return (
    <div className={cn("flex flex-col items-center gap-1 text-center", className)}>
      <p
        className={cn(
          "text-base font-medium transition-colors duration-300 sm:text-lg",
          state === "error" ? "text-red-300" : "text-slate-200",
        )}
        aria-live="polite"
        aria-atomic="true"
      >
        {state === "error" && errorMessage ? errorMessage : STATUS_LABELS[state]}
      </p>

      {state === "listening" && (
        <p className="font-mono text-sm text-cyan-400/80" aria-label={`Recording duration ${formatDuration(recordingDuration)}`}>
          {formatDuration(recordingDuration)}
        </p>
      )}

      {state === "idle" && (
        <p className="text-xs text-slate-500 sm:text-sm">
          Speak naturally — your words will appear in the chat
        </p>
      )}
    </div>
  );
}
