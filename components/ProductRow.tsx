import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { ProductWithRelations } from "@/lib/supabase/types";
import ProductCard from "./ProductCard";

export function SectionHeading({
  eyebrow,
  title,
  href,
  linkLabel = "View all",
}: {
  eyebrow?: string;
  title: string;
  href?: string;
  linkLabel?: string;
}) {
  return (
    <div className="mb-5 flex items-end justify-between gap-4">
      <div>
        {eyebrow && (
          <p className="mb-1 text-[11px] font-semibold tracking-[0.1em] text-primary uppercase">{eyebrow}</p>
        )}
        <h2 className="font-heading text-xl font-bold text-foreground sm:text-2xl">{title}</h2>
      </div>
      {href && (
        <Link
          href={href}
          className="group/link inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-foreground/80 transition-colors hover:text-primary"
        >
          {linkLabel}
          <ArrowRight className="size-4 transition-transform group-hover/link:translate-x-0.5" />
        </Link>
      )}
    </div>
  );
}

export default function ProductRow({
  title,
  eyebrow,
  href,
  products,
}: {
  title: string;
  eyebrow?: string;
  href: string;
  products: ProductWithRelations[];
}) {
  if (products.length === 0) return null;

  return (
    <section className="mb-16">
      <SectionHeading eyebrow={eyebrow} title={title} href={href} />
      <div className="scrollbar-primary -mx-4 flex snap-x gap-4 overflow-x-auto px-4 pb-3 sm:mx-0 sm:px-0">
        {products.map((product) => (
          <div key={product.id} className="w-48 shrink-0 snap-start sm:w-56">
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </section>
  );
}
