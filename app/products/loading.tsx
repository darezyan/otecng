import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import ProductGridSkeleton from "@/components/ProductGridSkeleton";
import LoadingSpinner from "@/components/LoadingSpinner";

function FilterSectionSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div>
      <Skeleton className="mb-3 h-3 w-20" />
      <div className="space-y-2.5">
        {Array.from({ length: rows }, (_, i) => (
          <Skeleton key={i} className="h-3.5 w-full max-w-32" />
        ))}
      </div>
    </div>
  );
}

export default function ProductsLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <LoadingSpinner />
      <Skeleton className="mb-6 h-8 w-48" />

      <div className="flex flex-col gap-8 lg:flex-row">
        <aside className="w-full shrink-0 space-y-6 lg:w-56">
          <FilterSectionSkeleton rows={5} />
          <Separator />
          <FilterSectionSkeleton rows={6} />
          <Separator />
          <FilterSectionSkeleton rows={5} />
        </aside>

        <div className="flex-1">
          <Skeleton className="mb-4 h-4 w-24" />
          <ProductGridSkeleton />
        </div>
      </div>
    </div>
  );
}
