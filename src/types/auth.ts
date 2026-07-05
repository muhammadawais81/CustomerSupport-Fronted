export type UserRole = "admin" | "user";

export interface User {
  id: number;
  first_name: string;
  last_name: string;
  organization: string;
  email: string;
  role: UserRole;
  is_verified: boolean;
  must_reset_password: boolean;
  created_at: string;
  updated_at: string | null;
}

export interface RegisterRequest {
  first_name: string;
  last_name: string;
  organization: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  refresh_token: string;
}

export interface VerifyEmailRequest {
  email: string;
  code: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  email: string;
  code: string;
  new_password: string;
}

export interface MessageResponse {
  message: string;
}
