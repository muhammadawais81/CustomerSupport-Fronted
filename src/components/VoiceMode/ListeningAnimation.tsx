"use client";

import { memo } from "react";
import { VoiceWaveform } from "@/components/VoiceMode/VoiceWaveform";

export const ListeningAnimation = memo(function ListeningAnimation() {
  return (
    <div className="flex flex-col items-center gap-2">
      <VoiceWaveform active variant="listening" />
      <p className="text-xs font-medium text-cyan-300">Listening</p>
    </div>
  );
});
