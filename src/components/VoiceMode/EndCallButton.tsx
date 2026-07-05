"use client";

import { memo } from "react";
import { cn } from "@/lib/utils";

interface EndCallButtonProps {
  onClick: () => void;
  className?: string;
}

export const EndCallButton = memo(function EndCallButton({
  onClick,
  className,
}: EndCallButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="End call"
      className={cn(
        "inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium",
        "bg-red-500/15 text-red-300 transition-colors hover:bg-red-500/25",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400",
        className,
      )}
    >
      <PhoneOffIcon className="h-4 w-4" />
      <span className="hidden sm:inline">End call</span>
    </button>
  );
});

function PhoneOffIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7 2 2 0 0 1 1.72 2v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.42 19.42 0 0 1-3.33-2.67m-2.67-3.34a19.79 19.79 0 0 1-3.07-8.63A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="22" x2="2" y1="2" y2="22" strokeLinecap="round" />
    </svg>
  );
}
