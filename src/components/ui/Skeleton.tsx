import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
}

/** Decorative loading placeholder. Always `aria-hidden` — pair it with a text/aria-live cue when the loading state itself needs to be announced. */
export function Skeleton({ className }: SkeletonProps) {
  return <div aria-hidden="true" className={cn("animate-pulse rounded-lg bg-surface", className)} />;
}
