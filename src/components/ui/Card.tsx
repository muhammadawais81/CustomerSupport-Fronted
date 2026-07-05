import { cn } from "@/lib/utils";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  description?: string;
  variant?: "light" | "glass";
}

export function Card({
  children,
  className,
  title,
  description,
  variant = "glass",
}: CardProps) {
  const isGlass = variant === "glass";

  return (
    <div
      className={cn(
        "rounded-2xl p-6",
        isGlass
          ? "glass-panel page-enter"
          : "border border-slate-200 bg-white shadow-sm",
        className,
      )}
    >
      {(title || description) && (
        <div className="mb-6">
          {title && (
            <h2 className={cn("text-lg font-semibold", isGlass ? "text-white" : "text-slate-900")}>
              {title}
            </h2>
          )}
          {description && (
            <p className={cn("mt-1 text-sm", isGlass ? "text-slate-400" : "text-slate-500")}>
              {description}
            </p>
          )}
        </div>
      )}
      {children}
    </div>
  );
}
