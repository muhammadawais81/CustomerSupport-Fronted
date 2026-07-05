"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useState } from "react";
import { verifyEmail } from "@/lib/api/auth";
import { ApiError } from "@/types/api";
import { AuthFormLayout } from "@/components/auth/AuthFormLayout";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Spinner } from "@/components/ui/Spinner";

function VerifyEmailForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState(searchParams.get("email") ?? "");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    try {
      const response = await verifyEmail({ email, code });
      setSuccess(response.message);
      setTimeout(() => router.push("/login"), 2000);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Verification failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthFormLayout
      title="Verify your email"
      subtitle="Enter the 6-digit code sent to your email"
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
          label="Verification code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="123456"
          required
          maxLength={6}
          inputMode="numeric"
          pattern="[0-9]{6}"
        />

        <Button type="submit" className="w-full" isLoading={isLoading}>
          Verify email
        </Button>
      </form>
    </AuthFormLayout>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-full flex-1 items-center justify-center">
          <Spinner size="lg" />
        </div>
      }
    >
      <VerifyEmailForm />
    </Suspense>
  );
}
