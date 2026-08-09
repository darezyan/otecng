import Link from "next/link";
import Image from "next/image";
import { getFeaturedProducts, getBrands, getHeroImages, getProductsByCategorySlug } from "@/lib/data/products";
import ProductGrid from "@/components/ProductGrid";
import ProductRow from "@/components/ProductRow";
import { Button } from "@/components/ui/button";

// Even 2x2 grid — two columns, two rows, consistent gaps, alternating tilt.
const HERO_TILE_STYLES = [
  "top-10 right-[32%] w-36 -rotate-6 sm:w-40",
  "top-10 right-[4%] w-36 rotate-6 sm:w-40",
  "bottom-10 right-[32%] w-36 rotate-6 sm:w-40",
  "bottom-10 right-[4%] w-36 -rotate-6 sm:w-40",
];

export default async function Home() {
  const [featured, brands, heroImages, tvs, refrigerators, freezers, acs] = await Promise.all([
    getFeaturedProducts(8),
    getBrands(),
    getHeroImages(),
    getProductsByCategorySlug("tvs", 10),
    getProductsByCategorySlug("refrigerators", 10),
    getProductsByCategorySlug("freezers", 10),
    getProductsByCategorySlug("acs", 10),
  ]);

  return (
    <div>
      {/* Full-bleed hero */}
      <section className="relative overflow-hidden bg-zinc-950 py-20 sm:py-28">
        <div
          className="absolute top-1/2 right-[10%] size-[28rem] -translate-y-1/2 rounded-full bg-primary/25 blur-[110px]"
          aria-hidden
        />

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-xl">
            <h1 className="font-heading text-4xl font-extrabold tracking-tight text-white sm:text-6xl">
              Electronics Made Easy
            </h1>
            <p className="mt-4 max-w-md text-base text-zinc-300 sm:text-lg">
              Shop quality electronics for your home, work, and everyday life.
            </p>
            <Button size="lg" className="mt-8" render={<Link href="/products">Shop all products</Link>} />
          </div>
        </div>

        <div className="pointer-events-none absolute inset-0 hidden lg:block" aria-hidden>
          {heroImages.map((url, i) => (
            <div
              key={url}
              className={`absolute overflow-hidden rounded-xl bg-zinc-100 p-2 shadow-2xl ${HERO_TILE_STYLES[i % HERO_TILE_STYLES.length]}`}
            >
              <div className="relative aspect-square w-full">
                <Image src={url} alt="" fill sizes="200px" className="object-contain" />
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <section className="mb-14">
          <h2 className="mb-4 text-xs font-semibold tracking-wide text-muted-foreground uppercase">Shop by brand</h2>
          <div className="flex flex-wrap gap-3">
            {brands.map((brand) => (
              <Link
                key={brand.id}
                href={`/products?brand=${brand.slug}`}
                className="rounded-full border bg-background px-5 py-2 text-sm font-medium text-foreground transition-colors hover:border-primary hover:text-primary"
              >
                {brand.name}
              </Link>
            ))}
          </div>
        </section>

        <ProductRow title="Televisions" href="/products?category=tvs" products={tvs} />
        <ProductRow title="Refrigerators" href="/products?category=refrigerators" products={refrigerators} />
        <ProductRow title="Freezers" href="/products?category=freezers" products={freezers} />
        <ProductRow title="Air Conditioners" href="/products?category=acs" products={acs} />

        <section>
          <div className="mb-4 flex items-baseline justify-between">
            <h2 className="font-heading text-lg font-bold text-foreground">Featured products</h2>
            <Link href="/products" className="text-sm font-medium text-primary hover:text-primary/80">
              View all &rarr;
            </Link>
          </div>
          <ProductGrid products={featured} />
        </section>
      </div>
    </div>
  );
}
