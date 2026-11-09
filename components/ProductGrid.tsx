import Link from "next/link";
import { SearchX } from "lucide-react";
import type { ProductWithRelations } from "@/lib/supabase/types";
import ProductCard from "./ProductCard";

export default function ProductGrid({
  products,
  columns = "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4",
}: {
  products: ProductWithRelations[];
  columns?: string;
}) {
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center rounded-xl border border-dashed px-6 py-20 text-center">
        <SearchX className="size-8 text-muted-foreground" aria-hidden />
        <p className="mt-4 font-medium text-foreground">No products match these filters</p>
        <p className="mt-1 text-sm text-muted-foreground">Try removing a filter or searching for something else.</p>
        <Link href="/products" className="mt-5 text-sm font-semibold text-primary hover:underline">
          Clear all filters
        </Link>
      </div>
    );
  }

  return (
    <div className={`grid gap-3 sm:gap-4 ${columns}`}>
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
