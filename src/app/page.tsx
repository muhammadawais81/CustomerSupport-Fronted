import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { AIBackground } from "@/components/ui/AIBackground";
import { AIOrb } from "@/components/ui/AIOrb";

export default function HomePage() {
  return (
    <div className="relative flex min-h-dvh flex-col overflow-hidden">
      <AIBackground showParticles showGrid showScanLine />

      <header className="relative z-10 border-b border-white/10 bg-black/20 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2.5">
            <AIOrb size="sm" />
            <span className="text-lg font-bold gradient-text">SupportHub</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm">
                Sign in
              </Button>
            </Link>
            <Link href="/register">
              <Button size="sm">Get started</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="relative z-10 flex flex-1 flex-col items-center justify-center px-4 py-20 text-center">
        <div className="empty-state-enter mx-auto max-w-3xl">
          <AIOrb size="xl" className="mx-auto mb-10" />

          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl">
            AI Customer
            <span className="block gradient-text">Support System</span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-slate-400">
            Ask questions and get instant, intelligent answers powered by your
            organization&apos;s documents. Built for the future of support.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link href="/register">
              <Button size="lg">Start chatting →</Button>
            </Link>
            <Link href="/login">
              <Button variant="glass" size="lg">
                Sign in
              </Button>
            </Link>
          </div>
        </div>

        <div className="mt-24 grid w-full max-w-5xl gap-5 sm:grid-cols-3">
          <FeatureCard
            icon="⚡"
            title="AI Chat Agent"
            description="Stream real-time answers from your knowledge base with markdown-rich responses."
          />
          <FeatureCard
            icon="💬"
            title="Chat History"
            description="Pick up past conversations anytime with a ChatGPT-style sidebar."
          />
          <FeatureCard
            icon="📚"
            title="Admin Panel"
            description="Upload documents to train your AI support agent in seconds."
          />
        </div>
      </main>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <div className="suggestion-card glass-panel group rounded-2xl p-6 text-left transition-all duration-300 hover:border-cyan-400/30 hover:bg-white/6">
      <span className="text-2xl">{icon}</span>
      <h3 className="mt-3 text-lg font-semibold text-white">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-slate-400 group-hover:text-slate-300">
        {description}
      </p>
    </div>
  );
}
