import Link from "next/link";
import type { ProductWithRelations } from "@/lib/supabase/types";
import ProductCard from "./ProductCard";

export default function ProductRow({
  title,
  href,
  products,
}: {
  title: string;
  href: string;
  products: ProductWithRelations[];
}) {
  if (products.length === 0) return null;

  return (
    <section className="mb-14">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="h-6 w-1.5 rounded-full bg-primary" aria-hidden />
          <h2 className="font-heading text-lg font-bold text-foreground">{title}</h2>
        </div>
        <Link
          href={href}
          className="text-sm font-medium text-primary transition-colors hover:text-primary/80"
        >
          View all &rarr;
        </Link>
      </div>
      <div className="scrollbar-primary -mx-4 flex snap-x gap-4 overflow-x-auto px-4 pb-3 sm:mx-0 sm:px-0">
        {products.map((product) => (
          <div key={product.id} className="w-44 shrink-0 snap-start sm:w-52">
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </section>
  );
}
