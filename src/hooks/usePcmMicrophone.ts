"use client";

import { useCallback, useRef, useState } from "react";
import {
  downsampleBuffer,
  encodeBase64,
  float32ToPcm16,
  flushPendingChunks,
  mergeToChunkBuffer,
} from "@/lib/voice/pcmAudio";
import { VOICE_SAMPLE_RATE, type VoiceSettings } from "@/types/voice";

export interface UsePcmMicrophoneOptions {
  settings?: Pick<
    VoiceSettings,
    "noiseSuppression" | "echoCancellation" | "microphoneDeviceId"
  >;
}

export function usePcmMicrophone(options: UsePcmMicrophoneOptions = {}) {
  const { settings } = options;
  const [isActive, setIsActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const onChunkRef = useRef<((base64Pcm: string) => void) | null>(null);
  const pendingRef = useRef<Uint8Array[]>([]);
  const mutedRef = useRef(false);

  const stopMic = useCallback(() => {
    processorRef.current?.disconnect();
    sourceRef.current?.disconnect();
    processorRef.current = null;
    sourceRef.current = null;

    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;

    if (audioContextRef.current?.state !== "closed") {
      void audioContextRef.current?.close();
    }
    audioContextRef.current = null;
    pendingRef.current = [];
    setIsActive(false);
  }, []);

  const startMic = useCallback(
    async (onChunk: (base64Pcm: string) => void): Promise<boolean> => {
      stopMic();
      setError(null);
      onChunkRef.current = onChunk;

      if (typeof window === "undefined" || !navigator.mediaDevices?.getUserMedia) {
        setError("Microphone is not supported in this browser.");
        return false;
      }

      try {
        const constraints: MediaStreamConstraints = {
          audio: {
            channelCount: 1,
            echoCancellation: settings?.echoCancellation ?? true,
            noiseSuppression: settings?.noiseSuppression ?? true,
            autoGainControl: true,
            ...(settings?.microphoneDeviceId
              ? { deviceId: { exact: settings.microphoneDeviceId } }
              : {}),
          },
        };

        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        streamRef.current = stream;

        const audioContext = new AudioContext({ sampleRate: VOICE_SAMPLE_RATE });
        audioContextRef.current = audioContext;

        if (audioContext.state === "suspended") {
          await audioContext.resume();
        }

        const source = audioContext.createMediaStreamSource(stream);
        sourceRef.current = source;

        const processor = audioContext.createScriptProcessor(4096, 1, 1);
        processorRef.current = processor;

        processor.onaudioprocess = (event) => {
          if (mutedRef.current) return;

          const input = event.inputBuffer.getChannelData(0);
          const downsampled = downsampleBuffer(
            input,
            audioContext.sampleRate,
            VOICE_SAMPLE_RATE,
          );
          const pcm16 = float32ToPcm16(downsampled);
          const { chunks, remaining } = mergeToChunkBuffer(
            pendingRef.current,
            pcm16,
          );
          pendingRef.current = remaining;

          for (const chunk of chunks) {
            onChunkRef.current?.(encodeBase64(chunk));
          }
        };

        source.connect(processor);
        processor.connect(audioContext.destination);

        setIsActive(true);
        return true;
      } catch (err) {
        const message =
          err instanceof DOMException && err.name === "NotAllowedError"
            ? "Microphone access was denied."
            : err instanceof Error
              ? err.message
              : "Failed to access microphone.";
        setError(message);
        stopMic();
        return false;
      }
    },
    [settings?.echoCancellation, settings?.microphoneDeviceId, settings?.noiseSuppression, stopMic],
  );

  const toggleMute = useCallback(() => {
    mutedRef.current = !mutedRef.current;
    setIsMuted(mutedRef.current);
  }, []);

  const setMuted = useCallback((muted: boolean) => {
    mutedRef.current = muted;
    setIsMuted(muted);
  }, []);

  const flushPending = useCallback(() => {
    const { chunks, remaining } = flushPendingChunks(pendingRef.current);
    pendingRef.current = remaining;
    for (const chunk of chunks) {
      onChunkRef.current?.(encodeBase64(chunk));
    }
  }, []);

  return {
    isActive,
    isMuted,
    error,
    startMic,
    stopMic,
    toggleMute,
    setMuted,
    flushPending,
  };
}
