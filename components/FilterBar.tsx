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

const headingClass = "mb-3 text-[11px] font-semibold tracking-[0.08em] text-muted-foreground uppercase";
const optionClass = (active: boolean) =>
  `block rounded-md px-2 py-1.5 transition-colors ${
    active ? "bg-primary/10 font-semibold text-primary" : "text-foreground/75 hover:bg-muted hover:text-foreground"
  }`;

function CheckboxLink({ href, active, label }: { href: string; active: boolean; label: ReactNode }) {
  return (
    <Link href={href} className="flex items-center gap-2.5 rounded-md px-2 py-1 text-foreground/75 hover:text-foreground">
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
    <div className="space-y-6">
      <div>
        <h3 className={headingClass}>Category</h3>
        <ul className="space-y-0.5 text-sm">
          <li>
            <Link
              href={buildHref(current, { category: undefined, size: undefined })}
              className={optionClass(!activeCategory)}
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
                className={optionClass(activeCategory === category.slug)}
              >
                {category.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <Separator />

      <div>
        <h3 className={headingClass}>Price</h3>
        <ul className="space-y-0.5 text-sm">
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
        <h3 className={headingClass}>Brand</h3>
        <ul className="space-y-0.5 text-sm">
          <li>
            <Link
              href={buildHref(current, { brand: undefined })}
              className={optionClass(!activeBrand)}
            >
              All brands
            </Link>
          </li>
          {brands.map((brand) => (
            <li key={brand.id}>
              <Link
                href={buildHref(current, { brand: brand.slug })}
                className={optionClass(activeBrand === brand.slug)}
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
            <h3 className={headingClass}>Size</h3>
            <ul className="space-y-0.5 text-sm">
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
    </div>
  );
}
