import Image from "next/image";
import Link from "next/link";
import type { ProductWithRelations } from "@/lib/supabase/types";
import { formatNaira } from "@/lib/format";
import QuickAddButton from "./QuickAddButton";

function primaryImage(product: ProductWithRelations) {
  const images = product.product_images ?? [];
  return images.find((img) => img.is_primary) ?? images[0] ?? null;
}

export default function ProductCard({ product }: { product: ProductWithRelations }) {
  const image = primaryImage(product);
  const href = `/products/${product.slug}`;

  return (
    <div className="group flex h-full flex-col rounded-lg border border-zinc-200 bg-white p-3 transition-colors hover:border-zinc-400">
      <Link href={href} className="relative block aspect-square w-full overflow-hidden rounded-md bg-white">
        {image ? (
          <Image
            src={image.url}
            alt={product.name}
            fill
            sizes="(min-width: 1024px) 22vw, (min-width: 640px) 33vw, 50vw"
            className="object-contain p-2"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-zinc-400">No image</div>
        )}
      </Link>

      <div className="mt-3 flex flex-1 flex-col">
        <span className="text-xs text-zinc-500">{product.brand?.name}</span>
        {/* line-clamp-2 without a min-h-*: see PROJECT_SUMMARY.md */}
        <Link href={href} className="mt-0.5 line-clamp-2 text-sm leading-snug text-zinc-900 hover:underline">
          {product.name}
        </Link>
        <p className="mt-auto pt-3 font-heading text-lg font-bold text-zinc-950">{formatNaira(product.price)}</p>
        <div className="mt-3">
          <QuickAddButton
            line={{
              productId: product.id,
              slug: product.slug,
              name: product.name,
              price: product.price,
              image: image?.url ?? null,
              brandName: product.brand?.name ?? "",
            }}
          />
        </div>
      </div>
    </div>
  );
}
