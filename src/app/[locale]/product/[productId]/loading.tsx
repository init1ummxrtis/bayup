import { Skeleton } from "@/components/ui/Skeleton";

export default function ProductLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Skeleton className="mb-6 h-40 w-full rounded-2xl sm:h-56" />

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_340px]">
        <div>
          <Skeleton className="h-4 w-24" />
          <Skeleton className="mt-2 h-8 w-3/4" />
          <Skeleton className="mt-3 h-5 w-40" />

          <div className="mt-6 rounded-2xl border border-border bg-surface p-5 sm:p-6">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="mt-3 h-3 w-full" />
            <Skeleton className="mt-2 h-3 w-5/6" />
          </div>
        </div>

        <Skeleton className="h-80 rounded-2xl" />
      </div>
    </div>
  );
}
