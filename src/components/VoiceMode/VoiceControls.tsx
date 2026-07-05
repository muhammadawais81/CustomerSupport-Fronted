"use client";

import { memo } from "react";
import { cn } from "@/lib/utils";
import type { VoiceSettings } from "@/types/voice";

interface VoiceControlsProps {
  isMuted: boolean;
  onToggleMute: () => void;
  onOpenSettings?: () => void;
  settings?: VoiceSettings;
  onSettingsChange?: (partial: Partial<VoiceSettings>) => void;
  showSettings?: boolean;
  onCloseSettings?: () => void;
  className?: string;
}

export const VoiceControls = memo(function VoiceControls({
  isMuted,
  onToggleMute,
  onOpenSettings,
  settings,
  onSettingsChange,
  showSettings,
  onCloseSettings,
  className,
}: VoiceControlsProps) {
  return (
    <div className={cn("flex flex-col items-center gap-4", className)}>
      <div className="flex items-center gap-4">
        <ControlButton
          label={isMuted ? "Unmute microphone" : "Mute microphone"}
          onClick={onToggleMute}
          active={isMuted}
        >
          {isMuted ? <MicOffIcon /> : <MicIcon />}
        </ControlButton>

        {onOpenSettings && (
          <ControlButton label="Voice settings" onClick={onOpenSettings}>
            <SettingsIcon />
          </ControlButton>
        )}
      </div>

      {showSettings && settings && onSettingsChange && (
        <div className="glass-panel w-full max-w-sm rounded-2xl p-4 message-enter">
          <div className="mb-3 flex items-center justify-between">
            <h4 className="text-sm font-semibold text-white">Voice Settings</h4>
            {onCloseSettings && (
              <button
                type="button"
                onClick={onCloseSettings}
                className="text-xs text-slate-400 hover:text-white"
              >
                Close
              </button>
            )}
          </div>

          <div className="space-y-3 text-sm">
            <SettingSlider
              label="Voice Speed"
              value={settings.voiceSpeed}
              min={0.5}
              max={2}
              step={0.1}
              onChange={(v) => onSettingsChange({ voiceSpeed: v })}
            />
            <SettingSlider
              label="Volume"
              value={settings.voiceVolume}
              min={0}
              max={1}
              step={0.05}
              onChange={(v) => onSettingsChange({ voiceVolume: v })}
            />
            <SettingToggle
              label="Auto Play"
              checked={settings.autoPlay}
              onChange={(v) => onSettingsChange({ autoPlay: v })}
            />
            <SettingToggle
              label="Noise Suppression"
              checked={settings.noiseSuppression}
              onChange={(v) => onSettingsChange({ noiseSuppression: v })}
            />
            <SettingToggle
              label="Echo Cancellation"
              checked={settings.echoCancellation}
              onChange={(v) => onSettingsChange({ echoCancellation: v })}
            />
          </div>
        </div>
      )}
    </div>
  );
});

function ControlButton({
  children,
  label,
  onClick,
  active,
}: {
  children: React.ReactNode;
  label: string;
  onClick: () => void;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-pressed={active}
      className={cn(
        "flex h-12 w-12 items-center justify-center rounded-full transition-all",
        "glass-panel-light hover:bg-white/12",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400",
        active && "bg-red-500/20 text-red-300",
      )}
    >
      {children}
    </button>
  );
}

function SettingSlider({
  label,
  value,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
}) {
  return (
    <label className="flex flex-col gap-1 text-slate-300">
      <span className="flex justify-between text-xs">
        <span>{label}</span>
        <span className="text-slate-500">{value.toFixed(2)}</span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="accent-cyan-500"
      />
    </label>
  );
}

function SettingToggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center justify-between gap-3 text-slate-300">
      <span className="text-xs">{label}</span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 rounded accent-cyan-500"
      />
    </label>
  );
}

function MicIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 14a3 3 0 0 0 3-3V5a3 3 0 1 0-6 0v6a3 3 0 0 0 3 3Z" />
      <path d="M19 11a1 1 0 1 0-2 0 5 5 0 0 1-10 0 1 1 0 1 0-2 0 7 7 0 0 0 6 6.92V21H9a1 1 0 1 0 0 2h6a1 1 0 1 0 0-2h-2v-3.08A7 7 0 0 0 19 11Z" />
    </svg>
  );
}

function MicOffIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V5a3 3 0 0 0-5.94-.6" strokeLinecap="round" />
      <path d="M17 11a5 5 0 0 1-10 0M12 19v3M3 3l18 18" strokeLinecap="round" />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <circle cx="12" cy="12" r="3" />
      <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" strokeLinecap="round" />
    </svg>
  );
}
