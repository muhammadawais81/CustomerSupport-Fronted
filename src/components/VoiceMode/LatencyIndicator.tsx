"use client";

import { memo } from "react";
import { cn } from "@/lib/utils";

interface LatencyIndicatorProps {
  latencyMs: number | null;
  className?: string;
}

export const LatencyIndicator = memo(function LatencyIndicator({
  latencyMs,
  className,
}: LatencyIndicatorProps) {
  if (latencyMs == null) return null;

  const color =
    latencyMs < 500 ? "text-emerald-400" : latencyMs < 1200 ? "text-amber-400" : "text-red-400";

  return (
    <span className={cn("font-mono text-[10px]", color, className)} aria-label={`Latency ${latencyMs}ms`}>
      {latencyMs}ms
    </span>
  );
});
