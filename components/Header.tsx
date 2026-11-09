import Link from "next/link";
import { Suspense } from "react";
import { ShieldCheck, Truck } from "lucide-react";
import CartBadge from "./CartBadge";
import HeaderNav from "./HeaderNav";
import Logo from "./Logo";
import SearchBar from "./SearchBar";

function NavRowSkeleton() {
  return <div className="h-[2.6875rem] border-b lg:h-[2.8125rem]" aria-hidden />;
}

// Deliberately synchronous — CartBadge needs no async data and hydrating it
// immediately (not deferred behind Suspense) avoids racing the cart's own
// localStorage-hydration effect. Only HeaderNav (which needs live category/
// brand data) is deferred, in its own boundary, below.
export default function Header() {
  return (
    <header className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/85">
      {/* Utility bar */}
      <div className="bg-ink text-white/80">
        <div className="mx-auto flex h-9 max-w-7xl items-center justify-center gap-6 px-4 text-xs sm:justify-between sm:px-6 lg:px-8">
          <p className="flex items-center gap-1.5">
            <ShieldCheck className="size-3.5 text-primary" aria-hidden />
            Genuine appliances from trusted brands
          </p>
          <p className="hidden items-center gap-1.5 sm:flex">
            <Truck className="size-3.5 text-primary" aria-hidden />
            Doorstep delivery · Secure payment with Squad by GTCO
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
          <Suspense fallback={<div className="h-11" />}>
            <SearchBar />
          </Suspense>
        </div>
      </div>

      <Suspense fallback={<NavRowSkeleton />}>
        <HeaderNav />
      </Suspense>
    </header>
  );
}
