import { cn } from "@/lib/utils";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  variant?: "light" | "glass";
}

export function Input({
  label,
  error,
  className,
  id,
  variant = "glass",
  ...props
}: InputProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

  const variantClasses =
    variant === "glass"
      ? "border-white/15 bg-white/5 text-slate-100 placeholder:text-slate-500 focus:border-cyan-400/60 focus:ring-cyan-400/20"
      : "border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-indigo-500/20";

  const labelClass =
    variant === "glass" ? "text-slate-300" : "text-slate-700";

  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={inputId} className={cn("block text-sm font-medium", labelClass)}>
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={cn(
          "block w-full rounded-xl border px-3 py-2.5 text-sm transition-all duration-200",
          "focus:outline-none focus:ring-2",
          variantClasses,
          error && "border-red-400/60 focus:border-red-400 focus:ring-red-400/20",
          className,
        )}
        {...props}
      />
      {error && <p className="text-sm text-red-400">{error}</p>}
    </div>
  );
}
