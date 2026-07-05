"use client";

import { memo } from "react";
import { VoiceWaveform } from "@/components/VoiceMode/VoiceWaveform";

export const SpeakingAnimation = memo(function SpeakingAnimation() {
  return (
    <div className="flex flex-col items-center gap-2">
      <VoiceWaveform active variant="speaking" />
      <p className="text-xs font-medium text-violet-300">AI is speaking</p>
    </div>
  );
});
