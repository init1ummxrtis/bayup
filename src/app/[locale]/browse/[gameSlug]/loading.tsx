import { Skeleton } from "@/components/ui/Skeleton";

export default function GameCatalogLoading() {
  return (
    <div>
      <div className="relative h-48 w-full overflow-hidden sm:h-64">
        <Skeleton className="h-full w-full rounded-none" />
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-wrap gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-24 rounded-full" />
          ))}
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[260px_1fr]">
          <Skeleton className="hidden h-96 rounded-2xl lg:block" />

          <div>
            <div className="mb-5 flex items-center justify-between">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-9 w-40" />
            </div>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="overflow-hidden rounded-2xl border border-border">
                  <Skeleton className="h-28 w-full rounded-none" />
                  <div className="flex flex-col gap-2.5 p-4">
                    <Skeleton className="h-4 w-4/5" />
                    <Skeleton className="h-3 w-1/2" />
                    <Skeleton className="h-3 w-1/3" />
                    <Skeleton className="mt-2 h-9 w-full rounded-lg" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
