/** Realtime voice WebSocket sample rate (PCM16 mono) */
export const VOICE_SAMPLE_RATE = 24000;

/** UI states for realtime voice call */
export type RealtimeVoiceState =
  | "idle"
  | "connecting"
  | "connected"
  | "listening"
  | "processing"
  | "speaking"
  | "interrupted"
  | "disconnected"
  | "reconnecting"
  | "error";

/** Legacy UI states used by live panel components */
export type VoiceState =
  | "idle"
  | "listening"
  | "processing"
  | "speaking"
  | "error";

export function mapRealtimeToUiState(state: RealtimeVoiceState): VoiceState {
  switch (state) {
    case "connecting":
    case "connected":
    case "disconnected":
    case "reconnecting":
      return "idle";
    case "interrupted":
      return "listening";
    case "processing":
      return "processing";
    case "speaking":
      return "speaking";
    case "listening":
      return "listening";
    case "error":
      return "error";
    default:
      return "idle";
  }
}

export interface VoiceSettings {
  voiceSpeed: number;
  voiceVolume: number;
  autoPlay: boolean;
  noiseSuppression: boolean;
  echoCancellation: boolean;
  microphoneDeviceId: string;
  speakerDeviceId: string;
}

export const DEFAULT_VOICE_SETTINGS: VoiceSettings = {
  voiceSpeed: 1,
  voiceVolume: 1,
  autoPlay: true,
  noiseSuppression: true,
  echoCancellation: true,
  microphoneDeviceId: "",
  speakerDeviceId: "",
};

export interface DetectedLanguage {
  code: string;
  label: string;
  flag: string;
}

export const LANGUAGE_DISPLAY: Record<string, DetectedLanguage> = {
  en: { code: "en", label: "English", flag: "🇺🇸" },
  ur: { code: "ur", label: "Urdu", flag: "🇵🇰" },
  es: { code: "es", label: "Spanish", flag: "🇪🇸" },
  ar: { code: "ar", label: "Arabic", flag: "🇸🇦" },
  fr: { code: "fr", label: "French", flag: "🇫🇷" },
  de: { code: "de", label: "German", flag: "🇩🇪" },
  hi: { code: "hi", label: "Hindi", flag: "🇮🇳" },
  auto: { code: "auto", label: "Auto-detect", flag: "🌐" },
};

// ─── WebSocket protocol ───

export interface SessionStartMessage {
  type: "session.start";
  chat_session_id: number;
  company_id: number;
  language: string;
}

export interface SessionStopMessage {
  type: "session.stop";
}

export interface SessionPingMessage {
  type: "session.ping";
}

export interface AudioAppendMessage {
  type: "audio.append";
  audio: string;
}

export interface AudioCommitMessage {
  type: "audio.commit";
}

export type ClientVoiceMessage =
  | SessionStartMessage
  | SessionStopMessage
  | SessionPingMessage
  | AudioAppendMessage
  | AudioCommitMessage;

export interface ServerVoiceEvent {
  type: string;
  [key: string]: unknown;
}

export interface SessionReadyEvent extends ServerVoiceEvent {
  type: "session.ready";
  session?: Record<string, unknown>;
}

export interface TranscriptDeltaEvent extends ServerVoiceEvent {
  type: "user.transcript.delta" | "assistant.transcript.delta";
  delta?: string;
  text?: string;
}

export interface TranscriptFinalEvent extends ServerVoiceEvent {
  type: "user.transcript.final";
  transcript?: string;
  text?: string;
}

export interface TextDeltaEvent extends ServerVoiceEvent {
  type: "assistant.text.delta";
  delta?: string;
  text?: string;
}

export interface TextDoneEvent extends ServerVoiceEvent {
  type: "assistant.text.done";
  text?: string;
}

export interface AudioDeltaEvent extends ServerVoiceEvent {
  type: "assistant.audio.delta";
  audio?: string;
  delta?: string;
}

export interface ErrorEvent extends ServerVoiceEvent {
  type: "error";
  message?: string;
  detail?: string;
}

export interface LanguageDetectedEvent extends ServerVoiceEvent {
  type: "language.detected";
  language?: string;
}

export interface VoiceUploadParams {
  audioBlob: Blob;
  chatSessionId: number;
  companyId: number;
}

// Legacy upload types (unused in realtime mode)
export interface VoiceChatResponse {
  transcript: string;
  answer: string;
  audio_url: string;
}

export interface VoiceExchange {
  transcript: string;
  answer: string;
  audioUrl: string;
  timestamp: string;
}

export type VoicePermissionStatus =
  | "granted"
  | "denied"
  | "unavailable"
  | "unsupported"
  | "prompt";

export interface VoiceRecorderError {
  type: "permission_denied" | "unavailable" | "unsupported" | "recording_failed";
  message: string;
}

export interface TranscriptEntry {
  id: string;
  role: "user" | "assistant";
  text: string;
  timestamp: string;
  isFinal: boolean;
}
