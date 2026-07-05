import { ApiError, type ApiRequestOptions } from "@/types/api";
import { getAccessToken, getRefreshToken, setTokens, clearTokens } from "@/lib/auth/tokens";
import type { TokenResponse } from "@/types/auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return null;

  try {
    const response = await fetch(`${API_URL}/api/refresh-token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    if (!response.ok) {
      clearTokens();
      return null;
    }

    const data: TokenResponse = await response.json();
    setTokens(data.access_token, data.refresh_token);
    return data.access_token;
  } catch {
    clearTokens();
    return null;
  }
}

async function getValidAccessToken(): Promise<string | null> {
  const token = getAccessToken();
  if (!token) return null;
  return token;
}

async function parseErrorResponse(response: Response): Promise<ApiError> {
  let detail: unknown;
  let message = `Request failed with status ${response.status}`;

  try {
    detail = await response.json();
    if (
      detail &&
      typeof detail === "object" &&
      "detail" in detail &&
      typeof (detail as { detail: unknown }).detail === "string"
    ) {
      message = (detail as { detail: string }).detail;
    } else if (
      detail &&
      typeof detail === "object" &&
      "message" in detail &&
      typeof (detail as { message: unknown }).message === "string"
    ) {
      message = (detail as { message: string }).message;
    }
  } catch {
    // ignore JSON parse errors
  }

  return new ApiError(message, response.status, detail);
}

export async function apiClient<T>(
  endpoint: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  const { body, auth = false, formData, headers: customHeaders, ...rest } = options;

  const headers: Record<string, string> = {
    ...(customHeaders as Record<string, string>),
  };

  if (!formData) {
    headers["Content-Type"] = "application/json";
  }

  if (auth) {
    const token = await getValidAccessToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  const makeRequest = (token?: string | null) => {
    const requestHeaders: Record<string, string> = { ...headers };
    if (token) {
      requestHeaders.Authorization = `Bearer ${token}`;
    }
    if (formData) {
      delete requestHeaders["Content-Type"];
    }

    return fetch(`${API_URL}${endpoint}`, {
      ...rest,
      headers: requestHeaders,
      body: formData ?? (body !== undefined ? JSON.stringify(body) : undefined),
    });
  };

  let response = await makeRequest(auth ? getAccessToken() : null);

  if (response.status === 401 && auth) {
    if (!refreshPromise) {
      refreshPromise = refreshAccessToken().finally(() => {
        refreshPromise = null;
      });
    }

    const newToken = await refreshPromise;
    if (newToken) {
      response = await makeRequest(newToken);
    }
  }

  if (!response.ok) {
    throw await parseErrorResponse(response);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export async function fetchWithAuth(
  endpoint: string,
  options: RequestInit = {},
): Promise<Response> {
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };

  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] ??= "application/json";
  }

  const makeRequest = (token?: string | null) => {
    const requestHeaders = { ...headers };
    if (token) {
      requestHeaders.Authorization = `Bearer ${token}`;
    }
    if (options.body instanceof FormData) {
      delete requestHeaders["Content-Type"];
    }

    return fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: requestHeaders,
    });
  };

  let response = await makeRequest(getAccessToken());

  if (response.status === 401) {
    if (!refreshPromise) {
      refreshPromise = refreshAccessToken().finally(() => {
        refreshPromise = null;
      });
    }

    const newToken = await refreshPromise;
    if (newToken) {
      response = await makeRequest(newToken);
    }
  }

  if (!response.ok) {
    throw await parseErrorResponse(response);
  }

  return response;
}

export { API_URL };
