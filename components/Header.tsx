import Link from "next/link";
import Image from "next/image";
import { Suspense } from "react";
import { ChevronDown, ShieldCheck, Truck } from "lucide-react";
import { getBrands, getCategories, getCategoryMenuData, getRefrigeratorSizeFacets } from "@/lib/data/products";
import CartBadge from "./CartBadge";
import Logo from "./Logo";
import NavAutoClose from "./NavAutoClose";
import SearchBar from "./SearchBar";

const PRIORITY_CATEGORY_SLUGS = ["tvs", "refrigerators", "freezers", "acs", "washing-machines"];

const triggerClass =
  "flex h-11 items-center gap-1 border-b-2 border-transparent px-3 text-sm font-medium text-foreground/75 outline-none transition-colors hover:text-foreground group-hover/item:border-primary group-hover/item:text-foreground";
const chevronClass = "size-3.5 text-muted-foreground transition-transform group-hover/item:rotate-180";
const panelWrapClass =
  "nav-panel invisible absolute inset-x-0 top-full z-50 opacity-0 transition-opacity duration-150 group-hover/item:visible group-hover/item:opacity-100 group-focus-within/item:visible group-focus-within/item:opacity-100";
const panelClass = "border-y bg-background shadow-[0_24px_48px_-24px_rgb(15_23_42/0.25)]";
const panelInnerClass = "mx-auto max-w-7xl px-4 py-7 sm:px-6 lg:px-8";
const panelHeadingClass = "mb-3 text-[11px] font-semibold tracking-[0.08em] text-muted-foreground uppercase";
const linkClass =
  "block rounded-md px-2 py-1.5 text-sm text-foreground/80 transition-colors hover:bg-muted hover:text-foreground";

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
    <header className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/85">
      {/* Utility bar */}
      <div className="bg-ink text-white/80">
        <div className="mx-auto flex h-9 max-w-7xl items-center justify-center gap-6 px-4 text-xs sm:justify-between sm:px-6 lg:px-8">
          <p className="flex items-center gap-1.5">
            <ShieldCheck className="size-3.5 text-primary" aria-hidden />
            Genuine appliances from {brands.length} trusted brands
          </p>
          <p className="hidden items-center gap-1.5 sm:flex">
            <Truck className="size-3.5 text-primary" aria-hidden />
            Doorstep delivery · Secure payment with Paystack
          </p>
        </div>
      </div>

      {/* Logo, search, cart */}
      <div className="border-b">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3.5 sm:gap-8 sm:px-6 lg:px-8">
          <Logo />

          <Suspense fallback={<div className="hidden max-w-2xl flex-1 sm:block" />}>
            <SearchBar className="hidden max-w-2xl flex-1 sm:block" />
          </Suspense>

          <div className="ml-auto flex items-center gap-1">
            <Link
              href="/products"
              className="hidden rounded-md px-3 py-2 text-sm font-medium text-foreground/75 transition-colors hover:bg-muted hover:text-foreground md:block"
            >
              All products
            </Link>
            <CartBadge />
          </div>
        </div>

        {/* Mobile search */}
        <div className="px-4 pb-3 sm:hidden">
          <Suspense fallback={<div className="h-10" />}>
            <SearchBar />
          </Suspense>
        </div>
      </div>

      {/* Mobile / tablet: simple scrollable category strip (hover menus don't
          work on touch). */}
      <nav aria-label="Categories" className="border-b lg:hidden">
        <ul className="no-scrollbar mx-auto flex max-w-7xl gap-1 overflow-x-auto px-3 sm:px-5">
          {[...priority, ...rest].map((category) => (
            <li key={category.id} className="shrink-0">
              <Link
                href={`/products?category=${category.slug}`}
                className="block px-2.5 py-2.5 text-sm font-medium whitespace-nowrap text-foreground/75 hover:text-foreground"
              >
                {category.name}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Desktop: category + brand mega-menu. Every dropdown panel is
          positioned relative to this single wide container, so it always
          spans the full nav width no matter which trigger opened it. */}
      <div className="hidden border-b lg:block">
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <NavAutoClose>
            <nav aria-label="Main" className="-ml-3 flex items-center">
              {priorityMenus.map(({ category, brands: categoryBrands, thumbnail, sizes }) => (
                <div key={category.id} className="group/item">
                  <button type="button" className={triggerClass}>
                    {category.name}
                    <ChevronDown className={chevronClass} />
                  </button>
                  <div className={panelWrapClass}>
                    <div className={panelClass}>
                      <div className={`${panelInnerClass} flex gap-10`}>
                        {thumbnail && (
                          <Link
                            href={`/products?category=${category.slug}`}
                            className="group/thumb flex w-56 shrink-0 flex-col overflow-hidden rounded-xl border bg-surface"
                          >
                            <div className="relative aspect-[4/3] w-full">
                              <Image
                                src={thumbnail}
                                alt=""
                                fill
                                sizes="224px"
                                className="object-contain p-4 mix-blend-multiply transition-transform duration-300 group-hover/thumb:scale-105"
                              />
                            </div>
                            <span className="border-t bg-background px-4 py-2.5 text-sm font-semibold text-foreground">
                              Shop all {category.name} &rarr;
                            </span>
                          </Link>
                        )}
                        {sizes.length > 0 && (
                          <div className="w-48 shrink-0">
                            <p className={panelHeadingClass}>By size</p>
                            <ul className="space-y-0.5">
                              {sizes.map((size) => (
                                <li key={size.value}>
                                  <Link
                                    href={`/products?category=${category.slug}&size=${size.value}`}
                                    className={linkClass}
                                  >
                                    {size.label}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <p className={panelHeadingClass}>Shop by brand</p>
                          <ul className="grid grid-cols-3 gap-x-8 gap-y-0.5">
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
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {rest.length > 0 && (
                <div className="group/item">
                  <button type="button" className={triggerClass}>
                    More categories
                    <ChevronDown className={chevronClass} />
                  </button>
                  <div className={panelWrapClass}>
                    <div className={panelClass}>
                      <div className={panelInnerClass}>
                        <p className={panelHeadingClass}>All categories</p>
                        <ul className="grid grid-cols-4 gap-x-8 gap-y-0.5">
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
                </div>
              )}

              <div className="group/item">
                <button type="button" className={triggerClass}>
                  Brands
                  <ChevronDown className={chevronClass} />
                </button>
                <div className={panelWrapClass}>
                  <div className={panelClass}>
                    <div className={panelInnerClass}>
                      <p className={panelHeadingClass}>Our brands</p>
                      <ul className="grid grid-cols-4 gap-3">
                        {brands.map((brand) => (
                          <li key={brand.id}>
                            <Link
                              href={`/products?brand=${brand.slug}`}
                              className="flex h-16 items-center justify-center rounded-lg border font-heading text-base font-bold text-foreground transition-colors hover:border-primary hover:text-primary"
                            >
                              {brand.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
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
