import Link from "next/link";
import Image from "next/image";
import { Suspense } from "react";
import { ChevronDown } from "lucide-react";
import { getBrands, getCategories, getCategoryMenuData, getRefrigeratorSizeFacets } from "@/lib/data/products";
import CartBadge from "./CartBadge";
import NavAutoClose from "./NavAutoClose";
import SearchBar from "./SearchBar";

const PRIORITY_CATEGORY_SLUGS = ["tvs", "refrigerators", "freezers", "acs", "washing-machines"];

const triggerClass =
  "flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-sm font-medium text-foreground/80 outline-none hover:bg-muted hover:text-foreground group-hover/item:bg-muted group-hover/item:text-foreground";
const chevronClass = "size-3.5 text-muted-foreground transition-transform group-hover/item:rotate-180";
const panelWrapClass =
  "nav-panel invisible absolute inset-x-0 top-full z-50 opacity-0 transition-opacity duration-150 group-hover/item:visible group-hover/item:opacity-100 group-focus-within/item:visible group-focus-within/item:opacity-100";
const panelClass = "border-t bg-background shadow-lg";
const panelInnerClass = "mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8";
const linkClass = "block rounded-md px-2 py-1 text-sm text-foreground/80 hover:bg-muted hover:text-foreground";

export default async function Header() {
  const [categories, brands] = await Promise.all([getCategories(), getBrands()]);

  const priority = PRIORITY_CATEGORY_SLUGS.map((slug) => categories.find((c) => c.slug === slug)).filter(
    (c): c is NonNullable<typeof c> => Boolean(c)
  );
  const rest = categories.filter((c) => !PRIORITY_CATEGORY_SLUGS.includes(c.slug));

  const priorityMenus = await Promise.all(
    priority.map(async (category) => ({
      category,
      ...(await getCategoryMenuData(category.slug, brands)),
      sizes: category.slug === "refrigerators" ? await getRefrigeratorSizeFacets() : [],
    }))
  );

  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/80">
      {/* Row 1: logo + search */}
      <div className="mx-auto flex max-w-7xl items-center gap-6 px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="shrink-0 font-heading text-2xl font-extrabold tracking-tight text-foreground">
          otec<span className="text-primary">ng</span>
        </Link>

        <Suspense fallback={<div className="hidden flex-1 max-w-xl sm:block" />}>
          <SearchBar />
        </Suspense>

        <Link
          href="/products"
          className="ml-auto shrink-0 text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          All products
        </Link>
        <CartBadge />
      </div>

      {/* Row 2: category + brand navigation. Every dropdown panel is
          positioned relative to this single wide container, so it always
          spans the full nav width no matter which trigger opened it. */}
      <div className="border-t">
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <NavAutoClose>
          <nav className="flex flex-wrap items-center gap-1 py-1">
            {priorityMenus.map(({ category, brands: categoryBrands, thumbnail, sizes }) => (
              <div key={category.id} className="group/item">
                <button type="button" className={triggerClass}>
                  {category.name}
                  <ChevronDown className={chevronClass} />
                </button>
                <div className={panelWrapClass}>
                  <div className={panelClass}>
                    <div className={`${panelInnerClass} flex gap-6`}>
                      {thumbnail && (
                        <div className="relative hidden w-32 shrink-0 overflow-hidden rounded-lg bg-muted sm:block">
                          <Image src={thumbnail} alt="" fill sizes="128px" className="object-contain p-3" />
                        </div>
                      )}
                      {sizes.length > 0 && (
                        <div className="min-w-0 flex-1">
                          <p className="mb-3 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                            By size
                          </p>
                          <ul className="space-y-1">
                            {sizes.map((size) => (
                              <li key={size.value}>
                                <Link href={`/products?category=${category.slug}&size=${size.value}`} className={linkClass}>
                                  {size.label}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="mb-3 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                          Shop by brand
                        </p>
                        <ul className="grid grid-cols-2 gap-x-8 gap-y-1 sm:grid-cols-4">
                          {categoryBrands.map((brand) => (
                            <li key={brand.id}>
                              <Link
                                href={`/products?category=${category.slug}&brand=${brand.slug}`}
                                className={linkClass}
                              >
                                {brand.name}
                              </Link>
                            </li>
                          ))}
                        </ul>
                        <Link
                          href={`/products?category=${category.slug}`}
                          className="mt-3 inline-block px-2 text-sm font-semibold text-primary hover:text-primary/80"
                        >
                          View all {category.name} &rarr;
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {rest.length > 0 && (
              <div className="group/item">
                <button type="button" className={triggerClass}>
                  Categories
                  <ChevronDown className={chevronClass} />
                </button>
                <div className={panelWrapClass}>
                  <div className={panelClass}>
                    <ul className={`${panelInnerClass} grid grid-cols-2 gap-1 sm:grid-cols-4`}>
                      {rest.map((category) => (
                        <li key={category.id}>
                          <Link href={`/products?category=${category.slug}`} className={linkClass}>
                            {category.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            <div className="group/item">
              <button type="button" className={triggerClass}>
                Brands
                <ChevronDown className={chevronClass} />
              </button>
              <div className={panelWrapClass}>
                <div className={panelClass}>
                  <ul className={`${panelInnerClass} grid grid-cols-2 gap-1 sm:grid-cols-4`}>
                    {brands.map((brand) => (
                      <li key={brand.id}>
                        <Link href={`/products?brand=${brand.slug}`} className={linkClass}>
                          {brand.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </nav>
          </NavAutoClose>
        </div>
      </div>
    </header>
  );
}
