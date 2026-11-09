"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { ChevronRight, Menu, X } from "lucide-react";
import type { Brand, Category } from "@/lib/supabase/types";

// Phone/tablet navigation: a ☰ button that opens a left drawer listing every
// category and brand as plain tap targets (hover mega-menus don't work on touch).
export default function MobileMenuDrawer({ categories, brands }: { categories: Category[]; brands: Brand[] }) {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const row =
    "flex items-center justify-between px-5 py-3.5 text-[15px] text-zinc-900 active:bg-zinc-100 hover:bg-zinc-50";

  return (
    <>
      <button
        type="button"
        aria-label="Open menu"
        aria-expanded={open}
        onClick={() => setOpen(true)}
        className="-ml-2 flex size-10 items-center justify-center rounded-md text-zinc-900 hover:bg-muted lg:hidden"
      >
        <Menu className="size-6" />
      </button>

      {/* Portalled to <body>: the sticky header's backdrop-blur would
          otherwise trap a position:fixed drawer inside the header's box. */}
      {open &&
        createPortal(
      <div className="fixed inset-0 z-[60] lg:hidden">
        <div
          onClick={() => setOpen(false)}
          className="absolute inset-0 bg-black/40 animate-in fade-in-0 duration-200"
        />
        <nav
          aria-label="Shop menu"
          // Close as soon as any link inside is tapped (navigation follows).
          onClickCapture={(e) => {
            if ((e.target as HTMLElement).closest("a")) setOpen(false);
          }}
          className="absolute inset-y-0 left-0 flex w-[85%] max-w-sm flex-col bg-white shadow-xl animate-in slide-in-from-left duration-200"
        >
          <div className="flex h-14 shrink-0 items-center justify-between border-b px-5">
            <span className="font-heading text-lg font-bold text-zinc-950">Menu</span>
            <button
              type="button"
              aria-label="Close menu"
              onClick={() => setOpen(false)}
              className="-mr-2 flex size-10 items-center justify-center rounded-md hover:bg-muted"
            >
              <X className="size-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto overscroll-contain pb-8">
            <Link href="/products" className={`${row} font-semibold`}>
              All products <ChevronRight className="size-4 text-zinc-400" />
            </Link>

            <p className="mt-3 border-t px-5 pt-5 pb-2 text-xs font-semibold tracking-wide text-zinc-500 uppercase">
              Categories
            </p>
            <ul>
              {categories.map((c) => (
                <li key={c.id}>
                  <Link href={`/products?category=${c.slug}`} className={row}>
                    {c.name} <ChevronRight className="size-4 text-zinc-400" />
                  </Link>
                </li>
              ))}
            </ul>

            <p className="mt-3 border-t px-5 pt-5 pb-2 text-xs font-semibold tracking-wide text-zinc-500 uppercase">
              Brands
            </p>
            <ul>
              {brands.map((b) => (
                <li key={b.id}>
                  <Link href={`/products?brand=${b.slug}`} className={row}>
                    {b.name} <ChevronRight className="size-4 text-zinc-400" />
                  </Link>
                </li>
              ))}
            </ul>

            <div className="mt-3 border-t pt-2">
              <Link href="/cart" className={row}>
                Your cart <ChevronRight className="size-4 text-zinc-400" />
              </Link>
            </div>
          </div>
        </nav>
      </div>,
          document.body
        )}
    </>
  );
}
