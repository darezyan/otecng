import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import LoadingSpinner from "@/components/LoadingSpinner";

export default function CartLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <LoadingSpinner />
      <Skeleton className="mb-8 h-8 w-32" />

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="divide-y rounded-2xl border">
            {Array.from({ length: 3 }, (_, i) => (
              <div key={i} className="flex gap-4 p-4">
                <Skeleton className="size-20 shrink-0 rounded-lg" />
                <div className="flex flex-1 flex-col gap-2">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-4 w-3/4" />
                  <div className="mt-auto flex items-center justify-between pt-2">
                    <Skeleton className="h-8 w-20 rounded-lg" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="h-fit rounded-2xl border p-5">
          <Skeleton className="h-4 w-28" />
          <Separator className="my-4" />
          <div className="flex items-center justify-between">
            <Skeleton className="h-3.5 w-16" />
            <Skeleton className="h-3.5 w-20" />
          </div>
          <Skeleton className="mt-5 h-10 w-full rounded-lg" />
        </div>
      </div>
    </div>
  );
}
