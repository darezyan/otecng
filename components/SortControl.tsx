"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowUpDown, Check, ChevronDown } from "lucide-react";
import { SORT_OPTIONS, type SortValue } from "@/lib/data/products";

// Sort for the products listing. Phones/tablets: a "Sort" button opening a
// bottom sheet (tap applies immediately, Jumia-style). Desktop: a native select.
// Keeps every other filter; resets to page 1.
export default function SortControl({ sort, variant }: { sort: SortValue; variant: "mobile" | "desktop" }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  function apply(value: SortValue) {
    const qs = new URLSearchParams(searchParams.toString());
    if (value === "newest") qs.delete("sort");
    else qs.set("sort", value);
    qs.delete("page");
    setOpen(false);
    router.push(qs.size ? `/products?${qs}` : "/products");
  }

  const current = SORT_OPTIONS.find((o) => o.value === sort) ?? SORT_OPTIONS[0];

  if (variant === "desktop") {
    return (
      <label className="flex items-center gap-2 text-sm text-zinc-600">
        Sort by
        <span className="relative">
          <select
            value={sort}
            onChange={(e) => apply(e.target.value as SortValue)}
            className="h-9 appearance-none rounded-md border border-zinc-300 bg-white pr-9 pl-3 text-sm font-medium text-zinc-900 outline-none focus:border-zinc-900"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute top-1/2 right-2.5 size-4 -translate-y-1/2 text-zinc-500" />
        </span>
      </label>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex h-10 items-center gap-2 rounded-md border border-zinc-300 bg-white px-4 text-sm font-semibold text-zinc-900"
      >
        <ArrowUpDown className="size-4" />
        Sort
        {sort !== "newest" && <span className="size-1.5 rounded-full bg-primary" aria-label="(active)" />}
      </button>

      {open &&
        createPortal(
          <div className="fixed inset-0 z-[70] lg:hidden" role="dialog" aria-modal="true" aria-label="Sort products">
            <div onClick={() => setOpen(false)} className="absolute inset-0 bg-black/40 animate-in fade-in-0 duration-200" />
            <div className="absolute inset-x-0 bottom-0 rounded-t-2xl bg-white pb-[max(1rem,env(safe-area-inset-bottom))] shadow-xl animate-in slide-in-from-bottom duration-200">
              <div className="mx-auto mt-2.5 h-1 w-10 rounded-full bg-zinc-300" aria-hidden />
              <p className="px-5 pt-4 pb-2 font-heading text-lg font-bold text-zinc-950">Sort by</p>
              <ul>
                {SORT_OPTIONS.map((o) => {
                  const on = o.value === current.value;
                  return (
                    <li key={o.value}>
                      <button
                        type="button"
                        onClick={() => apply(o.value)}
                        className="flex w-full items-center justify-between px-5 py-4 text-left text-[15px] text-zinc-900 active:bg-zinc-50"
                      >
                        <span className={on ? "font-semibold" : undefined}>{o.label}</span>
                        {on && <Check className="size-5 text-primary" />}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
