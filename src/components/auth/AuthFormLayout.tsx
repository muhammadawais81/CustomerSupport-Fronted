import Link from "next/link";
import { AIBackground } from "@/components/ui/AIBackground";
import { AIOrb } from "@/components/ui/AIOrb";

interface AuthFormLayoutProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export function AuthFormLayout({ title, subtitle, children, footer }: AuthFormLayoutProps) {
  return (
    <div className="relative flex min-h-dvh flex-1 overflow-hidden">
      <AIBackground showParticles showGrid showScanLine />

      <div className="relative z-10 flex w-full flex-col lg:flex-row">
        {/* Left panel — AI branding (desktop) */}
        <div className="hidden flex-1 flex-col items-center justify-center p-12 lg:flex">
          <div className="page-enter max-w-md text-center">
            <AIOrb size="xl" className="mx-auto mb-8" />
            <h2 className="text-3xl font-bold tracking-tight text-white">
              <span className="gradient-text">SupportHub AI</span>
            </h2>
            <p className="mt-4 text-base leading-relaxed text-slate-400">
              Intelligent customer support powered by your knowledge base.
              Ask questions, get instant AI answers.
            </p>
            <div className="mt-8 flex justify-center gap-6 text-xs text-slate-500">
              <span className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
                Neural Search
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-violet-400 animate-pulse" />
                Live Streaming
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-pulse" />
                Secure
              </span>
            </div>
          </div>
        </div>

        {/* Right panel — form */}
        <div className="flex flex-1 flex-col justify-center px-4 py-12 lg:max-w-lg lg:px-8 xl:max-w-xl">
          <div className="page-enter mx-auto w-full max-w-md">
            <div className="mb-8 text-center lg:text-left">
              <Link href="/" className="inline-flex items-center gap-2.5">
                <AIOrb size="sm" />
                <span className="text-xl font-bold gradient-text">SupportHub</span>
              </Link>
              <h1 className="mt-6 text-2xl font-bold tracking-tight text-white">{title}</h1>
              {subtitle && <p className="mt-2 text-sm text-slate-400">{subtitle}</p>}
            </div>

            <div className="glass-panel gradient-border rounded-2xl p-8">
              {children}
            </div>

            {footer && (
              <div className="mt-6 text-center text-sm text-slate-400 lg:text-left">
                {footer}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
