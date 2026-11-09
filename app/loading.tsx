import { Skeleton } from "@/components/ui/skeleton";
import ProductGridSkeleton from "@/components/ProductGridSkeleton";
import LoadingSpinner from "@/components/LoadingSpinner";

function ProductRowSkeleton({ titleWidth = "w-32" }: { titleWidth?: string }) {
  return (
    <section className="mb-14">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="h-6 w-1.5 rounded-full bg-primary/40" aria-hidden />
          <Skeleton className={`h-5 ${titleWidth}`} />
        </div>
        <Skeleton className="h-4 w-16" />
      </div>
      <div className="flex gap-4 overflow-hidden">
        {Array.from({ length: 5 }, (_, i) => (
          <div key={i} className="w-44 shrink-0 sm:w-52">
            <div className="flex flex-col overflow-hidden rounded-2xl border bg-card">
              <Skeleton className="aspect-square w-full rounded-none" />
              <div className="flex flex-col gap-2 border-t px-4 py-3.5">
                <Skeleton className="h-3 w-14" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="mt-1 h-4 w-20" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default function HomeLoading() {
  return (
    <div>
      <LoadingSpinner />
      {/* Static hero shell — no skeleton needed, this content isn't data-dependent */}
      <section className="relative overflow-hidden bg-zinc-950 py-20 sm:py-28">
        <div
          className="absolute top-1/2 right-[10%] size-[28rem] -translate-y-1/2 rounded-full bg-primary/25 blur-[110px]"
          aria-hidden
        />
        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-xl">
            <h1 className="font-heading text-4xl font-extrabold tracking-tight text-white sm:text-6xl">
              Electronics Made Easy
            </h1>
            <p className="mt-4 max-w-md text-base text-zinc-300 sm:text-lg">
              Shop quality electronics for your home, work, and everyday life.
            </p>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <section className="mb-14">
          <Skeleton className="mb-4 h-3 w-24" />
          <div className="flex flex-wrap gap-3">
            {Array.from({ length: 8 }, (_, i) => (
              <Skeleton key={i} className="h-9 w-24 rounded-full" />
            ))}
          </div>
        </section>

        <ProductRowSkeleton titleWidth="w-28" />
        <ProductRowSkeleton titleWidth="w-36" />
        <ProductRowSkeleton titleWidth="w-24" />
        <ProductRowSkeleton titleWidth="w-40" />

        <section>
          <div className="mb-4 flex items-baseline justify-between">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-16" />
          </div>
          <ProductGridSkeleton />
        </section>
      </div>
    </div>
  );
}
