import { cn } from "@/lib/utils";

interface AIOrbProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizeMap = {
  sm: { wrap: "h-10 w-10", core: "h-6 w-6", ring1: "h-10 w-10", ring2: "h-12 w-12" },
  md: { wrap: "h-16 w-16", core: "h-10 w-10", ring1: "h-16 w-16", ring2: "h-20 w-20" },
  lg: { wrap: "h-24 w-24", core: "h-14 w-14", ring1: "h-24 w-24", ring2: "h-28 w-28" },
  xl: { wrap: "h-32 w-32", core: "h-20 w-20", ring1: "h-32 w-32", ring2: "h-40 w-40" },
};

export function AIOrb({ size = "md", className }: AIOrbProps) {
  const s = sizeMap[size];

  return (
    <div className={cn("ai-orb-wrap", s.wrap, className)}>
      <div className={cn("ai-orb-ring ai-orb-ring-2", s.ring2)} />
      <div className={cn("ai-orb-ring ai-orb-ring-1", s.ring1)} />
      <div className={cn("ai-orb-core", s.core)} />
    </div>
  );
}
