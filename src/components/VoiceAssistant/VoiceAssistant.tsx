"use client";

import type { LocalMessage } from "@/types/chat";
import type { RealtimeVoiceCallbacks } from "@/hooks/useRealtimeVoice";
import { VoiceModeAssistant } from "@/components/VoiceMode/VoiceAssistant";

export interface VoiceSessionContext {
  chatId: number;
  companyId: number;
}

export interface VoiceAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  chatId?: number;
  companyId?: number;
  disabled?: boolean;
  messages: LocalMessage[];
  isLoadingChat?: boolean;
  ensureSession: (hint: string) => Promise<VoiceSessionContext>;
  onVoiceUserMessage: (transcript: string) => string;
  onVoiceUserMessageUpdate: (messageId: string, transcript: string) => void;
  onVoiceAssistantStart: () => string;
  onVoiceAssistantStream: (messageId: string, content: string, isComplete: boolean) => void;
  onSessionCreated?: (chatId: number) => void;
}

export function VoiceAssistant({
  isOpen,
  onClose,
  chatId,
  companyId,
  disabled,
  messages,
  isLoadingChat,
  ensureSession,
  onVoiceUserMessage,
  onVoiceUserMessageUpdate,
  onVoiceAssistantStart,
  onVoiceAssistantStream,
  onSessionCreated,
}: VoiceAssistantProps) {
  const callbacks: RealtimeVoiceCallbacks = {
    ensureSession,
    onVoiceUserMessage,
    onVoiceUserMessageUpdate,
    onVoiceAssistantStart,
    onVoiceAssistantStream,
    onSessionCreated,
  };

  return (
    <VoiceModeAssistant
      isOpen={isOpen}
      onClose={onClose}
      chatId={chatId}
      companyId={companyId}
      disabled={disabled}
      messages={messages}
      isLoadingChat={isLoadingChat}
      callbacks={callbacks}
    />
  );
}
