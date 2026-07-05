import { API_URL } from "@/lib/api/client";
import { getAccessToken } from "@/lib/auth/tokens";
import type { ClientVoiceMessage, ServerVoiceEvent } from "@/types/voice";
import { normalizeVoiceEvents } from "@/lib/voice/parseVoiceEvent";

const MAX_RECONNECT_ATTEMPTS = 3;
const HEARTBEAT_INTERVAL_MS = 25_000;
const RECONNECT_DELAY_MS = 2_000;

export type VoiceSocketEventHandler = (event: ServerVoiceEvent) => void;

export interface RealtimeVoiceConnection {
  sendAudio: (base64Pcm: string) => void;
  sendAudioCommit: () => void;
  sendStop: () => void;
  sendPing: () => void;
  close: () => void;
  isOpen: () => boolean;
}

export interface ConnectRealtimeVoiceOptions {
  chatSessionId: number;
  companyId: number;
  language?: string;
  onEvent: VoiceSocketEventHandler;
  onConnectionChange?: (connected: boolean) => void;
  onReconnecting?: (attempt: number) => void;
}

function buildWsUrl(token: string): string {
  const base = API_URL.replace(/^http/, "ws").replace(/\/$/, "");
  return `${base}/ws/voice?token=${encodeURIComponent(token)}`;
}

export function connectRealtimeVoice(
  options: ConnectRealtimeVoiceOptions,
): RealtimeVoiceConnection {
  const {
    chatSessionId,
    companyId,
    language = "auto",
    onEvent,
    onConnectionChange,
    onReconnecting,
  } = options;

  let ws: WebSocket | null = null;
  let heartbeatTimer: ReturnType<typeof setInterval> | null = null;
  let reconnectAttempts = 0;
  let intentionalClose = false;
  let sessionStarted = false;

  const clearHeartbeat = () => {
    if (heartbeatTimer) {
      clearInterval(heartbeatTimer);
      heartbeatTimer = null;
    }
  };

  const startHeartbeat = () => {
    clearHeartbeat();
    heartbeatTimer = setInterval(() => {
      send({ type: "session.ping" });
    }, HEARTBEAT_INTERVAL_MS);
  };

  const send = (message: ClientVoiceMessage) => {
    if (ws?.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
    }
  };

  const startSession = () => {
    if (sessionStarted) return;
    sessionStarted = true;
    send({
      type: "session.start",
      chat_session_id: chatSessionId,
      company_id: companyId,
      language,
    });
  };

  const connect = () => {
    const token = getAccessToken();
    if (!token) {
      onEvent({ type: "error", message: "Session expired, please log in again." });
      return;
    }

    ws = new WebSocket(buildWsUrl(token));

    ws.onopen = () => {
      reconnectAttempts = 0;
      onConnectionChange?.(true);
      startSession();
      startHeartbeat();
    };

    ws.onmessage = (messageEvent) => {
      const raw =
        typeof messageEvent.data === "string" ? messageEvent.data : "";
      if (!raw) return;

      try {
        const parsed: unknown = JSON.parse(raw);
        const events = normalizeVoiceEvents(parsed);
        for (const event of events) {
          onEvent(event);
        }
      } catch {
        // ignore malformed frames
      }
    };

    ws.onerror = () => {
      onEvent({ type: "error", message: "WebSocket connection error." });
    };

    ws.onclose = () => {
      clearHeartbeat();
      onConnectionChange?.(false);

      if (intentionalClose) return;

      if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
        reconnectAttempts += 1;
        sessionStarted = false;
        onEvent({ type: "connection.reconnecting", attempt: reconnectAttempts });
        onReconnecting?.(reconnectAttempts);
        setTimeout(connect, RECONNECT_DELAY_MS);
      } else {
        onEvent({ type: "error", message: "Connection lost. Please try again." });
      }
    };
  };

  connect();

  return {
    sendAudio: (base64Pcm: string) => {
      send({ type: "audio.append", audio: base64Pcm });
    },
    sendAudioCommit: () => {
      send({ type: "audio.commit" });
    },
    sendStop: () => {
      send({ type: "session.stop" });
    },
    close: () => {
      intentionalClose = true;
      clearHeartbeat();
      send({ type: "session.stop" });
      ws?.close();
      ws = null;
    },
    sendPing: () => send({ type: "session.ping" }),
    isOpen: () => ws?.readyState === WebSocket.OPEN,
  };
}
