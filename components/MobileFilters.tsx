"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check, ChevronRight, SlidersHorizontal } from "lucide-react";
import type { Brand, Category } from "@/lib/supabase/types";
import type { SizeFacet } from "@/lib/data/products";

type Option = { value: string; label: string };
type Selection = { category?: string; brand?: string; price?: string; size?: string };
type Panel = "main" | "category" | "brand";

// Phone/tablet filters, modelled on Jumia's mobile flow: a "Filter" button
// opens a full-screen sheet; Category and Brand drill into their own lists;
// nothing reloads until "Show results". Desktop keeps the sidebar FilterBar.
export default function MobileFilters({
  categories,
  brands,
  priceBrackets,
  sizes,
  active,
  query,
  sort,
  count,
}: {
  categories: Category[];
  brands: Brand[];
  priceBrackets: Option[];
  sizes?: SizeFacet[];
  active: Selection;
  query?: string;
  sort?: string;
  count: number;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [panel, setPanel] = useState<Panel>("main");
  const [sel, setSel] = useState<Selection>(active);

  const activeCount = Object.values(active).filter(Boolean).length;

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  function openSheet() {
    setSel(active);
    setPanel("main");
    setOpen(true);
  }

  function apply(next: Selection) {
    const qs = new URLSearchParams();
    if (query) qs.set("q", query);
    if (sort && sort !== "newest") qs.set("sort", sort);
    for (const [k, v] of Object.entries(next)) if (v) qs.set(k, v);
    setOpen(false);
    router.push(qs.size ? `/products?${qs}` : "/products");
  }

  // Size brackets belong to the category currently on screen; hide them if
  // the shopper picks a different category in the sheet.
  const showSizes = sizes && sizes.length > 0 && sel.category === active.category;
  const categoryName = categories.find((c) => c.slug === sel.category)?.name;
  const brandName = brands.find((b) => b.slug === sel.brand)?.name;

  const radio = (on: boolean) => (
    <span
      className={`flex size-5 shrink-0 items-center justify-center rounded-full border-2 ${
        on ? "border-primary" : "border-zinc-300"
      }`}
    >
      {on && <span className="size-2.5 rounded-full bg-primary" />}
    </span>
  );

  const listPanel = (title: string, key: "category" | "brand", items: { slug: string; name: string }[]) => (
    <>
      <SheetHeader title={title} onBack={() => setPanel("main")} />
      <ul className="flex-1 overflow-y-auto overscroll-contain">
        {[{ slug: "", name: key === "category" ? "All categories" : "All brands" }, ...items].map((item) => {
          const on = (sel[key] ?? "") === item.slug;
          return (
            <li key={item.slug || "all"}>
              <button
                type="button"
                onClick={() => {
                  setSel((s) => ({
                    ...s,
                    [key]: item.slug || undefined,
                    ...(key === "category" ? { size: undefined } : {}),
                  }));
                  setPanel("main");
                }}
                className="flex w-full items-center justify-between border-b border-zinc-100 px-5 py-4 text-left text-[15px] text-zinc-900 active:bg-zinc-50"
              >
                <span className={on ? "font-semibold" : undefined}>{item.name}</span>
                {on && <Check className="size-5 text-primary" />}
              </button>
            </li>
          );
        })}
      </ul>
    </>
  );

  return (
    <>
      <button
        type="button"
        onClick={openSheet}
        className="flex h-10 items-center gap-2 rounded-md border border-zinc-300 bg-white px-4 text-sm font-semibold text-zinc-900 lg:hidden"
      >
        <SlidersHorizontal className="size-4" />
        Filter
        {activeCount > 0 && (
          <span className="flex size-5 items-center justify-center rounded-full bg-primary text-[11px] text-primary-foreground">
            {activeCount}
          </span>
        )}
      </button>

      {open && (
        <div role="dialog" aria-modal="true" aria-label="Filter products" className="fixed inset-0 z-[70] flex flex-col bg-white lg:hidden">
          {panel === "category" && listPanel("Category", "category", categories)}
          {panel === "brand" && listPanel("Brand", "brand", brands)}

          {panel === "main" && (
            <>
              <SheetHeader title="Filter" onBack={() => setOpen(false)} />
              <div className="flex-1 overflow-y-auto overscroll-contain">
                <DrillRow label="Category" value={categoryName ?? "All categories"} onClick={() => setPanel("category")} />
                <DrillRow label="Brand" value={brandName ?? "All brands"} onClick={() => setPanel("brand")} />

                <fieldset className="border-b border-zinc-100 px-5 py-4">
                  <legend className="mb-2 pt-4 text-[15px] font-semibold text-zinc-950">Price (₦)</legend>
                  {priceBrackets.map((b) => {
                    const on = sel.price === b.value;
                    return (
                      <button
                        key={b.value}
                        type="button"
                        onClick={() => setSel((s) => ({ ...s, price: on ? undefined : b.value }))}
                        className="flex w-full items-center gap-3 py-2.5 text-left text-[15px] text-zinc-800"
                      >
                        {radio(on)} {b.label}
                      </button>
                    );
                  })}
                </fieldset>

                {showSizes && (
                  <fieldset className="border-b border-zinc-100 px-5 py-4">
                    <legend className="mb-2 pt-4 text-[15px] font-semibold text-zinc-950">Size</legend>
                    {sizes!.map((sz) => {
                      const on = sel.size === sz.value;
                      return (
                        <button
                          key={sz.value}
                          type="button"
                          onClick={() => setSel((s) => ({ ...s, size: on ? undefined : sz.value }))}
                          className="flex w-full items-center gap-3 py-2.5 text-left text-[15px] text-zinc-800"
                        >
                          {radio(on)} {sz.label}
                          <span className="text-sm text-zinc-400">({sz.count})</span>
                        </button>
                      );
                    })}
                  </fieldset>
                )}
              </div>

              <div className="grid shrink-0 grid-cols-2 gap-3 border-t bg-white p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
                <button
                  type="button"
                  onClick={() => apply({})}
                  className="h-12 rounded-md border border-zinc-300 text-sm font-semibold text-zinc-900"
                >
                  Reset
                </button>
                <button
                  type="button"
                  onClick={() => apply(sel)}
                  className="h-12 rounded-md bg-primary text-sm font-semibold text-primary-foreground"
                >
                  Show results
                </button>
              </div>
            </>
          )}
        </div>
      )}

      <span className="sr-only" aria-live="polite">
        {count} products
      </span>
    </>
  );
}

function SheetHeader({ title, onBack }: { title: string; onBack: () => void }) {
  return (
    <div className="flex h-14 shrink-0 items-center gap-3 border-b px-2">
      <button
        type="button"
        aria-label="Back"
        onClick={onBack}
        className="flex size-10 items-center justify-center rounded-md hover:bg-zinc-100"
      >
        <ArrowLeft className="size-5" />
      </button>
      <span className="font-heading text-lg font-bold text-zinc-950">{title}</span>
    </div>
  );
}

function DrillRow({ label, value, onClick }: { label: string; value: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center justify-between border-b border-zinc-100 px-5 py-4 text-left active:bg-zinc-50"
    >
      <span>
        <span className="block text-[15px] font-semibold text-zinc-950">{label}</span>
        <span className="block text-sm text-zinc-500">{value}</span>
      </span>
      <ChevronRight className="size-5 text-zinc-400" />
    </button>
  );
}
