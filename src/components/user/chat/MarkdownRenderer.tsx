"use client";

import { useCallback, useState } from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";

function CodeBlock({
  className,
  children,
}: {
  className?: string;
  children?: React.ReactNode;
}) {
  const [copied, setCopied] = useState(false);
  const language = className?.replace("language-", "") ?? "";
  const code = String(children ?? "").replace(/\n$/, "");

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  }, [code]);

  if (!code.includes("\n") && !className) {
    return (
      <code className="rounded bg-cyan-500/15 px-1.5 py-0.5 font-mono text-[0.85em] text-cyan-300">
        {children}
      </code>
    );
  }

  return (
    <div className="group relative my-3 overflow-hidden rounded-lg border border-white/10 bg-black/40">
      <div className="flex items-center justify-between border-b border-white/10 bg-white/5 px-3 py-1.5">
        <span className="text-xs font-medium text-slate-400">{language || "code"}</span>
        <button
          type="button"
          onClick={handleCopy}
          className="rounded px-2 py-0.5 text-xs text-slate-400 transition hover:bg-slate-700 hover:text-white"
        >
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
      <pre className="overflow-x-auto p-4 text-[13px] leading-relaxed">
        <code className={cn("font-mono text-slate-100", className)}>{code}</code>
      </pre>
    </div>
  );
}

const markdownComponents: Components = {
  h1: ({ children }) => (
    <h1 className="mb-3 mt-4 text-xl font-bold first:mt-0">{children}</h1>
  ),
  h2: ({ children }) => (
    <h2 className="mb-2 mt-4 text-lg font-bold first:mt-0">{children}</h2>
  ),
  h3: ({ children }) => (
    <h3 className="mb-2 mt-3 text-base font-semibold first:mt-0">{children}</h3>
  ),
  p: ({ children }) => <p className="mb-3 last:mb-0 leading-relaxed">{children}</p>,
  ul: ({ children }) => (
    <ul className="mb-3 list-disc space-y-1 pl-5 last:mb-0">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="mb-3 list-decimal space-y-1 pl-5 last:mb-0">{children}</ol>
  ),
  li: ({ children }) => <li className="leading-relaxed">{children}</li>,
  blockquote: ({ children }) => (
    <blockquote className="my-3 border-l-4 border-cyan-400/50 pl-4 italic text-slate-400">
      {children}
    </blockquote>
  ),
  a: ({ href, children }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="font-medium text-cyan-400 underline decoration-cyan-400/40 underline-offset-2 hover:text-cyan-300"
    >
      {children}
    </a>
  ),
  strong: ({ children }) => <strong className="font-semibold text-white">{children}</strong>,
  em: ({ children }) => <em className="italic text-slate-300">{children}</em>,
  hr: () => <hr className="my-4 border-white/10" />,
  table: ({ children }) => (
    <div className="my-3 overflow-x-auto rounded-lg border border-white/10">
      <table className="min-w-full divide-y divide-white/10 text-sm">{children}</table>
    </div>
  ),
  thead: ({ children }) => <thead className="bg-white/5">{children}</thead>,
  th: ({ children }) => (
    <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="border-t border-white/10 px-3 py-2 text-slate-300">{children}</td>
  ),
  code: ({ className, children }) => (
    <CodeBlock className={className}>{children}</CodeBlock>
  ),
  pre: ({ children }) => <>{children}</>,
};

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
  return (
    <div className={cn("markdown-content break-words", className)}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
        {content}
      </ReactMarkdown>
    </div>
  );
}

function StreamingCursor() {
  return (
    <span
      className="streaming-cursor ml-0.5 inline-block h-[1.1em] w-[2px] translate-y-[2px] bg-cyan-400"
      aria-hidden
    />
  );
}

interface StreamingMarkdownProps {
  content: string;
  isStreaming: boolean;
}

export function StreamingMarkdown({ content, isStreaming }: StreamingMarkdownProps) {
  if (isStreaming && !content) {
    return null;
  }

  return (
    <div className="relative">
      <MarkdownRenderer content={content} />
      {isStreaming && <StreamingCursor />}
    </div>
  );
}
