import Link from "next/link";
import { Suspense } from "react";
import CartBadge from "./CartBadge";
import HeaderNav from "./HeaderNav";
import MobileMenu from "./MobileMenu";
import SearchBar from "./SearchBar";

function NavRowSkeleton() {
  return <div className="hidden h-10.25 border-t lg:block" aria-hidden />;
}

// Deliberately synchronous — CartBadge needs no async data and hydrating it
// immediately (not deferred behind Suspense) avoids racing the cart's own
// localStorage-hydration effect. Only HeaderNav (which needs live category/
// brand data) is deferred, in its own boundary, below.
export default function Header() {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/80">
      {/* Row 1: logo + search */}
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 sm:gap-6 sm:px-6 lg:px-8">
        <Suspense fallback={<div className="-ml-2 size-10 lg:hidden" />}>
          <MobileMenu />
        </Suspense>
        <Link href="/" className="shrink-0 font-heading text-2xl font-extrabold tracking-tight text-foreground">
          otec<span className="text-primary">ng</span>
        </Link>

        <Suspense fallback={<div className="hidden flex-1 max-w-xl sm:block" />}>
          <SearchBar />
        </Suspense>

        <Link
          href="/products"
          className="ml-auto hidden shrink-0 text-sm font-medium text-muted-foreground hover:text-foreground sm:block"
        >
          All products
        </Link>
        <div className="ml-auto sm:ml-0">
          <CartBadge />
        </div>
      </div>

      {/* Phones: full-width search under the logo row */}
      <div className="px-4 pb-3 sm:hidden">
        <Suspense fallback={<div className="h-10" />}>
          <SearchBar className="w-full" />
        </Suspense>
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
