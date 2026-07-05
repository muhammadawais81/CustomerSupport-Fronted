"use client";

import { useCallback, useRef } from "react";
import { pcm16ToFloat32 } from "@/lib/voice/pcmAudio";
import { VOICE_SAMPLE_RATE } from "@/types/voice";

export function usePcmPlayer() {
  const audioContextRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const nextPlayTimeRef = useRef(0);
  const activeSourcesRef = useRef<AudioBufferSourceNode[]>([]);
  const volumeRef = useRef(1);
  const playbackRateRef = useRef(1);

  const ensureContext = useCallback(async (): Promise<AudioContext> => {
    if (!audioContextRef.current || audioContextRef.current.state === "closed") {
      audioContextRef.current = new AudioContext({ sampleRate: VOICE_SAMPLE_RATE });
      gainNodeRef.current = audioContextRef.current.createGain();
      gainNodeRef.current.gain.value = volumeRef.current;
      gainNodeRef.current.connect(audioContextRef.current.destination);
      nextPlayTimeRef.current = 0;
    }

    const ctx = audioContextRef.current;
    if (ctx.state === "suspended") {
      await ctx.resume();
    }

    return ctx;
  }, []);

  const playChunk = useCallback(
    async (pcm16: Uint8Array) => {
      if (!pcm16.length) return;

      const ctx = await ensureContext();
      const float32 = pcm16ToFloat32(pcm16);
      const channel = new Float32Array(float32);
      const buffer = ctx.createBuffer(1, channel.length, VOICE_SAMPLE_RATE);
      buffer.copyToChannel(channel, 0);

      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.playbackRate.value = playbackRateRef.current;
      source.connect(gainNodeRef.current ?? ctx.destination);

      const now = ctx.currentTime;
      if (nextPlayTimeRef.current < now) {
        nextPlayTimeRef.current = now;
      }

      source.start(nextPlayTimeRef.current);
      nextPlayTimeRef.current += buffer.duration / playbackRateRef.current;

      activeSourcesRef.current.push(source);
      source.onended = () => {
        activeSourcesRef.current = activeSourcesRef.current.filter((s) => s !== source);
      };
    },
    [ensureContext],
  );

  const stop = useCallback(() => {
    for (const source of activeSourcesRef.current) {
      try {
        source.stop();
      } catch {
        // already stopped
      }
    }
    activeSourcesRef.current = [];
    nextPlayTimeRef.current = 0;
  }, []);

  const destroy = useCallback(() => {
    stop();
    if (audioContextRef.current?.state !== "closed") {
      void audioContextRef.current?.close();
    }
    audioContextRef.current = null;
    gainNodeRef.current = null;
  }, [stop]);

  const setVolume = useCallback((volume: number) => {
    volumeRef.current = volume;
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = volume;
    }
  }, []);

  const setPlaybackRate = useCallback((rate: number) => {
    playbackRateRef.current = rate;
  }, []);

  return {
    playChunk,
    stop,
    destroy,
    setVolume,
    setPlaybackRate,
  };
}
