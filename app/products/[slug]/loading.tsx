import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import ProductGridSkeleton from "@/components/ProductGridSkeleton";
import LoadingSpinner from "@/components/LoadingSpinner";

export default function ProductDetailLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <LoadingSpinner />
      <Skeleton className="mb-6 h-4 w-56" />

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
        <div className="flex flex-col gap-3">
          <Skeleton className="aspect-square w-full rounded-lg" />
          <div className="flex gap-2">
            {Array.from({ length: 4 }, (_, i) => (
              <Skeleton key={i} className="size-16 shrink-0 rounded-md" />
            ))}
          </div>
        </div>

        <div>
          <Skeleton className="h-3 w-20" />
          <Skeleton className="mt-3 h-7 w-3/4" />
          <Skeleton className="mt-2 h-7 w-1/2" />
          <Skeleton className="mt-4 h-9 w-40" />
          <Skeleton className="mt-6 h-11 w-full rounded-lg" />

          <div className="mt-8">
            <Separator className="mb-6" />
            <Skeleton className="mb-3 h-4 w-28" />
            <div className="space-y-2">
              <Skeleton className="h-3.5 w-full" />
              <Skeleton className="h-3.5 w-full" />
              <Skeleton className="h-3.5 w-2/3" />
            </div>
          </div>
        </div>
      </div>

      <section className="mt-16">
        <Skeleton className="mb-4 h-6 w-40" />
        <ProductGridSkeleton count={4} />
      </section>
    </div>
  );
}
