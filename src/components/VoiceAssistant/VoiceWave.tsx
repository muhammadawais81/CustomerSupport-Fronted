"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { VoiceState } from "@/types/voice";

interface VoiceWaveProps {
  active?: boolean;
  variant?: "recording" | "speaking";
  barCount?: number;
  className?: string;
}

export function VoiceWave({
  active = false,
  variant = "recording",
  barCount = 7,
  className,
}: VoiceWaveProps) {
  const bars = Array.from({ length: barCount }, (_, i) => i);

  return (
    <div
      className={cn("flex h-10 items-center justify-center gap-1", className)}
      aria-hidden="true"
    >
      {bars.map((i) => (
        <span
          key={i}
          className={cn(
            "w-1 rounded-full transition-all duration-300",
            variant === "recording"
              ? "bg-gradient-to-t from-cyan-500 to-violet-400"
              : "bg-gradient-to-t from-violet-500 to-cyan-400",
            active ? "voice-wave-bar" : "h-1 opacity-30",
          )}
          style={active ? { animationDelay: `${i * 0.1}s` } : { height: "4px" }}
        />
      ))}
    </div>
  );
}

interface VoiceWaveRingProps {
  active?: boolean;
  state?: VoiceState;
  className?: string;
  children?: ReactNode;
}

export function VoiceWaveRing({
  active = false,
  state = "idle",
  className,
  children,
}: VoiceWaveRingProps) {
  return (
    <div className={cn("relative flex items-center justify-center", className)}>
      {active && (
        <>
          <span
            className={cn(
              "absolute inset-0 rounded-full",
              state === "listening" && "voice-pulse-ring bg-cyan-500/20",
              state === "speaking" && "voice-pulse-ring bg-violet-500/20",
            )}
          />
          <span
            className={cn(
              "absolute inset-[7.5%] rounded-full",
              state === "listening" && "voice-pulse-ring-delayed bg-cyan-400/15",
              state === "speaking" && "voice-pulse-ring-delayed bg-violet-400/15",
            )}
          />
        </>
      )}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
