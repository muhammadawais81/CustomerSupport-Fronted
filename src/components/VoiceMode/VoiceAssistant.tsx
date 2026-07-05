"use client";

import { memo, useCallback, useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { useRealtimeVoice } from "@/hooks/useRealtimeVoice";
import { useVoiceSettings } from "@/hooks/useVoiceSettings";
import type { LocalMessage } from "@/types/chat";
import type { RealtimeVoiceCallbacks } from "@/hooks/useRealtimeVoice";
import { ConnectionStatus } from "@/components/VoiceMode/ConnectionStatus";
import { EndCallButton } from "@/components/VoiceMode/EndCallButton";
import { LanguageIndicator } from "@/components/VoiceMode/LanguageIndicator";
import { LatencyIndicator } from "@/components/VoiceMode/LatencyIndicator";
import { ListeningAnimation } from "@/components/VoiceMode/ListeningAnimation";
import { MicrophonePermission } from "@/components/VoiceMode/MicrophonePermission";
import { RealtimeTranscript } from "@/components/VoiceMode/RealtimeTranscript";
import { SpeakingAnimation } from "@/components/VoiceMode/SpeakingAnimation";
import { VoiceControls } from "@/components/VoiceMode/VoiceControls";
import { VoiceOrb } from "@/components/VoiceMode/VoiceOrb";
import { VoiceChatPanel } from "@/components/VoiceAssistant/VoiceChatPanel";

export interface VoiceModeProps {
  isOpen: boolean;
  onClose: () => void;
  chatId?: number;
  companyId?: number;
  disabled?: boolean;
  messages: LocalMessage[];
  isLoadingChat?: boolean;
  callbacks: RealtimeVoiceCallbacks;
}

export const VoiceModeAssistant = memo(function VoiceModeAssistant({
  isOpen,
  onClose,
  chatId,
  companyId,
  disabled = false,
  messages,
  isLoadingChat = false,
  callbacks,
}: VoiceModeProps) {
  const [showSettings, setShowSettings] = useState(false);
  const [showPermission, setShowPermission] = useState(false);
  const { settings, setSettings } = useVoiceSettings();

  const voice = useRealtimeVoice({
    enabled: isOpen && !disabled,
    chatId,
    companyId,
    callbacks,
  });

  const handleEndCall = useCallback(() => {
    voice.disconnect();
    onClose();
  }, [onClose, voice]);

  useEffect(() => {
    if (voice.micError || voice.voiceState === "error") {
      if (voice.micError?.includes("denied")) {
        setShowPermission(true);
      }
    }
  }, [voice.micError, voice.voiceState]);

  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleEndCall();
      }
      if (
        (e.key === "m" || e.key === "M") &&
        !e.ctrlKey &&
        !e.metaKey &&
        !(e.target instanceof HTMLInputElement) &&
        !(e.target instanceof HTMLTextAreaElement)
      ) {
        voice.toggleMute();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [handleEndCall, isOpen, voice]);

  const showListeningAnim = voice.voiceState === "listening";
  const showSpeakingAnim = voice.voiceState === "speaking";

  const permissionError = useMemo(
    () =>
      voice.micError
        ? {
            type: "permission_denied" as const,
            message: voice.micError,
          }
        : null,
    [voice.micError],
  );

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex flex-col ai-bg-base"
        role="dialog"
        aria-modal="true"
        aria-label="Real-time voice conversation"
      >
        <div className="scan-line pointer-events-none absolute inset-0" aria-hidden="true" />

        <header className="relative z-10 flex shrink-0 items-center justify-between border-b border-white/10 bg-black/40 px-4 py-3 backdrop-blur-xl sm:px-6">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-4">
            <div>
              <h2 className="text-base font-semibold text-white sm:text-lg">
                🎤 Voice Conversation
              </h2>
              <ConnectionStatus
                state={voice.voiceState}
                isConnected={voice.isConnected}
                error={voice.error}
              />
            </div>
            <div className="flex items-center gap-2">
              <LanguageIndicator language={voice.detectedLanguage} />
              <LatencyIndicator latencyMs={voice.latencyMs} />
            </div>
          </div>

          <EndCallButton onClick={handleEndCall} />
        </header>

        <div className="relative z-10 flex min-h-0 flex-1 flex-col lg:flex-row">
          {/* Left — live voice */}
          <section
            className="flex min-h-0 flex-1 flex-col border-b border-white/10 lg:w-[45%] lg:flex-none lg:border-b-0 lg:border-r"
            aria-label="Live voice panel"
          >
            <div className="flex flex-1 flex-col items-center justify-center gap-4 px-4 py-6">
              <VoiceOrb state={voice.voiceState} />
              {showListeningAnim && <ListeningAnimation />}
              {showSpeakingAnim && <SpeakingAnimation />}
            </div>

            <div className="flex max-h-[45%] min-h-[180px] flex-col border-t border-white/10 px-4 py-4">
              <RealtimeTranscript
                userText={voice.userCaption}
                aiText={voice.aiCaption}
                isUserActive={voice.voiceState === "listening"}
                isAiActive={
                  voice.voiceState === "processing" || voice.voiceState === "speaking"
                }
                isAiStreaming={
                  voice.voiceState === "processing" || voice.voiceState === "speaking"
                }
                className="flex-1"
              />
            </div>

            <footer className="border-t border-white/10 px-4 py-4">
              {voice.isMuted && (
                <div
                  className="mb-3 rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-2 text-center text-sm text-red-300"
                  role="alert"
                >
                  Microphone is muted — click the mic button to unmute. The agent cannot hear you.
                </div>
              )}
              <VoiceControls
                isMuted={voice.isMuted}
                onToggleMute={voice.toggleMute}
                onOpenSettings={() => setShowSettings((v) => !v)}
                settings={settings}
                onSettingsChange={setSettings}
                showSettings={showSettings}
                onCloseSettings={() => setShowSettings(false)}
              />
              <p className="mt-3 text-center text-[10px] text-slate-500">
                M to mute · Esc to end call
              </p>
            </footer>
          </section>

          {/* Right — chat transcript */}
          <section
            className="flex min-h-0 flex-1 flex-col lg:w-[55%]"
            aria-label="Chat transcript"
          >
            <VoiceChatPanel messages={messages} isLoading={isLoadingChat} />
          </section>
        </div>

        {voice.voiceState === "error" && voice.error && (
          <div className="absolute bottom-24 left-1/2 z-20 -translate-x-1/2">
            <div className="glass-panel flex items-center gap-3 rounded-xl px-4 py-3">
              <p className="text-sm text-red-300">{voice.error}</p>
              <button
                type="button"
                onClick={() => void voice.retry()}
                className={cn(
                  "rounded-lg px-3 py-1 text-xs font-medium",
                  "bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30",
                )}
              >
                Retry
              </button>
            </div>
          </div>
        )}
      </div>

      <MicrophonePermission
        open={showPermission}
        error={permissionError}
        onRetry={() => {
          setShowPermission(false);
          void voice.retry();
        }}
        onClose={() => setShowPermission(false)}
      />
    </>
  );
});
