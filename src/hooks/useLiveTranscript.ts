"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface SpeechRecognitionEvent {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionInstance extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: Event) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
}

type SpeechRecognitionConstructor = new () => SpeechRecognitionInstance;

function getSpeechRecognition(): SpeechRecognitionConstructor | null {
  if (typeof window === "undefined") return null;

  const w = window as Window & {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  };

  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export function useLiveTranscript() {
  const [interimText, setInterimText] = useState("");
  const [finalText, setFinalText] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isSupported] = useState(() => getSpeechRecognition() !== null);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const finalPartsRef = useRef<string[]>([]);

  const stop = useCallback(() => {
    const recognition = recognitionRef.current;
    if (recognition) {
      recognition.onend = null;
      recognition.stop();
      recognitionRef.current = null;
    }
    setIsListening(false);
  }, []);

  const reset = useCallback(() => {
    stop();
    finalPartsRef.current = [];
    setInterimText("");
    setFinalText("");
  }, [stop]);

  const getCombinedTranscript = useCallback(() => {
    const parts = [...finalPartsRef.current];
    if (interimText.trim()) parts.push(interimText.trim());
    return parts.join(" ").trim() || finalText.trim();
  }, [interimText, finalText]);

  const start = useCallback(() => {
    const SpeechRecognition = getSpeechRecognition();
    if (!SpeechRecognition) return false;

    stop();
    finalPartsRef.current = [];
    setInterimText("");
    setFinalText("");

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = document.documentElement.lang || "en-US";

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interim = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const text = result[0]?.transcript ?? "";

        if (result.isFinal) {
          finalPartsRef.current.push(text.trim());
        } else {
          interim += text;
        }
      }

      setInterimText(interim);
      setFinalText(finalPartsRef.current.join(" ").trim());
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
      recognitionRef.current = null;
    };

    try {
      recognition.start();
      recognitionRef.current = recognition;
      setIsListening(true);
      return true;
    } catch {
      return false;
    }
  }, [stop]);

  useEffect(() => {
    return () => {
      stop();
    };
  }, [stop]);

  return {
    isSupported,
    isListening,
    interimText,
    finalText,
    liveText: [finalText, interimText].filter(Boolean).join(" ").trim(),
    start,
    stop,
    reset,
    getCombinedTranscript,
  };
}
