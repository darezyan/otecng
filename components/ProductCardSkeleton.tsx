import { Skeleton } from "@/components/ui/skeleton";

export default function ProductCardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border bg-card ring-1 ring-foreground/5">
      <Skeleton className="aspect-square w-full rounded-none" />
      <div className="flex flex-col gap-2 border-t px-4 py-3.5">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="mt-1 h-5 w-24" />
      </div>
    </div>
  );
}
