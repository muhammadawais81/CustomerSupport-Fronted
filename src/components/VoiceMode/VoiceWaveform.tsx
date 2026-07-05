"use client";

import { memo } from "react";
import { cn } from "@/lib/utils";

interface VoiceWaveformProps {
  active?: boolean;
  variant?: "listening" | "speaking";
  barCount?: number;
  className?: string;
}

export const VoiceWaveform = memo(function VoiceWaveform({
  active = false,
  variant = "listening",
  barCount = 9,
  className,
}: VoiceWaveformProps) {
  return (
    <div
      className={cn("flex h-12 items-center justify-center gap-1", className)}
      aria-hidden="true"
    >
      {Array.from({ length: barCount }, (_, i) => (
        <span
          key={i}
          className={cn(
            "w-1 rounded-full",
            variant === "listening"
              ? "bg-gradient-to-t from-cyan-500 to-violet-400"
              : "bg-gradient-to-t from-violet-500 to-cyan-400",
            active ? "voice-wave-bar" : "h-1 opacity-30",
          )}
          style={active ? { animationDelay: `${i * 0.08}s` } : { height: "4px" }}
        />
      ))}
    </div>
  );
});
