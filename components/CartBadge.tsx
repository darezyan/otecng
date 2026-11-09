"use client";

import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { useCart } from "@/lib/cart/CartProvider";

export default function CartBadge() {
  const { hydrated, count } = useCart();

  return (
    <Link
      href="/cart"
      aria-label={hydrated && count > 0 ? `Cart, ${count} items` : "Cart"}
      className="relative flex h-10 shrink-0 items-center gap-2 rounded-md px-2.5 text-sm font-medium text-foreground/80 transition-colors hover:bg-muted hover:text-foreground"
    >
      <span className="relative">
        <ShoppingBag className="size-5" />
        {hydrated && count > 0 && (
          <span className="absolute -top-1.5 -right-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
            {count > 99 ? "99+" : count}
          </span>
        )}
      </span>
      <span className="hidden md:inline">Cart</span>
    </Link>
  );
}
