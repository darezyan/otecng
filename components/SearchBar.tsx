"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";

export default function SearchBar({ className = "hidden flex-1 max-w-xl sm:block" }: { className?: string }) {
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
      <div className="relative">
        <input
          type="search"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Search freezers, TVs, refrigerators..."
          className="h-10 w-full rounded-full border bg-muted/40 pr-11 pl-4 text-sm outline-none placeholder:text-muted-foreground focus:border-primary focus:bg-background focus:ring-3 focus:ring-primary/20"
        />
        <button
          type="submit"
          aria-label="Search"
          className="absolute top-1/2 right-1.5 flex size-7 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <Search className="size-4" />
        </button>
      </div>
    </form>
  );
}
