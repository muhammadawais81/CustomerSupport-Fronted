"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/AuthProvider";
import { Spinner } from "@/components/ui/Spinner";

export function useRedirectIfAuthenticated(redirectTo = "/chat") {
  const { isLoading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace(redirectTo);
    }
  }, [isLoading, isAuthenticated, router, redirectTo]);

  return { isLoading, isAuthenticated };
}

export function GuestOnly({ children }: { children: React.ReactNode }) {
  const { isLoading, isAuthenticated } = useRedirectIfAuthenticated();

  if (isLoading || isAuthenticated) {
    return (
      <div className="flex min-h-full flex-1 items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return <>{children}</>;
}

export function RequireAuth({
  children,
  adminOnly = false,
}: {
  children: React.ReactNode;
  adminOnly?: boolean;
}) {
  const { isLoading, isAuthenticated, isAdmin } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/login");
    }
    if (!isLoading && isAuthenticated && adminOnly && !isAdmin) {
      router.replace("/chat");
    }
  }, [isLoading, isAuthenticated, isAdmin, adminOnly, router]);

  if (isLoading || !isAuthenticated || (adminOnly && !isAdmin)) {
    return (
      <div className="flex min-h-full flex-1 items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return <>{children}</>;
}
