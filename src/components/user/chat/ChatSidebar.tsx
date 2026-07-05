"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/AuthProvider";
import { useChatContext } from "@/lib/chat/ChatProvider";
import { getChatSidebarLabel, isGenericChatTitle } from "@/lib/chat/utils";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { AIOrb } from "@/components/ui/AIOrb";

export function ChatSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout, isAdmin } = useAuth();
  const { chats, chatPreviews, isLoading, sidebarOpen, setSidebarOpen } = useChatContext();

  const handleNewChat = () => {
    setSidebarOpen(false);
    router.push("/chat");
  };

  const visibleChats = chats.filter(
    (chat) => !isGenericChatTitle(chat.title) || Boolean(chatPreviews[chat.id]),
  );

  const isNewChatActive = pathname === "/chat";

  return (
    <>
      {sidebarOpen && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-label="Close sidebar"
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-white/10 bg-[#060818]/90 text-white shadow-2xl backdrop-blur-xl transition-transform duration-300 lg:static lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex items-center justify-between border-b border-white/10 p-4">
          <Link href="/chat" className="flex items-center gap-2">
            <AIOrb size="sm" />
            <span className="text-lg font-bold gradient-text">SupportHub</span>
          </Link>
          <button
            type="button"
            className="rounded-lg p-1.5 text-white/70 hover:bg-white/10 lg:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="p-3">
          <Button
            variant="glass"
            className={cn(
              "w-full",
              isNewChatActive && "border-cyan-400/40 bg-cyan-500/10 text-cyan-300",
            )}
            onClick={handleNewChat}
          >
            + New chat
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto px-2 pb-2">
          <p className="px-2 py-2 text-xs font-medium uppercase tracking-wider text-slate-500">
            History
          </p>

          {isLoading ? (
            <div className="flex justify-center py-8">
              <Spinner className="border-cyan-500/30 border-t-cyan-400" />
            </div>
          ) : visibleChats.length === 0 ? (
            <p className="px-2 py-4 text-sm text-slate-500">No conversations yet</p>
          ) : (
            <ul className="space-y-0.5">
              {visibleChats.map((chat) => {
                const isActive = pathname === `/chat/${chat.id}`;
                const label = getChatSidebarLabel(chat, chatPreviews);

                return (
                  <li key={chat.id}>
                    <Link
                      href={`/chat/${chat.id}`}
                      onClick={() => setSidebarOpen(false)}
                      title={label}
                      className={cn(
                        "sidebar-item block rounded-xl px-3 py-2.5 transition-all duration-200",
                        isActive
                          ? "bg-cyan-500/15 text-cyan-200 ring-1 ring-cyan-400/20"
                          : "text-slate-400 hover:bg-white/5 hover:text-white",
                      )}
                    >
                      <span className="block truncate text-sm font-medium leading-snug">
                        {label}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="border-t border-white/10 p-3">
          {user && (
            <div className="mb-2 rounded-xl bg-white/5 px-3 py-2">
              <p className="truncate text-sm font-medium text-slate-200">
                {user.first_name} {user.last_name}
              </p>
              <p className="truncate text-xs text-slate-500">{user.email}</p>
            </div>
          )}

          <div className="flex flex-col gap-0.5">
            <Link
              href="/profile"
              className="rounded-lg px-3 py-2 text-sm text-slate-400 transition hover:bg-white/5 hover:text-white"
            >
              Profile
            </Link>
            {isAdmin && (
              <Link
                href="/admin/documents"
                className="rounded-lg px-3 py-2 text-sm text-slate-400 transition hover:bg-white/5 hover:text-cyan-300"
              >
                Admin · Documents
              </Link>
            )}
            <button
              type="button"
              onClick={logout}
              className="rounded-lg px-3 py-2 text-left text-sm text-red-400/80 transition hover:bg-red-500/10 hover:text-red-300"
            >
              Sign out
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
