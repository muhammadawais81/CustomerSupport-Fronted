"use client";

import { cn } from "@/lib/utils";
import type { VoiceState } from "@/types/voice";

interface MicrophoneButtonProps {
  state: VoiceState;
  onClick: () => void;
  disabled?: boolean;
  className?: string;
}

export function MicrophoneButton({
  state,
  onClick,
  disabled = false,
  className,
}: MicrophoneButtonProps) {
  const isActive = state === "listening";
  const isProcessing = state === "processing";
  const isSpeaking = state === "speaking";

  const label =
    state === "listening"
      ? "Stop recording"
      : state === "processing"
        ? "Processing your message"
        : state === "speaking"
          ? "AI is speaking"
          : "Start voice recording";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || isProcessing || isSpeaking}
      aria-label={label}
      aria-pressed={isActive}
      className={cn(
        "group relative flex h-24 w-24 items-center justify-center rounded-full sm:h-28 sm:w-28",
        "transition-all duration-300 focus-visible:outline-none focus-visible:ring-2",
        "focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#060818]",
        "disabled:cursor-not-allowed disabled:opacity-60",
        isActive
          ? "bg-gradient-to-br from-red-500 via-rose-500 to-orange-500 shadow-lg shadow-red-500/30 voice-mic-active"
          : "bg-gradient-to-br from-cyan-500 via-indigo-500 to-violet-500 shadow-lg shadow-cyan-500/30 btn-glow hover:scale-105",
        className,
      )}
    >
      <span
        className={cn(
          "absolute inset-0 rounded-full opacity-0 transition-opacity duration-300",
          isActive && "opacity-100 voice-mic-glow",
        )}
        aria-hidden="true"
      />

      {isProcessing ? (
        <span className="h-8 w-8 animate-spin rounded-full border-2 border-white/30 border-t-white sm:h-10 sm:w-10" />
      ) : isSpeaking ? (
        <SpeakerIcon className="h-9 w-9 text-white voice-speaker-pulse sm:h-11 sm:w-11" />
      ) : isActive ? (
        <StopIcon className="h-8 w-8 text-white sm:h-10 sm:w-10" />
      ) : (
        <MicrophoneIcon className="h-9 w-9 text-white transition-transform group-hover:scale-110 sm:h-11 sm:w-11" />
      )}
    </button>
  );
}

function MicrophoneIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 14a3 3 0 0 0 3-3V5a3 3 0 1 0-6 0v6a3 3 0 0 0 3 3Z" />
      <path d="M19 11a1 1 0 1 0-2 0 5 5 0 0 1-10 0 1 1 0 1 0-2 0 7 7 0 0 0 6 6.92V21H9a1 1 0 1 0 0 2h6a1 1 0 1 0 0-2h-2v-3.08A7 7 0 0 0 19 11Z" />
    </svg>
  );
}

function StopIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <rect x="6" y="6" width="12" height="12" rx="2" />
    </svg>
  );
}

function SpeakerIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M11 5L6 9H3v6h3l5 4V5Z" />
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07M19.07 4.93a10 10 0 0 1 0 14.14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />
    </svg>
  );
}
