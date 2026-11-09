"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";

export default function SearchBar({ className }: { className?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [value, setValue] = useState(searchParams.get("q") ?? "");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // A search should look across everything, not stay narrowed by whatever
    // category/brand/price/size filters happened to be active before.
    const params = new URLSearchParams();
    if (value) params.set("q", value);
    router.push(`/products?${params.toString()}`);
  }

  return (
    <form onSubmit={handleSubmit} role="search" className={className}>
      <div className="relative flex">
        <Search
          className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
        <input
          type="search"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Search freezers, TVs, refrigerators…"
          aria-label="Search products"
          className="h-11 w-full min-w-0 rounded-l-lg border border-r-0 bg-surface pr-3 pl-10 text-sm outline-none placeholder:text-muted-foreground focus:border-primary focus:bg-background"
        />
        <button
          type="submit"
          className="h-11 shrink-0 rounded-r-lg bg-ink px-5 text-sm font-semibold text-white transition-colors hover:bg-ink-soft"
        >
          Search
        </button>
      </div>
    </form>
  );
}
