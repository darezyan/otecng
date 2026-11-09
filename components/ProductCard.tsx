import Image from "next/image";
import Link from "next/link";
import type { ProductWithRelations } from "@/lib/supabase/types";
import { formatNaira } from "@/lib/format";

function primaryImage(product: ProductWithRelations) {
  const images = product.product_images ?? [];
  return images.find((img) => img.is_primary) ?? images[0] ?? null;
}

export default function ProductCard({ product }: { product: ProductWithRelations }) {
  const image = primaryImage(product);

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border bg-card ring-1 ring-foreground/5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:ring-foreground/10"
    >
      <div className="relative aspect-square w-full overflow-hidden bg-zinc-100">
        {image ? (
          <Image
            src={image.url}
            alt={product.name}
            fill
            sizes="(min-width: 1024px) 22vw, (min-width: 640px) 33vw, 50vw"
            className="object-contain p-5 transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">No image</div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1 border-t px-4 py-3.5">
        <span className="text-[11px] font-semibold tracking-wide text-primary uppercase">{product.brand?.name}</span>
        <h3 className="line-clamp-2 text-sm leading-snug font-medium text-foreground">{product.name}</h3>
        <p className="mt-auto pt-1 font-heading text-base font-bold text-foreground">{formatNaira(product.price)}</p>
      </div>
    </Link>
  );
}
