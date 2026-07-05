"use client";

import { memo } from "react";
import { cn } from "@/lib/utils";
import type { RealtimeVoiceState } from "@/types/voice";

interface VoiceOrbProps {
  state: RealtimeVoiceState;
  className?: string;
}

export const VoiceOrb = memo(function VoiceOrb({ state, className }: VoiceOrbProps) {
  const isListening = state === "listening";
  const isThinking = state === "processing" || state === "connecting";
  const isSpeaking = state === "speaking";
  const isInterrupted = state === "interrupted";
  const isReconnecting = state === "reconnecting";

  return (
    <div
      className={cn("relative flex items-center justify-center", className)}
      aria-hidden="true"
    >
      {(isListening || isSpeaking) && (
        <>
          <span
            className={cn(
              "absolute inset-0 rounded-full voice-pulse-ring",
              isListening && "bg-cyan-500/25",
              isSpeaking && "bg-violet-500/25",
            )}
          />
          <span
            className={cn(
              "absolute inset-[12%] rounded-full voice-pulse-ring-delayed",
              isListening && "bg-cyan-400/15",
              isSpeaking && "bg-violet-400/15",
            )}
          />
        </>
      )}

      {isInterrupted && (
        <span className="absolute inset-0 animate-ping rounded-full bg-red-500/30" />
      )}

      <div
        className={cn(
          "relative z-10 flex h-28 w-28 items-center justify-center rounded-full sm:h-36 sm:w-36",
          "bg-gradient-to-br shadow-2xl transition-all duration-500",
          isListening && "from-cyan-500 via-indigo-500 to-violet-500 shadow-cyan-500/40 voice-mic-active",
          isThinking && "from-indigo-600 via-violet-600 to-purple-700 shadow-indigo-500/30 animate-[spin_8s_linear_infinite]",
          isSpeaking && "from-violet-500 via-fuchsia-500 to-cyan-500 shadow-violet-500/40 scale-110",
          isInterrupted && "from-red-500 via-rose-500 to-orange-500 shadow-red-500/40",
          isReconnecting && "from-amber-500 via-orange-500 to-red-500 shadow-amber-500/30",
          state === "idle" && "from-slate-700 via-slate-600 to-slate-700 shadow-slate-500/20 voice-orb-idle",
          state === "error" && "from-red-700 via-red-600 to-red-800",
          !isListening && !isThinking && !isSpeaking && !isInterrupted && !isReconnecting && state !== "error" && "from-cyan-600 via-indigo-600 to-violet-600 shadow-cyan-500/20",
        )}
      >
        <div className="h-[70%] w-[70%] rounded-full bg-white/10 backdrop-blur-sm" />
      </div>
    </div>
  );
});
