import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface RatingProps {
  value: number;
  count?: number;
  size?: "sm" | "md";
  className?: string;
}

export function Rating({ value, count, size = "sm", className }: RatingProps) {
  const starSize = size === "sm" ? 14 : 18;
  const rounded = Math.round(value * 2) / 2;

  return (
    <div className={cn("inline-flex items-center gap-1.5", className)}>
      <div className="flex items-center gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => {
          const filled = i + 1 <= rounded;
          const half = !filled && i + 0.5 === rounded;
          return (
            <Star
              key={i}
              size={starSize}
              className={cn(
                half ? "text-warning" : filled ? "text-warning" : "text-border-strong",
                (filled || half) && "fill-current"
              )}
            />
          );
        })}
      </div>
      <span className={cn("font-medium text-text", size === "sm" ? "text-sm" : "text-base")}>
        {value.toFixed(1)}
      </span>
      {typeof count === "number" && (
        <span className="text-sm text-text-subtle">({count})</span>
      )}
    </div>
  );
}
