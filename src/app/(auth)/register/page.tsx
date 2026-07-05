"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { register } from "@/lib/api/auth";
import { ApiError } from "@/types/api";
import { AuthFormLayout } from "@/components/auth/AuthFormLayout";
import { GuestOnly } from "@/hooks/useAuthRedirect";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    organization: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const updateField = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await register(form);
      router.push(`/verify-email?email=${encodeURIComponent(form.email)}`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <GuestOnly>
      <AuthFormLayout
        title="Create an account"
        subtitle="The first user to register becomes admin"
        footer={
          <>
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-cyan-400 hover:text-cyan-300">
              Sign in
            </Link>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <Alert variant="error">{error}</Alert>}

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="First name"
              value={form.first_name}
              onChange={(e) => updateField("first_name", e.target.value)}
              required
              autoComplete="given-name"
            />
            <Input
              label="Last name"
              value={form.last_name}
              onChange={(e) => updateField("last_name", e.target.value)}
              required
              autoComplete="family-name"
            />
          </div>

          <Input
            label="Organization"
            value={form.organization}
            onChange={(e) => updateField("organization", e.target.value)}
            required
            autoComplete="organization"
          />

          <Input
            label="Email"
            type="email"
            value={form.email}
            onChange={(e) => updateField("email", e.target.value)}
            placeholder="you@example.com"
            required
            autoComplete="email"
          />

          <Input
            label="Password"
            type="password"
            value={form.password}
            onChange={(e) => updateField("password", e.target.value)}
            placeholder="••••••••"
            required
            minLength={8}
            autoComplete="new-password"
          />

          <Button type="submit" className="w-full" isLoading={isLoading}>
            Create account
          </Button>
        </form>
      </AuthFormLayout>
    </GuestOnly>
  );
}
