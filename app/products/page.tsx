import type { Metadata } from "next";
import { SITE_NAME } from "@/lib/site";
import { getProducts, getCategories, getBrands, getSizeFacets, PRICE_BRACKETS, SIZE_FILTER_CATEGORIES } from "@/lib/data/products";
import { getPaginationRange } from "@/lib/pagination";
import ProductGrid from "@/components/ProductGrid";
import FilterBar from "@/components/FilterBar";
import MobileFilters from "@/components/MobileFilters";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

const PAGE_SIZE = 24;

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; brand?: string; q?: string; size?: string; price?: string; page?: string }>;
}): Promise<Metadata> {
  const params = await searchParams;
  const [categories, brands] = await Promise.all([getCategories(), getBrands()]);
  const category = categories.find((c) => c.slug === params.category);
  const brand = brands.find((b) => b.slug === params.brand);

  const title = params.q
    ? `Search: ${params.q}`
    : category && brand
      ? `${brand.name} ${category.name}`
      : category
        ? category.name
        : brand
          ? `${brand.name} appliances`
          : "Shop all appliances";
  const description = params.q
    ? `Search results for "${params.q}" at ${SITE_NAME}. Genuine appliances with secure checkout and doorstep delivery.`
    : `Shop ${[brand?.name, category?.name.toLowerCase() ?? "home appliances"].filter(Boolean).join(" ")} at ${SITE_NAME}. Genuine products from trusted brands, with secure checkout and doorstep delivery in Nigeria.`;

  const canonical = new URLSearchParams();
  if (category) canonical.set("category", category.slug);
  if (brand) canonical.set("brand", brand.slug);
  const canonicalUrl = canonical.size ? `/products?${canonical}` : "/products";
  const og = new URLSearchParams(canonical);
  if (params.q) og.set("q", params.q);
  const ogImage = { url: `/og${og.size ? `?${og}` : ""}`, width: 1200, height: 630, alt: title };

  return {
    title,
    description,
    alternates: { canonical: canonicalUrl },
    // Search results and deep filter combinations shouldn't be indexed.
    robots: params.q || params.price || params.size || params.page ? { index: false, follow: true } : undefined,
    openGraph: { type: "website", url: canonicalUrl, title, description, images: [ogImage] },
    twitter: { card: "summary_large_image", title, description, images: [ogImage] },
  };
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; brand?: string; q?: string; size?: string; price?: string; page?: string }>;
}) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page ?? 1) || 1);

  const [{ products, count }, categories, brands, sizes] = await Promise.all([
    getProducts({
      categorySlug: params.category,
      brandSlug: params.brand,
      query: params.q,
      sizeBracket: params.size,
      priceBracket: params.price,
      page,
      pageSize: PAGE_SIZE,
    }),
    getCategories(),
    getBrands(),
    params.category && SIZE_FILTER_CATEGORIES.includes(params.category)
      ? getSizeFacets(params.category)
      : Promise.resolve(undefined),
  ]);

  const totalPages = Math.max(1, Math.ceil(count / PAGE_SIZE));
  const baseParams = new URLSearchParams();
  if (params.category) baseParams.set("category", params.category);
  if (params.brand) baseParams.set("brand", params.brand);
  if (params.q) baseParams.set("q", params.q);
  if (params.size) baseParams.set("size", params.size);
  if (params.price) baseParams.set("price", params.price);

  const pageHref = (p: number) => {
    const qs = new URLSearchParams(baseParams);
    qs.set("page", String(p));
    return `/products?${qs.toString()}`;
  };

  const activeCategoryName = categories.find((c) => c.slug === params.category)?.name;
  const activeBrandName = brands.find((b) => b.slug === params.brand)?.name;
  const heading = params.q
    ? `Results for "${params.q}"`
    : [activeBrandName, activeCategoryName ?? (activeBrandName ? "products" : "All products")].filter(Boolean).join(" ");
  const paginationRange = getPaginationRange(page, totalPages);

  return (
    <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8 lg:py-10">
      <h1 className="mb-4 font-heading text-xl font-bold text-foreground sm:text-2xl lg:mb-6">{heading}</h1>

      {/* Phones/tablets: products first; filters live in a full-screen sheet */}
      <div className="mb-4 flex items-center justify-between lg:hidden">
        <MobileFilters
          categories={categories}
          brands={brands}
          priceBrackets={PRICE_BRACKETS}
          sizes={sizes}
          active={{ category: params.category, brand: params.brand, price: params.price, size: params.size }}
          query={params.q}
          count={count}
        />
        <p className="text-sm text-muted-foreground">{count} products</p>
      </div>

      <div className="flex flex-col gap-8 lg:flex-row">
        <div className="hidden lg:block">
        <FilterBar
          categories={categories}
          brands={brands}
          sizes={sizes}
          activeCategory={params.category}
          activeBrand={params.brand}
          activeSize={params.size}
          activePrice={params.price}
        />
        </div>

        <div className="flex-1">
          <p className="mb-4 hidden text-sm text-muted-foreground lg:block">{count} products</p>
          <ProductGrid products={products} />

          {totalPages > 1 && (
            <Pagination className="mt-10">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious href={page > 1 ? pageHref(page - 1) : undefined} aria-disabled={page === 1} />
                </PaginationItem>

                {paginationRange.map((token, i) =>
                  token === "ellipsis" ? (
                    <PaginationItem key={`e-${i}`}>
                      <PaginationEllipsis />
                    </PaginationItem>
                  ) : (
                    <PaginationItem key={token}>
                      <PaginationLink href={pageHref(token)} isActive={token === page}>
                        {token}
                      </PaginationLink>
                    </PaginationItem>
                  )
                )}

                <PaginationItem>
                  <PaginationNext
                    href={page < totalPages ? pageHref(page + 1) : undefined}
                    aria-disabled={page === totalPages}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </div>
      </div>
    </div>
  );
}
