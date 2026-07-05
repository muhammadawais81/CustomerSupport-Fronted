"use client";

import { cn } from "@/lib/utils";
import type { VoiceState } from "@/types/voice";
import { MicrophoneButton } from "@/components/VoiceAssistant/MicrophoneButton";
import { VoiceStatus } from "@/components/VoiceAssistant/VoiceStatus";
import { VoiceWave, VoiceWaveRing } from "@/components/VoiceAssistant/VoiceWave";
import { AIOrb } from "@/components/ui/AIOrb";

interface VoiceLivePanelProps {
  voiceState: VoiceState;
  recordingDuration: number;
  userLiveText: string;
  aiLiveText: string;
  isAiStreaming: boolean;
  errorMessage?: string | null;
  onMicClick: () => void;
  micDisabled?: boolean;
  recorderSupported?: boolean;
}

export function VoiceLivePanel({
  voiceState,
  recordingDuration,
  userLiveText,
  aiLiveText,
  isAiStreaming,
  errorMessage,
  onMicClick,
  micDisabled,
  recorderSupported = true,
}: VoiceLivePanelProps) {
  const showWave = voiceState === "listening" || voiceState === "speaking";
  const showUserCaption = userLiveText.length > 0 || voiceState === "listening";
  const showAiCaption =
    aiLiveText.length > 0 ||
    voiceState === "processing" ||
    voiceState === "speaking" ||
    isAiStreaming;

  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-1 flex-col items-center justify-center gap-5 px-4 py-6">
        <VoiceWaveRing
          active={showWave}
          state={voiceState === "speaking" ? "speaking" : "listening"}
          className="h-36 w-36 sm:h-44 sm:w-44"
        >
          <MicrophoneButton
            state={voiceState}
            onClick={onMicClick}
            disabled={micDisabled || !recorderSupported}
          />
        </VoiceWaveRing>

        <VoiceWave
          active={showWave}
          variant={voiceState === "speaking" ? "speaking" : "recording"}
          className="h-10"
        />

        <VoiceStatus
          state={voiceState}
          recordingDuration={recordingDuration}
          errorMessage={errorMessage}
        />
      </div>

      <div className="flex flex-1 flex-col gap-3 overflow-y-auto border-t border-white/10 px-4 py-4">
        {showUserCaption && (
          <LiveCaption
            label="You"
            text={userLiveText}
            isActive={voiceState === "listening"}
            isUser
            placeholder={voiceState === "listening" ? "Listening…" : undefined}
          />
        )}

        {showAiCaption && (
          <LiveCaption
            label="AI Agent"
            text={aiLiveText}
            isActive={voiceState === "processing" || voiceState === "speaking" || isAiStreaming}
            placeholder={
              voiceState === "processing" && !aiLiveText ? "Thinking…" : undefined
            }
            showOrb
            isStreaming={isAiStreaming}
          />
        )}

        {!showUserCaption && !showAiCaption && voiceState === "idle" && (
          <p className="text-center text-sm text-slate-500">
            Tap the microphone and start speaking
          </p>
        )}
      </div>
    </div>
  );
}

function LiveCaption({
  label,
  text,
  isActive,
  isUser = false,
  placeholder,
  showOrb = false,
  isStreaming = false,
}: {
  label: string;
  text: string;
  isActive?: boolean;
  isUser?: boolean;
  placeholder?: string;
  showOrb?: boolean;
  isStreaming?: boolean;
}) {
  const displayText = text || placeholder || "";

  return (
    <div
      className={cn(
        "message-enter rounded-2xl p-4 transition-all duration-300",
        isUser
          ? "bg-gradient-to-br from-cyan-600/20 via-indigo-600/15 to-violet-600/20 border border-cyan-500/20"
          : "glass-panel",
        isActive && !isUser && "streaming-glow",
      )}
    >
      <div className="mb-2 flex items-center gap-2">
        {showOrb && <AIOrb size="sm" />}
        <span
          className={cn(
            "text-xs font-semibold uppercase tracking-wide",
            isUser ? "text-cyan-400" : "text-violet-400",
          )}
        >
          {label}
        </span>
        {isActive && (
          <span className="flex gap-0.5" aria-hidden="true">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="h-1 w-1 rounded-full bg-cyan-400"
                style={{
                  animation: "thinking-bounce 1.2s ease-in-out infinite",
                  animationDelay: `${i * 0.15}s`,
                }}
              />
            ))}
          </span>
        )}
      </div>

      <p
        className={cn(
          "whitespace-pre-wrap text-sm leading-relaxed",
          isUser ? "text-slate-100" : "text-slate-200",
          !text && placeholder && "text-slate-500 italic",
        )}
      >
        {displayText}
        {isStreaming && text && (
          <span className="streaming-cursor ml-0.5 inline-block h-4 w-0.5 bg-cyan-400 align-middle" />
        )}
      </p>
    </div>
  );
}
