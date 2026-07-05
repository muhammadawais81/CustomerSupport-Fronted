"use client";

import { useCallback, useEffect, useState } from "react";
import {
  DEFAULT_VOICE_SETTINGS,
  type VoiceSettings,
} from "@/types/voice";

const STORAGE_KEY = "voice_settings";

export function useVoiceSettings() {
  const [settings, setSettingsState] = useState<VoiceSettings>(DEFAULT_VOICE_SETTINGS);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setSettingsState({ ...DEFAULT_VOICE_SETTINGS, ...JSON.parse(stored) });
      }
    } catch {
      // ignore
    }
    setIsLoaded(true);
  }, []);

  const setSettings = useCallback((partial: Partial<VoiceSettings>) => {
    setSettingsState((prev) => {
      const next = { ...prev, ...partial };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  }, []);

  return { settings, setSettings, isLoaded };
}
