"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import type { VoiceRecorderError } from "@/types/voice";

interface PermissionDialogProps {
  open: boolean;
  error: VoiceRecorderError | null;
  onRetry: () => void;
  onClose: () => void;
  className?: string;
}

export function PermissionDialog({
  open,
  error,
  onRetry,
  onClose,
  className,
}: PermissionDialogProps) {
  if (!open || !error) return null;

  const canRetry = error.type !== "unsupported";

  return (
    <div
      className={cn(
        "fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm",
        className,
      )}
      role="dialog"
      aria-modal="true"
      aria-labelledby="voice-permission-title"
    >
      <div className="glass-panel w-full max-w-sm rounded-2xl p-6 shadow-2xl message-enter">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-500/15">
          <MicrophoneOffIcon className="h-6 w-6 text-red-400" />
        </div>

        <h2 id="voice-permission-title" className="mb-2 text-lg font-semibold text-white">
          {error.type === "permission_denied"
            ? "Microphone access needed"
            : error.type === "unsupported"
              ? "Browser not supported"
              : "Microphone unavailable"}
        </h2>

        <p className="mb-6 text-sm leading-relaxed text-slate-400">{error.message}</p>

        {error.type === "permission_denied" && (
          <ul className="mb-6 space-y-1 text-xs text-slate-500">
            <li>• Click the lock icon in your browser address bar</li>
            <li>• Allow microphone access for this site</li>
            <li>• Refresh the page and try again</li>
          </ul>
        )}

        <div className="flex gap-3">
          <Button variant="ghost" className="flex-1" onClick={onClose}>
            Close
          </Button>
          {canRetry && (
            <Button variant="primary" className="flex-1" onClick={onRetry}>
              Try again
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function MicrophoneOffIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V5a3 3 0 0 0-5.94-.6" strokeLinecap="round" />
      <path d="M17 11a5 5 0 0 1-10 0M12 19v3M8 22h8M3 3l18 18" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
