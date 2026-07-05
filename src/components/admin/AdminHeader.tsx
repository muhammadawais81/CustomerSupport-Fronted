"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth/AuthProvider";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { AIOrb } from "@/components/ui/AIOrb";

const navItems = [{ href: "/admin/documents", label: "Documents" }];

export function AdminHeader() {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  return (
    <header className="border-b border-white/10 bg-black/30 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-6">
          <Link href="/admin/documents" className="flex items-center gap-2.5">
            <AIOrb size="sm" />
            <span className="text-lg font-bold gradient-text">Admin Console</span>
          </Link>
          <nav className="hidden items-center gap-1 sm:flex">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-xl px-3 py-2 text-sm font-medium transition-all duration-200",
                  pathname.startsWith(item.href)
                    ? "bg-cyan-500/15 text-cyan-300 ring-1 ring-cyan-400/20"
                    : "text-slate-400 hover:bg-white/5 hover:text-white",
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/chat"
            className="hidden text-sm font-medium text-slate-400 transition hover:text-cyan-300 sm:block"
          >
            ← Back to Chat
          </Link>
          {user && (
            <span className="hidden text-sm text-slate-500 sm:block">
              {user.first_name} {user.last_name}
            </span>
          )}
          <Button variant="glass" size="sm" onClick={logout}>
            Sign out
          </Button>
        </div>
      </div>
    </header>
  );
}
