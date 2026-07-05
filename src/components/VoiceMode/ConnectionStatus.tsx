"use client";

import { memo } from "react";
import { cn } from "@/lib/utils";
import type { RealtimeVoiceState } from "@/types/voice";

const STATUS_MAP: Record<RealtimeVoiceState, { label: string; color: string }> = {
  idle: { label: "Ready", color: "bg-slate-400" },
  connecting: { label: "Connecting…", color: "bg-amber-400" },
  connected: { label: "Connected", color: "bg-emerald-400" },
  listening: { label: "Listening…", color: "bg-cyan-400" },
  processing: { label: "Thinking…", color: "bg-violet-400" },
  speaking: { label: "Speaking…", color: "bg-fuchsia-400" },
  interrupted: { label: "Interrupted", color: "bg-red-400" },
  disconnected: { label: "Disconnected", color: "bg-slate-500" },
  reconnecting: { label: "Reconnecting…", color: "bg-amber-400" },
  error: { label: "Error", color: "bg-red-500" },
};

interface ConnectionStatusProps {
  state: RealtimeVoiceState;
  isConnected?: boolean;
  error?: string | null;
  className?: string;
}

export const ConnectionStatus = memo(function ConnectionStatus({
  state,
  isConnected,
  error,
  className,
}: ConnectionStatusProps) {
  const status = STATUS_MAP[state];

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <span className="relative flex h-2 w-2">
        {(state === "listening" || state === "connecting" || state === "reconnecting") && (
          <span
            className={cn(
              "absolute inline-flex h-full w-full animate-ping rounded-full opacity-60",
              status.color,
            )}
          />
        )}
        <span className={cn("relative inline-flex h-2 w-2 rounded-full", status.color)} />
      </span>
      <span className="text-xs text-slate-400">
        {error && state === "error" ? error : status.label}
        {isConnected && state !== "error" && state !== "disconnected" && (
          <span className="ml-1 text-emerald-400/80">• Live</span>
        )}
      </span>
    </div>
  );
});
