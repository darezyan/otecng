import {
  getProducts,
  getCategories,
  getBrands,
  getSizeFacets,
  PRICE_BRACKETS,
  SIZE_FILTER_CATEGORIES,
} from "@/lib/data/products";
import { getPaginationRange } from "@/lib/pagination";
import type { Metadata } from "next";
import Link from "next/link";
import { SITE_NAME } from "@/lib/site";
import { ChevronRight, SlidersHorizontal, X } from "lucide-react";
import ProductGrid from "@/components/ProductGrid";
import FilterBar from "@/components/FilterBar";
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

type ListingParams = { category?: string; brand?: string; q?: string; size?: string; price?: string; page?: string };

export async function generateMetadata({ searchParams }: { searchParams: Promise<ListingParams> }): Promise<Metadata> {
  const params = await searchParams;
  const [categories, brands] = await Promise.all([getCategories(), getBrands()]);
  const category = categories.find((c) => c.slug === params.category);
  const brand = brands.find((b) => b.slug === params.brand);

  const title = params.q
    ? `Search: ${params.q}`
    : category && brand
      ? `${brand.name} ${category.name}`
      : category
        ? `${category.name}: shop genuine ${category.name.toLowerCase()}`
        : brand
          ? `${brand.name} appliances`
          : "Shop all appliances";
  const description = params.q
    ? `Search results for "${params.q}" at ${SITE_NAME}. Genuine appliances, secure checkout with Squad by GTCO and doorstep delivery.`
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
  searchParams: Promise<ListingParams>;
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

  const activeCategory = categories.find((c) => c.slug === params.category);
  const activeBrand = brands.find((b) => b.slug === params.brand);
  const heading = params.q
    ? `Results for “${params.q}”`
    : [activeBrand?.name, activeCategory?.name ?? (activeBrand ? "products" : "All products")]
        .filter(Boolean)
        .join(" ");
  const paginationRange = getPaginationRange(page, totalPages);

  const without = (key: string) => {
    const qs = new URLSearchParams(baseParams);
    qs.delete(key);
    if (key === "category") qs.delete("size");
    const str = qs.toString();
    return str ? `/products?${str}` : "/products";
  };
  const chips = [
    params.q && { key: "q", label: `“${params.q}”` },
    activeCategory && { key: "category", label: activeCategory.name },
    activeBrand && { key: "brand", label: activeBrand.name },
    params.price && { key: "price", label: PRICE_BRACKETS.find((b) => b.value === params.price)?.label ?? params.price },
    params.size && {
      key: "size",
      label: sizes?.find((b) => b.value === params.size)?.label ?? params.size,
    },
  ].filter((c): c is { key: string; label: string } => Boolean(c));

  const filters = (
    <FilterBar
      categories={categories}
      brands={brands}
      sizes={sizes}
      activeCategory={params.category}
      activeBrand={params.brand}
      activeSize={params.size}
      activePrice={params.price}
    />
  );
  const start = count === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const end = Math.min(page * PAGE_SIZE, count);

  return (
    <div>
      <div className="border-b bg-surface">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-xs text-muted-foreground">
            <Link href="/" className="hover:text-foreground">
              Home
            </Link>
            <ChevronRight className="size-3" aria-hidden />
            <Link href="/products" className="hover:text-foreground">
              Products
            </Link>
            {activeCategory && (
              <>
                <ChevronRight className="size-3" aria-hidden />
                <span className="text-foreground">{activeCategory.name}</span>
              </>
            )}
          </nav>
          <h1 className="mt-3 font-heading text-2xl font-bold text-foreground sm:text-3xl">{heading}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {count.toLocaleString()} {count === 1 ? "product" : "products"}
          </p>
        </div>
      </div>

      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-8 sm:px-6 lg:flex-row lg:px-8">
        <details className="group rounded-xl border lg:hidden">
          <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3 text-sm font-semibold text-foreground [&::-webkit-details-marker]:hidden">
            <span className="flex items-center gap-2">
              <SlidersHorizontal className="size-4" aria-hidden /> Filters
              {chips.length > 0 && (
                <span className="rounded-full bg-primary px-1.5 text-[11px] text-primary-foreground">{chips.length}</span>
              )}
            </span>
            <ChevronRight className="size-4 transition-transform group-open:rotate-90" aria-hidden />
          </summary>
          <div className="border-t p-4">{filters}</div>
        </details>
        <aside className="hidden w-60 shrink-0 lg:block">
          <div className="sticky top-44">{filters}</div>
        </aside>

        <div className="min-w-0 flex-1">
          <div className="mb-5 flex flex-wrap items-center gap-2">
            {chips.map((chip) => (
              <Link
                key={chip.key}
                href={without(chip.key)}
                className="inline-flex items-center gap-1.5 rounded-full border bg-background py-1 pr-2 pl-3 text-xs font-medium text-foreground hover:border-foreground/30"
              >
                {chip.label}
                <X className="size-3.5 text-muted-foreground" aria-label="Remove filter" />
              </Link>
            ))}
            {chips.length > 1 && (
              <Link href="/products" className="text-xs font-semibold text-primary hover:underline">
                Clear all
              </Link>
            )}
            {count > 0 && (
              <p className="ml-auto text-xs text-muted-foreground">
                Showing {start}–{end} of {count.toLocaleString()}
              </p>
            )}
          </div>
          <ProductGrid products={products} columns="grid-cols-2 sm:grid-cols-3 xl:grid-cols-4" />
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
