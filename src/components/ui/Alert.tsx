import { cn } from "@/lib/utils";

type AlertVariant = "success" | "error" | "info" | "warning";

interface AlertProps {
  variant?: AlertVariant;
  children: React.ReactNode;
  className?: string;
}

const variantClasses: Record<AlertVariant, string> = {
  success: "border-emerald-400/30 bg-emerald-500/10 text-emerald-300",
  error: "border-red-400/30 bg-red-500/10 text-red-300",
  info: "border-cyan-400/30 bg-cyan-500/10 text-cyan-300",
  warning: "border-amber-400/30 bg-amber-500/10 text-amber-300",
};

export function Alert({ variant = "info", children, className }: AlertProps) {
  return (
    <div
      className={cn(
        "rounded-xl border px-4 py-3 text-sm backdrop-blur-sm",
        variantClasses[variant],
        className,
      )}
      role="alert"
    >
      {children}
    </div>
  );
}
