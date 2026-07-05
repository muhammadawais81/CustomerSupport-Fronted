import type { ServerVoiceEvent } from "@/types/voice";

const EVENT_ALIASES: Record<string, string> = {
  "response.text.delta": "assistant.text.delta",
  "response.text.done": "assistant.text.done",
  "response.audio.delta": "assistant.audio.delta",
  "response.audio.done": "assistant.audio.done",
  "response.done": "assistant.done",
  "assistant.response": "assistant.text.done",
  "assistant.response.delta": "assistant.text.delta",
  "assistant.response.done": "assistant.text.done",
  "assistant.message.delta": "assistant.text.delta",
  "assistant.message.done": "assistant.text.done",
  "assistant.output_text.delta": "assistant.text.delta",
  "assistant.output_text.done": "assistant.text.done",
  "transcript.delta": "user.transcript.delta",
  "transcript.final": "user.transcript.final",
  "input_audio_buffer.speech_started": "user.speech.started",
  "input_audio_buffer.speech_stopped": "user.speech.stopped",
  "output_audio_buffer.started": "assistant.speech.started",
  "output_audio_buffer.stopped": "assistant.done",
  session_ready: "session.ready",
  session_pong: "session.pong",
};

function unwrapPayload(raw: Record<string, unknown>): Record<string, unknown> {
  if (raw.data && typeof raw.data === "object" && !Array.isArray(raw.data)) {
    const data = raw.data as Record<string, unknown>;
    if ("type" in data || "event" in data || "transcript" in data || "delta" in data) {
      return { ...data, type: data.type ?? raw.type };
    }
  }

  if (raw.event && typeof raw.event === "object" && !Array.isArray(raw.event)) {
    return raw.event as Record<string, unknown>;
  }

  if (raw.payload && typeof raw.payload === "object" && !Array.isArray(raw.payload)) {
    return raw.payload as Record<string, unknown>;
  }

  return raw;
}

function normalizeType(type: string): string {
  const trimmed = type.trim();
  return EVENT_ALIASES[trimmed] ?? trimmed;
}

function extractTextFields(obj: Record<string, unknown>): {
  delta?: string;
  text?: string;
  transcript?: string;
  audio?: string;
} {
  const delta = obj.delta ?? obj.content ?? obj.token ?? obj.partial ?? obj.text_delta;
  const text = obj.text ?? obj.content ?? obj.answer ?? obj.response ?? obj.message ?? obj.output;
  const transcript = obj.transcript ?? obj.user_transcript ?? obj.input;
  const audio = obj.audio ?? obj.audio_data ?? obj.chunk;

  return {
    delta: delta != null ? String(delta) : undefined,
    text: text != null ? String(text) : undefined,
    transcript: transcript != null ? String(transcript) : undefined,
    audio: audio != null ? String(audio) : undefined,
  };
}

/** Normalize backend WebSocket payloads into consistent event shapes. */
export function normalizeVoiceEvents(raw: unknown): ServerVoiceEvent[] {
  if (!raw || typeof raw !== "object") return [];

  const obj = unwrapPayload(raw as Record<string, unknown>);
  const rawType = String(obj.type ?? obj.event ?? obj.event_type ?? "");
  const type = normalizeType(rawType);
  const fields = extractTextFields(obj);

  const event: ServerVoiceEvent = {
    ...obj,
    type,
    ...(fields.delta !== undefined ? { delta: fields.delta } : {}),
    ...(fields.text !== undefined ? { text: fields.text } : {}),
    ...(fields.transcript !== undefined ? { transcript: fields.transcript } : {}),
    ...(fields.audio !== undefined ? { audio: fields.audio } : {}),
  };

  if (!type) return [];

  return [event];
}

export function extractAssistantText(event: ServerVoiceEvent): {
  delta?: string;
  fullText?: string;
  isDone: boolean;
} {
  const type = event.type;

  if (type === "assistant.text.delta" || type === "assistant.transcript.delta") {
    return {
      delta: String(event.delta ?? event.text ?? ""),
      isDone: false,
    };
  }

  if (
    type === "assistant.text.done" ||
    type === "assistant.transcript.done" ||
    type === "assistant.response"
  ) {
    return {
      fullText: String(
        event.text ?? event.transcript ?? event.answer ?? event.response ?? "",
      ),
      isDone: true,
    };
  }

  return { isDone: false };
}
