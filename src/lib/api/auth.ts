import { apiClient } from "@/lib/api/client";
import { setTokens, clearTokens } from "@/lib/auth/tokens";
import type {
  ForgotPasswordRequest,
  LoginRequest,
  MessageResponse,
  RegisterRequest,
  ResetPasswordRequest,
  TokenResponse,
  User,
  VerifyEmailRequest,
} from "@/types/auth";

export async function register(data: RegisterRequest): Promise<User> {
  return apiClient<User>("/api/register", {
    method: "POST",
    body: data,
  });
}

export async function login(data: LoginRequest): Promise<TokenResponse> {
  const response = await apiClient<TokenResponse>("/api/login", {
    method: "POST",
    body: data,
  });
  setTokens(response.access_token, response.refresh_token);
  return response;
}

export async function verifyEmail(data: VerifyEmailRequest): Promise<MessageResponse> {
  return apiClient<MessageResponse>("/api/verify-email", {
    method: "POST",
    body: data,
  });
}

export async function getCurrentUser(): Promise<User> {
  return apiClient<User>("/api/me", {
    method: "GET",
    auth: true,
  });
}

export async function forgotPassword(data: ForgotPasswordRequest): Promise<MessageResponse> {
  return apiClient<MessageResponse>("/api/forgot-password", {
    method: "POST",
    body: data,
  });
}

export async function resetPassword(data: ResetPasswordRequest): Promise<MessageResponse> {
  return apiClient<MessageResponse>("/api/reset-password", {
    method: "POST",
    body: data,
  });
}

export function logout(): void {
  clearTokens();
}
