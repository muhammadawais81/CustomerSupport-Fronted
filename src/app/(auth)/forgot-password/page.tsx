"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { forgotPassword } from "@/lib/api/auth";
import { ApiError } from "@/types/api";
import { AuthFormLayout } from "@/components/auth/AuthFormLayout";
import { GuestOnly } from "@/hooks/useAuthRedirect";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setIsLoading(true);

    try {
      const response = await forgotPassword({ email });
      setMessage(response.message);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Request failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <GuestOnly>
      <AuthFormLayout
        title="Forgot password"
        subtitle="We'll send a reset code to your email"
        footer={
          <>
            Remember your password?{" "}
            <Link href="/login" className="font-medium text-cyan-400 hover:text-cyan-300">
              Sign in
            </Link>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <Alert variant="error">{error}</Alert>}
          {message && <Alert variant="success">{message}</Alert>}

          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            autoComplete="email"
          />

          <Button type="submit" className="w-full" isLoading={isLoading}>
            Send reset code
          </Button>

          {message && (
            <Link href={`/reset-password?email=${encodeURIComponent(email)}`}>
              <Button type="button" variant="secondary" className="w-full">
                Enter reset code
              </Button>
            </Link>
          )}
        </form>
      </AuthFormLayout>
    </GuestOnly>
  );
}
