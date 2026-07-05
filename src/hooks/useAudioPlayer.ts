"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  loadPlayableAudioSource,
  revokeAudioObjectUrl,
} from "@/lib/voice/audioUrl";

export type AudioPlayerStatus = "idle" | "loading" | "playing" | "paused" | "error";

function getMediaErrorMessage(audio: HTMLAudioElement): string {
  switch (audio.error?.code) {
    case MediaError.MEDIA_ERR_ABORTED:
      return "Audio playback was interrupted.";
    case MediaError.MEDIA_ERR_NETWORK:
      return "Could not load audio. Check your connection and try replay.";
    case MediaError.MEDIA_ERR_DECODE:
      return "Audio format is not supported by your browser.";
    case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
      return "Audio source is not available or not supported.";
    default:
      return "Failed to play audio response. You can try replaying.";
  }
}

function waitForCanPlay(audio: HTMLAudioElement, timeoutMs = 15000): Promise<void> {
  return new Promise((resolve, reject) => {
    if (audio.readyState >= HTMLMediaElement.HAVE_ENOUGH_DATA) {
      resolve();
      return;
    }

    const cleanup = () => {
      clearTimeout(timer);
      audio.removeEventListener("canplaythrough", onReady);
      audio.removeEventListener("loadeddata", onReady);
      audio.removeEventListener("error", onError);
    };

    const onReady = () => {
      cleanup();
      resolve();
    };

    const onError = () => {
      cleanup();
      reject(new Error(getMediaErrorMessage(audio)));
    };

    const timer = setTimeout(() => {
      cleanup();
      reject(new Error("Audio took too long to load. Tap replay to try again."));
    }, timeoutMs);

    audio.addEventListener("canplaythrough", onReady, { once: true });
    audio.addEventListener("loadeddata", onReady, { once: true });
    audio.addEventListener("error", onError, { once: true });
    audio.load();
  });
}

export function useAudioPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const objectUrlRef = useRef<string | null>(null);
  const [status, setStatus] = useState<AudioPlayerStatus>("idle");
  const [currentSourceUrl, setCurrentSourceUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const onEndedRef = useRef<(() => void) | null>(null);

  const revokeObjectUrl = useCallback(() => {
    revokeAudioObjectUrl(objectUrlRef.current);
    objectUrlRef.current = null;
  }, []);

  const cleanup = useCallback(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.removeAttribute("src");
      audio.load();
    }
    audioRef.current = null;
    revokeObjectUrl();
  }, [revokeObjectUrl]);

  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  const play = useCallback(
    async (url: string, onEnded?: () => void): Promise<boolean> => {
      if (!url?.trim()) {
        setStatus("error");
        setError("No audio was returned from the server.");
        return false;
      }

      setError(null);
      onEndedRef.current = onEnded ?? null;
      cleanup();
      setStatus("loading");
      setCurrentSourceUrl(url);

      try {
        const playableSrc = await loadPlayableAudioSource(url);
        if (playableSrc.startsWith("blob:")) {
          objectUrlRef.current = playableSrc;
        }

        const audio = new Audio();
        audio.preload = "auto";
        audio.src = playableSrc;
        audioRef.current = audio;

        audio.onplay = () => setStatus("playing");
        audio.onpause = () => {
          if (
            audio.duration &&
            audio.currentTime > 0 &&
            audio.currentTime < audio.duration
          ) {
            setStatus("paused");
          }
        };
        audio.onended = () => {
          setStatus("idle");
          onEndedRef.current?.();
          onEndedRef.current = null;
        };

        await waitForCanPlay(audio);
        await audio.play();
        return true;
      } catch (err) {
        cleanup();
        setStatus("error");
        setError(
          err instanceof Error
            ? err.message
            : "Failed to play audio response. You can try replaying.",
        );
        onEndedRef.current?.();
        onEndedRef.current = null;
        return false;
      }
    },
    [cleanup],
  );

  const pause = useCallback(() => {
    audioRef.current?.pause();
  }, []);

  const resume = useCallback(async () => {
    if (!audioRef.current) return;
    try {
      await audioRef.current.play();
      setStatus("playing");
      setError(null);
    } catch {
      setStatus("error");
      setError("Failed to resume audio playback.");
    }
  }, []);

  const replay = useCallback(async () => {
    if (!currentSourceUrl) return false;
    return play(currentSourceUrl, onEndedRef.current ?? undefined);
  }, [currentSourceUrl, play]);

  const stop = useCallback(() => {
    cleanup();
    setStatus("idle");
    setCurrentSourceUrl(null);
    onEndedRef.current = null;
    setError(null);
  }, [cleanup]);

  const clearError = useCallback(() => setError(null), []);

  return {
    status,
    currentUrl: currentSourceUrl,
    error,
    isPlaying: status === "playing",
    isPaused: status === "paused",
    play,
    pause,
    resume,
    replay,
    stop,
    clearError,
  };
}
