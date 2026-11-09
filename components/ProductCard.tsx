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
      className="group flex h-full flex-col overflow-hidden rounded-xl border bg-card transition-[border-color,box-shadow] duration-200 hover:border-foreground/15 hover:shadow-[0_12px_32px_-16px_rgb(15_23_42/0.3)]"
    >
      <div className="relative aspect-square w-full overflow-hidden bg-surface">
        {image ? (
          <Image
            src={image.url}
            alt={product.name}
            fill
            sizes="(min-width: 1024px) 22vw, (min-width: 640px) 33vw, 50vw"
            className="object-contain p-6 mix-blend-multiply transition-transform duration-500 group-hover:scale-[1.04]"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">No image</div>
        )}
        {product.category?.name && (
          <span className="absolute top-3 left-3 rounded-md bg-background/90 px-2 py-0.5 text-[11px] font-medium text-muted-foreground ring-1 ring-border">
            {product.category.name}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1.5 p-4">
        <span className="text-[11px] font-semibold tracking-[0.08em] text-muted-foreground uppercase">
          {product.brand?.name}
        </span>
        <h3 className="line-clamp-2 text-sm leading-snug font-medium text-foreground group-hover:text-primary">
          {product.name}
        </h3>
        <p className="mt-auto pt-2 font-heading text-[1.05rem] font-bold tracking-tight text-foreground">
          {formatNaira(product.price)}
        </p>
      </div>
    </Link>
  );
}
