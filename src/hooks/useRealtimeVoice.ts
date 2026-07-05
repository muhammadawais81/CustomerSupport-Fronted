"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePcmMicrophone } from "@/hooks/usePcmMicrophone";
import { usePcmPlayer } from "@/hooks/usePcmPlayer";
import { useVoiceSettings } from "@/hooks/useVoiceSettings";
import { decodeBase64 } from "@/lib/voice/pcmAudio";
import { extractAssistantText } from "@/lib/voice/parseVoiceEvent";
import { connectRealtimeVoice } from "@/services/voiceSocket";
import type { RealtimeVoiceConnection } from "@/services/voiceSocket";
import {
  LANGUAGE_DISPLAY,
  type DetectedLanguage,
  type RealtimeVoiceState,
  type ServerVoiceEvent,
} from "@/types/voice";

export interface RealtimeVoiceCallbacks {
  ensureSession: (hint: string) => Promise<{ chatId: number; companyId: number }>;
  onVoiceUserMessage: (transcript: string) => string;
  onVoiceUserMessageUpdate?: (messageId: string, transcript: string) => void;
  onVoiceAssistantStart: () => string;
  onVoiceAssistantStream: (messageId: string, content: string, isComplete: boolean) => void;
  onSessionCreated?: (chatId: number) => void;
}

export interface UseRealtimeVoiceOptions {
  enabled: boolean;
  chatId?: number;
  companyId?: number;
  callbacks: RealtimeVoiceCallbacks;
}

export function useRealtimeVoice({
  enabled,
  chatId,
  companyId,
  callbacks,
}: UseRealtimeVoiceOptions) {
  const [voiceState, setVoiceState] = useState<RealtimeVoiceState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [userCaption, setUserCaption] = useState("");
  const [aiCaption, setAiCaption] = useState("");
  const [detectedLanguage, setDetectedLanguage] = useState<DetectedLanguage | null>(null);
  const [latencyMs, setLatencyMs] = useState<number | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const connectionRef = useRef<RealtimeVoiceConnection | null>(null);
  const assistantIdRef = useRef<string | null>(null);
  const assistantTextRef = useRef("");
  const userMessageIdRef = useRef<string | null>(null);
  const sessionRef = useRef<{ chatId: number; companyId: number } | null>(null);
  const speechStartTimeRef = useRef<number | null>(null);
  const processingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const callbacksRef = useRef(callbacks);

  callbacksRef.current = callbacks;

  const { settings } = useVoiceSettings();
  const microphone = usePcmMicrophone({
    settings: {
      noiseSuppression: settings.noiseSuppression,
      echoCancellation: settings.echoCancellation,
      microphoneDeviceId: settings.microphoneDeviceId,
    },
  });
  const pcmPlayer = usePcmPlayer();

  useEffect(() => {
    pcmPlayer.setVolume(settings.voiceVolume);
    pcmPlayer.setPlaybackRate(settings.voiceSpeed);
  }, [pcmPlayer, settings.voiceSpeed, settings.voiceVolume]);

  const clearProcessingTimeout = useCallback(() => {
    if (processingTimeoutRef.current) {
      clearTimeout(processingTimeoutRef.current);
      processingTimeoutRef.current = null;
    }
  }, []);

  const ensureAssistantMessage = useCallback(() => {
    if (assistantIdRef.current) return assistantIdRef.current;
    assistantIdRef.current = callbacksRef.current.onVoiceAssistantStart();
    assistantTextRef.current = "";
    setAiCaption("");
    return assistantIdRef.current;
  }, []);

  const appendAssistantDelta = useCallback((delta: string) => {
    if (!delta) return;
    const assistantId = ensureAssistantMessage();
    assistantTextRef.current += delta;
    setAiCaption(assistantTextRef.current);
    callbacksRef.current.onVoiceAssistantStream(
      assistantId,
      assistantTextRef.current,
      false,
    );
    setVoiceState((prev) =>
      prev === "speaking" ? "speaking" : "processing",
    );
  }, [ensureAssistantMessage]);

  const completeAssistantText = useCallback((fullText: string) => {
    clearProcessingTimeout();
    const assistantId = assistantIdRef.current ?? ensureAssistantMessage();
    assistantTextRef.current = fullText;
    setAiCaption(fullText);
    callbacksRef.current.onVoiceAssistantStream(assistantId, fullText, true);
  }, [clearProcessingTimeout, ensureAssistantMessage]);

  const startProcessingTimeout = useCallback(() => {
    clearProcessingTimeout();
    processingTimeoutRef.current = setTimeout(() => {
      setError("AI response is taking too long. Still listening…");
      setVoiceState("listening");
      assistantIdRef.current = null;
      assistantTextRef.current = "";
    }, 45_000);
  }, [clearProcessingTimeout]);

  const flushAndCommitAudio = useCallback(() => {
    microphone.flushPending();
    connectionRef.current?.sendAudioCommit();
  }, [microphone]);

  const startMicrophoneStream = useCallback(async () => {
    const started = await microphone.startMic((base64Pcm) => {
      connectionRef.current?.sendAudio(base64Pcm);
    });
    if (!started && microphone.error) {
      setError(microphone.error);
      setVoiceState("error");
    }
    return started;
  }, [microphone]);

  const handleServerEvent = useCallback(
    (event: ServerVoiceEvent) => {
      const cb = callbacksRef.current;

      switch (event.type) {
        case "session.ready": {
          setVoiceState("listening");
          void startMicrophoneStream();
          break;
        }

        case "session.pong":
          break;

        case "connection.reconnecting":
          setVoiceState("reconnecting");
          break;

        case "connection.reconnected":
          setVoiceState("listening");
          break;

        case "language.detected": {
          const code = String(event.language ?? "auto");
          setDetectedLanguage(
            LANGUAGE_DISPLAY[code] ?? {
              code,
              label: code.toUpperCase(),
              flag: "🌐",
            },
          );
          break;
        }

        case "user.speech.started":
          speechStartTimeRef.current = Date.now();
          pcmPlayer.stop();
          setVoiceState("listening");
          setUserCaption("");
          break;

        case "user.transcript.delta": {
          const delta = String(event.delta ?? event.text ?? "");
          setUserCaption((prev) => prev + delta);
          break;
        }

        case "user.speech.stopped":
          flushAndCommitAudio();
          ensureAssistantMessage();
          setVoiceState("processing");
          startProcessingTimeout();
          break;

        case "user.transcript.final": {
          const transcript = String(event.transcript ?? event.text ?? "");
          setUserCaption(transcript);
          if (transcript) {
            const userId = cb.onVoiceUserMessage(transcript);
            userMessageIdRef.current = userId;
          }
          if (speechStartTimeRef.current) {
            setLatencyMs(Date.now() - speechStartTimeRef.current);
          }
          ensureAssistantMessage();
          startProcessingTimeout();
          break;
        }

        case "assistant.text.delta":
        case "assistant.transcript.delta": {
          const extracted = extractAssistantText(event);
          if (extracted.delta) {
            appendAssistantDelta(extracted.delta);
          }
          break;
        }

        case "assistant.text.done":
        case "assistant.transcript.done":
        case "assistant.response": {
          const extracted = extractAssistantText(event);
          const fullText = extracted.fullText ?? assistantTextRef.current;
          if (fullText) {
            completeAssistantText(fullText);
          }
          break;
        }

        case "assistant.speech.started":
          clearProcessingTimeout();
          setVoiceState("speaking");
          break;

        case "assistant.audio.delta": {
          clearProcessingTimeout();
          if (!settings.autoPlay) break;
          const audio = String(event.audio ?? event.delta ?? "");
          if (!audio) break;
          ensureAssistantMessage();
          setVoiceState("speaking");
          void pcmPlayer.playChunk(decodeBase64(audio));
          break;
        }

        case "assistant.done":
          clearProcessingTimeout();
          assistantIdRef.current = null;
          assistantTextRef.current = "";
          setVoiceState("listening");
          break;

        case "interrupted":
          pcmPlayer.stop();
          assistantIdRef.current = null;
          assistantTextRef.current = "";
          setAiCaption("");
          setVoiceState("interrupted");
          setTimeout(() => setVoiceState("listening"), 300);
          break;

        case "error": {
          const message = String(
            event.message ?? event.detail ?? "Voice session error.",
          );
          setError(message);
          setVoiceState("error");
          break;
        }

        default:
          break;
      }
    },
    [
      appendAssistantDelta,
      clearProcessingTimeout,
      completeAssistantText,
      ensureAssistantMessage,
      flushAndCommitAudio,
      pcmPlayer,
      settings.autoPlay,
      startMicrophoneStream,
      startProcessingTimeout,
    ],
  );

  const connect = useCallback(async () => {
    setError(null);
    setVoiceState("connecting");
    setUserCaption("");
    setAiCaption("");

    try {
      const session = sessionRef.current ?? {
        chatId: chatId ?? 0,
        companyId: companyId ?? 0,
      };

      if (!session.chatId) {
        const created = await callbacksRef.current.ensureSession("Voice call");
        sessionRef.current = created;
        // Notify parent to refresh chat list only — no navigation during call
        callbacksRef.current.onSessionCreated?.(created.chatId);
      } else {
        sessionRef.current = session;
      }

      const { chatId: sid, companyId: cid } = sessionRef.current;

      connectionRef.current?.close();
      connectionRef.current = connectRealtimeVoice({
        chatSessionId: sid,
        companyId: cid,
        onEvent: handleServerEvent,
        onConnectionChange: setIsConnected,
        onReconnecting: () => setVoiceState("reconnecting"),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to connect.");
      setVoiceState("error");
    }
  }, [chatId, companyId, handleServerEvent]);

  const disconnect = useCallback(() => {
    clearProcessingTimeout();
    connectionRef.current?.close();
    connectionRef.current = null;
    microphone.stopMic();
    pcmPlayer.destroy();
    assistantIdRef.current = null;
    assistantTextRef.current = "";
    userMessageIdRef.current = null;
    setVoiceState("idle");
    setIsConnected(false);
    setUserCaption("");
    setAiCaption("");
  }, [clearProcessingTimeout, microphone, pcmPlayer]);

  useEffect(() => {
    if (enabled) {
      void connect();
    } else {
      disconnect();
    }

    return () => {
      disconnect();
    };
  }, [enabled]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (sessionRef.current && chatId && companyId) {
      sessionRef.current = { chatId, companyId };
    }
  }, [chatId, companyId]);

  return {
    voiceState,
    error,
    userCaption,
    aiCaption,
    detectedLanguage,
    latencyMs,
    isConnected,
    isMuted: microphone.isMuted,
    micError: microphone.error,
    settings,
    connect,
    disconnect,
    toggleMute: microphone.toggleMute,
    retry: connect,
  };
}
