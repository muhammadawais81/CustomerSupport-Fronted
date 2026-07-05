"use client";

import { memo } from "react";
import { cn } from "@/lib/utils";
import type { DetectedLanguage } from "@/types/voice";

interface LanguageIndicatorProps {
  language: DetectedLanguage | null;
  className?: string;
}

export const LanguageIndicator = memo(function LanguageIndicator({
  language,
  className,
}: LanguageIndicatorProps) {
  if (!language) return null;

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full glass-panel-light px-3 py-1 text-xs text-slate-300",
        className,
      )}
      aria-label={`Detected language: ${language.label}`}
    >
      <span aria-hidden="true">{language.flag}</span>
      <span>{language.label}</span>
    </div>
  );
});
