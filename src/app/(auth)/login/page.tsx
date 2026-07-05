"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useState } from "react";
import { login } from "@/lib/api/auth";
import { useAuth } from "@/lib/auth/AuthProvider";
import { ApiError } from "@/types/api";
import { AuthFormLayout } from "@/components/auth/AuthFormLayout";
import { GuestOnly } from "@/hooks/useAuthRedirect";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Spinner } from "@/components/ui/Spinner";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refreshUser } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await login({ email, password });
      await refreshUser();
      const redirect = searchParams.get("redirect") ?? "/chat";
      router.push(redirect);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
      <AuthFormLayout
        title="Welcome back"
        subtitle="Sign in to your account"
        footer={
          <>
            Don&apos;t have an account?{" "}
            <Link href="/register" className="font-medium text-cyan-400 hover:text-cyan-300">
              Register
            </Link>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <Alert variant="error">{error}</Alert>}

          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            autoComplete="email"
          />

          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            autoComplete="current-password"
          />

          <div className="flex justify-end">
            <Link
              href="/forgot-password"
              className="text-sm font-medium text-cyan-400 hover:text-cyan-300"
            >
              Forgot password?
            </Link>
          </div>

          <Button type="submit" className="w-full" isLoading={isLoading}>
            Sign in
          </Button>
        </form>
      </AuthFormLayout>
  );
}

export default function LoginPage() {
  return (
    <GuestOnly>
      <Suspense
        fallback={
          <div className="flex min-h-full flex-1 items-center justify-center">
            <Spinner size="lg" />
          </div>
        }
      >
        <LoginForm />
      </Suspense>
    </GuestOnly>
  );
}
