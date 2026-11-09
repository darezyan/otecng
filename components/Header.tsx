import Link from "next/link";
import { Suspense } from "react";
import CartBadge from "./CartBadge";
import HeaderNav from "./HeaderNav";
import SearchBar from "./SearchBar";

function NavRowSkeleton() {
  return <div className="h-10.25 border-t" aria-hidden />;
}

// Deliberately synchronous — CartBadge needs no async data and hydrating it
// immediately (not deferred behind Suspense) avoids racing the cart's own
// localStorage-hydration effect. Only HeaderNav (which needs live category/
// brand data) is deferred, in its own boundary, below.
export default function Header() {
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
      <Suspense fallback={<NavRowSkeleton />}>
        <HeaderNav />
      </Suspense>
    </header>
  );
}
