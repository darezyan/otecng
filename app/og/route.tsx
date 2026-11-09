import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";
import { getBrands, getCategories, getProducts } from "@/lib/data/products";
import { BrandCard, OG_SIZE, ogFonts, toPngDataUri } from "@/lib/og";

// Social preview for /products listings (category / brand / search), which
// can't use the opengraph-image file convention because they vary by query.
export async function GET(request: NextRequest) {
  const sp = request.nextUrl.searchParams;
  const q = sp.get("q")?.slice(0, 60) || undefined;

  const [categories, brands] = await Promise.all([getCategories().catch(() => []), getBrands().catch(() => [])]);
  // Only accept known slugs so arbitrary query strings can't pass through.
  const category = categories.find((c) => c.slug === sp.get("category"));
  const brand = brands.find((b) => b.slug === sp.get("brand"));

  const { products, count } = await getProducts({
    categorySlug: category?.slug,
    brandSlug: brand?.slug,
    query: q,
    pageSize: 1,
  }).catch(() => ({ products: [], count: 0 }));

  const first = products[0];
  const firstImage = first?.product_images.find((i) => i.is_primary) ?? first?.product_images[0];
  const image = await toPngDataUri(firstImage?.url);

  const title = q
    ? `Results for “${q}”`
    : [brand?.name, category?.name ?? (brand ? "appliances" : "Shop all appliances")].filter(Boolean).join(" ");

  return new ImageResponse(
    (
      <BrandCard
        eyebrow={q ? "Search" : "Shop the range"}
        title={title}
        subtitle={count ? `${count.toLocaleString()} genuine ${count === 1 ? "product" : "products"}, delivered to your door.` : undefined}
        image={image}
      />
    ),
    {
      ...OG_SIZE,
      fonts: await ogFonts(),
      headers: { "Cache-Control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800" },
    }
  );
}
