import { cn } from "@/lib/utils";
import type { DocumentStatus } from "@/types/documents";

interface BadgeProps {
  status: DocumentStatus;
  className?: string;
}

const statusConfig: Record<DocumentStatus, { label: string; className: string }> = {
  UPLOADED: {
    label: "Uploaded",
    className: "bg-slate-500/20 text-slate-300 ring-1 ring-slate-400/20",
  },
  PROCESSING: {
    label: "Processing",
    className: "bg-amber-500/15 text-amber-300 ring-1 ring-amber-400/20",
  },
  COMPLETED: {
    label: "Completed",
    className: "bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-400/20",
  },
  FAILED: {
    label: "Failed",
    className: "bg-red-500/15 text-red-300 ring-1 ring-red-400/20",
  },
};

export function DocumentStatusBadge({ status, className }: BadgeProps) {
  const config = statusConfig[status];

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        config.className,
        className,
      )}
    >
      {config.label}
    </span>
  );
}
