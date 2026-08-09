import type { ReactNode } from "react";
import Link from "next/link";
import { Check } from "lucide-react";
import type { Brand, Category } from "@/lib/supabase/types";
import type { SizeFacet } from "@/lib/data/products";
import { PRICE_BRACKETS } from "@/lib/data/products";
import { Separator } from "@/components/ui/separator";

function buildHref(base: Record<string, string | undefined>, overrides: Record<string, string | undefined>) {
  const params = new URLSearchParams();
  const merged = { ...base, ...overrides };
  for (const [key, value] of Object.entries(merged)) {
    if (value) params.set(key, value);
  }
  const qs = params.toString();
  return qs ? `/products?${qs}` : "/products";
}

function CheckboxLink({ href, active, label }: { href: string; active: boolean; label: ReactNode }) {
  return (
    <Link href={href} className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
      <span
        className={`flex size-4 shrink-0 items-center justify-center rounded border ${
          active ? "border-primary bg-primary text-primary-foreground" : "border-input"
        }`}
      >
        {active && <Check className="size-3" />}
      </span>
      <span className={active ? "font-medium text-foreground" : undefined}>{label}</span>
    </Link>
  );
}

export default function FilterBar({
  categories,
  brands,
  sizes,
  activeCategory,
  activeBrand,
  activeSize,
  activePrice,
}: {
  categories: Category[];
  brands: Brand[];
  sizes?: SizeFacet[];
  activeCategory?: string;
  activeBrand?: string;
  activeSize?: string;
  activePrice?: string;
}) {
  const current = { category: activeCategory, brand: activeBrand, size: activeSize, price: activePrice };

  return (
    <aside className="w-full shrink-0 space-y-6 lg:w-56">
      <div>
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Category</h3>
        <ul className="space-y-1 text-sm">
          <li>
            <Link
              href={buildHref(current, { category: undefined, size: undefined })}
              className={!activeCategory ? "font-semibold text-primary" : "text-muted-foreground hover:text-foreground"}
            >
              All categories
            </Link>
          </li>
          {categories.map((category) => (
            <li key={category.id}>
              <Link
                href={buildHref(current, {
                  category: category.slug,
                  size: category.slug === "refrigerators" ? activeSize : undefined,
                })}
                className={
                  activeCategory === category.slug
                    ? "font-semibold text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }
              >
                {category.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <Separator />

      <div>
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Price</h3>
        <ul className="space-y-1.5 text-sm">
          {PRICE_BRACKETS.map((bracket) => {
            const isActive = activePrice === bracket.value;
            return (
              <li key={bracket.value}>
                <CheckboxLink
                  href={buildHref(current, { price: isActive ? undefined : bracket.value })}
                  active={isActive}
                  label={bracket.label}
                />
              </li>
            );
          })}
        </ul>
      </div>

      <Separator />

      <div>
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Brand</h3>
        <ul className="space-y-1 text-sm">
          <li>
            <Link
              href={buildHref(current, { brand: undefined })}
              className={!activeBrand ? "font-semibold text-primary" : "text-muted-foreground hover:text-foreground"}
            >
              All brands
            </Link>
          </li>
          {brands.map((brand) => (
            <li key={brand.id}>
              <Link
                href={buildHref(current, { brand: brand.slug })}
                className={
                  activeBrand === brand.slug ? "font-semibold text-primary" : "text-muted-foreground hover:text-foreground"
                }
              >
                {brand.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {activeCategory === "refrigerators" && sizes && sizes.length > 0 && (
        <>
          <Separator />
          <div>
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Size</h3>
            <ul className="space-y-1.5 text-sm">
              {sizes.map((size) => {
                const isActive = activeSize === size.value;
                return (
                  <li key={size.value}>
                    <CheckboxLink
                      href={buildHref(current, { size: isActive ? undefined : size.value })}
                      active={isActive}
                      label={
                        <>
                          {size.label} <span className="text-xs text-muted-foreground">({size.count})</span>
                        </>
                      }
                    />
                  </li>
                );
              })}
            </ul>
          </div>
        </>
      )}
    </aside>
  );
}
