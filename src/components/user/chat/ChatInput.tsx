"use client";

import { FormEvent, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
  isLoading?: boolean;
  placeholder?: string;
}

export function ChatInput({
  value,
  onChange,
  onSubmit,
  disabled = false,
  isLoading = false,
  placeholder = "Ask anything about our products or policies...",
}: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  }, [value]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!value.trim() || disabled || isLoading) return;
    onSubmit();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="chat-input-enter mx-auto w-full max-w-3xl px-4 pb-6 pt-2"
    >
      <div className="glass-panel flex items-end gap-2 rounded-2xl p-2 shadow-lg shadow-cyan-500/5">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled || isLoading}
          rows={1}
          className={cn(
            "max-h-40 min-h-[44px] flex-1 resize-none bg-transparent px-3 py-2.5 text-sm text-slate-100",
            "placeholder:text-slate-500 focus:outline-none disabled:opacity-50",
          )}
        />
        <Button
          type="submit"
          disabled={!value.trim() || disabled || isLoading}
          isLoading={isLoading}
          className="shrink-0 rounded-xl px-4"
        >
          Send
        </Button>
      </div>
      <p className="mt-2 text-center text-xs text-slate-500">
        Press Enter to send · Shift+Enter for new line
      </p>
    </form>
  );
}
