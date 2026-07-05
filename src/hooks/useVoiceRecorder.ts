"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { VoicePermissionStatus, VoiceRecorderError } from "@/types/voice";

const MIME_TYPE = "audio/webm";

function getSupportedMimeType(): string | null {
  if (typeof MediaRecorder === "undefined") return null;

  const candidates = [
    "audio/webm;codecs=opus",
    "audio/webm",
    "audio/ogg;codecs=opus",
    "audio/mp4",
  ];

  for (const type of candidates) {
    if (MediaRecorder.isTypeSupported(type)) return type;
  }

  return null;
}

function mapMediaError(error: unknown): VoiceRecorderError {
  if (error instanceof DOMException) {
    if (error.name === "NotAllowedError" || error.name === "PermissionDeniedError") {
      return {
        type: "permission_denied",
        message: "Microphone access was denied. Please allow microphone access in your browser settings.",
      };
    }
    if (error.name === "NotFoundError" || error.name === "DevicesNotFoundError") {
      return {
        type: "unavailable",
        message: "No microphone was found. Please connect a microphone and try again.",
      };
    }
    if (error.name === "NotReadableError") {
      return {
        type: "unavailable",
        message: "Your microphone is unavailable. It may be in use by another application.",
      };
    }
  }

  return {
    type: "recording_failed",
    message: error instanceof Error ? error.message : "Failed to start recording.",
  };
}

export function useVoiceRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [permissionStatus, setPermissionStatus] = useState<VoicePermissionStatus>("prompt");
  const [error, setError] = useState<VoiceRecorderError | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);

  const isSupported =
    typeof window !== "undefined" &&
    typeof navigator !== "undefined" &&
    Boolean(navigator.mediaDevices?.getUserMedia) &&
    typeof MediaRecorder !== "undefined" &&
    getSupportedMimeType() !== null;

  const cleanupStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  }, []);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const resetRecording = useCallback(() => {
    stopTimer();
    cleanupStream();
    mediaRecorderRef.current = null;
    chunksRef.current = [];
    setIsRecording(false);
    setRecordingDuration(0);
  }, [cleanupStream, stopTimer]);

  useEffect(() => {
    return () => {
      resetRecording();
    };
  }, [resetRecording]);

  const checkPermission = useCallback(async (): Promise<VoicePermissionStatus> => {
    if (!isSupported) {
      setPermissionStatus("unsupported");
      return "unsupported";
    }

    try {
      if (navigator.permissions?.query) {
        const result = await navigator.permissions.query({ name: "microphone" as PermissionName });
        const status = result.state as VoicePermissionStatus;
        setPermissionStatus(status);
        return status;
      }
    } catch {
      // Permissions API may not support microphone query in all browsers
    }

    return permissionStatus;
  }, [isSupported, permissionStatus]);

  const startRecording = useCallback(async (): Promise<boolean> => {
    setError(null);

    if (!isSupported) {
      const unsupportedError: VoiceRecorderError = {
        type: "unsupported",
        message: "Voice recording is not supported in this browser. Please try Chrome, Edge, or Firefox.",
      };
      setError(unsupportedError);
      setPermissionStatus("unsupported");
      return false;
    }

    const mimeType = getSupportedMimeType();
    if (!mimeType) {
      setError({
        type: "unsupported",
        message: "Audio recording format is not supported in this browser.",
      });
      return false;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      setPermissionStatus("granted");

      const recorder = new MediaRecorder(stream, { mimeType });
      chunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current = recorder;
      recorder.start(250);
      startTimeRef.current = Date.now();
      setIsRecording(true);
      setRecordingDuration(0);

      timerRef.current = setInterval(() => {
        setRecordingDuration(Math.floor((Date.now() - startTimeRef.current) / 1000));
      }, 250);

      return true;
    } catch (err) {
      const mapped = mapMediaError(err);
      setError(mapped);
      setPermissionStatus(mapped.type === "permission_denied" ? "denied" : "unavailable");
      cleanupStream();
      return false;
    }
  }, [cleanupStream, isSupported]);

  const stopRecording = useCallback((): Promise<Blob | null> => {
    return new Promise((resolve) => {
      const recorder = mediaRecorderRef.current;

      if (!recorder || recorder.state === "inactive") {
        resetRecording();
        resolve(null);
        return;
      }

      recorder.onstop = () => {
        stopTimer();
        const mimeType = recorder.mimeType || MIME_TYPE;
        const blob =
          chunksRef.current.length > 0
            ? new Blob(chunksRef.current, { type: mimeType })
            : null;

        cleanupStream();
        mediaRecorderRef.current = null;
        chunksRef.current = [];
        setIsRecording(false);
        resolve(blob);
      };

      recorder.onerror = () => {
        setError({
          type: "recording_failed",
          message: "Recording failed unexpectedly. Please try again.",
        });
        resetRecording();
        resolve(null);
      };

      recorder.stop();
    });
  }, [cleanupStream, resetRecording, stopTimer]);

  const clearError = useCallback(() => setError(null), []);

  return {
    isSupported,
    isRecording,
    recordingDuration,
    permissionStatus,
    error,
    checkPermission,
    startRecording,
    stopRecording,
    clearError,
    resetRecording,
  };
}
