import { fetchWithAuth, API_URL } from "@/lib/api/client";

export function resolveAudioUrl(url: string): string {
  const trimmed = url.trim();
  if (!trimmed) return "";

  if (
    trimmed.startsWith("http://") ||
    trimmed.startsWith("https://") ||
    trimmed.startsWith("blob:")
  ) {
    return trimmed;
  }

  const base = API_URL.replace(/\/$/, "");
  const path = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  return `${base}${path}`;
}

/**
 * Returns the API path for protected voice audio, regardless of host (localhost vs 127.0.0.1).
 */
export function getProtectedVoiceAudioPath(url: string): string | null {
  const trimmed = url.trim();
  if (!trimmed) return null;

  if (trimmed.startsWith("/api/chat/voice/audio/")) {
    return trimmed;
  }

  try {
    const parsed = new URL(trimmed);
    if (parsed.pathname.startsWith("/api/chat/voice/audio/")) {
      return parsed.pathname;
    }
  } catch {
    // Not an absolute URL — try resolving then extract path.
    const resolved = resolveAudioUrl(trimmed);
    try {
      const parsed = new URL(resolved);
      if (parsed.pathname.startsWith("/api/chat/voice/audio/")) {
        return parsed.pathname;
      }
    } catch {
      return null;
    }
  }

  return null;
}

/**
 * Loads audio via authenticated fetch when the URL points at our protected voice endpoint.
 * HTML Audio cannot send Authorization headers, so we fetch as a blob first.
 */
export async function loadPlayableAudioSource(url: string): Promise<string> {
  const trimmed = url.trim();
  if (!trimmed) {
    throw new Error("No audio URL was provided.");
  }

  const protectedPath = getProtectedVoiceAudioPath(trimmed);
  if (protectedPath) {
    const response = await fetchWithAuth(protectedPath, { method: "GET" });
    const contentType = response.headers.get("content-type") ?? "";

    if (!contentType.includes("audio") && !contentType.includes("mpeg")) {
      throw new Error(
        "Could not load voice audio. Your session may have expired — refresh and try again.",
      );
    }

    const buffer = await response.arrayBuffer();
    if (!buffer.byteLength) {
      throw new Error("Audio file is empty.");
    }

    const blob = new Blob([buffer], { type: "audio/mpeg" });
    return URL.createObjectURL(blob);
  }

  return resolveAudioUrl(trimmed);
}

export function revokeAudioObjectUrl(objectUrl: string | null | undefined): void {
  if (objectUrl?.startsWith("blob:")) {
    URL.revokeObjectURL(objectUrl);
  }
}
