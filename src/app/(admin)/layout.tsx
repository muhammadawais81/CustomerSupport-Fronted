"use client";

import { AdminHeader } from "@/components/admin/AdminHeader";
import { AIBackground } from "@/components/ui/AIBackground";
import { RequireAuth } from "@/hooks/useAuthRedirect";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireAuth adminOnly>
      <div className="relative flex min-h-dvh flex-col">
        <AIBackground showParticles showGrid />
        <div className="relative z-10 flex min-h-dvh flex-col">
          <AdminHeader />
          <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
            {children}
          </main>
        </div>
      </div>
    </RequireAuth>
  );
}
