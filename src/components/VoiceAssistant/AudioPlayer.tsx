"use client";

import { cn } from "@/lib/utils";
import type { AudioPlayerStatus } from "@/hooks/useAudioPlayer";

interface AudioPlayerProps {
  status: AudioPlayerStatus;
  onPlay: () => void;
  onPause: () => void;
  onResume: () => void;
  onReplay: () => void;
  error?: string | null;
  className?: string;
}

export function AudioPlayerControls({
  status,
  onPlay,
  onPause,
  onResume,
  onReplay,
  error,
  className,
}: AudioPlayerProps) {
  const isPlaying = status === "playing";
  const isPaused = status === "paused";
  const isLoading = status === "loading";
  const hasAudio = status !== "idle" || Boolean(error);

  if (!hasAudio && !error) return null;

  return (
    <div
      className={cn(
        "flex flex-col items-center gap-2",
        className,
      )}
      role="group"
      aria-label="AI voice playback controls"
    >
      <div className="flex items-center gap-2">
        {isPlaying ? (
          <ControlButton label="Pause audio" onClick={onPause}>
            <PauseIcon />
          </ControlButton>
        ) : isPaused ? (
          <ControlButton label="Resume audio" onClick={onResume}>
            <PlayIcon />
          </ControlButton>
        ) : (
          <ControlButton label="Replay audio" onClick={onReplay} disabled={isLoading}>
            {isLoading ? <LoadingSpinner /> : <ReplayIcon />}
          </ControlButton>
        )}

        {!isPlaying && !isPaused && status === "idle" && !error && (
          <ControlButton label="Play audio" onClick={onPlay}>
            <PlayIcon />
          </ControlButton>
        )}
      </div>

      {error && (
        <p className="text-center text-xs text-red-300" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

function ControlButton({
  children,
  label,
  onClick,
  disabled,
}: {
  children: React.ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className={cn(
        "inline-flex h-9 w-9 items-center justify-center rounded-full",
        "glass-panel-light text-slate-200 transition-all",
        "hover:bg-white/12 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400",
        "disabled:cursor-not-allowed disabled:opacity-50",
      )}
    >
      {children}
    </button>
  );
}

function LoadingSpinner() {
  return (
    <span className="h-4 w-4 animate-spin rounded-full border-2 border-cyan-400/30 border-t-cyan-400" />
  );
}

function PlayIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M8 5v14l11-7L8 5Z" />
    </svg>
  );
}

function PauseIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <rect x="6" y="5" width="4" height="14" rx="1" />
      <rect x="14" y="5" width="4" height="14" rx="1" />
    </svg>
  );
}

function ReplayIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M1 4v6h6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
