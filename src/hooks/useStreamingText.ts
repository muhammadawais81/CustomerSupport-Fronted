"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface UseStreamingTextOptions {
  /** Milliseconds between each word reveal */
  wordDelayMs?: number;
  onUpdate?: (partial: string, isComplete: boolean) => void;
}

export function useStreamingText(options: UseStreamingTextOptions = {}) {
  const { wordDelayMs = 35, onUpdate } = options;
  const [displayText, setDisplayText] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const onUpdateRef = useRef(onUpdate);

  onUpdateRef.current = onUpdate;

  const stop = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsStreaming(false);
  }, []);

  const streamText = useCallback(
    (fullText: string): Promise<void> => {
      stop();
      setDisplayText("");
      setIsStreaming(true);

      const words = fullText.split(/(\s+)/);
      let index = 0;
      let accumulated = "";

      return new Promise((resolve) => {
        timerRef.current = setInterval(() => {
          if (index >= words.length) {
            stop();
            setDisplayText(fullText);
            onUpdateRef.current?.(fullText, true);
            resolve();
            return;
          }

          accumulated += words[index];
          index += 1;
          setDisplayText(accumulated);
          onUpdateRef.current?.(accumulated, false);
        }, wordDelayMs);
      });
    },
    [stop, wordDelayMs],
  );

  const reset = useCallback(() => {
    stop();
    setDisplayText("");
  }, [stop]);

  useEffect(() => {
    return () => stop();
  }, [stop]);

  return {
    displayText,
    isStreaming,
    streamText,
    reset,
    stop,
  };
}
