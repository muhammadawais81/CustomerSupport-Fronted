import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "danger" | "ghost" | "glass";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-gradient-to-r from-cyan-500 via-indigo-500 to-violet-500 text-white btn-glow hover:from-cyan-400 hover:via-indigo-400 hover:to-violet-400 focus-visible:ring-cyan-400",
  secondary:
    "glass-panel-light text-slate-200 hover:bg-white/12 focus-visible:ring-cyan-400/50",
  glass:
    "bg-white/5 border border-white/15 text-slate-200 hover:bg-white/10 hover:border-cyan-400/30 focus-visible:ring-cyan-400/50",
  danger:
    "bg-gradient-to-r from-red-600 to-rose-600 text-white hover:from-red-500 hover:to-rose-500 focus-visible:ring-red-400",
  ghost:
    "bg-transparent text-slate-300 hover:bg-white/8 hover:text-white focus-visible:ring-cyan-400/50",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-sm rounded-lg",
  md: "px-4 py-2 text-sm rounded-xl",
  lg: "px-6 py-3 text-base rounded-xl",
};

export function Button({
  className,
  variant = "primary",
  size = "md",
  isLoading = false,
  disabled,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 font-medium transition-all duration-200",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[#060818]",
        "disabled:cursor-not-allowed disabled:opacity-50 disabled:transform-none disabled:shadow-none",
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      )}
      {children}
    </button>
  );
}
