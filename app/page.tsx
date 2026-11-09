import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import {
  getBrands,
  getCategoryTiles,
  getFeaturedProducts,
  getHeroImages,
  getProductsByCategorySlug,
} from "@/lib/data/products";
import ProductGrid from "@/components/ProductGrid";
import ProductRow, { SectionHeading } from "@/components/ProductRow";
import TrustStrip from "@/components/TrustStrip";
import { Button } from "@/components/ui/button";

// Re-fetch catalogue data hourly so prices and new products show up without a redeploy.
export const revalidate = 3600;

const HERO_LABELS = ["Televisions", "Refrigerators", "Freezers", "Air conditioners"];

export default async function Home() {
  const [featured, brands, heroImages, categoryTiles, tvs, refrigerators, freezers, acs] = await Promise.all([
    getFeaturedProducts(8),
    getBrands(),
    getHeroImages(),
    getCategoryTiles(),
    getProductsByCategorySlug("tvs", 10),
    getProductsByCategorySlug("refrigerators", 10),
    getProductsByCategorySlug("freezers", 10),
    getProductsByCategorySlug("acs", 10),
  ]);
  const totalProducts = categoryTiles.reduce((sum, c) => sum + c.count, 0);

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-ink">
        <div
          className="absolute -top-40 right-0 size-[36rem] rounded-full bg-primary/20 blur-[140px]"
          aria-hidden
        />
        <div
          className="absolute inset-0 opacity-[0.06] [background-image:linear-gradient(to_right,white_1px,transparent_1px),linear-gradient(to_bottom,white_1px,transparent_1px)] [background-size:56px_56px]"
          aria-hidden
        />

        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 pt-14 pb-24 sm:px-6 sm:pt-20 lg:grid-cols-12 lg:px-8 lg:pb-32">
          <div className="lg:col-span-6">
            <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-medium text-white/80">
              <span className="size-1.5 rounded-full bg-primary" aria-hidden />
              {totalProducts > 0 ? `${totalProducts.toLocaleString()}+ products from ${brands.length} trusted brands` : "Trusted appliance brands"}
            </p>
            <h1 className="mt-6 font-heading text-4xl leading-[1.05] font-extrabold text-white sm:text-6xl">
              Home appliances,
              <br />
              <span className="text-primary">made simple.</span>
            </h1>
            <p className="mt-5 max-w-lg text-base leading-7 text-white/70 sm:text-lg">
              Shop genuine TVs, refrigerators, freezers, air conditioners and more at honest prices. Pay securely
              and get it delivered to your door.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Button
                size="lg"
                className="h-12 px-6 text-sm font-semibold"
                nativeButton={false}
                render={
                  <Link href="/products">
                    Shop all products <ArrowRight />
                  </Link>
                }
              />
              <Button
                size="lg"
                variant="outline"
                className="h-12 border-white/20 bg-transparent px-6 text-sm font-semibold text-white hover:bg-white/10 hover:text-white"
                nativeButton={false}
                render={<Link href="#categories">Browse categories</Link>}
              />
            </div>
          </div>

          {heroImages.length > 0 && (
            <div className="hidden lg:col-span-6 lg:block">
              <div className="grid grid-cols-2 gap-4">
                {heroImages.slice(0, 4).map((url, i) => (
                  <div
                    key={url}
                    className={`rounded-2xl bg-white p-5 shadow-2xl shadow-black/30 ${i % 2 === 1 ? "translate-y-8" : ""}`}
                  >
                    <div className="relative aspect-[4/3] w-full">
                      <Image src={url} alt="" fill sizes="280px" priority={i < 2} className="object-contain" />
                    </div>
                    <p className="mt-3 text-xs font-semibold tracking-[0.08em] text-muted-foreground uppercase">
                      {HERO_LABELS[i]}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative z-10 -mt-12 mb-16 shadow-[0_20px_40px_-24px_rgb(15_23_42/0.35)]">
          <TrustStrip />
        </div>

        {/* Categories */}
        <section id="categories" className="mb-16 scroll-mt-40">
          <SectionHeading eyebrow="Browse" title="Shop by category" href="/products" linkLabel="All products" />
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-6">
            {categoryTiles.map((category) => (
              <li key={category.id}>
                <Link
                  href={`/products?category=${category.slug}`}
                  className="group flex h-full flex-col overflow-hidden rounded-xl border bg-surface transition-[border-color,box-shadow] hover:border-foreground/15 hover:shadow-[0_12px_32px_-16px_rgb(15_23_42/0.3)]"
                >
                  <div className="relative aspect-[4/3] w-full">
                    {category.image && (
                      <Image
                        src={category.image}
                        alt=""
                        fill
                        sizes="(min-width: 1024px) 15vw, (min-width: 640px) 30vw, 45vw"
                        className="object-contain p-5 mix-blend-multiply transition-transform duration-500 group-hover:scale-105"
                      />
                    )}
                  </div>
                  <div className="flex items-center justify-between gap-2 border-t bg-background px-4 py-3">
                    <span>
                      <span className="block text-sm font-semibold text-foreground">{category.name}</span>
                      <span className="block text-xs text-muted-foreground">{category.count} products</span>
                    </span>
                    <ArrowRight className="size-4 shrink-0 text-muted-foreground transition-all group-hover:translate-x-0.5 group-hover:text-primary" />
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <ProductRow eyebrow="Entertainment" title="Televisions" href="/products?category=tvs" products={tvs} />
        <ProductRow eyebrow="Cooling" title="Refrigerators" href="/products?category=refrigerators" products={refrigerators} />

        {/* Brands */}
        <section className="mb-16 rounded-2xl bg-surface p-6 sm:p-10">
          <div className="grid items-center gap-8 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <p className="mb-1 text-[11px] font-semibold tracking-[0.1em] text-primary uppercase">Our brands</p>
              <h2 className="font-heading text-xl font-bold text-foreground sm:text-2xl">Brands you already trust</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Every product we sell is an original unit from the manufacturer&apos;s range.
              </p>
            </div>
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:col-span-8">
              {brands.map((brand) => (
                <li key={brand.id}>
                  <Link
                    href={`/products?brand=${brand.slug}`}
                    className="flex h-20 items-center justify-center rounded-xl border bg-background font-heading text-lg font-bold text-foreground transition-colors hover:border-primary hover:text-primary"
                  >
                    {brand.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <ProductRow eyebrow="Storage" title="Freezers" href="/products?category=freezers" products={freezers} />
        <ProductRow eyebrow="Climate" title="Air conditioners" href="/products?category=acs" products={acs} />

        <section>
          <SectionHeading eyebrow="Hand-picked" title="Featured products" href="/products" />
          <ProductGrid products={featured} />
        </section>
      </div>
    </div>
  );
}
