"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useState } from "react";
import { resetPassword } from "@/lib/api/auth";
import { ApiError } from "@/types/api";
import { AuthFormLayout } from "@/components/auth/AuthFormLayout";
import { GuestOnly } from "@/hooks/useAuthRedirect";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Spinner } from "@/components/ui/Spinner";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState(searchParams.get("email") ?? "");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    try {
      const response = await resetPassword({ email, code, new_password: newPassword });
      setSuccess(response.message);
      setTimeout(() => router.push("/login"), 2000);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Password reset failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthFormLayout
      title="Reset password"
      subtitle="Enter the code from your email and a new password"
      footer={
        <>
          <Link href="/login" className="font-medium text-cyan-400 hover:text-cyan-300">
            Back to sign in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <Alert variant="error">{error}</Alert>}
        {success && <Alert variant="success">{success}</Alert>}

        <Input
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
        />

        <Input
          label="Reset code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="123456"
          required
          maxLength={6}
          inputMode="numeric"
        />

        <Input
          label="New password"
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder="••••••••"
          required
          minLength={8}
          autoComplete="new-password"
        />

        <Button type="submit" className="w-full" isLoading={isLoading}>
          Reset password
        </Button>
      </form>
    </AuthFormLayout>
  );
}

export default function ResetPasswordPage() {
  return (
    <GuestOnly>
      <Suspense
        fallback={
          <div className="flex min-h-full flex-1 items-center justify-center">
            <Spinner size="lg" />
          </div>
        }
      >
        <ResetPasswordForm />
      </Suspense>
    </GuestOnly>
  );
}
