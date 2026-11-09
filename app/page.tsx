import Link from "next/link";
import Image from "next/image";
import {
  getBrands,
  getHeroImages,
  getCategoryTiles,
  getFeaturedProducts,
  getProductsByCategorySlug,
} from "@/lib/data/products";
import { formatNaira } from "@/lib/format";
import ProductGrid from "@/components/ProductGrid";
import ProductRow, { SectionHeader } from "@/components/ProductRow";

// Re-fetch catalogue data hourly so prices and new products show up without a redeploy.
export const revalidate = 3600;

function primaryImageUrl(images: { url: string; is_primary: boolean; position: number }[]) {
  return (images.find((i) => i.is_primary) ?? [...images].sort((a, b) => a.position - b.position)[0])?.url ?? null;
}

export default async function Home() {
  const [featured, brands, categories, heroImages, tvs, refrigerators, freezers, acs] = await Promise.all([
    getFeaturedProducts(8),
    getBrands(),
    getCategoryTiles(),
    getHeroImages(),
    getProductsByCategorySlug("tvs", 12),
    getProductsByCategorySlug("refrigerators", 12),
    getProductsByCategorySlug("freezers", 12),
    getProductsByCategorySlug("acs", 12),
  ]);

  const heroProduct = refrigerators[0];
  const heroImage = heroProduct ? primaryImageUrl(heroProduct.product_images) : null;

  // Side tiles: a representative photo (curated in getHeroImages: TV first,
  // Hisense AC last) plus the category's real product count.
  const sideTiles = [
    { slug: "tvs", image: heroImages[0] ?? null },
    { slug: "acs", image: heroImages[3] ?? null },
  ]
    .map((t) => ({ ...t, category: categories.find((c) => c.slug === t.slug) }))
    .filter((t) => t.category);

  return (
    <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8">
      {/* Hero: one static banner + two category tiles (no carousel) */}
      <section className="grid gap-4 lg:grid-cols-3">
        <div className="relative overflow-hidden rounded-xl bg-zinc-950 lg:col-span-2">
          <div className="grid h-full items-center gap-6 p-7 sm:p-10 md:grid-cols-2">
            <div>
              <h1 className="font-heading text-4xl leading-[1.05] font-extrabold tracking-tight text-white sm:text-5xl">
                Electronics Made Easy
              </h1>
              <p className="mt-4 max-w-sm text-base text-zinc-300">
                Shop quality electronics for your home, work, and everyday life.
              </p>
              <Link
                href="/products"
                className="mt-7 inline-flex h-11 items-center rounded-md bg-primary px-6 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Shop all products
              </Link>
            </div>

            {heroProduct && heroImage && (
              <Link href={`/products/${heroProduct.slug}`} className="group hidden rounded-lg bg-white p-4 md:block">
                <div className="relative aspect-[4/3] w-full">
                  <Image
                    src={heroImage}
                    alt={heroProduct.name}
                    fill
                    priority
                    sizes="(min-width: 1024px) 28vw, 40vw"
                    className="object-contain"
                  />
                </div>
                <div className="mt-3 flex items-end justify-between gap-3 border-t border-zinc-100 pt-3">
                  <span className="line-clamp-1 text-sm text-zinc-600">{heroProduct.name}</span>
                  <span className="shrink-0 font-heading text-base font-bold text-zinc-950">
                    {formatNaira(heroProduct.price)}
                  </span>
                </div>
              </Link>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-1">
          {sideTiles.map(({ slug, image, category }) => (
            <Link
              key={slug}
              href={`/products?category=${slug}`}
              className="group flex flex-col-reverse gap-3 rounded-xl border border-zinc-200 bg-white p-4 transition-colors hover:border-zinc-400 sm:flex-row sm:items-center sm:gap-4 sm:p-5"
            >
              <div className="min-w-0 flex-1">
                <p className="font-heading text-base font-bold text-zinc-950 sm:text-lg">{category!.name}</p>
                <p className="mt-0.5 text-sm text-zinc-500">{category!.count} products</p>
                <span className="mt-3 inline-block text-sm font-semibold text-zinc-900 group-hover:underline">
                  Shop now
                </span>
              </div>
              {image && (
                <div className="relative aspect-square w-full shrink-0 sm:size-32 sm:w-32">
                  <Image src={image} alt="" fill sizes="(min-width: 640px) 128px, 45vw" className="object-contain" />
                </div>
              )}
            </Link>
          ))}
        </div>
      </section>

      {/* Shop by category */}
      <section className="mt-12 mb-12">
        <SectionHeader title="Shop by category" />
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {categories.map((category) => (
            <li key={category.id}>
              <Link
                href={`/products?category=${category.slug}`}
                className="flex items-center gap-3 rounded-lg border border-zinc-200 bg-white p-2.5 transition-colors hover:border-zinc-400"
              >
                <span className="relative size-14 shrink-0 overflow-hidden rounded-md bg-white">
                  {category.image && (
                    <Image src={category.image} alt="" fill sizes="56px" className="object-contain" />
                  )}
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold text-zinc-900">{category.name}</span>
                  <span className="block text-xs text-zinc-500">{category.count} products</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <ProductRow title="Televisions" href="/products?category=tvs" products={tvs} />
      <ProductRow title="Refrigerators" href="/products?category=refrigerators" products={refrigerators} />
      <ProductRow title="Freezers" href="/products?category=freezers" products={freezers} />
      <ProductRow title="Air Conditioners" href="/products?category=acs" products={acs} />

      {/* Brands */}
      <section className="mb-12">
        <SectionHeader title="Shop by brand" />
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
          {brands.map((brand) => (
            <li key={brand.id}>
              <Link
                href={`/products?brand=${brand.slug}`}
                className="flex h-16 items-center justify-center rounded-lg border border-zinc-200 bg-white font-heading text-base font-bold text-zinc-900 transition-colors hover:border-zinc-400"
              >
                {brand.name}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <SectionHeader title="Featured products" href="/products" />
        <ProductGrid products={featured} />
      </section>
    </div>
  );
}
