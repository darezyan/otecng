import Link from "next/link";
import type { ProductWithRelations } from "@/lib/supabase/types";
import ProductCard from "./ProductCard";
import RailScroller from "./RailScroller";

export function SectionHeader({ title, href, linkLabel = "View all" }: { title: string; href?: string; linkLabel?: string }) {
  return (
    <div className="mb-4 flex items-end justify-between gap-4">
      <h2 className="font-heading text-xl font-bold text-zinc-950 sm:text-2xl">{title}</h2>
      {href && (
        <Link href={href} className="shrink-0 text-sm font-semibold text-zinc-900 underline-offset-4 hover:underline">
          {linkLabel}
        </Link>
      )}
    </div>
  );
}

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
    <section className="mb-12">
      <SectionHeader title={title} href={href} />
      <RailScroller label={title}>
        {products.map((product) => (
          <div key={product.id} className="w-[46%] shrink-0 snap-start sm:w-[31%] md:w-[23.5%] lg:w-[18.8%]">
            <ProductCard product={product} />
          </div>
        ))}
      </RailScroller>
    </section>
  );
}
