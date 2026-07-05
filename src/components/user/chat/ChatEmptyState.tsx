"use client";

import { AIOrb } from "@/components/ui/AIOrb";

const suggestions = [
  "How do I get a refund?",
  "What are your business hours?",
  "How can I contact support?",
  "Tell me about your pricing plans",
];

interface ChatEmptyStateProps {
  onSuggestionClick: (text: string) => void;
}

export function ChatEmptyState({ onSuggestionClick }: ChatEmptyStateProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-12">
      <div className="empty-state-enter text-center">
        <AIOrb size="lg" className="mx-auto mb-6" />
        <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
          How can I <span className="gradient-text">help you</span> today?
        </h1>
        <p className="mt-2 max-w-md text-sm text-slate-400">
          Ask questions about products, policies, or support — powered by your
          organization&apos;s AI knowledge base.
        </p>
      </div>

      <div className="mt-10 grid w-full max-w-2xl gap-3 sm:grid-cols-2">
        {suggestions.map((text, i) => (
          <button
            key={text}
            type="button"
            onClick={() => onSuggestionClick(text)}
            className="suggestion-card glass-panel rounded-xl px-4 py-3 text-left text-sm text-slate-300 transition-all hover:border-cyan-400/30 hover:text-white"
            style={{ animationDelay: `${i * 80}ms` }}
          >
            {text}
          </button>
        ))}
      </div>
    </div>
  );
}
