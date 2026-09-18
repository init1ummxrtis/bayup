import { Skeleton } from "@/components/ui/Skeleton";

export default function PaymentLoading() {
  return (
    <div className="mx-auto max-w-md px-4 py-16 sm:px-6">
      <div className="rounded-2xl border border-border bg-surface p-6">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="mt-2 h-4 w-48" />

        <Skeleton className="my-6 h-16 w-full rounded-xl" />

        <Skeleton className="mb-2 h-3 w-24" />
        <Skeleton className="mb-6 h-12 w-full rounded-xl" />

        <Skeleton className="h-12 w-full rounded-xl" />
      </div>
    </div>
  );
}
