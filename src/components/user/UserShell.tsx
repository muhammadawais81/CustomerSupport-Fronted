"use client";

import { AIBackground } from "@/components/ui/AIBackground";
import { ChatSidebar } from "@/components/user/chat/ChatSidebar";
import { ChatProvider } from "@/lib/chat/ChatProvider";
import { RequireAuth } from "@/hooks/useAuthRedirect";

export function UserShell({ children }: { children: React.ReactNode }) {
  return (
    <RequireAuth>
      <ChatProvider>
        <div className="relative flex h-dvh overflow-hidden">
          <AIBackground showParticles showGrid showScanLine />
          <div className="relative z-10 flex h-full w-full">
            <ChatSidebar />
            <main className="flex min-w-0 flex-1 flex-col">{children}</main>
          </div>
        </div>
      </ChatProvider>
    </RequireAuth>
  );
}
