import { getProducts, getCategories, getBrands, getSizeFacets, SIZE_FILTER_CATEGORIES } from "@/lib/data/products";
import { getPaginationRange } from "@/lib/pagination";
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

  const heading = params.q ? `Results for "${params.q}"` : "All products";
  const paginationRange = getPaginationRange(page, totalPages);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="mb-6 font-heading text-2xl font-bold text-foreground">{heading}</h1>

      <div className="flex flex-col gap-8 lg:flex-row">
        <FilterBar
          categories={categories}
          brands={brands}
          sizes={sizes}
          activeCategory={params.category}
          activeBrand={params.brand}
          activeSize={params.size}
          activePrice={params.price}
        />

        <div className="flex-1">
          <p className="mb-4 text-sm text-muted-foreground">{count} products</p>
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
